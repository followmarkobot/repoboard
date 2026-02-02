"use client";

import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import RepoColumn from "./components/RepoColumn";
import CommandBar from "./components/CommandBar";

interface Repo {
  name: string;
  description: string | null;
  language: string | null;
  updated_at: string;
}

export default function Home() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetch("/api/repos")
      .then((r) => r.json())
      .then((data) => {
        setRepos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleRepo = (name: string) => {
    setSelectedRepos((prev) =>
      prev.includes(name) ? prev.filter((r) => r !== name) : [...prev, name]
    );
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Sidebar */}
      <Sidebar
        repos={repos}
        selectedRepos={selectedRepos}
        onToggle={toggleRepo}
        loading={loading}
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Columns */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex h-full gap-0 min-w-min">
            {selectedRepos.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)]">
                <div className="text-center">
                  <div className="text-5xl mb-4">📋</div>
                  <div className="text-lg font-medium mb-2">No repos selected</div>
                  <div className="text-sm">Check repos in the sidebar to add columns</div>
                </div>
              </div>
            ) : (
              selectedRepos.map((repoName) => (
                <RepoColumn
                  key={repoName}
                  repoName={repoName}
                  onClose={() => toggleRepo(repoName)}
                />
              ))
            )}
          </div>
        </div>

        {/* Command Bar */}
        <CommandBar />
      </div>
    </div>
  );
}
