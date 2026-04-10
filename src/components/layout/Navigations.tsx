"use client";

import React, { useEffect } from "react";

interface NavigationProps {
  session?: any;
  signOutAction?: () => Promise<void>;
  signInAction?: () => Promise<void>;
  children: React.ReactNode;
}

export default function Navigation({
  session,
  signOutAction,
  signInAction,
  children,
}: NavigationProps) {
  useEffect(() => {
    // URL パラメータで render=true の場合、body に rendering クラスを追加
    const isRendering =
      new URLSearchParams(window.location.search).get("render") === "true";
    if (isRendering) {
      document.body.classList.add("rendering");
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div
          className="font-bold text-2xl tracking-tighter hover:opacity-80 transition-opacity cursor-pointer"
          onClick={() => (window.location.href = "/")}
        >
          Kinemoji
        </div>
        <div className="flex gap-6 items-center">
          <nav className="hidden sm:flex gap-6 text-sm font-medium">
            <a
              href="/kinemoji/list"
              className="hover:text-orange-600 transition-colors"
            >
              Gallery
            </a>
            <a
              href="/kinemoji/new"
              className="hover:text-orange-600 transition-colors"
            >
              Create
            </a>
          </nav>
          <div className="flex gap-4 items-center">
            {session ? (
              <button
                onClick={() => signOutAction?.()}
                className="text-sm font-medium hover:text-orange-600 transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => signInAction?.()}
                className="text-sm font-medium hover:text-orange-600 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
