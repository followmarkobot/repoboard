import { auth } from "@/auth";

export async function getGitHubAuth(): Promise<{ token: string; username: string } | null> {
  const session = await auth();
  if (!session) return null;
  const token = (session as any).accessToken;
  const username = (session as any).username;
  if (!token || !username) return null;
  return { token, username };
}
