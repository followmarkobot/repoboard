import { NextResponse } from "next/server";
import { getGitHubAuth } from "@/lib/github";

export async function GET() {
  const gh = await getGitHubAuth();
  if (!gh) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const repos: any[] = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated&affiliation=owner`,
      { headers: { Authorization: `Bearer ${gh.token}`, Accept: "application/vnd.github+json" }, next: { revalidate: 60 } }
    );
    if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status });
    const data = await res.json();
    if (data.length === 0) break;
    repos.push(...data.map((r: any) => ({ name: r.name, description: r.description, language: r.language, updated_at: r.updated_at })));
    page++;
  }
  return NextResponse.json(repos);
}
