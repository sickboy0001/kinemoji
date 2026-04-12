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
};

export default nextConfig;
