import React from 'react'
// import { auth } from "./auth";
import { authOptions,auth } from '../auth';



export default async function Dashboard() {
      const session:any = await auth()
    console.log(session)
      
    
      // Fetch private repos from GitHub
      const res = await fetch("https://api.github.com/user/repos?visibility=private&affiliation=owner", {
        headers: {
          Authorization: `token ${session?.accessToken}`,
        },
        next: { revalidate: 60 }, // optional caching for 60 seconds
      });
    
      const repos = await res.json();
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
