import type { MetadataRoute } from "next";

// Sadece herkese açık pazarlama sayfaları. Profiller gizlilik gereği
// otomatik listelenmez (kullanıcı isterse linkini kendi paylaşır).
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://ritycard.one";
  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/gizlilik`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
