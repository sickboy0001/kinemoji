"use client";

import { Suspense } from "react";
import { KinemojiNewPage } from "@/components/pages/kinemoji-new-page";

export default function NewKinemojiPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <KinemojiNewPage />
    </Suspense>
  );
}
