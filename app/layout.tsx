import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepoBoard — TweetDeck for Code",
  description: "Multi-column GitHub repo browser with AI command bar",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
