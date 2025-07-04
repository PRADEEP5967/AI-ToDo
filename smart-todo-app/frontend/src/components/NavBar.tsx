"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/context/input", label: "Context Input" },
  { href: "/context", label: "Context Management" },
  { href: "/analytics", label: "Analytics" },
  { href: "/categories", label: "Categories" },
  { href: "/profile", label: "Profile" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="bg-white dark:bg-gray-900 border-b shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <span className="font-bold text-xl text-blue-700 dark:text-blue-300">Smart Todo</span>
          </div>
          <div className="hidden md:flex gap-6">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t shadow">
          <div className="flex flex-col gap-2 p-4">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
} 