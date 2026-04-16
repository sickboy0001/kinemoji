import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-39f349e1ff8d4e5fb729e7fc4866e158.r2.dev", // R2 公開 URL も追加
        port: "",
        pathname: "/**",
      },
    ],
  },
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
