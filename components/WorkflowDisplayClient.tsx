"use client";
import { useState, useEffect, useMemo, useCallback, JSX } from "react";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Workflow, WorkflowRun, getWorkflowRuns } from "@/utils/github/github";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  CircleSlash,
  SkipForward,
  Loader2,
  Clock3,
  AlertTriangle,
  HelpCircle,
  FileText,
  Info,
  ListChecks,
  BarChart3,
  RefreshCw,
} from "lucide-react";

interface WorkflowDisplayClientProps {
  owner: string;
  repo: string;
  initialWorkflows: Workflow[];
  initialSelectedWorkflowRuns?: WorkflowRun[];
  initialSelectedWorkflowId?: number;
}

const RUN_STATUS_COLORS: { [key: string]: string } = {
  success: "hsl(var(--chart-1))",
  failure: "hsl(var(--chart-2))",
  cancelled: "hsl(var(--chart-3))",
  skipped: "hsl(var(--chart-4))",
  in_progress: "hsl(var(--chart-5))",
  queued: "hsl(var(--chart-queued))",
  neutral: "hsl(var(--chart-neutral))",
  timed_out: "hsl(var(--chart-queued))",
  action_required: "hsl(var(--chart-queued))",
  unknown: "hsl(var(--chart-default))",
  default: "hsl(var(--chart-default))",
};

function getStatusVisuals(
  status: WorkflowRun["status"],
  conclusion: WorkflowRun["conclusion"]
): {
  icon: JSX.Element;
  badgeVariant:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "success"
    | "warning";
} {
  const iconProps = { className: "h-4 w-4" };
  let badgeVariant:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "success"
    | "warning" = "default";

  if (status === "completed") {
    if (conclusion === "success") {
      badgeVariant = "success";
      return { icon: <CheckCircle2 {...iconProps} />, badgeVariant };
    }
    if (conclusion === "failure") {
      badgeVariant = "destructive";
      return { icon: <XCircle {...iconProps} />, badgeVariant };
    }
    if (conclusion === "cancelled") {
      badgeVariant = "secondary";
      return { icon: <CircleSlash {...iconProps} />, badgeVariant };
    }
    if (conclusion === "skipped") {
      badgeVariant = "warning";
      return { icon: <SkipForward {...iconProps} />, badgeVariant };
    }
    if (conclusion === "neutral") {
      badgeVariant = "outline";
      return { icon: <Info {...iconProps} />, badgeVariant };
    }
    if (conclusion === "timed_out") {
      badgeVariant = "destructive";
      return { icon: <Clock3 {...iconProps} />, badgeVariant };
    }
  }
  if (status === "in_progress") {
    badgeVariant = "default";
    return {
      icon: <Loader2 {...iconProps} className="animate-spin" />,
      badgeVariant,
    };
  }
  if (status === "queued" || status === "waiting") {
    badgeVariant = "outline";
    return { icon: <Clock3 {...iconProps} />, badgeVariant };
  }
  if (status === "action_required") {
    badgeVariant = "warning";
    return { icon: <AlertTriangle {...iconProps} />, badgeVariant };
  }

  return { icon: <HelpCircle {...iconProps} />, badgeVariant };
}

const RUNS_TO_FETCH = 25;

const CustomPieLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
  value,
  fill,
}: any) => {
  if (percent < 0.05 && value < 3) return null;

  const RADIAN = Math.PI / 180;
  // Position label slightly outside for better readability on smaller slices, or inside for larger
  const radiusFactor = percent > 0.15 ? 0.6 : 0.7; // Adjust positioning logic
  const radius = innerRadius + (outerRadius - innerRadius) * radiusFactor;
  const x =
    cx + (outerRadius - innerRadius + 20) * Math.cos(-midAngle * RADIAN); // Further out for line
  const y =
    cy + (outerRadius - innerRadius + 20) * Math.sin(-midAngle * RADIAN);
  const textAnchor = x > cx ? "start" : "end";
  const labelColor = "hsl(var(--pie-label-text))";

  return (
    <text
      x={x}
      y={y}
      fill={labelColor}
      textAnchor={textAnchor}
      dominantBaseline="central"
      fontSize="11px"
      fontWeight="medium"
      className="pointer-events-none"
    >
      {`${name} (${value})`}
    </text>
  );
};

