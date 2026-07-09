"use client";

import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { sanitizeField } from "@/lib/formSanitize";
import type { IbanItem } from "@/lib/types";

const MAX = 4;

export default function IbansEditor({
  value,
  onChange,
}: {
  value: IbanItem[];
  onChange: (v: IbanItem[]) => void;
}) {
  const rows = value.length ? value : [];

  const update = (i: number, patch: Partial<IbanItem>) => {
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };
  const add = () => {
    if (rows.length >= MAX) return;
    onChange([...rows, { label: "", value: "" }]);
  };
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      {rows.length === 0 && (
        <p className="text-sm text-black/45">
          Henüz IBAN yok. Birden fazla IBAN ekleyebilirsin (ör. farklı bankalar).
        </p>
      )}

      {rows.map((row, i) => (
        <div
          key={i}
          className="rounded-2xl border border-black/[0.08] bg-black/[0.015] p-3.5 space-y-2.5"
        >
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center text-black/50 bg-black/[0.04] border border-black/[0.06] flex-shrink-0 font-semibold text-sm">
              ₺
            </span>
            <input
              type="text"
              value={row.label || ""}
              onChange={(e) => update(i, { label: e.target.value.slice(0, 40) })}
              placeholder="Banka adı (ör. Ziraat) — opsiyonel"
              className="input-neon !py-2.5 flex-1"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="IBAN'ı sil"
              title="IBAN'ı sil"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-black/35 hover:text-red-600 hover:bg-red-500/[0.06] transition-colors flex-shrink-0"
            >
              <FaTrashAlt className="text-sm" />
            </button>
          </div>
          <input
            type="text"
            value={row.value}
            onChange={(e) => update(i, { value: sanitizeField("iban", e.target.value) })}
            placeholder="TRXX XXXX XXXX XXXX XXXX XXXX XX"
            className="input-neon font-mono"
          />
        </div>
      ))}

      {rows.length < MAX && (
        <button
          type="button"
          onClick={add}
          className="w-full glass-soft rounded-xl py-2.5 text-sm font-medium text-black/70 hover:text-black hover:bg-black/[0.03] transition-colors flex items-center justify-center gap-2"
        >
          <FaPlus className="text-xs" /> IBAN ekle
        </button>
      )}
    </div>
  );
}
