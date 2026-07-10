import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Six Words Live",
  description:
    "Everyone gets the same six-word story prompt today. Write yours, drop it into the live wall, and upvote the best before midnight.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
