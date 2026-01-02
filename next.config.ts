/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production deployment configuration
  basePath: "/pfc",
  assetPrefix: "/pfc",
  output: "standalone",
  // Prevent 301 redirects for trailing slash normalization
  trailingSlash: false,
  // Disable automatic redirects that can cause loops
  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;

