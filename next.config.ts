import type { NextConfig } from "next";
import {
  ALLOWED_IMAGE_HOSTS,
  ALLOWED_VIDEO_EMBED_HOSTS,
} from "./lib/allowlist";

const cspImgSrc = ["'self'", "data:", ...ALLOWED_IMAGE_HOSTS.map((h) => `https://${h}`)].join(" ");
const cspFrameSrc = ["'self'", ...ALLOWED_VIDEO_EMBED_HOSTS.map((h) => `https://${h}`)].join(" ");

// 'unsafe-inline' script-src is required by Next.js hydration without a
// nonce-middleware setup — acceptable for this static, no-user-data PoC.
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src ${cspImgSrc}`,
  `frame-src ${cspFrameSrc}`,
  `font-src 'self'`,
  `connect-src 'self'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'self'`,
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
