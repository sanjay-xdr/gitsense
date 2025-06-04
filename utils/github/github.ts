"use server"
import { auth } from "@/app/auth";
import { UserDetails } from "../../types/github/github";
import axios from "axios";
const BASE_URL = "https://api.github.com";

export const fetchUserDetails = async (
  username: string
): Promise<UserDetails> => {
  console.log(username);
  const session: any = await auth();
  if (!session) {
    throw new Error(`Failed to fetch user details: Please login again`);
  }
  try {
    const url = `${BASE_URL}/users/${username}`;
    console.log(url, " this is the url");
    const response = await axios.get<UserDetails>(
      `${BASE_URL}/users/${username}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error(`Failed to fetch user details: ${error}`);
  }
};

export async function getStargazers(
  owner: string,
  repo: string,
  perPage = 30,
  page = 1
) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/stargazers?per_page=${perPage}&page=${page}`,
    {
      headers: { Accept: "application/vnd.github.v3+json" },
      next: { revalidate: 60 },
    }
  );
  // console.log(await res.json(), " this is the get Stargazers");
  if (!res.ok) return [];
  return await res.json();
}

export async function getForkUsers(
  owner: string,
  repo: string,
  perPage = 30,
  page = 1
) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/forks?per_page=${perPage}&page=${page}`, // Changed 'stargazers' to 'forks'
    {
      headers: { Accept: "application/vnd.github.v3+json" },
      next: { revalidate: 60 }, // This is a Next.js specific option for ISR/caching
    }
  );

  // Optional: For debugging the raw forks response
  // const rawForks = await res.clone().json(); // Clone response to consume it multiple times
  // console.log(rawForks, " this is the getForks response");

  if (!res.ok) {
    // You might want to log the error or handle specific status codes
    // console.error(`Error fetching forks: ${res.status} ${res.statusText}`);
    // const errorBody = await res.text();
    // console.error(errorBody);
    return []; // Return empty array on error
  }

  const forksData = await res.json(); // This will be an array of fork objects

  // The GitHub API for forks returns an array of fork objects.
  // Each fork object has an 'owner' property, which is the user who forked the repo.
  // We need to extract these 'owner' objects.
  if (Array.isArray(forksData)) {
    return forksData.map((fork) => fork.owner); // Extract the user object from each fork
  } else {
    // This case should ideally not happen if res.ok is true and API behaves as expected
    // console.error("Fetched forks data is not an array:", forksData);
    return [];
  }
}

// lib/github.ts

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const commonHeaders = {
  Accept: "application/vnd.github.v3+json",
  ...(GITHUB_TOKEN && { Authorization: `token ${GITHUB_TOKEN}` }),
};

export interface Workflow {
  id: number;
  node_id: string;
  name: string;
  path: string;
  state:
    | "active"
    | "deleted"
    | "disabled_fork"
    | "disabled_inactivity"
    | "disabled_manually";
  created_at: string;
  updated_at: string;
  url: string;
  html_url: string;
  badge_url: string;
}

export interface WorkflowRun {
  id: number;
  name: string;
  status:
    | "queued"
    | "in_progress"
    | "completed"
    | "action_required"
    | "cancelled"
    | "failure"
    | "neutral"
    | "skipped"
    | "stale"
    | "success"
    | "timed_out"
    | "waiting";
  conclusion:
    | "success"
    | "failure"
    | "neutral"
    | "cancelled"
    | "skipped"
    | "timed_out"
    | "action_required"
    | null;
  actor: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  created_at: string;
  updated_at: string;
  html_url: string;
  run_number: number;
  event: string;
  head_branch?: string;
}

interface WorkflowsResponse {
  total_count: number;
  workflows: Workflow[];
}

interface WorkflowRunsResponse {
  total_count: number;
  workflow_runs: WorkflowRun[];
}

export async function getRepoWorkflows(
  owner: string,
  repo: string
): Promise<Workflow[]> {
  const session: any = await auth();
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/workflows`;
  try {
    const res = await fetch(url, {
      headers: {
        ...commonHeaders,
        Authorization: `Bearer ${session.accessToken}`,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error(
        `Error fetching workflows: ${res.status} ${await res.text()}`
      );
      return [];
    }
    const data: WorkflowsResponse = await res.json();
    return data.workflows || [];
  } catch (error) {
    console.error("Failed to fetch workflows:", error);
    return [];
  }
}

export async function getWorkflowRuns(
  owner: string,
  repo: string,
  workflowId: number | string, // workflow_id can be the ID (number) or the workflow file name (string)
  perPage = 5, // Get recent 5 runs by default
  page = 1
): Promise<WorkflowRun[]> {
  const session: any = await auth();
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/workflows/${workflowId}/runs?per_page=${perPage}&page=${page}`;
  try {
    const res = await fetch(url, {
      headers: {
        ...commonHeaders,
        Authorization: `Bearer ${session.accessToken}`,
      },
      next: { revalidate: 30 }, // Revalidate runs more frequently if needed
    });

    if (!res.ok) {
      console.error(
        `Error fetching workflow runs for ${workflowId}: ${
          res.status
        } ${await res.text()}`
      );
      return [];
    }
    const data: WorkflowRunsResponse = await res.json();
    return data.workflow_runs || [];
  } catch (error) {
    console.error(`Failed to fetch workflow runs for ${workflowId}:`, error);
    return [];
  }
}
