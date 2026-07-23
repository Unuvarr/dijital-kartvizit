import { supabase } from "./supabaseClient";

const VIEW_KEY = (slug: string) => `viewed:${slug}`;
// /admin'e giris yapilmis cihaz ekip cihazidir: demo okutmalari istatistige girmez
const ADMIN_DEVICE_KEY = "rity_admin_key";

/**
 * Profil sayfasinda 1 gorunum kaydeder.
 * Sayilmayanlar: kartin sahibi (ProfileClient'ta), yonetici cihazi,
 * ayni cihazdan 24 saat icindeki tekrarlar (localStorage).
 * Dondurdugu deger yeni toplam view_count (RPC'den).
 */
export async function trackView(slug: string): Promise<number | null> {
  try {
    if (localStorage.getItem(ADMIN_DEVICE_KEY)) return null;
    const last = localStorage.getItem(VIEW_KEY(slug));
    if (last) {
      const lastTs = parseInt(last, 10);
      if (!isNaN(lastTs) && Date.now() - lastTs < 24 * 60 * 60 * 1000) {
        return null;
      }
    }
  } catch {
    // localStorage yoksa devam et
  }

  const { data, error } = await supabase.rpc("increment_view", {
    p_slug: slug,
  });

  if (error) {
    console.warn("View tracking failed:", error.message);
    return null;
  }

  try {
    localStorage.setItem(VIEW_KEY(slug), Date.now().toString());
  } catch {
    // ignore
  }

  return typeof data === "number" ? data : null;
}
