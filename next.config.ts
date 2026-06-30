import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking — disallow embedding in iframes
  { key: "X-Frame-Options",        value: "DENY" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Stop browsers leaking the referrer to third parties
  { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
  // Disable browser features not needed by this app
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Enforce HTTPS for one year (only active in production behind HTTPS)
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  // Content Security Policy — lock down script/style/frame sources
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js App Router requires 'unsafe-inline' for hydration scripts
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // Supabase (HTTP + WebSocket for realtime) + OpenRouter
      `connect-src 'self' https://kvqbxlzsksqblnpnbwkh.supabase.co wss://kvqbxlzsksqblnpnbwkh.supabase.co https://openrouter.ai`,
      "img-src 'self' data: blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // Prevent exposing server internals in error responses
  poweredByHeader: false,
};

export default nextConfig;
