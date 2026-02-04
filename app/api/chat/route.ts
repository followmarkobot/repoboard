import { NextRequest } from "next/server";
import { getGitHubAuth } from "@/lib/github";
import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

async function fetchFileTree(
  username: string,
  repo: string,
  token: string,
  path = ""
): Promise<string[]> {
  const url = path
    ? `https://api.github.com/repos/${username}/${repo}/contents/${path}`
    : `https://api.github.com/repos/${username}/${repo}/contents`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  });

  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];

  const paths: string[] = [];
  for (const item of data) {
    if (item.type === "file") {
      paths.push(item.path);
    } else if (item.type === "dir") {
      paths.push(item.path + "/");
      // Only recurse one level deep to avoid rate limits
      if (path === "") {
        const children = await fetchFileTree(username, repo, token, item.path);
        paths.push(...children);
      }
    }
  }
  return paths;
}

async function fetchFileContent(
  username: string,
  repo: string,
  token: string,
  path: string
): Promise<string | null> {
  const url = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.encoding === "base64" && data.content) {
    return Buffer.from(data.content, "base64").toString("utf-8");
  }
  return null;
}

const KEY_FILES = ["package.json", "README.md", "readme.md", "Cargo.toml", "go.mod", "pyproject.toml", "requirements.txt"];

export async function POST(req: NextRequest) {
  const gh = await getGitHubAuth();
  if (!gh) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json();
  const { repoName, message, history } = body as {
    repoName: string;
    message: string;
    history: Message[];
  };

  if (!repoName || !message) {
    return new Response(JSON.stringify({ error: "repoName and message required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Fetch file tree
  const fileTree = await fetchFileTree(gh.username, repoName, gh.token);

  // Fetch key files for context
  const keyFileContents: Record<string, string> = {};
  for (const kf of KEY_FILES) {
    if (fileTree.includes(kf)) {
      const content = await fetchFileContent(gh.username, repoName, gh.token, kf);
      if (content && content.length < 10000) {
        keyFileContents[kf] = content;
      }
    }
  }

  const systemPrompt = `You are a code assistant for the GitHub repo '${repoName}'. Given the file tree below, help the user understand the codebase. When referencing files, always include the full path wrapped in backticks like \`path/to/file.ts\`. Be concise — 1-2 sentence explanations per file. Be conversational but brief.

FILE TREE:
${fileTree.join("\n")}

${Object.keys(keyFileContents).length > 0 ? "KEY FILE CONTENTS:\n" + Object.entries(keyFileContents).map(([path, content]) => `--- ${path} ---\n${content}`).join("\n\n") : ""}`;

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...(history || []).map((m: Message) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: message },
  ];

  const stream = await getOpenAI().chat.completions.create({
    model: "gpt-4.1",
    messages,
    stream: true,
    max_tokens: 1500,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
