"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronDown, FaCheck } from "react-icons/fa6";
import { SOCIAL_PLATFORMS, platformMeta } from "@/lib/socials";
import SocialIcon from "@/components/SocialIcon";

/** Ozel (yuvarlak, ikonlu) platform secici - native select yerine. */
export default function PlatformSelect({
  value,
  used,
  onChange,
}: {
  value: string;
  used: Set<string>;
  onChange: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const meta = platformMeta(value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 rounded-xl border border-black/[0.14] bg-white px-3 py-2 text-sm hover:border-black/25 transition"
      >
        <span
          className="flex items-center justify-center w-5 h-5 flex-shrink-0"
          style={{ color: meta?.color || "#6e6e73" }}
        >
          <SocialIcon platform={value} className="text-sm" />
        </span>
        <span className="flex-1 text-left truncate text-[#1d1d1f]">
          {meta?.label || value}
        </span>
        <FaChevronDown
          className={`text-[10px] text-black/40 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute z-30 mt-1.5 w-full rounded-2xl border border-black/[0.08] bg-white shadow-xl overflow-hidden max-h-64 overflow-y-auto"
          >
            {SOCIAL_PLATFORMS.map((p) => {
              const disabled =
                p.key !== "custom" && p.key !== value && used.has(p.key);
              const active = p.key === value;
              return (
                <button
                  key={p.key}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(p.key);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors ${
                    disabled
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-black/[0.04]"
                  } ${active ? "bg-black/[0.03]" : ""}`}
                >
                  <span
                    className="flex items-center justify-center w-5 h-5 flex-shrink-0"
                    style={{ color: p.color }}
                  >
                    <SocialIcon platform={p.key} className="text-sm" />
                  </span>
                  <span className="flex-1 truncate text-[#1d1d1f]">
                    {p.label}
                    {disabled && (
                      <span className="text-black/40"> (eklendi)</span>
                    )}
                  </span>
                  {active && <FaCheck className="text-[10px] text-[#141416]" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
