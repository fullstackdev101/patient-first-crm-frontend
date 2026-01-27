/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production deployment configuration
  basePath: "/pfc",
  assetPrefix: "/pfc",
  output: "standalone",
  // Ensure trailing slashes are removed for consistent routing
  trailingSlash: false,
};

module.exports = nextConfig;
