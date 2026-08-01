import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "192.168.1.104",
    "192.168.1.104:4000",
    "10.83.57.221",
    "10.83.57.221:4000",
  ],
  reactCompiler: true,
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
};

export default nextConfig;
