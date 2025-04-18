const removeImports = require("next-remove-imports")();

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx", "md"],
  experimental: {
    mdxRs: true,
  },
};

module.exports = removeImports(nextConfig);
