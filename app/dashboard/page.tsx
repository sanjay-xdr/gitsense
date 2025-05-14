import React from 'react'
// import { auth } from "./auth";
import { authOptions,auth } from '../auth';

// async function fetchAllRepos(session:any) {
//   const baseUrl = "https://api.github.com/user/repos";
//   let page = 1; // Start with the first page
//   const perPage = 100; // Maximum allowed by GitHub
//   let allRepos = [];
//   let hasMoreData = true;

//   while (hasMoreData) {
//     const res = await fetch(`${baseUrl}?visibility=all&affiliation=owner,collaborator,organization_member&per_page=${perPage}&page=${page}`, {
//       headers: {
//         Authorization: `token ${session?.accessToken}`, // Personal Access Token
//       },
//     });

//     if (!res.ok) {
//       console.error("Error fetching repositories:", res.status, await res.text());
//       break;
//     }

//     const repos = await res.json();

//     // Add the current page's repositories to the allRepos array
//     allRepos = [...allRepos, ...repos];

//     // Check if there are more pages of data
//     if (repos.length < perPage) {
//       hasMoreData = false; // No more data, stop the loop
//     } else {
//       page++; // Move to the next page
//     }
//   }

//   console.log(allRepos.length);
//   return allRepos;
// }


export default async function Dashboard() {
  
      const session:any = await auth()
        // fetchAllRepos(session);
    // console.log(session)
      
    
      // Fetch private repos from GitHub
      const res = await fetch("https://api.github.com/user/repos?visibility=all&affiliation=owner", {
        headers: {
          Authorization: `token ${session?.accessToken}`,
        },
        next: { revalidate: 60 }, // optional caching for 60 seconds
      });
    
      const repos = await res.json();
      console.log(repos?.length)
  return (
 <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Your Private GitHub Repositories</h1>
      <ul className="space-y-2">
        {repos.map((repo: any) => (
          <li key={repo.id} className="bg-gray-100 rounded px-4 py-2">
            {repo.full_name}
          </li>
        ))}
      </ul>
    </div>
  )
}
