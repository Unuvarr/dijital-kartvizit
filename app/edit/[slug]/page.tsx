"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { uploadAvatar } from "@/lib/storage";
import { motion, AnimatePresence } from "framer-motion";
import { containerVariants, itemVariants, cardVariants } from "@/lib/motion";
import { FaSave, FaArrowLeft, FaCheck, FaExclamationCircle, FaPalette } from "react-icons/fa";
import { THEMES, type ThemeKey, themeStyle } from "@/lib/types";
import AvatarCropper from "@/components/AvatarCropper";

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

export default function EditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

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

  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeKey>("indigo");
  const [originalTheme, setOriginalTheme] = useState<ThemeKey>("indigo");

  // Veriyi yükle
  useEffect(() => {
    async function loadData() {
      try {
        const { data } = await supabase
          .from("digital_cards")
          .select("*")
          .eq("slug", slug)
          .single();

        if (data) {
          // Sahiplik kontrolü: oturum id'si kartin owner_id'si ile eslesiyor mu?
          const userId = await getCurrentUserId();

          if (userId && data.owner_id && userId === data.owner_id) {
            setIsOwner(true);

            setAvatarUrl(data.avatar_url || null);

            // Formu doldur
            const formData: FormData = {
              first_name: data.first_name || "",
              last_name: data.last_name || "",
              title: data.title || "",
              company: data.company || "",
              phone: data.phone || "",
              email: data.email || "",
              whatsapp: data.whatsapp || "",
              website: data.website || "",
              instagram: data.instagram || "",
              linkedin: data.linkedin || "",
              twitter: data.twitter || "",
              iban: data.iban || "",
              address: data.address || "",
            };

            setFormData(formData);
            setOriginalData(formData);
            const t = (data.theme as ThemeKey) || "indigo";
            setTheme(t);
            setOriginalTheme(t);
          } else {
            setError("Bu kartı düzenlemek için izniniz yok");
          }
        } else {
          setError("Kart bulunamadı");
        }

        setLoading(false);
      } catch (err) {
        console.error("Veri yükleme hatası:", err);
        setError("Bir hata oluştu");
        setLoading(false);
      }
    }

    if (slug) loadData();
  }, [slug]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Fotoğraf en fazla 5 MB olabilir");
      return;
    }
    setCropSrc(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleCropped = (file: File) => {
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setCropSrc(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.first_name.trim()) {
      setError("Ad boş bırakılamaz");
      return;
    }
    if (!formData.last_name.trim()) {
      setError("Soyad boş bırakılamaz");
      return;
    }
    if (!formData.phone.trim()) {
      setError("Telefon boş bırakılamaz");
      return;
    }
    if (!formData.email.trim()) {
      setError("E-posta boş bırakılamaz");
      return;
    }

    setSaving(true);

    try {
      // Yeni fotograf secildiyse yukle
      let newAvatarUrl = avatarUrl;
      if (avatarFile) {
        newAvatarUrl = await uploadAvatar(slug, avatarFile);
      }

      const { error: updateError } = await supabase
        .from("digital_cards")
        .update({
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          title: formData.title?.trim() || null,
          company: formData.company?.trim() || null,
          avatar_url: newAvatarUrl,
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          whatsapp: formData.whatsapp?.trim() || null,
          website: formData.website?.trim() || null,
          instagram: formData.instagram?.trim() || null,
          linkedin: formData.linkedin?.trim() || null,
          twitter: formData.twitter?.trim() || null,
          iban: formData.iban?.trim() || null,
          address: formData.address?.trim() || null,
          theme,
        })
        .eq("slug", slug);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setAvatarUrl(newAvatarUrl);
      setAvatarFile(null);
      setSuccess(true);
      setOriginalData(formData);
      setOriginalTheme(theme);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Update hatası:", err);
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSaving(false);
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
          <p className="text-black/50 text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          className="neon-border max-w-md"
        >
          <div className="glass rounded-[2rem] p-8 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold neon-text mb-2">
              Erişim Reddedildi
            </h1>
            <p className="text-black/55 mb-6">
              Bu cihaz kartın sahibi olarak tanınmıyor. Kartı sen oluşturduysan
              ve cihazını/tarayıcını değiştirdiysen, e-postanla erişimi geri
              alabilirsin.
            </p>
            <div className="flex flex-col gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/recover`)}
                className="btn-neon inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold"
              >
                🔑 Erişimi Geri Al
              </motion.button>
              <button
                onClick={() => router.push(`/profile/${slug}`)}
                className="glass-soft inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-black/70 hover:text-black transition font-semibold"
              >
                <FaArrowLeft /> Profili Gör
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const hasChanges =
    JSON.stringify(formData) !== JSON.stringify(originalData) ||
    avatarFile !== null ||
    theme !== originalTheme;

  const fieldGroups = [
    {
      title: "Temel Bilgiler",
      fields: ["first_name", "last_name", "title", "company"],
    },
    {
      title: "İletişim",
      fields: ["phone", "email", "whatsapp"],
    },
    {
      title: "Sosyal Medya",
      fields: ["instagram", "linkedin", "twitter"],
    },
    {
      title: "Ek Bilgiler",
      fields: ["website", "iban", "address"],
    },
  ];

  const fieldLabels: { [key: string]: string } = {
    first_name: "Ad *",
    last_name: "Soyad *",
    title: "Ünvan",
    company: "Şirket",
    phone: "Telefon *",
    email: "E-posta *",
    whatsapp: "WhatsApp",
    website: "Web Sitesi",
    instagram: "Instagram",
    linkedin: "LinkedIn",
    twitter: "Twitter",
    iban: "IBAN",
    address: "Adres",
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <AvatarCropper
        open={!!cropSrc}
        imageSrc={cropSrc}
        onCancel={() => setCropSrc(null)}
        onComplete={handleCropped}
      />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push(`/profile/${slug}`)}
            className="glass-soft inline-flex items-center gap-2 text-black/70 hover:text-black px-4 py-2 rounded-xl transition"
          >
            <FaArrowLeft /> Geri
          </button>
          <h1 className="text-3xl font-bold neon-text">Kartını Düzenle</h1>
        </motion.div>

        {/* Success / Error */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] flex items-center gap-3"
            >
              <FaCheck className="text-emerald-500 text-xl" />
              <p className="text-emerald-600 font-semibold">
                Değişiklikler kaydedildi! ✓
              </p>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/[0.06] flex items-center gap-3"
            >
              <FaExclamationCircle className="text-red-500 text-xl" />
              <p className="text-red-600">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profil Fotografi */}
          <motion.div variants={cardVariants} className="neon-border">
            <div className="glass rounded-[2rem] p-6 flex flex-col items-center">
              <h2 className="text-sm font-semibold text-black/70 uppercase tracking-wide mb-4 self-start">
                Profil Fotoğrafı
              </h2>
              <label className="cursor-pointer group">
                <div className="relative w-28 h-28">
                  <div className="absolute -inset-1 rounded-full bg-[linear-gradient(135deg,#4f46e5,#7c3aed)] opacity-30 blur-[2px] group-hover:opacity-60 transition" />
                  <div className="relative w-28 h-28 rounded-full overflow-hidden bg-black/[0.03] border border-black/10 flex items-center justify-center">
                    {avatarPreview || avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarPreview || avatarUrl || ""}
                        alt="Profil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl text-black/30">＋</span>
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
                Değiştirmek için tıkla (maks. 5 MB)
              </p>
            </div>
          </motion.div>

          {/* Tema secici */}
          <motion.div variants={cardVariants} className="neon-border">
            <div className="glass rounded-[2rem] p-6" style={themeStyle(theme)}>
              <h2 className="text-sm font-semibold text-black/70 uppercase tracking-wide mb-4 flex items-center gap-2">
                <FaPalette /> Tema
              </h2>
              <div className="grid grid-cols-5 gap-3">
                {(Object.keys(THEMES) as ThemeKey[]).map((key) => {
                  const t = THEMES[key];
                  const active = theme === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTheme(key)}
                      className={`relative h-16 rounded-xl overflow-hidden transition ${
                        active
                          ? "ring-2 ring-offset-2 ring-offset-white"
                          : "ring-1 ring-black/10 hover:ring-black/20"
                      }`}
                      style={
                        active
                          ? ({
                              ["--tw-ring-color" as string]: t.accent,
                            } as React.CSSProperties)
                          : undefined
                      }
                      aria-label={t.name}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
                        }}
                      />
                      {active && (
                        <FaCheck className="absolute top-1.5 right-1.5 text-white text-xs drop-shadow" />
                      )}
                      <span className="absolute bottom-1 left-2 text-[10px] font-medium text-white drop-shadow">
                        {t.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-black/40 mt-3">
                Profil sayfası butonları ve vurguları seçilen renge döner.
              </p>
            </div>
          </motion.div>

          {fieldGroups.map((group) => (
            <motion.div key={group.title} variants={cardVariants} className="neon-border">
              <div className="glass rounded-[2rem] p-6">
                <h2 className="text-sm font-semibold text-black/70 uppercase tracking-wide mb-6">
                  {group.title}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {group.fields.map((fieldName) => (
                    <div
                      key={fieldName}
                      className={fieldName === "address" ? "md:col-span-2" : ""}
                    >
                      <label className="block text-sm font-medium text-black/70 mb-1.5">
                        {fieldLabels[fieldName]}
                      </label>
                      {fieldName === "address" ? (
                        <textarea
                          name={fieldName}
                          value={formData[fieldName as keyof FormData] || ""}
                          onChange={handleChange}
                          rows={3}
                          className="input-neon resize-none"
                        />
                      ) : (
                        <input
                          type={
                            fieldName === "email"
                              ? "email"
                              : fieldName === "website"
                              ? "url"
                              : "text"
                          }
                          name={fieldName}
                          value={formData[fieldName as keyof FormData] || ""}
                          onChange={handleChange}
                          required={
                            fieldName === "first_name" ||
                            fieldName === "last_name" ||
                            fieldName === "phone" ||
                            fieldName === "email"
                          }
                          className="input-neon"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Buttons */}
          <motion.div variants={itemVariants} className="flex gap-4">
            <button
              type="button"
              onClick={() => setFormData(originalData || formData)}
              disabled={!hasChanges}
              className="glass-soft flex-1 px-6 py-4 rounded-xl text-black/70 hover:text-black font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ↻ Sıfırla
            </button>
            <motion.button
              whileHover={hasChanges ? { scale: 1.02 } : undefined}
              whileTap={hasChanges ? { scale: 0.98 } : undefined}
              type="submit"
              disabled={saving || !hasChanges}
              className="btn-neon flex-1 px-6 py-4 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <FaSave /> Değişiklikleri Kaydet
                </>
              )}
            </motion.button>
          </motion.div>
        </form>

        {/* Info Box */}
        <motion.div
          variants={itemVariants}
          className="mt-8 p-5 rounded-xl glass-soft"
        >
          <p className="text-black/55 text-sm">
            💡 Sadece bu cihazdan düzenleyebilirsin. Başka cihazdan açıldığında
            bu değişiklikleri görüp kopyalayabilecekler.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
