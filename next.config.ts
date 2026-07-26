import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  basePath,
  output: process.env.GITHUB_PAGES === "true" ? "export" : undefined,
  trailingSlash: process.env.GITHUB_PAGES === "true",
  typescript: process.env.GITHUB_PAGES === "true"
    ? { tsconfigPath: "tsconfig.pages.json" }
    : undefined,
};

export default nextConfig;
