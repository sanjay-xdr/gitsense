// components/WorkflowDisplayClient.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Workflow, WorkflowRun, getWorkflowRuns } from '@/utils/github/github'; // Adjust path

interface WorkflowDisplayClientProps {
  owner: string;
  repo: string;
  initialWorkflows: Workflow[];
  initialSelectedWorkflowRuns?: WorkflowRun[]; // Optional: if first workflow runs are pre-fetched
  initialSelectedWorkflowId?: number; // Optional
}

const RUN_STATUS_COLORS: { [key: string]: string } = {
  success: '#28a745', // Green
  failure: '#dc3545', // Red
  cancelled: '#6c757d', // Gray
  skipped: '#ffc107', // Yellow
  in_progress: '#007bff', // Blue
  queued: '#17a2b8', // Teal
  neutral: '#6c757d',
  timed_out: '#fd7e14', // Orange
  action_required: '#fd7e14',
  default: '#adb5bd', // Light gray for others
};

// Helper to get a status icon (can be moved to a utils file)
function getStatusIcon(status: WorkflowRun['status'], conclusion: WorkflowRun['conclusion']) {
    if (status === 'completed') {
      if (conclusion === 'success') return '✅';
      if (conclusion === 'failure') return '❌';
      if (conclusion === 'cancelled') return '🚫';
      if (conclusion === 'skipped') return '⏭️';
      if (conclusion === 'neutral') return '➖';
      if (conclusion === 'timed_out') return '⏱️';
    }
    if (status === 'in_progress') return '⏳';
    if (status === 'queued') return '🕒';
    if (status === 'waiting') return '⏳';
    if (status === 'action_required') return '❗';
    return '❓';
}

