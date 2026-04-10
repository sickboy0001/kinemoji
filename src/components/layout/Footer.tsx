import React from "react";

export default function Footer() {
  return (
    <footer className="border-t py-8 px-6 text-center text-xs text-neutral-400 bg-neutral-50">
      <div className="mb-4 font-bold text-neutral-900 tracking-tight">
        Kinemoji
      </div>
      &copy; {new Date().getFullYear()} Kinemoji. All rights reserved.
    </footer>
  );
}
