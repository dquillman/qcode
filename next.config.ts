import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a minimal server for Docker/Cloud Run
  output: "standalone",
};

export default nextConfig;
