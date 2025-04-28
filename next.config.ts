const removeImports = require("next-remove-imports")();

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  pageExtensions: ["ts", "tsx", "mdx", "md"],
  experimental: {
    mdxRs: true,
  },
};

module.exports = removeImports(nextConfig);
