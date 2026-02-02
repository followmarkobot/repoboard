"use client";

import { useState } from "react";
import FileTree from "./FileTree";
import CodePreview from "./CodePreview";

interface RepoColumnProps {
  repoName: string;
  onClose: () => void;
}

export default function RepoColumn({ repoName, onClose }: RepoColumnProps) {
  const [selectedFile, setSelectedFile] = useState<{ path: string; content: string } | null>(null);
  const [showCode, setShowCode] = useState(true);

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
        <button
          onClick={onClose}
          className="text-xs px-1.5 py-0.5 rounded hover:bg-[var(--bg-tertiary)] shrink-0"
          style={{ color: "var(--text-secondary)" }}
          title="Remove column"
        >
          ✕
        </button>
      </div>

      {/* File tree */}
      <div
        className="overflow-y-auto"
        style={{
          flex: showCode && selectedFile ? "0 0 45%" : "1 1 auto",
          minHeight: "120px",
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
              className="text-[10px] px-1 rounded hover:bg-[var(--bg-tertiary)]"
              style={{ color: "var(--text-secondary)" }}
            >
              ▼
            </button>
          </div>
          <div className="flex-1 overflow-auto min-h-0">
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
    </div>
  );
}
