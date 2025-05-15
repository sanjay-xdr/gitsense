import { auth } from "@/app/auth";
import React from "react";

async function fetchRepoDetails(owner: string, repo: string) {
   const session:any = await auth()
  const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const prUrl = `https://api.github.com/repos/${owner}/${repo}/pulls`;

  try {
    // Fetch repository details
    const repoResponse = await fetch(repoUrl, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    const repoDetails = await repoResponse.json();

    // Fetch pull requests
    const prResponse = await fetch(prUrl, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    const pullRequests = await prResponse.json();

    return { repoDetails, pullRequests };
  } catch (error) {
    console.error("Error fetching repository details:", error);
    return { repoDetails: null, pullRequests: [] };
  }
}

export default async function Page({
  params,
}: {
  params: { repoName: string[] }; // Catch-all route for [...repoName]
}) {
  const {repoName} = await params; // Destructure owner and repo from the URL
  const { repoDetails, pullRequests } = await fetchRepoDetails(repoName[0], repoName[1]);

  if (!repoDetails) {
    return <div>Error fetching repository details. Please try again later.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Repository: {repoDetails.full_name}
      </h1>
      <div className="space-y-4">
        <p>
          <strong>Description:</strong> {repoDetails.description || "No description available."}
        </p>
        <p>
          <strong>Stars:</strong> {repoDetails.stargazers_count}
        </p>
        <p>
          <strong>Forks:</strong> {repoDetails.forks_count}
        </p>
        <p>
          <strong>Open Issues:</strong> {repoDetails.open_issues_count}
        </p>
      </div>

      <h2 className="text-2xl font-bold mt-8">Pull Requests</h2>
      {pullRequests.length > 0 ? (
        <ul className="list-disc pl-5 space-y-2">
          {pullRequests.map((pr: any) => (
            <li key={pr.id}>
              <a
                href={pr.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {pr.title}
              </a>{" "}
              by {pr.user.login}
            </li>
          ))}
        </ul>
      ) : (
        <p>No open pull requests.</p>
      )}
    </div>
  );
}