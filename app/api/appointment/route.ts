import { getServiceClient } from "@/lib/supabaseServer";
import { takeToken, clientIp } from "@/lib/rateLimit";

/**
 * /api/appointment : Ziyaretçiden gelen randevu talebini kaydeder ve
 * (RESEND_API_KEY varsa) kart sahibine e-posta bildirimi gönderir.
 * Korumalar: IP başına dakikada 5 istek, honeypot, alan doğrulama.
 * Insert service-role ile; RLS'te anon insert KAPALI.
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = takeToken(`appt:${ip}`, 5, 60_000);
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

  // Honeypot
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return Response.json({ ok: true });
  }

  const cardId = String(body.card_id || "").trim();
  const date = String(body.date || "").trim();
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const note = String(body.note || "").trim();

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cardId)
  ) {
    return Response.json({ error: "Geçersiz kart" }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "Geçersiz tarih" }, { status: 400 });
  }
  // Tarih bugünden geçmişte olamaz, ~90 günden ileri olamaz
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const picked = new Date(`${date}T00:00:00`);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 90);
  if (isNaN(picked.getTime()) || picked < today || picked > maxDate) {
    return Response.json({ error: "Uygun olmayan tarih" }, { status: 400 });
  }
  if (!name || name.length > 120) {
    return Response.json({ error: "Ad gerekli" }, { status: 400 });
  }
  if (phone.length > 40 || note.length > 500) {
    return Response.json({ error: "Çok uzun" }, { status: 400 });
  }

  const supabase = getServiceClient();

  const { error: insErr } = await supabase.from("appointments").insert({
    card_id: cardId,
    date,
    visitor_name: name,
    visitor_phone: phone || null,
    note: note || null,
  });
  if (insErr) {
    return Response.json({ error: "Kaydedilemedi" }, { status: 500 });
  }

  // Sahibe e-posta bildirimi (anahtar yoksa sessizce atlanır)
  try {
    const key = process.env.RESEND_API_KEY;
    if (key) {
      const { data: card } = await supabase
        .from("digital_cards")
        .select("owner_email, first_name, last_name, slug")
        .eq("id", cardId)
        .single();
      if (card?.owner_email) {
        const dateTr = new Date(`${date}T00:00:00`).toLocaleDateString("tr-TR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Rity Card <noreply@ritycard.one>",
            to: [card.owner_email],
            subject: `Yeni randevu talebi — ${name}`,
            html: `
              <div style="font-family:Arial,sans-serif;color:#141416">
                <h2 style="margin:0 0 12px">📅 Yeni randevu talebi</h2>
                <p style="margin:0 0 6px"><b>Kişi:</b> ${escapeHtml(name)}</p>
                ${phone ? `<p style="margin:0 0 6px"><b>Telefon:</b> ${escapeHtml(phone)}</p>` : ""}
                <p style="margin:0 0 6px"><b>Tercih ettiği gün:</b> ${dateTr}</p>
                ${note ? `<p style="margin:0 0 6px"><b>Not:</b> ${escapeHtml(note)}</p>` : ""}
                <p style="margin:14px 0 0;color:#6b7280;font-size:13px">
                  Panelinden görüntüle: https://ritycard.one/dashboard
                </p>
              </div>`,
          }),
        });
      }
    }
  } catch {
    // e-posta başarısızlığı randevuyu bozmaz
  }

  return Response.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
