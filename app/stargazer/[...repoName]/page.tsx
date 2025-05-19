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
  const perPage = 10;
 const page=parseInt(searchParams?.page) || 1;

  // Fetch one extra to check if there are more pages
  const stargazers = await getStargazers(owner, repo, perPage, page);
  const hasNext = stargazers.length === perPage;
  const hasPrev = page > 1;

  return (
    <main
      style={{
        maxWidth: 500,
        margin: "2rem auto",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        padding: "2rem",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "2rem",
          fontWeight: 700,
          marginBottom: "1.5rem",
          color: "#333",
        }}
      >
        ⭐ Stargazers for{" "}
        <span style={{ color: "#0070f3" }}>
          {owner}/{repo}
        </span>
      </h1>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gap: "1rem",
        }}
      >
        {stargazers.map((user) => (
          <li
            key={user.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              background: "#f9f9f9",
              borderRadius: 8,
              padding: "0.75rem 1rem",
            }}
          >
            <img
              src={user.avatar_url}
              alt={user.login}
              width={40}
              height={40}
              style={{
                borderRadius: "50%",
                border: "2px solid #eaeaea",
                background: "#fff",
              }}
            />
            <a
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontWeight: 500,
                color: "#0070f3",
                textDecoration: "none",
                fontSize: "1.1rem",
              }}
            >
              {user.login}
            </a>
          </li>
        ))}
      </ul>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "2rem",
        }}
      >
        <a
          href={`?page=${page - 1}`}
          style={{
            pointerEvents: hasPrev ? "auto" : "none",
            opacity: hasPrev ? 1 : 0.4,
            color: "#0070f3",
            padding: "0.5rem 1rem",
            borderRadius: 6,
            background: "#eaeaea",
            textDecoration: "none",
            fontWeight: 500,
          }}
          aria-disabled={!hasPrev}
        >
          ← Prev
        </a>
        <span style={{ fontWeight: 600, color: "#333" }}>Page {page}</span>
        <a
          href={`?page=${page + 1}`}
          style={{
            pointerEvents: hasNext ? "auto" : "none",
            opacity: hasNext ? 1 : 0.4,
            color: "#0070f3",
            padding: "0.5rem 1rem",
            borderRadius: 6,
            background: "#eaeaea",
            textDecoration: "none",
            fontWeight: 500,
          }}
          aria-disabled={!hasNext}
        >
          Next →
        </a>
      </nav>
    </main>
  );
}
