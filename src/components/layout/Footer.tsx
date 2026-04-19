import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t py-6 px-6 text-[10px] sm:text-xs text-neutral-400 bg-white">
      <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-2">
        <span className="font-bold text-neutral-900 tracking-tight">
          Kinemoji
        </span>
        <span className="text-neutral-200">|</span>
        <Link
          href="/help"
          className="hover:text-neutral-900 transition-colors underline-offset-4 hover:underline"
        >
          ヘルプ
        </Link>
        <span className="text-neutral-200">|</span>
        <Link
          href="https://x.com/dodoitu0001"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-neutral-900 transition-colors underline-offset-4 hover:underline"
        >
          Contact: @dodoitu0001
        </Link>
        <span className="text-neutral-200">|</span>
        <div>&copy; {new Date().getFullYear()} Kinemoji</div>
      </div>
    </footer>
  );
}
