"use client";

interface CodePreviewProps {
  content: string;
  path: string;
}

export default function CodePreview({ content, path }: CodePreviewProps) {
  const lines = content.split("\n");
  const lineNumWidth = String(lines.length).length;

  return (
    <div className="text-xs font-mono overflow-auto" style={{ background: "var(--bg-primary)" }}>
      <pre className="m-0 p-0">
        {lines.map((line, i) => (
          <div key={i} className="flex hover:bg-[var(--bg-tertiary)]" style={{ minHeight: "18px" }}>
            <span
              className="select-none text-right pr-3 pl-2 shrink-0"
              style={{
                color: "var(--text-secondary)",
                opacity: 0.5,
                width: `${lineNumWidth * 8 + 24}px`,
                borderRight: "1px solid var(--border)",
              }}
            >
              {i + 1}
            </span>
            <span className="pl-3 whitespace-pre" style={{ color: "var(--text-primary)" }}>
              {line || " "}
            </span>
          </div>
        ))}
      </pre>
    </div>
  );
}
