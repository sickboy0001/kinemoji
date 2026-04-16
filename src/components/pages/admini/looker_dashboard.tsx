"use client";

export function LookerDashboard() {
  const lookerUrl = process.env.NEXT_PUBLIC_LOOKER_STUDIO_URL || "";

  if (!lookerUrl) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg text-red-600">
        環境変数 <code>NEXT_PUBLIC_LOOKER_STUDIO_URL</code>{" "}
        が設定されていません。
      </div>
    );
  }

  return (
    <div className="w-full">
      <iframe
        width="600"
        height="443"
        src={lookerUrl}
        style={{ border: 0, width: "100%", height: "1050px" }}
        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      ></iframe>
    </div>
  );
}
