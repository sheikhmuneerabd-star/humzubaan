import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // core package TypeScript mein hai, isliye Next.js ko compile karne ko kehna parta hai
  transpilePackages: ["@humzubaan/core"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;