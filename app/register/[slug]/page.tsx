"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { ensureAnonymousSession, linkRecoveryEmail } from "@/lib/auth";
import { uploadAvatar } from "@/lib/storage";
import { motion } from "framer-motion";
import { containerVariants, itemVariants, cardVariants } from "@/lib/motion";
import AvatarCropper from "@/components/AvatarCropper";
import SocialLinksEditor from "@/components/SocialLinksEditor";
import type { SocialLink } from "@/lib/types";
import { sanitizeField, validateContactForm } from "@/lib/formSanitize";

interface FormData {
  first_name: string;
  last_name: string;
  title?: string;
  company?: string;
  phone: string;
  email: string;
  whatsapp?: string;
  website?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  iban?: string;
  address?: string;
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

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  // Kirpma modali icin secilen ham gorsel
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverCropSrc, setCoverCropSrc] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [step, setStep] = useState<1 | 2>(1);

  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    title: "",
    company: "",
    phone: "",
    email: "",
    whatsapp: "",
    website: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    iban: "",
    address: "",
  });

  // Kontrol: Eğer kart zaten aktif ise profile'e yönlendir
  useEffect(() => {
    async function checkStatus() {
      try {
        const { data } = await supabase
          .from("digital_cards")
          .select("status")
          .eq("slug", slug)
          .single();

        if (data?.status === "Aktif") {
          router.push(`/profile/${slug}`);
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error("Status kontrol hatası:", err);
        setLoading(false);
      }
    }

    if (slug) checkStatus();
  }, [slug, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: sanitizeField(name, value),
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Fotoğraf en fazla 5 MB olabilir");
      return;
    }
    // Once kirpma modalini ac; kullanici ortalayip onaylayinca kaydederiz.
    setCropSrc(URL.createObjectURL(file));
    e.target.value = ""; // ayni dosya tekrar secilebilsin
  };

  const handleCropped = (file: File) => {
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setCropSrc(null);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Kapak en fazla 5 MB olabilir");
      return;
    }
    setCoverCropSrc(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleCoverCropped = (file: File) => {
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setCoverCropSrc(null);
  };

  // Adım 1'den 2'ye: zorunlu alanları doğrula
  const goToStep2 = () => {
    const vErr = validateContactForm(formData);
    if (vErr) {
      setError(vErr);
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validasyon (her ihtimale karşı son kontrol)
    const vErr = validateContactForm(formData);
    if (vErr) {
      setError(vErr);
      setStep(1);
      return;
    }

    setSubmitting(true);

    try {
      const email = formData.email.trim();

      // 0. Kural: bir e-posta = tek kart. Bu e-posta ile zaten Aktif bir kart
      //    varsa yeni kayda izin verme; kullaniciyi kurtarmaya yonlendir.
      const { data: existing } = await supabase
        .from("digital_cards")
        .select("slug")
        .ilike("owner_email", email)
        .eq("status", "Aktif")
        .limit(1);

      if (existing && existing.length > 0) {
        setSubmitting(false);
        setError(
          "Bu e-posta ile zaten bir kartınız var. Mevcut kartınıza erişmek için \"Erişimi Geri Al\" sayfasını kullanın."
        );
        return;
      }

      // 1. Cihaz icin sessizce anonim oturum ac (kullanici farketmez).
      //    Bu oturum cihazda kalir -> sonraki girislerde "Duzenle" otomatik cikar.
      const ownerId = await ensureAnonymousSession();

      // 2. Fotograf/kapak secildiyse yukle, public URL al.
      let avatarUrl: string | null = null;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(slug, avatarFile);
      }
      let coverUrl: string | null = null;
      if (coverFile) {
        coverUrl = await uploadAvatar(slug, coverFile);
      }

      // 3. Bos karti sahiplen: owner_id'yi kendimize yaz, bilgileri kaydet.
      //    RLS sayesinde bunu sadece bos bir kart icin yapabiliyoruz.
      const { error: updateError } = await supabase
        .from("digital_cards")
        .update({
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          title: formData.title?.trim() || null,
          company: formData.company?.trim() || null,
          avatar_url: avatarUrl,
          cover_url: coverUrl,
          phone: formData.phone.trim(),
          email,
          whatsapp: formData.whatsapp?.trim() || null,
          website: formData.website?.trim() || null,
          social_links: socialLinks.filter((l) => l.value && l.value.trim()),
          iban: formData.iban?.trim() || null,
          address: formData.address?.trim() || null,
          status: "Aktif",
          owner_id: ownerId,
          owner_email: email,
        })
        .eq("slug", slug);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // 3. Kurtarma icin e-postayi hesaba bagla (cihaz kaybinda erisim geri alinir).
      //    Basarisiz olsa bile kayit gecerli; cihaz zaten taniniyor.
      try {
        await linkRecoveryEmail(email);
      } catch {
        // sessizce gec - kurtarma bag(lan)masi zorunlu degil
      }

      setSuccess(true);

      setTimeout(() => {
        router.push(`/profile/${slug}`);
      }, 2000);
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
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#6366f1] border-r-[#8b5cf6] animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#a5b4fc] animate-spin [animation-direction:reverse]" />
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
              ✅
            </motion.div>
            <h2 className="text-3xl font-bold neon-text mb-2">Başarılı!</h2>
            <p className="text-black/55">
              Kartın kaydedildi. Yönlendiriliyorsun...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <AvatarCropper
        open={!!cropSrc}
        imageSrc={cropSrc}
        onCancel={() => setCropSrc(null)}
        onComplete={handleCropped}
      />
      <AvatarCropper
        open={!!coverCropSrc}
        imageSrc={coverCropSrc}
        onCancel={() => setCoverCropSrc(null)}
        onComplete={handleCoverCropped}
        aspect={3}
        cropShape="rect"
        outW={1000}
        outH={333}
        title="Kapağı ortala"
      />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-md mx-auto"
      >
        <motion.div variants={itemVariants} className="text-center mb-6">
          <h1 className="text-4xl font-bold neon-text mb-2">Kartını Oluştur</h1>
          <p className="text-black/55">
            {step === 1 ? "Önce temel bilgiler — 30 saniye" : "Dilediğin kadar zenginleştir"}
          </p>
        </motion.div>

        {/* Adım göstergesi */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 mb-5">
          {[1, 2].map((s) => (
            <span
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                step === s ? "w-8 bg-[#4f46e5]" : "w-2 bg-black/15"
              }`}
            />
          ))}
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ============ ADIM 1: ZORUNLU ============ */}
              {step === 1 && (
                <>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-black/70 tracking-wide uppercase text-xs">
                      Temel Bilgiler
                    </h3>
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
                      placeholder="0555..."
                      required
                    />
                    <Field
                      label="E-posta *"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={goToStep2}
                    className="btn-neon w-full py-3.5 rounded-xl font-semibold text-white"
                  >
                    Devam Et →
                  </motion.button>
                  <p className="text-[11px] text-black/40 text-center">
                    Sadece bu 4 alan zorunlu. Fotoğraf, sosyal medya ve gerisini
                    sonraki adımda (ya da hiç) ekleyebilirsin.
                  </p>
                </>
              )}

              {/* ============ ADIM 2: OPSİYONEL ============ */}
              {step === 2 && (
                <>
                  {/* Profil Fotografi */}
                  <div className="flex flex-col items-center pb-6 border-b border-black/[0.06]">
                    <label className="cursor-pointer group">
                      <div className="relative w-28 h-28">
                        <div className="absolute -inset-1 rounded-full bg-[linear-gradient(135deg,#4f46e5,#7c3aed)] opacity-30 blur-[2px] group-hover:opacity-60 transition" />
                        <div className="relative w-28 h-28 rounded-full overflow-hidden bg-black/[0.03] border border-black/10 flex items-center justify-center">
                          {avatarPreview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={avatarPreview}
                              alt="Önizleme"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl text-black/30">＋</span>
                          )}
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-black/40 mt-3">
                      Fotoğraf / Logo (isteğe bağlı)
                    </p>
                  </div>

                  {/* Kapak Fotografi */}
                  <div className="pb-6 border-b border-black/[0.06]">
                    <label className="cursor-pointer block group">
                      <div className="relative w-full aspect-[3/1] rounded-2xl overflow-hidden bg-black/[0.03] border border-black/10 flex items-center justify-center">
                        {coverPreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={coverPreview}
                            alt="Kapak önizleme"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm text-black/40">
                            ＋ Kapak fotoğrafı ekle (isteğe bağlı)
                          </span>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="hidden"
                      />
                    </label>
                    {coverPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setCoverFile(null);
                          setCoverPreview(null);
                        }}
                        className="mt-2 text-xs text-red-600 hover:text-red-700 transition-colors"
                      >
                        Kapağı kaldır
                      </button>
                    )}
                  </div>

                  {/* Ünvan / Şirket / WhatsApp */}
                  <div className="space-y-4 pb-6 border-b border-black/[0.06]">
                    <h3 className="font-semibold text-black/70 tracking-wide uppercase text-xs">
                      İş & İletişim
                    </h3>
                    <Field
                      label="Ünvan"
                      name="title"
                      value={formData.title || ""}
                      onChange={handleChange}
                      placeholder="Örn. Pazarlama Müdürü"
                    />
                    <Field
                      label="Şirket"
                      name="company"
                      value={formData.company || ""}
                      onChange={handleChange}
                      placeholder="Örn. ABC A.Ş."
                    />
                    <Field
                      label="WhatsApp"
                      name="whatsapp"
                      type="tel"
                      value={formData.whatsapp || ""}
                      onChange={handleChange}
                      placeholder="(İsteğe bağlı)"
                    />
                  </div>

                  {/* Sosyal Medya & Bağlantılar */}
                  <div className="space-y-4 pb-6 border-b border-black/[0.06]">
                    <h3 className="font-semibold text-black/70 tracking-wide uppercase text-xs">
                      Sosyal Medya & Bağlantılar
                    </h3>
                    <SocialLinksEditor
                      value={socialLinks}
                      onChange={setSocialLinks}
                    />
                  </div>

                  {/* Ek Bilgiler */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-black/70 tracking-wide uppercase text-xs">
                      Ek Bilgiler
                    </h3>
                    <Field
                      label="Web Sitesi"
                      name="website"
                      type="url"
                      value={formData.website || ""}
                      onChange={handleChange}
                      placeholder="https://..."
                    />
                    <Field
                      label="IBAN"
                      name="iban"
                      value={formData.iban || ""}
                      onChange={handleChange}
                    />
                    <div>
                      <label className="block text-sm font-medium text-black/70 mb-1.5">
                        Adres
                      </label>
                      <textarea
                        name="address"
                        value={formData.address || ""}
                        onChange={handleChange}
                        rows={2}
                        className="input-neon resize-none"
                      />
                    </div>
                  </div>

                  {/* Geri + Kaydet */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setStep(1);
                      }}
                      className="glass-soft px-5 py-3.5 rounded-xl text-sm font-semibold text-black/70 hover:text-black hover:bg-black/[0.03] transition-colors"
                    >
                      ← Geri
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={submitting}
                      className="btn-neon flex-1 py-3.5 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Kaydediliyor..." : "✓ Kartımı Oluştur"}
                    </motion.button>
                  </div>
                  <p className="text-[11px] text-black/40 text-center leading-snug">
                    Oluşturarak{" "}
                    <a
                      href="/gizlilik"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-black/60"
                    >
                      Gizlilik Politikası
                    </a>
                    ’nı kabul etmiş olursun.
                  </p>
                </>
              )}
            </form>

            <p className="mt-5 text-center text-xs text-black/40">
              💡 Bu cihazdan kayıt yapıyorsunuz
            </p>
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
