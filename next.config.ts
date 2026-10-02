import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure these server-only packages are not bundled for the browser
  serverExternalPackages: ['@huggingface/transformers'],
  // Empty turbopack config tells Next.js we are aware we're using Turbopack
  turbopack: {},
  webpack: (config) => {
    // Prevent node-only modules from being bundled for the browser
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    };
    return config;
  },
};

export default nextConfig;
