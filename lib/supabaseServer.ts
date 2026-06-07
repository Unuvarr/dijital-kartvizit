import { createClient } from "@supabase/supabase-js";
import type { Profile } from "./types";

/**
 * Server-side Supabase client. Sadece public read icin kullanilir
 * (RLS "Herkes okuyabilir" politikasi). Anon key, server'da da gecerli.
 */
function getServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

/** Slug'a gore karti server'da cek. Bulunamazsa null. */
export async function fetchCardBySlug(slug: string): Promise<Profile | null> {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("digital_cards")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data as Profile;
}
