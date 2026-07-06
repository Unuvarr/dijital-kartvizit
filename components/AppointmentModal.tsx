"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaCheck, FaCalendarCheck } from "react-icons/fa";

const WD = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const MO = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

function ymd(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function AppointmentModal({
  open,
  onClose,
  cardId,
  cardOwnerName,
  days,
}: {
  open: boolean;
  onClose: () => void;
  cardId: string;
  cardOwnerName: string;
  days: number[]; // izinli hafta günleri (0..6); boş = tümü
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Önümüzdeki 21 gün, izinli hafta günlerine göre süzülmüş
  const options = useMemo(() => {
    const out: { value: string; wd: string; d: number; mo: string }[] = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    for (let i = 0; i < 21; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const wd = d.getDay();
      if (days.length > 0 && !days.includes(wd)) continue;
      out.push({ value: ymd(d), wd: WD[wd], d: d.getDate(), mo: MO[d.getMonth()] });
    }
    return out;
  }, [days]);

  const reset = () => {
    setSelected(null);
    setName("");
    setPhone("");
    setNote("");
    setDone(false);
    setError(null);
  };
  const close = () => {
    reset();
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selected) {
      setError("Lütfen bir gün seç");
      return;
    }
    if (!name.trim()) {
      setError("Adını yaz");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card_id: cardId,
          date: selected,
          name: name.trim(),
          phone: phone.trim(),
          note: note.trim(),
          website, // honeypot
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gönderilemedi");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={close}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="neon-border max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 180, damping: 24, mass: 0.9 }}
          >
            <div className="glass rounded-[1.75rem] p-6 relative">
              <button
                onClick={close}
                className="absolute top-4 right-4 text-black/40 hover:text-black transition"
                aria-label="Kapat"
              >
                <FaTimes />
              </button>

              {done ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-black/[0.05] text-[#141416] flex items-center justify-center text-2xl">
                    <FaCheck />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">Talebin iletildi!</h3>
                  <p className="text-sm text-black/55">
                    {cardOwnerName} en kısa sürede saati netleştirmek için sana
                    dönecek.
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <div
                      className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
                    >
                      <FaCalendarCheck />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Randevu Al</h3>
                    <p className="text-xs text-black/55">
                      {cardOwnerName} için uygun bir gün seç
                    </p>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/[0.06] text-red-600 text-xs">
                      {error}
                    </div>
                  )}

                  {/* Gün seçici */}
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 mb-4">
                    {options.map((o) => {
                      const active = selected === o.value;
                      return (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => setSelected(o.value)}
                          className={`flex-shrink-0 w-14 rounded-xl py-2 flex flex-col items-center border transition-colors ${
                            active
                              ? "text-white border-transparent"
                              : "border-black/10 text-black/70 hover:bg-black/[0.03]"
                          }`}
                          style={active ? { backgroundColor: "var(--accent)" } : undefined}
                        >
                          <span className="text-[10px] uppercase tracking-wide opacity-80">
                            {o.wd}
                          </span>
                          <span className="text-base font-bold leading-tight">{o.d}</span>
                          <span className="text-[10px] opacity-80">{o.mo}</span>
                        </button>
                      );
                    })}
                  </div>

                  <form onSubmit={submit} className="space-y-3">
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value.slice(0, 60))}
                      placeholder="Adın *"
                      className="input-neon"
                      required
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.slice(0, 20))}
                      placeholder="Telefon"
                      className="input-neon"
                    />
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value.slice(0, 300))}
                      rows={2}
                      placeholder="Not (isteğe bağlı)"
                      className="input-neon resize-none"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-neon w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50"
                    >
                      {submitting ? "Gönderiliyor..." : "Randevu Talebi Gönder"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
