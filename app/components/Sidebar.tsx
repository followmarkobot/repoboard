"use client";

import { useState } from "react";

interface Repo {
  name: string;
  description: string | null;
  language: string | null;
  updated_at: string;
}

interface SidebarProps {
  repos: Repo[];
  selectedRepos: string[];
  onToggle: (name: string) => void;
  loading: boolean;
  collapsed: boolean;
  onCollapse: () => void;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
};

export default function Sidebar({ repos, selectedRepos, onToggle, loading, collapsed, onCollapse }: SidebarProps) {
  const [search, setSearch] = useState("");

  const filtered = repos.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  if (collapsed) {
    return (
      <div
        className="w-10 flex flex-col items-center pt-3 cursor-pointer border-r"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
        onClick={onCollapse}
      >
        <span className="text-[var(--text-secondary)] text-sm">▶</span>
        <span
          className="text-xs mt-2 font-mono"
          style={{ writingMode: "vertical-rl", color: "var(--text-secondary)" }}
        >
          {selectedRepos.length} repos
        </span>
      </div>
    );
  }

  return (
    <div
      className="w-64 flex flex-col border-r shrink-0"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b" style={{ borderColor: "var(--border)" }}>
        <h1 className="text-sm font-bold tracking-wide" style={{ color: "var(--accent)" }}>
          ⬡ REPOBOARD
        </h1>
        <button
          onClick={onCollapse}
          className="text-xs px-1.5 py-0.5 rounded hover:bg-[var(--bg-tertiary)]"
          style={{ color: "var(--text-secondary)" }}
        >
          ◀
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <input
          type="text"
          placeholder="Filter repos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-2 py-1.5 text-xs rounded border focus:outline-none focus:border-[var(--accent)]"
          style={{
            background: "var(--bg-primary)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {/* Repo list */}
      <div className="flex-1 overflow-y-auto px-1">
        {loading ? (
          <div className="px-3 py-4 text-xs" style={{ color: "var(--text-secondary)" }}>
            Loading repos...
          </div>
        ) : (
          filtered.map((repo) => (
            <label
              key={repo.name}
              className="flex items-start gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-[var(--bg-tertiary)] group"
            >
              <input
                type="checkbox"
                checked={selectedRepos.includes(repo.name)}
                onChange={() => onToggle(repo.name)}
                className="mt-0.5 rounded"
                style={{ accentColor: "var(--accent)" }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {repo.name}
                </div>
                {repo.language && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ background: LANG_COLORS[repo.language] || "var(--text-secondary)" }}
                    />
                    <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                      {repo.language}
                    </span>
                  </div>
                )}
              </div>
            </label>
          ))
        )}
      </div>

      {/* Footer */}
      <div
        className="px-3 py-2 text-[10px] border-t"
        style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}
      >
        {repos.length} repos · {selectedRepos.length} selected
      </div>
    </div>
  );
}
