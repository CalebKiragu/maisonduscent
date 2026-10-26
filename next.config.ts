import type { NextConfig } from "next";

const preview = process.env.PREVIEW_MODE === "true";

const nextConfig: NextConfig = {
  images: {
    // Render's 512 MB free instance is too small for on-demand sharp
    // conversions across pages with many product images. The source files
    // are already sized for the storefront, so serve them directly in preview.
    unoptimized: preview,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1440, 1920],
    imageSizes: [64, 96, 128, 192, 256, 384],
  },
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      ...(preview
        ? [
            {
              source: "/:path*",
              headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
            },
          ]
        : []),
      {
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
