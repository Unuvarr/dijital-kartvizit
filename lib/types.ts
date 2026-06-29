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

export type ThemeKey = "mono" | "indigo" | "emerald" | "rose" | "amber" | "slate";

export const THEMES: Record<
  ThemeKey,
  { name: string; accent: string; accent2: string; soft: string }
> = {
  mono: {
    name: "Siyah-Beyaz",
    accent: "#141416",
    accent2: "#3a3a3d",
    soft: "rgba(20, 20, 22, 0.10)",
  },
  indigo: {
    name: "Indigo",
    accent: "#4f46e5",
    accent2: "#7c3aed",
    soft: "rgba(79, 70, 229, 0.12)",
  },
  emerald: {
    name: "Zümrüt",
    accent: "#059669",
    accent2: "#0d9488",
    soft: "rgba(5, 150, 105, 0.12)",
  },
  rose: {
    name: "Gül",
    accent: "#e11d48",
    accent2: "#db2777",
    soft: "rgba(225, 29, 72, 0.12)",
  },
  amber: {
    name: "Kehribar",
    accent: "#d97706",
    accent2: "#ea580c",
    soft: "rgba(217, 119, 6, 0.12)",
  },
  slate: {
    name: "Antrasit",
    accent: "#334155",
    accent2: "#1e293b",
    soft: "rgba(51, 65, 85, 0.12)",
  },
};

export function themeStyle(key?: ThemeKey | null): React.CSSProperties {
  const t = THEMES[key || "mono"];
  return {
    ["--accent" as string]: t.accent,
    ["--accent-2" as string]: t.accent2,
    ["--accent-soft" as string]: t.soft,
  };
}
