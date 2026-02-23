import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bolt Fleet TV Dashboard",
  description: "TV-first fleet operations dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <body>{children}</body>
    </html>
  );
}
