import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  // Public-facing base URL (production domain, e.g. https://example.com). Falls back to localhost for dev.
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3003";
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
