import React from "react";

export default function Footer() {
  return (
    <footer className="border-t p-4 text-center text-sm text-slate-500">
      &copy; {new Date().getFullYear()} kinemoji. All rights reserved.
    </footer>
  );
}
