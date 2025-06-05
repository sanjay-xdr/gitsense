"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

function extractOwnerRepo(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim();

  const urlMatch = trimmed.match(
    /^https?:\/\/(www\.)?github\.com\/([^\/\s]+)\/([^\/\s]+)(?:\/.*)?$/
  );
  if (urlMatch) {
    return { owner: urlMatch[2], repo: urlMatch[3] };
  }

  // If input is just owner/repo
  const parts = trimmed.split("/");
  if (parts.length === 2 && parts[0] && parts[1]) {
    return { owner: parts[0], repo: parts[1] };
  }

  return null;
}

export function SearchForm() {
  const [searchQuery, setSearchQuery] = useState("https://github.com/vercel/next.js");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const extracted = extractOwnerRepo(searchQuery);
    if (!extracted) return;
    router.push(`/repos/dashboard/${extracted.owner}/${extracted.repo}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center space-x-2"
    >
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="owner/repository or github URL"
          className="pl-8 bg-white border-slate-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
      >
        Explore
      </Button>
    </form>
  );
}