import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "cesium/Build/Cesium/Widgets/widgets.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Avocado Orchard Digital AI | Enterprise Agricultural Intelligence",
  description: "High-performance AI agent system for avocado orchard digital twin modeling, real-time analysis, simulation, and decision-making powered by AMD GPU infrastructure.",
  keywords: ["avocado", "orchard", "digital twin", "AI", "agriculture", "AMD", "GPU", "simulation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-gray-950 text-gray-50">
        {children}
      </body>
    </html>
  );
}

// Made with Bob
