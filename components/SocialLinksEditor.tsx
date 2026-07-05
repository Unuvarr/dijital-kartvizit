"use client";

import { SOCIAL_PLATFORMS, platformMeta } from "@/lib/socials";
import type { SocialLink } from "@/lib/types";
import PlatformSelect from "@/components/PlatformSelect";
import SocialIcon from "@/components/SocialIcon";
import { FaTrash } from "react-icons/fa6";

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

  const add = (key: string) => {
    if (key !== "custom" && used.has(key)) return;
    onChange([...value, { platform: key, value: "" }]);
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
              <PlatformSelect
                value={link.platform}
                used={used}
                onChange={(key) => update(i, { platform: key })}
              />
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
                onChange={(e) =>
                  update(i, { label: e.target.value.slice(0, 30) })
                }
                maxLength={30}
                placeholder="Görünecek ad (örn. Sahibinden)"
                className="input-neon py-2"
              />
            )}

            {prefix && !pastedFullUrl ? (
              <div className="flex items-stretch rounded-[0.85rem] border border-black/[0.14] bg-white overflow-hidden focus-within:border-[#141416] focus-within:ring-2 focus-within:ring-[#141416]/15 transition">
                <span className="px-2.5 flex items-center text-xs text-black/45 bg-black/[0.03] border-r border-black/[0.06] whitespace-nowrap">
                  {prefix}
                </span>
                <input
                  type="text"
                  value={link.value}
                  onChange={(e) =>
                    update(i, { value: e.target.value.slice(0, 120) })
                  }
                  maxLength={120}
                  placeholder="kullanıcı adı"
                  className="flex-1 min-w-0 px-3 py-2 bg-transparent outline-none text-sm"
                />
              </div>
            ) : (
              <input
                type="text"
                value={link.value}
                onChange={(e) =>
                  update(i, { value: e.target.value.slice(0, 120) })
                }
                maxLength={120}
                placeholder={meta?.placeholder || "https://..."}
                className="input-neon py-2"
              />
            )}
          </div>
        );
      })}

      <div>
        <p className="text-xs text-black/45 mb-2">Bağlantı ekle</p>
        <div className="grid grid-cols-6 gap-2">
          {SOCIAL_PLATFORMS.map((p) => {
            const isUsed = p.key !== "custom" && used.has(p.key);
            return (
              <button
                key={p.key}
                type="button"
                disabled={isUsed}
                onClick={() => add(p.key)}
                title={p.label}
                aria-label={p.label}
                className={`aspect-square rounded-xl flex items-center justify-center border transition-colors ${
                  isUsed
                    ? "opacity-30 cursor-not-allowed border-black/[0.06]"
                    : "glass-soft border-black/[0.06] hover:bg-black/[0.04]"
                }`}
              >
                <SocialIcon
                  platform={p.key}
                  className="text-lg"
                  style={{ color: p.color }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
