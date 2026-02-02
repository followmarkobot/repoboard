"use client";

import { useState } from "react";
import FileTree from "./FileTree";
import CodePreview from "./CodePreview";
import ChatPanel from "./ChatPanel";

interface RepoColumnProps {
  repoName: string;
  onClose: () => void;
}

export default function RepoColumn({ repoName, onClose }: RepoColumnProps) {
  const [selectedFile, setSelectedFile] = useState<{ path: string; content: string } | null>(null);
  const [showCode, setShowCode] = useState(true);
  const [showChat, setShowChat] = useState(false);

  const handleFileSelect = async (path: string) => {
    try {
      const res = await fetch(`/api/file?repo=${repoName}&path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.content !== undefined) {
        setSelectedFile({ path, content: data.content });
        setShowCode(true);
      }
    } catch (err) {
      console.error("Failed to fetch file:", err);
    }
  };

  return (
    <div
      className="w-[320px] shrink-0 flex flex-col border-r h-full"
      style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}
    >
      {/* Column header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b shrink-0"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs">📦</span>
          <span className="text-xs font-bold truncate" style={{ color: "var(--accent)" }}>
            {repoName}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setShowChat(!showChat)}
            className="text-xs px-1.5 py-0.5 rounded hover:bg-[var(--bg-tertiary)] cursor-pointer border-0"
            style={{
              color: showChat ? "var(--accent)" : "var(--text-secondary)",
              background: showChat ? "var(--bg-tertiary)" : "transparent",
            }}
            title={showChat ? "Hide chat" : "Show chat assistant"}
          >
            💬
          </button>
          <button
            onClick={onClose}
            className="text-xs px-1.5 py-0.5 rounded hover:bg-[var(--bg-tertiary)] shrink-0 cursor-pointer border-0"
            style={{ color: "var(--text-secondary)", background: "transparent" }}
            title="Remove column"
          >
            ✕
          </button>
        </div>
      </div>

      {/* File tree */}
      <div
        className="overflow-y-auto"
        style={{
          flex: showCode && selectedFile ? "0 0 30%" : showChat ? "0 0 50%" : "1 1 auto",
          minHeight: "80px",
        }}
      >
        <FileTree repoName={repoName} onFileSelect={handleFileSelect} selectedPath={selectedFile?.path} />
      </div>

      {/* Code preview */}
      {selectedFile && showCode && (
        <>
          <div
            className="flex items-center justify-between px-3 py-1 border-t border-b shrink-0"
            style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
          >
            <span
              className="text-[10px] font-mono truncate"
              style={{ color: "var(--text-secondary)" }}
            >
              {selectedFile.path}
            </span>
            <button
              onClick={() => setShowCode(false)}
              className="text-[10px] px-1 rounded hover:bg-[var(--bg-tertiary)] cursor-pointer border-0"
              style={{ color: "var(--text-secondary)", background: "transparent" }}
            >
              ▼
            </button>
          </div>
          <div
            className="overflow-auto min-h-0"
            style={{ flex: showChat ? "0 0 25%" : "1 1 auto" }}
          >
            <CodePreview content={selectedFile.content} path={selectedFile.path} />
          </div>
        </>
      )}

      {/* Collapsed code indicator */}
      {selectedFile && !showCode && (
        <div
          className="px-3 py-1 border-t cursor-pointer hover:bg-[var(--bg-tertiary)] shrink-0"
          style={{ borderColor: "var(--border)" }}
          onClick={() => setShowCode(true)}
        >
          <span className="text-[10px] font-mono" style={{ color: "var(--text-secondary)" }}>
            ▶ {selectedFile.path}
          </span>
        </div>
      )}

      {/* Chat panel */}
      {showChat && <ChatPanel repoName={repoName} onFileClick={handleFileSelect} />}
    </div>
  );
}
