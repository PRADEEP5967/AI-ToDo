"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem("onboarded")) {
      setOpen(true);
      localStorage.setItem("onboarded", "true");
    }
  }, []);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Welcome to Smart Todo!</h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-3">
          <p className="text-gray-700 dark:text-gray-200">Get started with your AI-powered productivity assistant:</p>
          <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 text-sm space-y-1">
            <li>Quickly add and manage tasks with smart suggestions</li>
            <li>Input daily context from messages, emails, or notes</li>
            <li>Use analytics to track your productivity</li>
            <li>Switch between light and dark mode anytime</li>
          </ul>
        </div>
        <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={() => setOpen(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Get Started</button>
        </div>
      </div>
    </div>
  );
} 