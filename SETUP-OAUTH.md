# GitHub OAuth App Setup

1. Go to **https://github.com/settings/developers** → **OAuth Apps** → **New OAuth App**
2. Fill in:
   - **Application name:** `RepoBoard`
   - **Homepage URL:** `https://repoboard.vercel.app` (or `http://localhost:3000` for local)
   - **Authorization callback URL:** `https://repoboard.vercel.app/api/auth/callback/github`
     - For local dev: `http://localhost:3000/api/auth/callback/github`
3. Click **Register application**
4. Copy the **Client ID** → `GITHUB_ID`
5. Generate a **Client secret** → `GITHUB_SECRET`
6. Generate an auth secret: `openssl rand -base64 32` → `NEXTAUTH_SECRET`
7. Copy `.env.example` to `.env.local` and fill in the values

For Vercel deployment, add the same env vars in the Vercel project settings.
