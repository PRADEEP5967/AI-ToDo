import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import DarkModeToggle from "@/components/DarkModeToggle";
import OnboardingModal from "@/components/OnboardingModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Todo - AI-Powered Task Management",
  description: "A modern, AI-powered task management application with intelligent task enhancement and context processing.",
  keywords: ["todo", "task management", "AI", "productivity", "smart"],
  authors: [{ name: "Smart Todo Team" }],
  robots: "index, follow",
};

export const viewport = "width=device-width, initial-scale=1";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 dark:bg-gray-900 antialiased`}>
        <div className="min-h-full">
          <NavBar />
          <div className="absolute top-4 right-4 z-50"><DarkModeToggle /></div>
          <OnboardingModal />
        {children}
        </div>
      </body>
    </html>
  );
}
