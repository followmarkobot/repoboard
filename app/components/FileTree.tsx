"use client";

import { useState, useEffect } from "react";

interface TreeItem {
  name: string;
  path: string;
  type: "file" | "dir";
  size: number;
}

interface FileTreeProps {
  repoName: string;
  onFileSelect: (path: string) => void;
  selectedPath?: string;
}

function TreeNode({
  item,
  repoName,
  onFileSelect,
  selectedPath,
  depth,
}: {
  item: TreeItem;
  repoName: string;
  onFileSelect: (path: string) => void;
  selectedPath?: string;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<TreeItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  const isDir = item.type === "dir";
  const isSelected = selectedPath === item.path;

  const handleClick = async () => {
    if (isDir) {
      if (!expanded && children === null) {
        setLoading(true);
        try {
          const res = await fetch(
            `/api/tree?repo=${repoName}&path=${encodeURIComponent(item.path)}`
          );
          const data = await res.json();
          setChildren(data);
        } catch {
          setChildren([]);
        }
        setLoading(false);
      }
      setExpanded(!expanded);
    } else {
      onFileSelect(item.path);
    }
  };

  const icon = isDir ? (expanded ? "📂" : "📁") : getFileIcon(item.name);

  return (
    <div>
      <div
        onClick={handleClick}
        className="flex items-center gap-1 py-0.5 px-2 cursor-pointer hover:bg-[var(--bg-tertiary)] rounded-sm"
        style={{
          paddingLeft: `${depth * 16 + 8}px`,
          background: isSelected ? "var(--bg-tertiary)" : "transparent",
        }}
      >
        {isDir && (
          <span className="text-[10px] w-3 text-center" style={{ color: "var(--text-secondary)" }}>
            {loading ? "⟳" : expanded ? "▾" : "▸"}
          </span>
        )}
        {!isDir && <span className="w-3" />}
        <span className="text-xs">{icon}</span>
        <span
          className="text-xs truncate font-mono"
          style={{
            color: isDir ? "var(--text-primary)" : "var(--text-secondary)",
            fontWeight: isDir ? 500 : 400,
          }}
        >
          {item.name}
        </span>
      </div>
      {expanded && children && (
        <div>
          {children.map((child) => (
            <TreeNode
              key={child.path}
              item={child}
              repoName={repoName}
              onFileSelect={onFileSelect}
              selectedPath={selectedPath}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getFileIcon(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: "🔷",
    tsx: "🔷",
    js: "🟡",
    jsx: "🟡",
    json: "📋",
    md: "📝",
    py: "🐍",
    go: "🔵",
    rs: "🦀",
    css: "🎨",
    html: "🌐",
    yml: "⚙️",
    yaml: "⚙️",
    toml: "⚙️",
    lock: "🔒",
    env: "🔐",
    sh: "💻",
    sql: "🗄️",
  };
  return map[ext || ""] || "📄";
}

export default function FileTree({ repoName, onFileSelect, selectedPath }: FileTreeProps) {
  const [items, setItems] = useState<TreeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/tree?repo=${repoName}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          setError(data.error || "Failed to load");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Network error");
        setLoading(false);
      });
  }, [repoName]);

  if (loading) {
    return (
      <div className="px-3 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3 py-3 text-xs" style={{ color: "var(--yellow)" }}>
        {error}
      </div>
    );
  }

  return (
    <div className="py-1">
      {items.map((item) => (
        <TreeNode
          key={item.path}
          item={item}
          repoName={repoName}
          onFileSelect={onFileSelect}
          selectedPath={selectedPath}
          depth={0}
        />
      ))}
    </div>
  );
}
