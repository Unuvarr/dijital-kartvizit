"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

export default function GatewayPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function checkCard() {
      if (!slug) return;

      try {
        const { data, error } = await supabase
          .from("digital_cards")
          .select("status")
          .eq("slug", slug)
          .single();

        if (error) {
          console.error("Supabase Hatası:", error);
          setErrorMsg("❌ Bu kart bulunamadı");
          return;
        }

        if (!data) {
          setErrorMsg("❌ Bu slug sistemde kayıtlı değil");
          return;
        }

        // Eğer status "Bos" ise registro sayfasına git
        if (data.status === "Bos") {
          router.push(`/register/${slug}`);
        } else {
          // Aktif ise profile'e git
          router.push(`/profile/${slug}`);
        }
      } catch (err) {
        console.error("Beklenmeyen hata:", err);
        setErrorMsg("❌ Bir hata oluştu");
      }
    }

    checkCard();
  }, [slug, router]);

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          className="neon-border max-w-md"
        >
          <div className="glass rounded-[2rem] p-10 text-center">
            <div className="text-6xl mb-4">❌</div>
            <p className="text-red-600 text-lg font-semibold">{errorMsg}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#6366f1] border-r-[#8b5cf6] animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#a5b4fc] animate-spin [animation-direction:reverse]" />
        </div>
        <p className="neon-text font-semibold">Kartın Yükleniyor...</p>
      </div>
    </div>
  );
}
