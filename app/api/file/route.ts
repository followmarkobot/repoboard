import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return NextResponse.json({ error: "No GITHUB_TOKEN" }, { status: 500 });

  const repo = req.nextUrl.searchParams.get("repo");
  const path = req.nextUrl.searchParams.get("path");

  if (!repo || !path) return NextResponse.json({ error: "repo and path params required" }, { status: 400 });

  const res = await fetch(
    `https://api.github.com/repos/followmarkobot/${repo}/contents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
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
