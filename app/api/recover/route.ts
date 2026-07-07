import { createClient } from "@supabase/supabase-js";
import { takeToken, clientIp } from "@/lib/rateLimit";

/**
 * /api/recover : Magic-link gonderir. IP basina dakikada 3 istek limiti.
 *
 * Frontend [recover/page.tsx] dogrudan supabase.auth.signInWithOtp cagiriyordu
 * (anon key client'ta acik). Bu endpoint'i opsiyonel kullanmak istersen
 * sendRecoveryLink'i bu endpoint'e fetch'lemek uzere degistirebilirsin.
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = takeToken(`recover:${ip}`, 3, 60_000);
  if (!limit.ok) {
    return Response.json(
      {
        error: `Cok fazla deneme. ${Math.ceil(limit.retryAfterMs / 1000)} sn sonra tekrar dene.`,
      },
      { status: 429, headers: { "retry-after": `${Math.ceil(limit.retryAfterMs / 1000)}` } }
    );
  }

  let email: string;
  let slug: string | null = null;
  try {
    const body = await req.json();
    email = String(body?.email || "").trim();
    const rawSlug = body?.slug ? String(body.slug).trim() : "";
    // Sadece guvenli slug karakterlerine izin ver (acik yonlendirme onlemi)
    if (rawSlug && /^[a-zA-Z0-9_-]+$/.test(rawSlug)) slug = rawSlug;
  } catch {
    return Response.json({ error: "Gecersiz istek" }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Gecerli bir e-posta gir" }, { status: 400 });
  }

  const origin =
    req.headers.get("origin") ||
    new URL(req.url).origin;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/recover${
        slug ? `?slug=${encodeURIComponent(slug)}` : ""
      }`,
    },
  });

  if (error) {
    // Ham Supabase hatasını sızdırma (enumeration/iç durum ipucu önlemi)
    console.error("recover signInWithOtp error:", error.message);
    return Response.json(
      { error: "Şu an gönderilemedi, biraz sonra tekrar dene." },
      { status: 500 }
    );
  }

  return Response.json({ ok: true });
}
