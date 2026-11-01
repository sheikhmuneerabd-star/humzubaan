import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@humzubaan/core"],
  serverExternalPackages: ["mongoose"],
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