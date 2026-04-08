"use client";

import React from "react";

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
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white p-4 flex justify-between items-center">
        <div className="font-bold text-xl">Kinemoji</div>
        <div className="flex gap-4">
          {session ? (
            <button onClick={() => signOutAction?.()}>Sign Out</button>
          ) : (
            <button onClick={() => signInAction?.()}>Sign In</button>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}
