"use client";

import { useEffect, useState } from "react";
import { LookerDashboard } from "./looker_dashboard";

export default function AdminiPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"looker" | "og">("looker");

  useEffect(() => {
    const savedTab = localStorage.getItem("admini_active_tab");
    if (savedTab === "looker" || savedTab === "og") {
      setActiveTab(savedTab);
    }
    setMounted(true);
  }, []);

  const handleTabChange = (tab: "looker" | "og") => {
    setActiveTab(tab);
    localStorage.setItem("admini_active_tab", tab);
  };

  if (!mounted) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-[1150px]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        {/* Simple Tab List */}
        <div className="flex w-full mb-6 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => handleTabChange("looker")}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              activeTab === "looker"
                ? "bg-white shadow-sm text-orange-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Looker Studio
          </button>
        </div>

        {/* Tab Content */}
        <div className="w-full">
          {activeTab === "looker" && (
            <div className="animate-in fade-in duration-500">
              <LookerDashboard />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
