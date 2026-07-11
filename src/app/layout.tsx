import type { Metadata } from "next";
import { fraunces, inter } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sestet — one prompt, six words, everyone today",
  description:
    "Sestet gives everyone the same six-word story prompt each day. Write yours, drop it into a live wall of everyone else's, and upvote the best before midnight.",
  icons: {
    icon: "favicon.svg",
  },
  openGraph: {
    title: "Sestet — one prompt, six words, everyone today",
    description:
      "Everyone gets the same six-word story prompt each day. Write yours, land in a live wall of everyone else's, and upvote the best before midnight.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${inter.variable}`}>{children}</body>
    </html>
  );
}
