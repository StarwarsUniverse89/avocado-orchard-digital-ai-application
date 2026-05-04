"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 glass-elevated">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary">
              <span className="text-2xl">🥑</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-gray-50 group-hover:text-primary transition-colors">
                Avocado Orchard AI
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Digital Twin Platform
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-gray-300 hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/orchards"
              className="text-sm font-medium text-gray-300 hover:text-primary transition-colors"
            >
              Orchards
            </Link>
            <Link
              href="/ai-advisor"
              className="text-sm font-medium text-gray-300 hover:text-primary transition-colors"
            >
              AI Advisor
            </Link>
            <Link
              href="/simulation"
              className="text-sm font-medium text-gray-300 hover:text-primary transition-colors"
            >
              Simulation
            </Link>
            <Link
              href="/analytics"
              className="text-sm font-medium text-gray-300 hover:text-primary transition-colors"
            >
              Analytics
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 dark:bg-gray-800 hover:bg-gray-700 dark:hover:bg-gray-700 text-gray-300 dark:text-gray-300 text-sm font-medium transition-colors">
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
              <span>Alerts</span>
            </button>
            <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-gray-950 text-sm font-semibold hover:opacity-90 transition-opacity glow-primary">
              Connect AMD GPU
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// Made with Bob
