"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { sendRecoveryLink } from "@/lib/auth";
import { motion } from "framer-motion";
import { containerVariants, itemVariants, cardVariants } from "@/lib/motion";

export default function RecoverPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Magic link'e tiklayip geri donen kullaniciyi yakala:
  // gercek (e-postali) oturum varsa kartini bulup duzenlemeye yonlendir.
  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (user?.email) {
        // 1) Once bu cihaz/oturum dogrudan sahip mi?
        const { data: byOwner } = await supabase
          .from("digital_cards")
          .select("slug")
          .eq("owner_id", user.id)
          .maybeSingle();

        if (byOwner?.slug) {
          router.replace(`/edit/${byOwner.slug}`);
          return;
        }

        // 2) Degilse, kayit e-postasiyla eslesen karti bul ve sahipligi
        //    bu guncel oturuma geri bagla (eski cihaz tokeni kaybolmus olabilir).
        const { data: byEmail } = await supabase
          .from("digital_cards")
          .select("slug, owner_id")
          .ilike("owner_email", user.email)
          .maybeSingle();

        if (byEmail?.slug) {
          if (byEmail.owner_id !== user.id) {
            await supabase
              .from("digital_cards")
              .update({ owner_id: user.id })
              .eq("slug", byEmail.slug);
          }
          router.replace(`/edit/${byEmail.slug}`);
          return;
        }

        setError("Bu e-postaya bağlı bir kart bulunamadı.");
      }
      setChecking(false);
    }
    check();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("E-posta gir");
      return;
    }
    setSending(true);
    try {
      await sendRecoveryLink(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Link gönderilemedi");
    } finally {
      setSending(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#6366f1] border-r-[#8b5cf6] animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#a5b4fc] animate-spin [animation-direction:reverse]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-md w-full"
      >
        <motion.div variants={cardVariants} className="neon-border">
          <div className="glass rounded-[2rem] p-8">
            <motion.div variants={itemVariants} className="text-center mb-6">
              <div className="text-5xl mb-3">🔑</div>
              <h1 className="text-2xl font-bold neon-text mb-2">
                Kartına Erişimi Geri Al
              </h1>
              <p className="text-black/55 text-sm">
                Telefonunu mu değiştirdin? Kayıt sırasında kullandığın e-postayı
                gir, sana giriş linki gönderelim.
              </p>
            </motion.div>

            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] text-center"
              >
                <p className="text-emerald-600 font-semibold">
                  📧 Link gönderildi!
                </p>
                <p className="text-emerald-700/70 text-sm mt-1">
                  E-postandaki bağlantıya tıkla, otomatik olarak kartının
                  düzenleme sayfasına yönlendirileceksin.
                </p>
              </motion.div>
            ) : (
              <motion.form
                variants={itemVariants}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {error && (
                  <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/[0.06] text-red-600 text-sm">
                    {error}
                  </div>
                )}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="input-neon"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={sending}
                  className="btn-neon w-full py-3.5 rounded-xl font-semibold text-white disabled:opacity-50"
                >
                  {sending ? "Gönderiliyor..." : "Giriş Linki Gönder"}
                </motion.button>
              </motion.form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
