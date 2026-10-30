import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only the Docker image runs the standalone server.
  output: process.env.STANDALONE_BUILD ? "standalone" : undefined,
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
