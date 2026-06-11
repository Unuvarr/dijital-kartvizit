import { getServiceClient } from "@/lib/supabaseServer";
import { takeToken, clientIp } from "@/lib/rateLimit";

/**
 * /api/lead : Ziyaretciden gelen iletisim bilgisini kaydeder.
 * Korumalar: IP basina dakikada 5 istek, honeypot (bot tuzagi), alan dogrulama.
 * Insert service-role ile yapilir; RLS'te anon insert KAPALI (dogrudan
 * spam engellenir).
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = takeToken(`lead:${ip}`, 5, 60_000);
  if (!limit.ok) {
    return Response.json(
      { error: "Çok fazla deneme. Biraz sonra tekrar dene." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  // Honeypot: gizli alan doluysa bot -> sessizce basarili don (kaydetme)
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return Response.json({ ok: true });
  }

  const cardId = String(body.card_id || "").trim();
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const email = String(body.email || "").trim();
  const company = String(body.company || "").trim();
  const message = String(body.message || "").trim();

  // UUID formatinda card_id bekle
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      cardId
    )
  ) {
    return Response.json({ error: "Geçersiz kart" }, { status: 400 });
  }
  if (!name || name.length > 120) {
    return Response.json({ error: "Ad gerekli" }, { status: 400 });
  }
  if (!phone && !email) {
    return Response.json(
      { error: "Telefon veya e-posta gerekli" },
      { status: 400 }
    );
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Geçersiz e-posta" }, { status: 400 });
  }
  // Uzunluk sinirlari (asiri veri/abuse engeli)
  if (phone.length > 40 || company.length > 120 || message.length > 1000) {
    return Response.json({ error: "Çok uzun" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from("card_leads").insert({
    card_id: cardId,
    name,
    phone: phone || null,
    email: email || null,
    company: company || null,
    message: message || null,
  });

  if (error) {
    // GECICI TESHIS: gercek hatayi don (sonra kaldirilacak)
    return Response.json(
      {
        error: "Kaydedilemedi",
        debug: {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          keyLen: (process.env.SUPABASE_SERVICE_ROLE_KEY || "").length,
        },
      },
      { status: 500 }
    );
  }
  return Response.json({ ok: true });
}
