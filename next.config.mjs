/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
};

// Lets `next dev` emulate the D1/KV bindings the API routes need, instead
// of only working when proxied through `wrangler pages dev`.
if (process.env.NODE_ENV === "development") {
  const { setupDevPlatform } = await import("@cloudflare/next-on-pages/next-dev");
  await setupDevPlatform();
}

export default nextConfig;
