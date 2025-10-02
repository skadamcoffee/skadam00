/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // this tells Next.js to generate a static export
  experimental: {
    typedRoutes: true // keep this if you use Expo Router
  },
};

module.exports = nextConfig;
