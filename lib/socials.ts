import type { SocialLink } from "./types";

export interface SocialPlatformMeta {
  key: string;
  label: string;
  color: string; // acik zeminde okunur marka rengi
  base?: string; // kullanici adi onekli platformlar; yoksa tam URL beklenir
  strip?: string; // kullanici adinin basindan kirpilacak karakter (orn "@")
  placeholder: string;
}

/** Hazir platformlar (Google Maps & Drive haric). Sirasi seçicide gorunur. */
export const SOCIAL_PLATFORMS: SocialPlatformMeta[] = [
  { key: "instagram", label: "Instagram", color: "#E1306C", base: "https://instagram.com/", strip: "@", placeholder: "kullanıcı adı" },
  { key: "x", label: "X (Twitter)", color: "#000000", base: "https://x.com/", strip: "@", placeholder: "kullanıcı adı" },
  { key: "facebook", label: "Facebook", color: "#1877F2", base: "https://facebook.com/", placeholder: "kullanıcı adı veya link" },
  { key: "linkedin", label: "LinkedIn", color: "#0A66C2", base: "https://linkedin.com/in/", placeholder: "kullanıcı adı veya link" },
  { key: "youtube", label: "YouTube", color: "#FF0000", placeholder: "kanal linki" },
  { key: "tiktok", label: "TikTok", color: "#000000", base: "https://tiktok.com/@", strip: "@", placeholder: "kullanıcı adı" },
  { key: "snapchat", label: "Snapchat", color: "#C7A500", base: "https://snapchat.com/add/", strip: "@", placeholder: "kullanıcı adı" },
  { key: "pinterest", label: "Pinterest", color: "#E60023", base: "https://pinterest.com/", placeholder: "kullanıcı adı" },
  { key: "reddit", label: "Reddit", color: "#FF4500", base: "https://reddit.com/user/", strip: "u/", placeholder: "kullanıcı adı" },
  { key: "threads", label: "Threads", color: "#000000", base: "https://threads.net/@", strip: "@", placeholder: "kullanıcı adı" },
  { key: "telegram", label: "Telegram", color: "#26A5E4", base: "https://t.me/", strip: "@", placeholder: "kullanıcı adı" },
  { key: "whatsapp", label: "WhatsApp", color: "#25D366", placeholder: "telefon (90...) veya link" },
  { key: "discord", label: "Discord", color: "#5865F2", placeholder: "davet linki" },
  { key: "spotify", label: "Spotify", color: "#1DB954", placeholder: "profil/sanatçı linki" },
  { key: "twitch", label: "Twitch", color: "#9146FF", base: "https://twitch.tv/", placeholder: "kullanıcı adı" },
  { key: "soundcloud", label: "SoundCloud", color: "#FF5500", base: "https://soundcloud.com/", placeholder: "kullanıcı adı" },
  { key: "github", label: "GitHub", color: "#181717", base: "https://github.com/", placeholder: "kullanıcı adı" },
  { key: "behance", label: "Behance", color: "#1769FF", base: "https://behance.net/", placeholder: "kullanıcı adı" },
  { key: "dribbble", label: "Dribbble", color: "#EA4C89", base: "https://dribbble.com/", placeholder: "kullanıcı adı" },
  { key: "medium", label: "Medium", color: "#000000", base: "https://medium.com/@", strip: "@", placeholder: "kullanıcı adı" },
  { key: "paypal", label: "PayPal", color: "#003087", base: "https://paypal.me/", placeholder: "kullanıcı adı" },
  { key: "airbnb", label: "Airbnb", color: "#FF5A5F", placeholder: "profil linki" },
  { key: "clubhouse", label: "Clubhouse", color: "#5B4636", base: "https://clubhouse.com/@", strip: "@", placeholder: "kullanıcı adı" },
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
