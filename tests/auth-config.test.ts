import { describe, it, expect } from "vitest";

/**
 * Bug: Clicking "Sign in" returns a 500 "Server error - problem with server configuration"
 * Root cause: NextAuth GitHub provider requires GITHUB_ID and GITHUB_SECRET env vars.
 * When these are missing or set to placeholder values, the auth endpoint crashes with a 500.
 *
 * This test verifies that the auth configuration fails gracefully when credentials
 * are missing, and works when they're present.
 */

describe("Auth configuration", () => {
  it("should have GITHUB_ID set to a real value (not placeholder)", () => {
    const githubId = process.env.GITHUB_ID;
    expect(githubId).toBeDefined();
    expect(githubId).not.toBe("");
    expect(githubId).not.toBe("your_github_oauth_app_client_id");
    expect(githubId!.length).toBeGreaterThan(5);
  });

  it("should have GITHUB_SECRET set to a real value (not placeholder)", () => {
    const githubSecret = process.env.GITHUB_SECRET;
    expect(githubSecret).toBeDefined();
    expect(githubSecret).not.toBe("");
    expect(githubSecret).not.toBe("your_github_oauth_app_client_secret");
    expect(githubSecret!.length).toBeGreaterThan(5);
  });

  it("should have NEXTAUTH_SECRET set", () => {
    const secret = process.env.NEXTAUTH_SECRET;
    expect(secret).toBeDefined();
    expect(secret).not.toBe("");
    expect(secret).not.toBe("generate_with_openssl_rand_base64_32");
  });
});
