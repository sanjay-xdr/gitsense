"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";


export default function RepoDropdown({ repos }: { repos: any[] }) {
  const [selectedRepo, setSelectedRepo] = useState("");
  const router=useRouter();

  const handleRepoSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRepo(event.target.value);
    router.push(`/repos/dashboard/${event.target.value}`);
    console.log("Selected repository:", event.target.value);

  };

  return (
    <div className="space-y-4">
      <label htmlFor="repos-dropdown" className="block text-lg font-medium text-gray-700">
        Select a Repository
      </label>
      <select
        id="repos-dropdown"
        className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        onChange={handleRepoSelect}
      >
        <option value="">-- Select a Repository --</option>
        {repos.map((repo: any) => (
          <option key={repo.id} value={repo.full_name}>
            {repo.full_name}
          </option>
        ))}
      </select>
      {selectedRepo && (
        <p className="text-center text-gray-500 mt-4">
          You selected: <strong>{selectedRepo}</strong>
        </p>
      )}
    </div>
  );
}