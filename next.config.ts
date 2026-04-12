import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/kinemoji/gif",
        destination: "/api/kinemoji/gif",
      },
      {
        source: "/kinemoji/status/:id",
        destination: "/api/kinemoji/status/:id",
      },
    ];
  },
  // Turbopack 設定を空にすることで、webpack 設定との競合を回避
  // Next.js 16 では Turbopack がデフォルトで有効
  turbopack: {},
};

export default nextConfig;
