"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Sidebar from "./components/Sidebar";
import RepoColumn from "./components/RepoColumn";
import CommandBar from "./components/CommandBar";

interface Repo {
  name: string;
  description: string | null;
  language: string | null;
  updated_at: string;
}

function SignInScreen() {
  return (
    <div className="flex h-screen items-center justify-center" style={{ background: "var(--bg-primary)" }}>
      <div className="text-center">
        <div className="text-5xl mb-6">⬡</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          RepoBoard
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
          TweetDeck for your GitHub repos
        </p>
        <button
          onClick={() => signIn("github")}
          className="flex items-center gap-3 mx-auto px-6 py-3 rounded-lg font-medium text-sm transition-colors cursor-pointer"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          Sign in with GitHub
        </button>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center" style={{ background: "var(--bg-primary)" }}>
      <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading...</div>
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/repos")
      .then((r) => r.json())
      .then((data) => {
        setRepos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status]);

  if (status === "loading") return <LoadingScreen />;
  if (status === "unauthenticated") return <SignInScreen />;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Sidebar */}
      <Sidebar
        repos={repos}
        selectedRepos={selectedRepos}
        onToggle={(name) =>
          setSelectedRepos((prev) =>
            prev.includes(name) ? prev.filter((r) => r !== name) : [...prev, name]
          )
        }
        loading={loading}
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={session?.user ?? null}
        onSignOut={() => signOut()}
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
                  onClose={() =>
                    setSelectedRepos((prev) => prev.filter((r) => r !== repoName))
                  }
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