export default function WorkflowDisplayClient({
  owner,
  repo,
  initialWorkflows,
  initialSelectedWorkflowRuns,
  initialSelectedWorkflowId,
}: WorkflowDisplayClientProps) {
  const [activeWorkflows, setActiveWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<number | null>(
    null
  );
  const [selectedWorkflowRuns, setSelectedWorkflowRuns] = useState<
    WorkflowRun[]
  >([]);
  const [isLoadingRuns, setIsLoadingRuns] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUsedInitialRuns, setHasUsedInitialRuns] = useState(false);

  useEffect(() => {
    const active = initialWorkflows
      .filter((wf) => wf.state === "active")
      .sort((a, b) => a.name.localeCompare(b.name));
    setActiveWorkflows(active);

    if (
      initialSelectedWorkflowId &&
      active.some((wf) => wf.id === initialSelectedWorkflowId)
    ) {
      setSelectedWorkflowId(initialSelectedWorkflowId);
    } else if (active.length > 0) {
      setSelectedWorkflowId(active[0].id);
    } else {
      setSelectedWorkflowId(null);
      setIsLoadingRuns(false); 
    }
  }, [initialWorkflows, initialSelectedWorkflowId]);

  const fetchRunsForSelectedWorkflow = useCallback(
    async (workflowId: number) => {
      if (!workflowId) {
        setSelectedWorkflowRuns([]);
        setIsLoadingRuns(false);
        return;
      }
      setIsLoadingRuns(true);
      setError(null);
      try {
        const runs = await getWorkflowRuns(
          owner,
          repo,
          workflowId,
          RUNS_TO_FETCH
        );
        setSelectedWorkflowRuns(runs);
      } catch (e) {
        console.error("Failed to fetch workflow runs:", e);
        setError("Failed to load workflow runs. Please try again.");
        setSelectedWorkflowRuns([]);
      } finally {
        setIsLoadingRuns(false);
      }
    },
    [owner, repo]
  ); 

  useEffect(() => {
    if (selectedWorkflowId === null) {
      setSelectedWorkflowRuns([]);
      setIsLoadingRuns(false);
      return;
    }

    // Use pre-fetched initial runs if:
    // 1. The current selectedWorkflowId matches the initial ID.
    // 2. Initial runs were provided.
    // 3. We haven't used these initial runs yet.
    if (
      selectedWorkflowId === initialSelectedWorkflowId &&
      initialSelectedWorkflowRuns &&
      initialSelectedWorkflowRuns.length > 0 &&
      !hasUsedInitialRuns
    ) {
      setSelectedWorkflowRuns(initialSelectedWorkflowRuns);
      setHasUsedInitialRuns(true); // Mark as used
      setIsLoadingRuns(false); // Data is set, no longer loading
    } else if (selectedWorkflowId) {
      // Otherwise, fetch runs for the currently selected workflow.
      // This will also run if hasUsedInitialRuns is true but selectedWorkflowId changes.
      fetchRunsForSelectedWorkflow(selectedWorkflowId);
    }
  }, [
    selectedWorkflowId,
    initialSelectedWorkflowId,
    initialSelectedWorkflowRuns, // Prop, reference might change
    fetchRunsForSelectedWorkflow, // Stable due to useCallback
    hasUsedInitialRuns,
  ]);

  const selectedWorkflowDetails = useMemo(() => {
    return activeWorkflows.find((wf) => wf.id === selectedWorkflowId);
  }, [selectedWorkflowId, activeWorkflows]);

  const pieChartData = useMemo(() => {
    if (!selectedWorkflowRuns || selectedWorkflowRuns.length === 0) return [];
    const counts: { [key: string]: number } = {};
    selectedWorkflowRuns.forEach((run) => {
      const key = (run.conclusion || run.status || "unknown").toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([statusKey, value]) => ({
      name:
        statusKey.charAt(0).toUpperCase() +
        statusKey.slice(1).replace(/_/g, " "),
      value,
      fill: RUN_STATUS_COLORS[statusKey] || RUN_STATUS_COLORS.default,
      statusKey: statusKey,
    }));
  }, [selectedWorkflowRuns]);

  const handleWorkflowChange = (value: string) => {
    const newId = Number(value);
    setSelectedWorkflowId(newId);
    if (newId !== initialSelectedWorkflowId) {
      setHasUsedInitialRuns(true);
    } else {
      setHasUsedInitialRuns(false);
    }
  };

  if (initialWorkflows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Workflows Found</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              No GitHub Actions workflows were found for{" "}
              <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">
                {owner}/{repo}
              </code>
              .
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (activeWorkflows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              There are no active GitHub Actions workflows for this repository.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Workflow</CardTitle>
          <CardDescription>
            Choose an active workflow to see its details and recent run history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedWorkflowId?.toString() || ""}
            onValueChange={handleWorkflowChange}
            disabled={isLoadingRuns && !selectedWorkflowId} 
          >
            <SelectTrigger className="w-full md:w-[350px]">
              <SelectValue placeholder="-- Choose a workflow --" />
            </SelectTrigger>
            <SelectContent>
              {activeWorkflows.map((wf) => (
                <SelectItem key={wf.id} value={wf.id.toString()}>
                  {wf.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {selectedWorkflowDetails && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-xl">
                {selectedWorkflowDetails.name}
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={selectedWorkflowDetails.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="mr-2 h-4 w-4" /> View Workflow File
                </Link>
              </Button>
            </div>
            <CardDescription className="mt-1">
              Path:{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">
                {selectedWorkflowDetails.path}
              </code>
              <span className="mx-2">·</span>
              Last Updated:{" "}
              {new Date(
                selectedWorkflowDetails.updated_at
              ).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRuns ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-1 space-y-3">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-[340px] w-full rounded-md" />
                  </div>
                  <div className="lg:col-span-2 space-y-3">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </div>
            ) : selectedWorkflowRuns.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <BarChart3 className="mr-2 h-5 w-5 text-muted-foreground" />
                      Run Status Distribution
                    </CardTitle>
                    <CardDescription>
                      Based on the latest {selectedWorkflowRuns.length} runs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center">
                    <div style={{ width: "100%", height: 340 }}>
                      <ResponsiveContainer>
                        <PieChart
                          margin={{ top: 5, right: 5, bottom: 20, left: 5 }}
                        >
                          {" "}
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false} 
                            outerRadius={100} 
                            innerRadius={55} 
                            fill="#8884d8"
                            dataKey="value"
                            label={<CustomPieLabel />}
                          >
                            {pieChartData.map((entry) => (
                              <Cell
                                key={`cell-${entry.statusKey}-${entry.value}`}
                                fill={entry.fill}
                                className="focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1"
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            offset={30}
                            cursor={{ fill: "hsla(var(--muted)/0.3)" }}
                            formatter={(value, name, props) => {
                              const percentage = props.payload?.percent;
                              return [
                                `${value} runs ${
                                  percentage
                                    ? `(${(percentage * 100).toFixed(1)}%)`
                                    : ""
                                }`,
                                props.payload?.name,
                              ];
                            }}
                            contentStyle={{
                              backgroundColor: "hsl(var(--popover))",
                              color: "hsl(var(--popover-foreground))",
                              borderColor: "hsl(var(--border))",
                              borderRadius: "var(--radius)",
                              boxShadow: "var(--shadow-md)",
                              fontSize: "0.875rem",
                              padding: "0.5rem 0.75rem",
                            }}
                            wrapperStyle={{ zIndex: 50 }} 
                          />
                          <Legend
                            iconSize={10}
                            wrapperStyle={{
                              fontSize: "0.8rem",
                              paddingTop: "15px",
                              lineHeight: "1.6",
                            }}
                            formatter={(value) => (
                              <span style={{ color: "hsl(var(--foreground))" }}>
                                {value}
                              </span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        <ListChecks className="mr-2 h-5 w-5 text-muted-foreground" />
                        Recent Runs
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          selectedWorkflowId &&
                          fetchRunsForSelectedWorkflow(selectedWorkflowId)
                        }
                        disabled={isLoadingRuns}
                      >
                        <RefreshCw
                          className={`mr-2 h-4 w-4 ${
                            isLoadingRuns ? "animate-spin" : ""
                          }`}
                        />
                        Refresh
                      </Button>
                    </div>
                    <CardDescription>
                      Showing the latest {selectedWorkflowRuns.length} runs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pr-1">
                    <ul className="space-y-3 max-h-[500px] overflow-y-auto pr-3">
                      {selectedWorkflowRuns.map((run) => {
                        const { icon, badgeVariant } = getStatusVisuals(
                          run.status,
                          run.conclusion
                        );
                        const runTitle = `${run.event} - Run #${run.run_number}`;
                        return (
                          <li key={run.id}>
                            <Link
                              href={run.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block hover:bg-accent/50 transition-colors rounded-md p-3 border"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center space-x-2 min-w-0">
                                  <span className="text-lg shrink-0">
                                    {icon}
                                  </span>
                                  <span
                                    className="font-medium text-sm text-foreground truncate"
                                    title={runTitle}
                                  >
                                    {runTitle}
                                  </span>
                                </div>
                                <Badge
                                  variant={badgeVariant}
                                  className="whitespace-nowrap capitalize shrink-0 flex items-center"
                                >

                                  {run.conclusion || run.status}
                                </Badge>
                              </div>
                              <div className="mt-1.5 text-xs text-muted-foreground space-x-1.5 flex flex-wrap items-center">
                                <span>
                                  By{" "}
                                  <span className="font-medium text-foreground">
                                    {run.actor.login}
                                  </span>
                                </span>
                                <span className="hidden sm:inline">·</span>
                                <span className="block sm:inline mt-0.5 sm:mt-0">
                                  {new Date(run.created_at).toLocaleString(
                                    undefined,
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </span>
                                {run.head_branch && (
                                  <>
                                    <span className="hidden sm:inline">·</span>
                                    <span className="block sm:inline mt-0.5 sm:mt-0">
                                      on{" "}
                                      <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">
                                        {run.head_branch}
                                      </code>
                                    </span>
                                  </>
                                )}
                              </div>
                              {run.display_title &&
                                run.display_title !== run.event && (
                                  <p
                                    className="mt-1 text-xs text-muted-foreground truncate"
                                    title={run.display_title}
                                  >
                                    Commit: {run.display_title}
                                  </p>
                                )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No Runs Found</AlertTitle>
                <AlertDescription>
                  No recent runs found for this workflow.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedWorkflowId && !isLoadingRuns && activeWorkflows.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Select a Workflow</AlertTitle>
              <AlertDescription>
                Please select a workflow from the dropdown to view its details
                and run history.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
