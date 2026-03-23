/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@trading/types", "@trading/db"],
};

module.exports = nextConfig;
