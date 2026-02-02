import { NextRequest, NextResponse } from "next/server";
import { getGitHubAuth } from "@/lib/github";

export async function GET(req: NextRequest) {
  const gh = await getGitHubAuth();
  if (!gh) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const repo = req.nextUrl.searchParams.get("repo");
  const path = req.nextUrl.searchParams.get("path") || "";

  if (!repo) return NextResponse.json({ error: "repo param required" }, { status: 400 });

  const url = path
    ? `https://api.github.com/repos/${gh.username}/${repo}/contents/${path}`
    : `https://api.github.com/repos/${gh.username}/${repo}/contents`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${gh.token}`, Accept: "application/vnd.github+json" },
    next: { revalidate: 30 },
  });

  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status });
  const data = await res.json();

  const items = Array.isArray(data) ? data : [data];
  const formatted = items
    .map((item: any) => ({
      name: item.name,
      path: item.path,
      type: item.type,
      size: item.size,
    }))
    .sort((a: any, b: any) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === "dir" ? -1 : 1;
    });

  return NextResponse.json(formatted);
}
