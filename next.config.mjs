/** @type {import('next').NextConfig} */
const r2PublicUrl = process.env.R2_PUBLIC_URL;

let r2Hostname;
if (r2PublicUrl) {
  try {
    r2Hostname = new URL(r2PublicUrl).hostname;
  } catch {
    r2Hostname = undefined;
  }
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: r2Hostname
      ? [
          {
            protocol: "https",
            hostname: r2Hostname,
            pathname: "/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
