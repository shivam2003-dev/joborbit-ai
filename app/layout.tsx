import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shivam2003-dev.github.io/joborbit-ai/"),
  title: {
    default: "JobOrbit AI — AI, DevOps & MLOps Jobs",
    template: "%s | JobOrbit AI",
  },
  description:
    "Discover AI, DevOps, MLOps, cloud, platform and SRE opportunities across India and worldwide.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
