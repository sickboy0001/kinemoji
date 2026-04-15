import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t py-8 px-6 text-center text-xs text-neutral-400 bg-neutral-50">
      <div className="mb-4 font-bold text-neutral-900 tracking-tight">
        Kinemoji
      </div>
      <div className="mb-4">
        <Link
          href="/help"
          className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium
            bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          ヘルプ
        </Link>
      </div>
      &copy; {new Date().getFullYear()} Kinemoji. All rights reserved.
    </footer>
  );
}
