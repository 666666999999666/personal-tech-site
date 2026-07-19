import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QZ Site",
  description: "Agent Native Personal Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
