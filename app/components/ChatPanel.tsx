"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  repoName: string;
  onFileClick: (path: string) => void;
}

function parseMessageContent(
  content: string,
  onFileClick: (path: string) => void
) {
  // Split on backtick-wrapped file paths
  const parts = content.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      const inner = part.slice(1, -1);
      // Check if it looks like a file path (has extension or slash)
      const isFilePath = /\.\w+$/.test(inner) || inner.includes("/");
      if (isFilePath) {
        return (
          <button
            key={i}
            onClick={() => onFileClick(inner)}
            className="inline-flex items-center gap-0.5 px-1 py-0 rounded font-mono text-[11px] cursor-pointer border-0"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--accent)",
            }}
            title={`Open ${inner}`}
          >
            <span style={{ fontSize: "9px" }}>📄</span>
            {inner}
          </button>
        );
      }
      return (
        <code
          key={i}
          className="px-1 py-0 rounded font-mono text-[11px]"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)" }}
        >
          {inner}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ChatPanel({ repoName, onFileClick }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoName,
          message: trimmed,
          history: messages,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        setMessages([...newMessages, { role: "assistant", content: `Error: ${err}` }]);
        setIsLoading(false);
        return;
      }

      // Stream the response
      const reader = res.body?.getReader();
      if (!reader) {
        setIsLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let assistantContent = "";
      setMessages([...newMessages, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        setMessages([...newMessages, { role: "assistant", content: assistantContent }]);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Failed to get response. Please try again." },
      ]);
    }

    setIsLoading(false);
    inputRef.current?.focus();
  };

  return (
    <div
      className="flex flex-col border-t"
      style={{
        borderColor: "var(--border)",
        height: "40%",
        minHeight: "140px",
        background: "var(--bg-primary)",
      }}
    >
      {/* Chat header */}
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 border-b shrink-0"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <span className="text-xs">💬</span>
        <span className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
          Code Assistant
        </span>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="ml-auto text-[10px] px-1.5 py-0.5 rounded hover:bg-[var(--bg-tertiary)] cursor-pointer border-0"
            style={{ color: "var(--text-secondary)", background: "transparent" }}
            title="Clear chat"
          >
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-4">
            <div className="text-lg mb-1">🤖</div>
            <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
              Ask anything about this repo
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="rounded-lg px-2.5 py-1.5 text-[11px] leading-relaxed max-w-[90%]"
              style={{
                background:
                  msg.role === "user" ? "var(--accent)" : "var(--bg-secondary)",
                color:
                  msg.role === "user" ? "#fff" : "var(--text-primary)",
                border:
                  msg.role === "assistant" ? "1px solid var(--border)" : "none",
              }}
            >
              {msg.role === "assistant"
                ? parseMessageContent(msg.content, onFileClick)
                : msg.content}
              {msg.role === "assistant" && msg.content === "" && isLoading && (
                <span style={{ color: "var(--text-secondary)" }}>Thinking...</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-t shrink-0"
        style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Ask about the codebase..."
          className="flex-1 text-[11px] px-2.5 py-1.5 rounded border outline-none"
          style={{
            background: "var(--bg-primary)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="text-[11px] px-2.5 py-1.5 rounded font-medium border-0 cursor-pointer"
          style={{
            background: isLoading || !input.trim() ? "var(--bg-tertiary)" : "var(--accent)",
            color: isLoading || !input.trim() ? "var(--text-secondary)" : "#fff",
          }}
        >
          {isLoading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
