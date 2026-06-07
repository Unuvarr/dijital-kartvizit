import { supabase } from "./supabaseClient";

const VIEW_KEY = (slug: string) => `viewed:${slug}`;

/**
 * Profil sayfasinda 1 gorunum kaydeder.
 * Ayni cihazdan 24 saat icinde tekrar saymaz (localStorage).
 * Dondurdugu deger yeni toplam view_count (RPC'den).
 */
export async function trackView(slug: string): Promise<number | null> {
  try {
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

export interface CardViewRow {
  viewed_at: string;
  referrer: string | null;
  user_agent: string | null;
}

/** Sahibinin paneli icin: son N gunluk gorunumler. */
export async function fetchViewSeries(
  cardId: string,
  days = 14
): Promise<CardViewRow[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("card_views")
    .select("viewed_at, referrer, user_agent")
    .eq("card_id", cardId)
    .gte("viewed_at", since.toISOString())
    .order("viewed_at", { ascending: false })
    .limit(500);

  if (error) {
    console.warn("fetchViewSeries failed:", error.message);
    return [];
  }
  return (data as CardViewRow[]) || [];
}
