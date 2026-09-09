/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // scripts/deploy-frontend.sh sets STATIC_EXPORT=true to produce the out/
  // directory that gets synced to S3 (LocalStack or real AWS). Local dev via
  // `docker compose up` runs the normal Next.js dev server instead.
  ...(process.env.STATIC_EXPORT === "true" ? { output: "export" } : {}),
};

module.exports = nextConfig;
