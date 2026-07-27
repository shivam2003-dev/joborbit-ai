import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const publicBasePath = process.env.GITHUB_PAGES === "true" ? "/joborbit-ai" : "";

export const metadata: Metadata = {
  metadataBase: new URL("https://shivam2003-dev.github.io/joborbit-ai/"),
  title: {
    default: "JobOrbit AI — AI, DevOps & MLOps Jobs",
    template: "%s | JobOrbit AI",
  },
  description:
    "Discover current AI, DevOps, MLOps, cloud, platform and SRE opportunities for professionals with 1–4 years of experience.",
  icons: {
    icon: `${publicBasePath}/favicon.svg`,
    shortcut: `${publicBasePath}/favicon.svg`,
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
