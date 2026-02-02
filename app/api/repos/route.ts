import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return NextResponse.json({ error: "No GITHUB_TOKEN" }, { status: 500 });

  const repos: any[] = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `https://api.github.com/orgs/followmarkobot/repos?per_page=100&page=${page}&sort=updated`,
      { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" }, next: { revalidate: 60 } }
    );
    if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status });
    const data = await res.json();
    if (data.length === 0) break;
    repos.push(...data.map((r: any) => ({ name: r.name, description: r.description, language: r.language, updated_at: r.updated_at })));
    page++;
  }
  return NextResponse.json(repos);
}
