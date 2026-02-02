import { NextRequest, NextResponse } from "next/server";
import { getGitHubAuth } from "@/lib/github";

export async function GET(req: NextRequest) {
  const gh = await getGitHubAuth();
  if (!gh) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const repo = req.nextUrl.searchParams.get("repo");
  const path = req.nextUrl.searchParams.get("path");

  if (!repo || !path) return NextResponse.json({ error: "repo and path params required" }, { status: 400 });

  const res = await fetch(
    `https://api.github.com/repos/${gh.username}/${repo}/contents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${gh.token}`,
        Accept: "application/vnd.github.raw+json",
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text }, { status: res.status });
  }

  const content = await res.text();
  return NextResponse.json({ content, path });
}
