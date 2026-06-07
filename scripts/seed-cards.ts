/**
 * Toplu slug uretici (admin scripti).
 *
 * Kullanim:
 *   npx tsx scripts/seed-cards.ts --count 50 --prefix "krt" --out cards.csv
 *
 * Gereklilik:
 *   - SUPABASE_SERVICE_ROLE_KEY env'de olmali (Supabase Project Settings > API).
 *   - NEXT_PUBLIC_SUPABASE_URL env'de.
 *
 * Cikti: CSV (slug,url) - NFC encoder'ina yuklemek icin.
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (name: string, def?: string) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : def;
  };
  return {
    count: parseInt(get("count", "10")!, 10),
    prefix: get("prefix", "krt")!,
    out: get("out", "cards.csv")!,
    baseUrl: get("base", "https://kartvizit.example.com")!,
  };
}

const ALPH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // okunabilir alfabe (I,O,0,1 yok)
function genSlug(prefix: string, len = 6) {
  let s = "";
  for (let i = 0; i < len; i++) {
    s += ALPH[Math.floor(Math.random() * ALPH.length)];
  }
  return `${prefix}-${s}`;
}

async function main() {
  const { count, prefix, out, baseUrl } = parseArgs();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "HATA: NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY env olarak gerekli."
    );
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const rows: { slug: string; status: "Bos" }[] = [];
  const used = new Set<string>();
  while (rows.length < count) {
    const slug = genSlug(prefix);
    if (used.has(slug)) continue;
    used.add(slug);
    rows.push({ slug, status: "Bos" });
  }

  console.log(`Yukleniyor: ${count} adet boş kart...`);
  const { error } = await supabase.from("digital_cards").insert(rows);
  if (error) {
    console.error("Insert hatasi:", error.message);
    process.exit(1);
  }

  const csv =
    "slug,url\n" +
    rows.map((r) => `${r.slug},${baseUrl.replace(/\/$/, "")}/${r.slug}`).join("\n");
  writeFileSync(out, csv, "utf8");

  console.log(`Tamam. ${count} kart eklendi, CSV: ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
