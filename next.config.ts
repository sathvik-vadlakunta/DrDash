import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep type errors and lint failures fatal in `next build`; `pnpm verify`
  // runs both explicitly, but the Vercel build must also refuse a broken tree.
  reactStrictMode: true,
};

export default nextConfig;
