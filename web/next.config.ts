import path from "node:path";
import type { NextConfig } from "next";

// The API keys live in the root .env. Variables that are already set win.
try {
  process.loadEnvFile(path.join(process.cwd(), "..", ".env"));
} catch {
  // No root .env, for example in the Docker build. The app then uses mock recipes.
}

const nextConfig: NextConfig = {
  // Only the Docker image runs the standalone server.
  output: process.env.STANDALONE_BUILD ? "standalone" : undefined,
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
