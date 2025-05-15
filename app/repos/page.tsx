import React from "react";
import axios from "axios";
import { auth } from "../auth";

async function fetchAllRepos(session: any) {
  const baseUrl = "https://api.github.com/user/repos";
  let page = 1; 
  const perPage = 100; 
  let allRepos: any[] = [];
  let hasMoreData = true;

  try {
    while (hasMoreData) {
      const { data } = await axios.get(`${baseUrl}?visibility=all&affiliation=owner&per_page=${perPage}&page=${page}`, {
        headers: {
          Authorization: `token ${session?.accessToken}`,
        },
      });
      console.log("Fetching Data");
      allRepos = [...allRepos, ...data];

      if (data.length < perPage) {
        hasMoreData = false; 
      } else {
        page++; 
      }
    }
  } catch (error: any) {
    console.error("Error fetching repositories:", error.response?.status, error.response?.data || error.message);
  }

  return allRepos;
}

export default async function Dashboard() {
  const session: any = await auth();

  // Fetch all repositories
  const repos = await fetchAllRepos(session);
  console.log(repos.length);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Your GitHub Repositories</h1>
      {repos.length > 0 ? (
        <div className="space-y-4">
          <label htmlFor="repos-dropdown" className="block text-lg font-medium text-gray-700">
            Select a Repository
          </label>
          <select
            id="repos-dropdown"
            className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {repos.map((repo: any) => (
              <option key={repo.id} value={repo.full_name}>
                {repo.full_name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p className="text-center text-gray-500">No repositories found.</p>
      )}
    </div>
  );
}