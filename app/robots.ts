import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Özel/işlevsel sayfalar aramada çıkmasın
      disallow: ["/dashboard", "/edit/", "/recover", "/register/", "/api/", "/admin"],
    },
    sitemap: "https://ritycard.one/sitemap.xml",
  };
}
