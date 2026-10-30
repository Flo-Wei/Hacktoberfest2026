import { existsSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

// The team keeps one .env at the repo root, but Next.js only reads web/.
const rootEnv = path.resolve(process.cwd(), "..", ".env");
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const nextConfig: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
