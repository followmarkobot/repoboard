import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { command } = await req.json();
  if (!command) return NextResponse.json({ error: "command required" }, { status: 400 });

  // Phase 2: integrate with AI
  return NextResponse.json({
    response: `AI command received: "${command}". Integration coming soon.`,
  });
}
