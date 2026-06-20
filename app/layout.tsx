import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teaching Materials Generator",
  description: "A calm private tool for Early Intervention Program teaching materials."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-body">{children}</body>
    </html>
  );
}
