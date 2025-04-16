import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UK Wall Paint Colour Detector",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
