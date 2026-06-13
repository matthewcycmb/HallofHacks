import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // No SEO value + user-specific: keep crawlers out.
      disallow: ["/api/", "/account", "/collections", "/signup"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
