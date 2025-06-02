
import Link from 'next/link';
import { getRepoWorkflows, getWorkflowRuns, Workflow, WorkflowRun } from '@/utils/github/github';
import WorkflowDisplayClient from '@/components/WorkflowDisplayClient'; 

interface WorkflowPageParams {
  owner: string;
  repo: string;
}

export default async function WorkflowPage({ params }:  {
  params:{ repoName: string[] }
}) {

  const { repoName } = await params;
  const owner = repoName[0];
  const repo = repoName[1];
  const workflows = await getRepoWorkflows(owner, repo);

  let initialSelectedWorkflowRuns: WorkflowRun[] = [];
  let initialSelectedWorkflowId: number | undefined = undefined;

  if (workflows && workflows.length > 0) {
    const firstActiveWorkflow = workflows.find(wf => wf.state === 'active');
    if (firstActiveWorkflow) {
      initialSelectedWorkflowId = firstActiveWorkflow.id;
      initialSelectedWorkflowRuns = await getWorkflowRuns(owner, repo, firstActiveWorkflow.id, 20);
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          GitHub Actions for{' '}
          <Link href={`https://github.com/${owner}/${repo}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {owner}/{repo}
          </Link>
        </h1>
        <p className="text-md text-gray-500 mt-1">Analyze workflow statuses and recent runs.</p>
      </div>

      <WorkflowDisplayClient
        owner={owner}
        repo={repo}
        initialWorkflows={workflows || []}
        initialSelectedWorkflowRuns={initialSelectedWorkflowRuns}
        initialSelectedWorkflowId={initialSelectedWorkflowId}
      />
    </div>
  );
}

export async function generateMetadata({ params }: { params: WorkflowPageParams }) {
  return {
    title: `Workflows & Runs | ${params.owner}/${params.repo}`,
    description: `View GitHub Actions workflows, run history, and status metrics for ${params.owner}/${params.repo}.`,
  };
}