import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Public-facing base URL (production domain, e.g. https://example.com). Falls back to localhost for dev.
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3003";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