export default function WorkflowDisplayClient({
  owner,
  repo,
  initialWorkflows,
  initialSelectedWorkflowRuns,
  initialSelectedWorkflowId
}: WorkflowDisplayClientProps) {
  const [activeWorkflows, setActiveWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<number | null>(initialSelectedWorkflowId || null);
  const [selectedWorkflowRuns, setSelectedWorkflowRuns] = useState<WorkflowRun[]>(initialSelectedWorkflowRuns || []);
  const [isLoadingRuns, setIsLoadingRuns] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const active = initialWorkflows.filter(wf => wf.state === 'active');
    setActiveWorkflows(active);
    if (active.length > 0 && !initialSelectedWorkflowId) {
      setSelectedWorkflowId(active[0].id);
    } else if (initialSelectedWorkflowId) {
        setSelectedWorkflowId(initialSelectedWorkflowId);
    }
  }, [initialWorkflows, initialSelectedWorkflowId]);

  useEffect(() => {
    if (selectedWorkflowId) {
      // Skip fetching if initial runs for this ID were provided
      if (initialSelectedWorkflowRuns && initialSelectedWorkflowId === selectedWorkflowId && initialSelectedWorkflowRuns.length > 0) {
        setSelectedWorkflowRuns(initialSelectedWorkflowRuns);
        return;
      }

      const fetchRuns = async () => {
        setIsLoadingRuns(true);
        setError(null);
        try {
          // Fetch more runs, e.g., last 20, for a better chart
          const runs = await getWorkflowRuns(owner, repo, selectedWorkflowId, 20);
          setSelectedWorkflowRuns(runs);
        } catch (e) {
          console.error("Failed to fetch workflow runs:", e);
          setError("Failed to load workflow runs. Please try again.");
          setSelectedWorkflowRuns([]);
        } finally {
          setIsLoadingRuns(false);
        }
      };
      fetchRuns();
    } else {
      setSelectedWorkflowRuns([]); // Clear runs if no workflow is selected
    }
  }, [selectedWorkflowId, owner, repo, initialSelectedWorkflowId, initialSelectedWorkflowRuns]);

  const selectedWorkflowDetails = useMemo(() => {
    return activeWorkflows.find(wf => wf.id === selectedWorkflowId);
  }, [selectedWorkflowId, activeWorkflows]);

  const pieChartData = useMemo(() => {
    if (!selectedWorkflowRuns || selectedWorkflowRuns.length === 0) return [];
    const counts: { [key: string]: number } = {};
    selectedWorkflowRuns.forEach(run => {
      const key = run.conclusion || run.status; // Use conclusion if completed, otherwise status
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
      value,
      fill: RUN_STATUS_COLORS[name] || RUN_STATUS_COLORS.default,
    }));
  }, [selectedWorkflowRuns]);

  if (initialWorkflows.length === 0) {
    return <p className="text-gray-600">No workflows found for this repository.</p>;
  }

  if (activeWorkflows.length === 0) {
    return <p className="text-gray-600">No active workflows found for this repository.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="workflow-select" className="block text-sm font-medium text-gray-700 mb-1">
          Select Workflow:
        </label>
        <select
          id="workflow-select"
          value={selectedWorkflowId || ''}
          onChange={(e) => setSelectedWorkflowId(Number(e.target.value))}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
        >
          <option value="" disabled>-- Choose a workflow --</option>
          {activeWorkflows.map(wf => (
            <option key={wf.id} value={wf.id}>
              {wf.name}
            </option>
          ))}
        </select>
      </div>

      {selectedWorkflowDetails && (
        <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{selectedWorkflowDetails.name}</h2>
            <Link
              href={selectedWorkflowDetails.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline mt-2 md:mt-0"
            >
              View Workflow File on GitHub
            </Link>
          </div>
          <p className="text-sm text-gray-500 mb-1">
            Path: <code className="bg-gray-100 p-1 rounded text-xs">{selectedWorkflowDetails.path}</code>
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Last Updated: {new Date(selectedWorkflowDetails.updated_at).toLocaleString()}
          </p>

          {error && <p className="text-red-500 bg-red-50 p-3 rounded-md">{error}</p>}

          {isLoadingRuns ? (
            <div className="flex justify-center items-center h-60">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="ml-3 text-gray-600">Loading runs...</p>
            </div>
          ) : selectedWorkflowRuns.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="lg:col-span-1">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Run Status Distribution</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} runs`, name]}/>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                    <p>Total Runs Analyzed: {selectedWorkflowRuns.length}</p>
                    {/* You can add more metrics here, e.g., success rate */}
                </div>
              </div>

              <div className="lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Recent Runs (Latest {selectedWorkflowRuns.length}):</h3>
                <ul className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedWorkflowRuns.map((run) => (
                    <li key={run.id} className="p-3 bg-gray-50 rounded-md border border-gray-200 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getStatusIcon(run.status, run.conclusion)}</span>
                          <Link
                            href={run.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline truncate max-w-[200px] sm:max-w-[300px] md:max-w-full"
                            title={`${run.event} - Run #${run.run_number}`}
                          >
                            {run.event} - Run #{run.run_number}
                          </Link>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap
                          ${run.status === 'completed' && run.conclusion === 'success' ? 'bg-green-100 text-green-800' : ''}
                          ${run.status === 'completed' && run.conclusion === 'failure' ? 'bg-red-100 text-red-800' : ''}
                          ${run.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : ''}
                          ${run.status === 'queued' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${run.status === 'completed' && run.conclusion === 'cancelled' ? 'bg-gray-100 text-gray-800' : ''}
                          ${run.status === 'completed' && run.conclusion === 'skipped' ? 'bg-yellow-100 text-yellow-700' : ''}
                          ${!run.conclusion && run.status !== 'in_progress' && run.status !== 'queued' ? 'bg-purple-100 text-purple-800' : ''}
                        `}>
                          {run.conclusion || run.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1.5">
                        <span>Triggered by {run.actor.login}</span>
                        <span className="mx-1">·</span>
                        <span>{new Date(run.created_at).toLocaleString()}</span>
                        {run.head_branch && <span className="ml-2">on <code className="text-purple-600 bg-purple-50 px-1 rounded">{run.head_branch}</code></span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-4">No recent runs found for this workflow, or workflow not selected.</p>
          )}
        </div>
      )}
       {/* Fallback if no workflow is selected yet, and not loading */}
       {!selectedWorkflowId && !isLoadingRuns && activeWorkflows.length > 0 && (
        <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 text-center text-gray-500">
          <p>Please select a workflow from the dropdown above to see its details and run history.</p>
        </div>
      )}
    </div>
  );
}