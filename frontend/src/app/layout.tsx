import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flare DeFi Copilot",
  description:
    "AI-powered DeFi assistant for Flare Network — built with MCP at ETH Oxford 2026",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="sticky top-0 z-50 flex items-center gap-6 px-6 py-3 border-b border-gray-200 dark:border-dark-500 bg-white/80 dark:bg-dark-900/80 backdrop-blur-sm">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white"
          >
            <span className="inline-flex w-8 h-8 items-center justify-center rounded-lg bg-gradient-to-br from-flare-coral to-flare-coral-dark text-white text-sm font-bold shadow-md shadow-flare-coral/20">
              F
            </span>
            Flare DeFi
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
            >
              Chat
            </Link>
            <Link
              href="/lottery"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
            >
              Lottery
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
