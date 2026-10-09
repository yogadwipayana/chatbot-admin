import path from "node:path";

import type { NextConfig } from "next";

/**
 * Asal API yang dipanggil peramban, sama seperti `src/lib/api/client.ts`.
 * Kosong (`NEXT_PUBLIC_API_BASE_URL=`) berarti satu domain dengan dashboard,
 * jadi `'self'` sudah mencakupnya.
 */
function asalApi(): string | null {
  const alamat = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
  if (!alamat) return null;
  try {
    return new URL(alamat).origin;
  } catch {
    return null;
  }
}

const api = asalApi();

/**
 * Token admin tinggal di localStorage (`src/lib/auth/token.ts`), jadi XSS di
 * dashboard berarti token bocor. CSP ini tidak memakai nonce: `next-themes`
 * menyuntikkan skrip sebaris dan semua halaman dashboard statis, sedangkan
 * nonce memaksa setiap halaman dirender per permintaan. Yang tetap ditahan:
 * skrip dari domain lain, pengiriman ke mana pun selain API (`connect-src`,
 * `img-src`, `form-action`), `<base>` palsu, plugin, dan pembingkaian.
 * `'unsafe-eval'` hanya untuk `next dev` (React memakainya untuk jejak galat).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${api ? ` ${api}` : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const headerKeamanan = [
  { key: "Content-Security-Policy", value: csp },
  // Peramban lama yang belum mengenal `frame-ancestors`: tombol "Matikan
  // layanan chat" dan "Hapus permanen" tidak boleh dapat diklik lewat iframe.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  turbopack: {
    // Tanpa ini Turbopack menebak akar proyek dari package-lock.json terdekat,
    // yang di beberapa mesin pengembang ada di direktori home.
    root: path.join(__dirname),
  },
  async headers() {
    return [{ source: "/:path*", headers: headerKeamanan }];
  },
};

export default nextConfig;
