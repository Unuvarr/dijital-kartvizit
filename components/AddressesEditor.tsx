"use client";

import { FaPlus, FaTrashAlt, FaMapMarkerAlt, FaHome, FaBriefcase } from "react-icons/fa";
import type { AddressItem } from "@/lib/types";

const MAX = 6; // pratik "birkaç" sınırı

const PRESETS: { label: string; text: string; Icon: typeof FaHome }[] = [
  { label: "Ev", text: "Ev", Icon: FaHome },
  { label: "İş", text: "İş", Icon: FaBriefcase },
  { label: "", text: "Diğer", Icon: FaPlus },
];

export default function AddressesEditor({
  value,
  onChange,
}: {
  value: AddressItem[];
  onChange: (v: AddressItem[]) => void;
}) {
  const rows = value.length ? value : [];

  const update = (i: number, patch: Partial<AddressItem>) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    onChange(next);
  };
  const add = (label: string) => {
    if (rows.length >= MAX) return;
    onChange([...rows, { label, value: "" }]);
  };
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      {rows.length === 0 && (
        <p className="text-sm text-black/45">
          Henüz adres yok. Birden fazla adres ekleyebilirsin (ör. Ofis, Şube).
        </p>
      )}

      {rows.map((row, i) => {
        // Ev/İş sabit etiket; yalnız "Diğer" (serbest) satırda metin kutusu
        const fixed = row.label === "Ev" || row.label === "İş";
        const RowIcon =
          row.label === "Ev" ? FaHome : row.label === "İş" ? FaBriefcase : FaMapMarkerAlt;
        return (
          <div
            key={i}
            className="rounded-2xl border border-black/[0.08] bg-black/[0.015] p-3.5 space-y-2.5"
          >
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-black/50 bg-black/[0.04] border border-black/[0.06] flex-shrink-0">
                <RowIcon className="text-xs" />
              </span>
              {fixed ? (
                <span className="flex-1 text-sm font-medium text-[#1d1d1f]">
                  {row.label}
                </span>
              ) : (
                <input
                  type="text"
                  value={row.label || ""}
                  onChange={(e) => update(i, { label: e.target.value.slice(0, 30) })}
                  placeholder="Etiket (ör. Depo, Şube)"
                  className="input-neon !py-2.5 flex-1"
                />
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Adresi sil"
                title="Adresi sil"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-black/35 hover:text-red-600 hover:bg-red-500/[0.06] transition-colors flex-shrink-0"
              >
                <FaTrashAlt className="text-sm" />
              </button>
            </div>
            <textarea
              value={row.value}
              onChange={(e) => update(i, { value: e.target.value.slice(0, 300) })}
              rows={2}
              placeholder="Adres metni"
              className="input-neon resize-none"
            />
          </div>
        );
      })}

      {rows.length < MAX && (
        <div>
          <p className="text-xs text-black/45 mb-2">Adres ekle</p>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map(({ label, text, Icon }) => (
              <button
                key={text}
                type="button"
                onClick={() => add(label)}
                className="glass-soft rounded-xl py-2.5 text-sm font-medium text-black/70 hover:text-black hover:bg-black/[0.03] transition-colors flex items-center justify-center gap-2"
              >
                <Icon className="text-xs" /> {text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
