import { createClient } from "@supabase/supabase-js";

/**
 * /api/health : Hafif saglik kontrolu. Supabase'e kucuk bir sorgu atar
 * (uptime monitoru bunu 5 dk'da bir ping'leyince Supabase uyumaz).
 * Karta bagimli degil; her zaman calisir.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );
    // En hafif sorgu: 1 satir basligi (veri cekmeden DB'ye dokunur)
    const { error } = await supabase
      .from("digital_cards")
      .select("id", { count: "exact", head: true })
      .limit(1);

    if (error) {
      return Response.json({ ok: false }, { status: 500 });
    }
    return Response.json({ ok: true, ts: Date.now() });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
