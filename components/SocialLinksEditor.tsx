"use client";

import { SOCIAL_PLATFORMS, platformMeta } from "@/lib/socials";
import type { SocialLink } from "@/lib/types";
import SocialIcon from "@/components/SocialIcon";
import { FaPlus, FaTrash } from "react-icons/fa6";

/**
 * Esnek sosyal baglanti editoru: kullanici istedigi kadar platform ekler,
 * siler. "Ozel link" ile listede olmayan her seyi de ekleyebilir.
 */
export default function SocialLinksEditor({
  value,
  onChange,
}: {
  value: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}) {
  const update = (i: number, patch: Partial<SocialLink>) => {
    const next = value.map((l, idx) => (idx === i ? { ...l, ...patch } : l));
    onChange(next);
  };
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  // Kullanilan platformlar (custom haric -> custom coklu olabilir)
  const used = new Set(
    value.map((l) => l.platform).filter((p) => p !== "custom")
  );

  const add = () => {
    // Henuz eklenmemis ilk platformu sec; hepsi doluysa "Ozel link"e dus
    const next =
      SOCIAL_PLATFORMS.find((p) => p.key !== "custom" && !used.has(p.key))
        ?.key || "custom";
    onChange([...value, { platform: next, value: "" }]);
  };

  return (
    <div className="space-y-3">
      {value.map((link, i) => {
        const meta = platformMeta(link.platform);
        const isCustom = link.platform === "custom";
        const prefix = meta?.base?.replace(/^https?:\/\//, "");
        // Kullanici tam URL yapistirdiysa onek gosterme (kafa karistirmasin)
        const pastedFullUrl = /^https?:\/\//i.test(link.value || "");
        return (
          <div key={i} className="glass-soft rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white border border-black/[0.06]"
                style={{ color: meta?.color || "#6e6e73" }}
              >
                <SocialIcon platform={link.platform} className="text-sm" />
              </span>
              <select
                value={link.platform}
                onChange={(e) => update(i, { platform: e.target.value })}
                className="input-neon flex-1 py-2"
              >
                {SOCIAL_PLATFORMS.map((p) => (
                  <option
                    key={p.key}
                    value={p.key}
                    disabled={
                      p.key !== "custom" &&
                      p.key !== link.platform &&
                      used.has(p.key)
                    }
                  >
                    {p.label}
                    {p.key !== "custom" &&
                    p.key !== link.platform &&
                    used.has(p.key)
                      ? " (eklendi)"
                      : ""}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Kaldır"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-black/40 hover:text-red-600 hover:bg-red-500/[0.06] transition-colors flex-shrink-0"
              >
                <FaTrash className="text-xs" />
              </button>
            </div>

            {isCustom && (
              <input
                type="text"
                value={link.label || ""}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder="Görünecek ad (örn. Sahibinden)"
                className="input-neon py-2"
              />
            )}

            {prefix && !pastedFullUrl ? (
              <div className="flex items-stretch rounded-[0.85rem] border border-black/[0.14] bg-white overflow-hidden focus-within:border-[#4f46e5] focus-within:ring-2 focus-within:ring-[#4f46e5]/15 transition">
                <span className="px-2.5 flex items-center text-xs text-black/45 bg-black/[0.03] border-r border-black/[0.06] whitespace-nowrap">
                  {prefix}
                </span>
                <input
                  type="text"
                  value={link.value}
                  onChange={(e) => update(i, { value: e.target.value })}
                  placeholder="kullanıcı adı"
                  className="flex-1 min-w-0 px-3 py-2 bg-transparent outline-none text-sm"
                />
              </div>
            ) : (
              <input
                type="text"
                value={link.value}
                onChange={(e) => update(i, { value: e.target.value })}
                placeholder={meta?.placeholder || "https://..."}
                className="input-neon py-2"
              />
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={add}
        className="w-full glass-soft rounded-xl py-2.5 text-sm font-medium text-black/70 hover:text-black hover:bg-black/[0.03] transition-colors flex items-center justify-center gap-2"
      >
        <FaPlus className="text-xs" /> Bağlantı Ekle
      </button>
    </div>
  );
}
