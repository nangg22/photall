import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Config needed for @huggingface/transformers to work in the browser
  serverExternalPackages: ['@huggingface/transformers'],
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    }
    return config;
  },
  experimental: {
    turbopack: {
      resolveAlias: {
        "sharp$": "",
        "onnxruntime-node$": "",
      }
    }
  }
};

export default nextConfig;
