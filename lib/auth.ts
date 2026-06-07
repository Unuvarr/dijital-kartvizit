import { supabase } from "./supabaseClient";

/**
 * Mevcut oturumdaki kullanicinin id'sini dondurur (anonim olabilir).
 * Oturum yoksa null doner.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/**
 * Cihazda bir oturum yoksa sessizce anonim oturum acar ve kullanici id'sini doner.
 * Kullanici hicbir sey yapmaz; bu "cihaz tanima"nin temelidir.
 */
export async function ensureAnonymousSession(): Promise<string> {
  const existing = await getCurrentUserId();
  if (existing) return existing;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    throw new Error(
      error?.message ||
        "Anonim oturum acilamadi. Supabase'de 'Anonymous sign-ins' ayarini kontrol et."
    );
  }
  return data.user.id;
}

/**
 * Kurtarma icin anonim hesaba e-posta baglar.
 * Kullanici e-postasina onay/giris linki gider; tiklayinca ayni hesaba
 * (ayni id) baska cihazdan da girebilir. Cihaz kaybinda erisim bu sayede geri alinir.
 */
export async function linkRecoveryEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ email });
  if (error) throw new Error(error.message);
}

/**
 * Kurtarma akisi: e-postaya tek kullanimlik giris linki gonderir.
 * /api/recover route'u rate-limited (IP basina dk'da 3) ve sunucudan gonderir.
 */
export async function sendRecoveryLink(
  email: string,
  slug?: string
): Promise<void> {
  const res = await fetch("/api/recover", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, slug }),
  });
  if (!res.ok) {
    let msg = "Link gonderilemedi";
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
}
