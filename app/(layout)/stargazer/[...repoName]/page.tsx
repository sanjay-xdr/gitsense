import UserCard from "@/components/UserCard";
import { getStargazers } from "@/utils/github/github";
import React from "react";


export default async function Page({
  params,searchParams
}: {
  params: { repoName: string[] },
  searchParams: any
}) {
  const { repoName } = await params;
  const owner = repoName[0];
  const repo = repoName[1];
  const perPage = 12;
  let urlQuery=await searchParams;
 const page=parseInt(urlQuery?.page) || 1;

  // Fetch one extra to check if there are more pages
  const stargazers = await getStargazers(owner, repo, perPage, page);
  const hasNext = stargazers.length === perPage;
  const hasPrev = page > 1;

  return (
      <main className=" mx-auto my-8 pl-16 pr-16 bg-white rounded-lg shadow-md font-sans">
      <h1 className="text-center text-4xl font-bold mb-6 text-gray-800">
        ⭐ Stargazers for{' '}
        <span className="text-blue-500">
          {owner}/{repo}
        </span>
      </h1>
      <ul className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {stargazers.map((user) => (
          <UserCard key={user.id} contributor={user} />
        ))}
      </ul>
      <nav className="flex justify-center items-center mt-8 space-x-4">
        <a
          href={`?page=${page - 1}`}
          className={`px-4 py-2 bg-gray-200 rounded font-medium hover:bg-gray-300 transition ${
            hasPrev ? '' : 'opacity-50 pointer-events-none'
          }`}
          aria-disabled={!hasPrev}
        >
          ← Prev
        </a>
        <span className="font-semibold text-gray-700">Page {page}</span>
        <a
          href={`?page=${page + 1}`}
          className={`px-4 py-2 bg-gray-200 rounded font-medium hover:bg-gray-300 transition ${
            hasNext ? '' : 'opacity-50 pointer-events-none'
          }`}
          aria-disabled={!hasNext}
        >
          Next →
        </a>
      </nav>
    </main>
  );
}
