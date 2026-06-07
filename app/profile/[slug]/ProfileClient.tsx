"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentUserId } from "@/lib/auth";
import { containerVariants, itemVariants, cardVariants } from "@/lib/motion";
import { buildVCard } from "@/lib/vcard";
import { trackView } from "@/lib/analytics";
import { themeStyle, type Profile } from "@/lib/types";
import BrandedQR from "@/components/BrandedQR";
import LeadCaptureModal from "@/components/LeadCaptureModal";
import {
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaDownload,
  FaEnvelope,
  FaPhone,
  FaCopy,
  FaCheck,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaEdit,
  FaShare,
  FaQrcode,
  FaTimes,
  FaExternalLinkAlt,
  FaChevronRight,
  FaMapMarkedAlt,
  FaUserPlus,
  FaChartLine,
} from "react-icons/fa";

function normalizeUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function siteName(url: string) {
  let host: string;
  try {
    host = new URL(normalizeUrl(url)).hostname;
  } catch {
    host = url.replace(/^https?:\/\//i, "").split("/")[0];
  }
  return host.replace(/^www\./, "").toLocaleLowerCase("tr-TR");
}

export default function ProfileClient({
  profile,
  slug,
}: {
  profile: Profile;
  slug: string;
}) {
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const [activeModal, setActiveModal] = useState<"address" | null>(null);
  const [viewCount, setViewCount] = useState<number | null>(
    profile.view_count ?? null
  );
  const [profileUrl] = useState(() =>
    typeof window !== "undefined" ? window.location.href : ""
  );
  const qrRef = useRef<HTMLDivElement>(null);

  // Sahiplik kontrolu + tek seferlik gorulenme kaydi
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const userId = await getCurrentUserId();
      if (cancelled) return;
      const owner = !!(userId && profile.owner_id && userId === profile.owner_id);
      setIsOwner(owner);

      // Sahip kendi kartina bakinca sayma
      if (!owner) {
        const newCount = await trackView(slug);
        if (newCount !== null && !cancelled) setViewCount(newCount);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile.owner_id, slug]);

  const handleCopy = (text: string | undefined | null, type: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${profile.first_name || "kart"}-qr.png`;
    link.click();
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: `${profile.first_name} ${profile.last_name}`,
          url: window.location.href,
        });
        return;
      } catch {
        // kullanici iptal etti
      }
    }
    handleCopy(window.location.href, "share");
  };

  const downloadVCard = async () => {
    const vcf = await buildVCard(profile);
    const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${profile.first_name}_${profile.last_name}.vcf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const socials = [
    { url: profile.instagram, Icon: FaInstagram, label: "Instagram", color: "#E1306C" },
    { url: profile.linkedin, Icon: FaLinkedin, label: "LinkedIn", color: "#0A66C2" },
    { url: profile.twitter, Icon: FaTwitter, label: "Twitter", color: "#1DA1F2" },
  ].filter((s) => s.url);

  const quickActions = [
    profile.phone
      ? { label: "Ara", href: `tel:${profile.phone}`, Icon: FaPhone }
      : null,
    profile.whatsapp
      ? {
          label: "WhatsApp",
          href: `https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`,
          Icon: FaWhatsapp,
        }
      : null,
    profile.email
      ? { label: "E-posta", href: `mailto:${profile.email}`, Icon: FaEnvelope }
      : null,
  ].filter(Boolean) as { label: string; href: string; Icon: typeof FaPhone }[];

  return (
    <div
      className="min-h-screen py-10 px-4 relative"
      style={themeStyle(profile.theme)}
    >
      <motion.div
        className="relative z-10 max-w-md mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={cardVariants} className="neon-border">
          <div className="relative rounded-[1.75rem] overflow-hidden glass">
            {/* Toolbar */}
            <div className="relative z-10 flex items-center justify-end gap-2 px-5 pt-5">
              <button
                onClick={handleShare}
                aria-label="Paylaş"
                className="w-9 h-9 rounded-full glass-soft flex items-center justify-center text-black/55 hover:text-black hover:bg-black/[0.04] transition-colors"
              >
                <FaShare className="text-xs" />
              </button>
              <button
                onClick={() => setShowQR(true)}
                aria-label="QR Kod"
                className="w-9 h-9 rounded-full glass-soft flex items-center justify-center text-black/55 hover:text-black hover:bg-black/[0.04] transition-colors"
              >
                <FaQrcode className="text-xs" />
              </button>
              {isOwner && (
                <>
                  <button
                    onClick={() => router.push("/dashboard")}
                    aria-label="İstatistik"
                    className="w-9 h-9 rounded-full glass-soft flex items-center justify-center text-black/55 hover:text-black hover:bg-black/[0.04] transition-colors"
                    title={
                      viewCount != null
                        ? `${viewCount} görüntülenme`
                        : "İstatistik"
                    }
                  >
                    <FaChartLine className="text-xs" />
                  </button>
                  <button
                    onClick={() => router.push(`/edit/${slug}`)}
                    aria-label="Düzenle"
                    className="w-9 h-9 rounded-full glass-soft flex items-center justify-center text-black/55 hover:text-black hover:bg-black/[0.04] transition-colors"
                  >
                    <FaEdit className="text-xs" />
                  </button>
                </>
              )}
            </div>

            {/* Header */}
            <motion.div
              variants={itemVariants}
              className="relative z-10 px-8 pb-7 pt-3 text-center"
            >
              <div className="relative inline-block mb-4">
                <div className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-[#f0f0f3] ring-1 ring-black/[0.06] shadow-sm">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={`${profile.first_name} ${profile.last_name}`}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      priority
                    />
                  ) : (
                    <span className="text-3xl font-medium text-black/40">
                      {profile.first_name?.[0]}
                      {profile.last_name?.[0]}
                    </span>
                  )}
                </div>
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                {profile.first_name} {profile.last_name}
              </h1>
              {(profile.title || profile.company) && (
                <p className="text-sm mt-1.5 text-black/50">
                  {profile.title}
                  {profile.title && profile.company ? " · " : ""}
                  {profile.company}
                </p>
              )}
              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="inline-block text-sm text-black/45 hover:text-black/70 transition-colors mt-1"
                >
                  {profile.phone}
                </a>
              )}
            </motion.div>

            {/* Birincil aksiyon: vCard */}
            <motion.div variants={itemVariants} className="px-8 pb-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={downloadVCard}
                className="btn-neon w-full rounded-2xl py-4 px-4 text-white font-semibold text-sm flex items-center justify-center gap-2"
              >
                <FaDownload className="text-sm" />
                <span>Rehbere Kaydet</span>
              </motion.button>
            </motion.div>

            {/* Lead capture */}
            <motion.div variants={itemVariants} className="px-8 pb-4">
              <button
                onClick={() => setShowLead(true)}
                className="w-full glass-soft rounded-xl py-2.5 text-xs font-medium text-black/70 hover:text-black hover:bg-black/[0.03] transition-colors flex items-center justify-center gap-2"
              >
                <FaUserPlus />
                <span>Sen de bilgini bırak</span>
              </button>
            </motion.div>

            {/* Sosyal */}
            {socials.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="px-8 pb-5 flex justify-center gap-3"
              >
                {socials.map(({ url, Icon, label, color }) => (
                  <motion.a
                    key={label}
                    href={url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    whileHover={{ scale: 1.12, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-11 h-11 rounded-full glass-soft flex items-center justify-center hover:bg-black/[0.03] transition-colors"
                  >
                    <Icon className="text-lg" style={{ color }} />
                  </motion.a>
                ))}
              </motion.div>
            )}

            {/* Hızlı iletişim */}
            {quickActions.length > 0 && (
              <motion.div variants={itemVariants} className="px-8 pb-6">
                <div
                  className="grid gap-3"
                  style={{
                    gridTemplateColumns: `repeat(${quickActions.length}, minmax(0, 1fr))`,
                  }}
                >
                  {quickActions.map(({ label, href, Icon }) => (
                    <motion.a
                      key={label}
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      className="glass-soft rounded-2xl py-3.5 flex flex-col items-center justify-center gap-1.5 text-black/70 hover:text-[#1d1d1f] hover:bg-black/[0.03] transition-colors"
                    >
                      <Icon className="text-base" />
                      <span className="text-[11px] font-medium">{label}</span>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Detay */}
            <div className="px-6 pb-6 space-y-2.5">
              {profile.website && (
                <ContactRow
                  icon={
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(
                        profile.website
                      )}`}
                      alt=""
                      className="w-4 h-4 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  }
                  label="Web Sitesi"
                  value={siteName(profile.website)}
                  href={normalizeUrl(profile.website)}
                  external
                />
              )}
              {profile.iban && (
                <ContactRow
                  icon={<span className="font-semibold">₺</span>}
                  label="IBAN"
                  copyable
                  onClick={() => handleCopy(profile.iban, "iban")}
                  copied={copied === "iban"}
                />
              )}
              {profile.address && (
                <ContactRow
                  icon={<FaMapMarkerAlt />}
                  label="Adres"
                  onClick={() => setActiveModal("address")}
                />
              )}
            </div>

            {isOwner && viewCount != null && (
              <div className="px-6 pb-4 -mt-1 text-center text-xs text-black/40">
                👁 {viewCount} görüntülenme
              </div>
            )}

            {!isOwner && (
              <div className="px-6 pb-6 -mt-1 text-center">
                <button
                  onClick={() => router.push(`/recover?slug=${slug}`)}
                  className="text-xs text-black/35 hover:text-black/60 transition-colors"
                >
                  Bu kart sana mı ait? Eriş
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowQR(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="neon-border max-w-xs w-full"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <div className="glass rounded-[1.75rem] p-8 text-center relative">
                <button
                  onClick={() => setShowQR(false)}
                  className="absolute top-4 right-4 text-black/40 hover:text-black transition"
                  aria-label="Kapat"
                >
                  <FaTimes />
                </button>
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-1">
                  {profile.first_name} {profile.last_name}
                </h3>
                <p className="text-xs text-black/45 mb-5">Kartı açmak için okut</p>
                <div
                  ref={qrRef}
                  className="flex justify-center p-4 bg-white rounded-2xl border border-black/[0.06]"
                >
                  {profileUrl && (
                    <BrandedQR
                      value={profileUrl}
                      logoUrl={profile.avatar_url || null}
                      size={220}
                    />
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={downloadQR}
                  className="mt-6 w-full py-3 btn-neon text-white rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <FaDownload className="text-sm" />
                  <span>QR Kodu İndir</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Adres */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setActiveModal(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="neon-border max-w-xs w-full"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <div className="glass rounded-[1.75rem] p-8 text-center relative">
                <button
                  onClick={() => setActiveModal(null)}
                  className="absolute top-4 right-4 text-black/40 hover:text-black transition"
                  aria-label="Kapat"
                >
                  <FaTimes />
                </button>
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center text-xl text-[#1d1d1f] glass-soft">
                  <FaMapMarkerAlt />
                </div>
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-1">
                  Adres
                </h3>
                <p className="text-sm text-black/70 break-words bg-black/[0.03] border border-black/[0.06] rounded-xl p-3 my-4">
                  {profile.address}
                </p>
                <div className="space-y-3">
                  <motion.a
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                      profile.address || ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 btn-neon text-white rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <FaMapMarkedAlt className="text-sm" />
                    <span>Haritada Aç</span>
                  </motion.a>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleCopy(profile.address, "address")}
                    className="w-full py-3 glass-soft text-[#1d1d1f] rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-black/[0.03] transition-colors"
                  >
                    {copied === "address" ? (
                      <>
                        <FaCheck className="text-sm text-emerald-500" />
                        <span>Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <FaCopy className="text-sm" />
                        <span>Adresi Kopyala</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LeadCaptureModal
        open={showLead}
        onClose={() => setShowLead(false)}
        cardId={profile.id}
        cardOwnerName={`${profile.first_name} ${profile.last_name}`}
      />
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
  onClick,
  copied,
  mono,
  external,
  copyable,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  href?: string;
  onClick?: () => void;
  copied?: boolean;
  mono?: boolean;
  external?: boolean;
  copyable?: boolean;
}) {
  const inner = (
    <div className="glass-soft rounded-2xl p-3.5 flex items-center justify-between hover:bg-black/[0.02] transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-black/70 bg-black/[0.04] border border-black/[0.06]">
          <span className="text-xs">{icon}</span>
        </div>
        <div className="text-left min-w-0 flex-1">
          <p
            className={`text-black/40 uppercase tracking-wider font-medium ${
              value ? "text-[10px]" : "text-sm tracking-wide text-black/70 normal-case"
            }`}
          >
            {label}
          </p>
          {value && (
            <p
              className={`text-[#1d1d1f] font-medium truncate ${
                mono ? "text-xs font-mono" : "text-sm"
              }`}
            >
              {value}
            </p>
          )}
        </div>
      </div>
      {copied ? (
        <FaCheck className="text-emerald-500 text-sm flex-shrink-0" />
      ) : copyable ? (
        <FaCopy className="text-black/35 text-xs flex-shrink-0" />
      ) : external ? (
        <FaExternalLinkAlt className="text-black/35 text-xs flex-shrink-0" />
      ) : (
        <FaChevronRight className="text-black/35 text-xs flex-shrink-0" />
      )}
    </div>
  );

  const motionProps = {
    whileHover: { scale: 1.015 },
    whileTap: { scale: 0.99 },
  };

  if (href) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full"
        {...motionProps}
      >
        {inner}
      </motion.a>
    );
  }
  return (
    <motion.button onClick={onClick} className="w-full" {...motionProps}>
      {inner}
    </motion.button>
  );
}
