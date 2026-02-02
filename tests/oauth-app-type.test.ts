import { describe, it, expect } from "vitest";

/**
 * Bug: GitHub OAuth returns 404 at github.com/login/oauth/authorize
 * Root cause: Client ID prefix "Ov23li" indicates a GitHub App, not an OAuth App.
 * NextAuth's GitHub provider expects an OAuth App client ID.
 * OAuth App client IDs are 20-char hex strings (e.g., "a1b2c3d4e5f6a1b2c3d4").
 * GitHub App client IDs start with "Iv" or "Ov" prefixes.
 */

describe("GitHub OAuth App type", () => {
  it("GITHUB_ID should not be a GitHub App client ID (Iv/Ov prefix)", () => {
    const githubId = process.env.GITHUB_ID;
    expect(githubId).toBeDefined();
    // GitHub Apps have Iv1. or Ov23 prefixes — OAuth Apps don't
    expect(githubId).not.toMatch(/^(Iv|Ov)\d/);
  });
});
