import type { SocialLink } from "./types";

export interface SocialPlatformMeta {
  key: string;
  label: string;
  color: string; // acik zeminde okunur marka rengi
  base?: string; // kullanici adi onekli platformlar; yoksa tam URL beklenir
  strip?: string; // kullanici adinin basindan kirpilacak karakter (orn "@")
  placeholder: string;
}

/** En cok kullanilan platformlar + Ozel link. Sirasi seçicide gorunur. */
export const SOCIAL_PLATFORMS: SocialPlatformMeta[] = [
  { key: "instagram", label: "Instagram", color: "#E1306C", base: "https://instagram.com/", strip: "@", placeholder: "kullanıcı adı" },
  { key: "whatsapp", label: "WhatsApp", color: "#25D366", placeholder: "telefon (90...) veya link" },
  { key: "linkedin", label: "LinkedIn", color: "#0A66C2", base: "https://linkedin.com/in/", placeholder: "kullanıcı adı veya link" },
  { key: "facebook", label: "Facebook", color: "#1877F2", base: "https://facebook.com/", placeholder: "kullanıcı adı veya link" },
  { key: "x", label: "X (Twitter)", color: "#000000", base: "https://x.com/", strip: "@", placeholder: "kullanıcı adı" },
  { key: "youtube", label: "YouTube", color: "#FF0000", placeholder: "kanal linki" },
  { key: "tiktok", label: "TikTok", color: "#000000", base: "https://tiktok.com/@", strip: "@", placeholder: "kullanıcı adı" },
  { key: "telegram", label: "Telegram", color: "#26A5E4", base: "https://t.me/", strip: "@", placeholder: "kullanıcı adı" },
  { key: "spotify", label: "Spotify", color: "#1DB954", placeholder: "profil/sanatçı linki" },
  { key: "snapchat", label: "Snapchat", color: "#C7A500", base: "https://snapchat.com/add/", strip: "@", placeholder: "kullanıcı adı" },
  { key: "custom", label: "Özel link", color: "#6e6e73", placeholder: "https://..." },
];

const BY_KEY: Record<string, SocialPlatformMeta> = Object.fromEntries(
  SOCIAL_PLATFORMS.map((p) => [p.key, p])
);

export function platformMeta(key: string): SocialPlatformMeta | undefined {
  return BY_KEY[key];
}

/** Kullanici degerinden tiklanabilir URL uretir. */
export function buildSocialHref(link: SocialLink): string {
  const meta = BY_KEY[link.platform];
  let v = (link.value || "").trim();
  if (!v) return "#";

  // Güvenlik: tehlikeli şemaları reddet (javascript:, data:, vbscript:)
  if (/^\s*(javascript|data|vbscript):/i.test(v)) return "#";

  // WhatsApp ozel: telefon ise wa.me'ye cevir
  if (link.platform === "whatsapp" && !/^https?:\/\//i.test(v)) {
    const digits = v.replace(/\D/g, "");
    return digits ? `https://wa.me/${digits}` : "#";
  }

  // Tam URL girilmisse oldugu gibi kullan
  if (/^https?:\/\//i.test(v)) return v;

  // Kullanici adi onekini kirp
  if (meta?.strip && v.startsWith(meta.strip)) {
    v = v.slice(meta.strip.length);
  }

  if (meta?.base) return meta.base + v;
  // Base yoksa: cikip link gibi davran
  return `https://${v}`;
}

/** Custom degilse platform etiketini, custom ise kullanicinin verdigi etiketi dondurur. */
export function socialLabel(link: SocialLink): string {
  if (link.platform === "custom") return link.label?.trim() || "Link";
  return BY_KEY[link.platform]?.label || link.platform;
}
