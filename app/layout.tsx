import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LimeGuide - AI-Powered MCAT Study Platform",
  description: "Master biochemistry and physics with unlimited AI-generated practice questions optimized for pre-med students",
  manifest: "/manifest.json",
  themeColor: "#2d5016",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LimeGuide",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
