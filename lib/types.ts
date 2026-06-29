export interface Profile {
  id: string;
  slug: string;
  status: "Bos" | "Aktif";
  first_name: string;
  last_name: string;
  title?: string | null;
  company?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  email: string;
  phone?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  iban?: string | null;
  address?: string | null;
  owner_id?: string | null;
  owner_email?: string | null;
  theme?: ThemeKey | null;
  view_count?: number | null;
  social_links?: SocialLink[] | null;
}

export interface SocialLink {
  platform: string; // SOCIAL_PLATFORMS key veya "custom"
  value: string; // kullanici adi veya tam URL
  label?: string; // sadece "custom" icin gosterilecek ad
}

export type ThemeKey = "mono" | "navy" | "emerald" | "gold";

export const THEMES: Record<
  ThemeKey,
  { name: string; accent: string; accent2: string; soft: string }
> = {
  mono: {
    name: "Siyah",
    accent: "#141416",
    accent2: "#3a3a3d",
    soft: "rgba(20, 20, 22, 0.10)",
  },
  navy: {
    name: "Lacivert",
    accent: "#1b2c52",
    accent2: "#2d4a82",
    soft: "rgba(27, 44, 82, 0.10)",
  },
  emerald: {
    name: "Zümrüt",
    accent: "#0f5132",
    accent2: "#157f4c",
    soft: "rgba(15, 81, 50, 0.10)",
  },
  gold: {
    name: "Altın",
    accent: "#8a6515",
    accent2: "#b8901f",
    soft: "rgba(138, 101, 21, 0.10)",
  },
};

export function themeStyle(key?: ThemeKey | null): React.CSSProperties {
  // Eski/bilinmeyen tema anahtarları (indigo, rose...) güvenle mono'ya düşer
  const t = (key && THEMES[key]) || THEMES.mono;
  return {
    ["--accent" as string]: t.accent,
    ["--accent-2" as string]: t.accent2,
    ["--accent-soft" as string]: t.soft,
  };
}
