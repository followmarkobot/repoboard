"use client";

import { useState, useRef } from "react";

interface Message {
  type: "command" | "response";
  text: string;
}

export default function CommandBar() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const command = input.trim();
    setInput("");
    setExpanded(true);
    setMessages((prev) => [...prev, { type: "command", text: command }]);
    setLoading(true);

    try {
      const res = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { type: "response", text: data.response || data.error }]);
    } catch {
      setMessages((prev) => [...prev, { type: "response", text: "Error: Failed to send command" }]);
    }
    setLoading(false);
  };

  return (
    <div
      className="border-t shrink-0"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      {/* Message history */}
      {expanded && messages.length > 0 && (
        <div className="max-h-32 overflow-y-auto px-4 py-2 border-b" style={{ borderColor: "var(--border)" }}>
          {messages.map((msg, i) => (
            <div key={i} className="flex gap-2 py-0.5 text-xs font-mono">
              <span style={{ color: msg.type === "command" ? "var(--accent)" : "var(--green)" }}>
                {msg.type === "command" ? "❯" : "◆"}
              </span>
              <span style={{ color: msg.type === "command" ? "var(--text-primary)" : "var(--text-secondary)" }}>
                {msg.text}
              </span>
            </div>
          ))}
          {loading && (
            <div className="text-xs font-mono py-0.5" style={{ color: "var(--text-secondary)" }}>
              ⟳ Processing...
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-2">
        <span className="text-sm font-mono" style={{ color: "var(--accent)" }}>
          ❯
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='AI command — e.g. "Move auth from Echo to backend"'
          className="flex-1 bg-transparent text-xs font-mono focus:outline-none"
          style={{ color: "var(--text-primary)" }}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="text-xs px-3 py-1 rounded font-medium disabled:opacity-30 transition-opacity"
          style={{
            background: "var(--accent)",
            color: "var(--bg-primary)",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
