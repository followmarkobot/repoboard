import { NextRequest, NextResponse } from "next/server";
import { getGitHubAuth } from "@/lib/github";

export async function POST(req: NextRequest) {
  const gh = await getGitHubAuth();
  if (!gh) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { command } = await req.json();
  if (!command) return NextResponse.json({ error: "command required" }, { status: 400 });

  // Phase 2: integrate with AI
  return NextResponse.json({
    response: `AI command received: "${command}". Integration coming soon.`,
  });
}
