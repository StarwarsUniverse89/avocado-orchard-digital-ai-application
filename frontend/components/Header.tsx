"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#070a10]/90 backdrop-blur-xl">
      <div className="mx-auto max-w-[1920px] px-5 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-sm font-black tracking-tight text-cyan-200 shadow-[0_0_24px_rgba(0,212,255,0.14)]">
              GO
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-gray-50 transition-colors group-hover:text-cyan-200">
                Gemini Orchard Operations OS
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">
                Operational Intelligence
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/command-center"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-cyan-200"
            >
              Command Center
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-cyan-200"
            >
              Regional Command
            </Link>
            <Link
              href="/orchards"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-cyan-200"
            >
              Orchards
            </Link>
            <Link
              href="/analytics"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-cyan-200"
            >
              Financial Exposure
            </Link>
            <Link
              href="/settings"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-cyan-200"
            >
              Integrations
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/command-center"
              className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/[0.08] md:flex"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span>Human Approval</span>
            </Link>
            <Link
              href="/command-center"
              className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-bold text-gray-950 shadow-[0_0_24px_rgba(0,212,255,0.18)] transition-opacity hover:opacity-90"
            >
              Open Mission Control
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

// Made with Bob
