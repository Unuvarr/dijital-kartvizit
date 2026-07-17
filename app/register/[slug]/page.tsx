"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { ensureAnonymousSession } from "@/lib/auth";
import { motion } from "framer-motion";
import { containerVariants, itemVariants, cardVariants } from "@/lib/motion";
import { sanitizeField, validateContactForm } from "@/lib/formSanitize";

interface FormData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
}

export default function RegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
  });

  // Kart zaten aktifse profile yonlendir; "yarı hazır" kartta formu önden doldur
  useEffect(() => {
    async function checkStatus() {
      try {
        const { data } = await supabase
          .from("digital_cards")
          .select("status, first_name, last_name, phone")
          .eq("slug", slug)
          .single();

        if (data?.status === "Aktif") {
          router.push(`/profile/${slug}`);
          return;
        }
        // Önceden tanımlanmış kart: isim/soyisim hazır gelir, kişi kalanını ekler
        if (data) {
          setFormData((prev) => ({
            ...prev,
            first_name: data.first_name ?? prev.first_name,
            last_name: data.last_name ?? prev.last_name,
            phone: data.phone ?? prev.phone,
          }));
        }
        setLoading(false);
      } catch (err) {
        console.error("Status kontrol hatası:", err);
        setLoading(false);
      }
    }
    if (slug) checkStatus();
  }, [slug, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: sanitizeField(name, value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const vErr = validateContactForm(formData);
    if (vErr) {
      setError(vErr);
      return;
    }

    setSubmitting(true);
    try {
      const email = formData.email.trim();

      // Kural: bir e-posta = tek kart
      const { data: existing } = await supabase
        .from("digital_cards")
        .select("slug")
        .ilike("owner_email", email)
        .eq("status", "Aktif")
        .limit(1);

      if (existing && existing.length > 0) {
        setSubmitting(false);
        setError(
          'Bu e-posta ile zaten bir kartınız var. Erişmek için "Kart Girişi" sayfasını kullanın.'
        );
        return;
      }

      // Cihaz icin sessiz anonim oturum (sonraki girislerde "Duzenle" cikar)
      const ownerId = await ensureAnonymousSession();

      // Bos karti sahiplen: sadece temel bilgiler. Gerisi duzenleme ekraninda.
      const { error: updateError } = await supabase
        .from("digital_cards")
        .update({
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          phone: formData.phone.trim(),
          email,
          status: "Aktif",
          owner_id: ownerId,
          owner_email: email,
        })
        .eq("slug", slug);

      if (updateError) throw new Error(updateError.message);

      // Not: E-posta dogrulama maili GONDERILMEZ. Kurtarma owner_email kolonu
      // uzerinden calisir (kart kaybinda /recover ile e-postayla geri alinir).

      setSuccess(true);
      // Duzenleme ekranina yonlendir: foto/sosyal/tema orada zenginlestirilir
      setTimeout(() => {
        router.push(`/edit/${slug}?new=1`);
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Kayıt sırasında bir hata oluştu"
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#141416] border-r-[#3a3a3d] animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#8a8a8d] animate-spin [animation-direction:reverse]" />
          </div>
          <p className="text-black/50 text-sm">Kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          className="neon-border"
        >
          <div className="glass rounded-[2rem] px-10 py-12 text-center max-w-md">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 12 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <h2 className="text-3xl font-bold neon-text mb-2">Kartın Hazır!</h2>
            <p className="text-black/55">
              Şimdi fotoğraf, sosyal medya ve daha fazlasını ekleyelim...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-md w-full"
      >
        <motion.div variants={itemVariants} className="text-center mb-7">
          <h1 className="text-4xl font-bold neon-text mb-2">Kartını Oluştur</h1>
          <p className="text-black/55">Sadece birkaç bilgi — 20 saniye 🚀</p>
        </motion.div>

        <motion.div variants={cardVariants} className="neon-border">
          <div className="glass rounded-[2rem] p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/[0.06]"
              >
                <p className="text-red-600 text-sm">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Ad *"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Ad"
                  required
                />
                <Field
                  label="Soyad *"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Soyad"
                  required
                />
              </div>
              <Field
                label="Telefon *"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="05XX XXX XX XX"
                required
              />
              <Field
                label="E-posta *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ornek@email.com"
                required
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="btn-neon w-full py-3.5 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {submitting ? "Oluşturuluyor..." : "Kartı Oluştur →"}
              </motion.button>
              <p className="text-[11px] text-black/40 text-center leading-snug">
                Oluşturduktan sonra fotoğraf, sosyal medya ve diğer her şeyi
                ekleyebilirsin. Oluşturarak{" "}
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
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-black/70 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="input-neon"
      />
    </div>
  );
}
