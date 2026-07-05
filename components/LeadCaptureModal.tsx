"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaUserPlus, FaCheck } from "react-icons/fa";

interface LeadCaptureModalProps {
  open: boolean;
  onClose: () => void;
  cardId: string;
  cardOwnerName: string;
}

export default function LeadCaptureModal({
  open,
  onClose,
  cardId,
  cardOwnerName,
}: LeadCaptureModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [hp, setHp] = useState(""); // honeypot (bot tuzagi)
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setPhone("");
    setEmail("");
    setCompany("");
    setMessage("");
    setHp("");
    setDone(false);
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Adın zorunlu");
      return;
    }
    if (!phone.trim() && !email.trim()) {
      setError("Telefon veya e-postadan en az biri gerekli");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          card_id: cardId,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          company: company.trim(),
          message: message.trim(),
          website: hp, // honeypot
        }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        setError(b?.error || "Gönderilemedi");
        return;
      }
      setDone(true);
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (done) reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="neon-border max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="glass rounded-[1.75rem] p-7 relative">
              <button
                onClick={handleClose}
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
                  <h3 className="text-lg font-semibold mb-1">Teşekkürler!</h3>
                  <p className="text-sm text-black/55">
                    Bilgilerin {cardOwnerName} ile paylaşıldı.
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-5">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl glass-soft flex items-center justify-center text-xl">
                      <FaUserPlus />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">
                      Kendi bilgini bırak
                    </h3>
                    <p className="text-xs text-black/55">
                      {cardOwnerName} sana ulaşabilsin
                    </p>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/[0.06] text-red-600 text-xs">
                      {error}
                    </div>
                  )}

                  <form onSubmit={submit} className="space-y-3">
                    {/* Honeypot: insanlar gormez, botlar doldurur */}
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={hp}
                      onChange={(e) => setHp(e.target.value)}
                      className="hidden"
                      aria-hidden="true"
                    />
                    <input
                      className="input-neon"
                      placeholder="Ad Soyad *"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <input
                      className="input-neon"
                      placeholder="Telefon"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <input
                      className="input-neon"
                      placeholder="E-posta"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                      className="input-neon"
                      placeholder="Şirket"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                    <textarea
                      className="input-neon resize-none"
                      placeholder="Mesaj (opsiyonel)"
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={sending}
                      className="btn-neon w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50"
                    >
                      {sending ? "Gönderiliyor..." : "Gönder"}
                    </motion.button>
                    <p className="text-[10px] text-black/40 text-center leading-snug">
                      Göndererek bilgilerinin kart sahibiyle paylaşılmasını ve{" "}
                      <a
                        href="/gizlilik"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-black/60"
                      >
                        Gizlilik Politikası
                      </a>
                      ’nı kabul edersin.
                    </p>
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
