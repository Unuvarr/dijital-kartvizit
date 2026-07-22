import { getServiceClient } from "@/lib/supabaseServer";
import { takeToken, clientIp } from "@/lib/rateLimit";

/**
 * /api/admin/stats : Yonetici paneli verisi.
 * Koruma: ADMIN_KEY (env) dogrulamasi + IP basina dakikada 10 deneme.
 * Service-role SADECE anahtar dogrulandiktan sonra kullanilir.
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = takeToken(`admin:${ip}`, 10, 60_000);
  if (!limit.ok) {
    return Response.json({ error: "Çok fazla deneme" }, { status: 429 });
  }

  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) {
    return Response.json(
      { error: "ADMIN_KEY tanımlı değil (Vercel ortam değişkeni ekle)" },
      { status: 503 }
    );
  }

  let body: { key?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Geçersiz istek" }, { status: 400 });
  }
  if (!body.key || body.key !== adminKey) {
    return Response.json({ error: "Geçersiz anahtar" }, { status: 401 });
  }

  const supabase = getServiceClient();

  const { data: cards, error: cardsErr } = await supabase
    .from("digital_cards")
    .select(
      "id, slug, status, first_name, last_name, title, company, view_count, owner_email, avatar_url"
    )
    .order("view_count", { ascending: false });

  if (cardsErr || !cards) {
    return Response.json({ error: "Veri alınamadı" }, { status: 500 });
  }

  // Lead sayilari: kart basina grupla
  const { data: leads } = await supabase.from("card_leads").select("card_id");
  const leadCounts: Record<string, number> = {};
  for (const l of leads ?? []) {
    leadCounts[l.card_id] = (leadCounts[l.card_id] ?? 0) + 1;
  }

  const rows = cards.map((c) => ({
    slug: c.slug,
    name: [c.first_name, c.last_name].filter(Boolean).join(" ") || "—",
    status: c.status,
    title: c.title,
    company: c.company,
    views: c.view_count ?? 0,
    leads: leadCounts[c.id] ?? 0,
    hasPhoto: Boolean(c.avatar_url),
    hasEmail: Boolean(c.owner_email),
  }));

  const ozet = {
    toplamKart: rows.length,
    aktifKart: rows.filter((r) => r.status === "Aktif").length,
    toplamOkutulma: rows.reduce((a, r) => a + r.views, 0),
    toplamLead: rows.reduce((a, r) => a + r.leads, 0),
  };

  return Response.json({ ozet, rows });
}
