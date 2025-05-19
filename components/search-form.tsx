"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function SearchForm() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    // Split the query to get owner and repo
    const parts = searchQuery.trim().split("/")
    if (parts.length >= 2) {
      const owner = parts[parts.length - 2]
      const repo = parts[parts.length - 1]
      router.push(`/repos/dashboard/${owner}/${repo}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="owner/repository (e.g. vercel/next.js)"
          className="pl-8 bg-white border-slate-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
        Explore
      </Button>
    </form>
  )
}
