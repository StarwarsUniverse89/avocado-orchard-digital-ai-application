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
  title: "Gemini Orchard Operations OS",
  description: "Operational intelligence command system for avocado agriculture, mission planning, human-in-the-loop field execution, operational memory, and ML label archive preparation.",
  keywords: ["avocado", "orchard operations", "Gemini", "operational digital twin", "agriculture", "mission control", "ML label archive"],
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
