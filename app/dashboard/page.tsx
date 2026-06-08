"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserId } from "@/lib/auth";
import { containerVariants, itemVariants, cardVariants } from "@/lib/motion";
import { FaUserPlus, FaIdCard, FaArrowLeft } from "react-icons/fa";
import type { Profile } from "@/lib/types";

interface LeadRow {
  id: number;
  card_id: string;
  created_at: string;
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  message: string | null;
}

interface CardSummary {
  card: Profile;
  leadCount: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);

  useEffect(() => {
    (async () => {
      const userId = await getCurrentUserId();
      if (!userId) {
        router.replace("/recover");
        return;
      }

      const { data: myCards } = await supabase
        .from("digital_cards")
        .select("*")
        .eq("owner_id", userId);

      const list = (myCards as Profile[]) || [];

      const summaries: CardSummary[] = await Promise.all(
        list.map(async (card) => {
          const { count: leadCount } = await supabase
            .from("card_leads")
            .select("*", { count: "exact", head: true })
            .eq("card_id", card.id);
          return {
            card,
            leadCount: leadCount || 0,
          };
        })
      );

      if (list.length > 0) {
        const ids = list.map((c) => c.id);
        const { data: allLeads } = await supabase
          .from("card_leads")
          .select("*")
          .in("card_id", ids)
          .order("created_at", { ascending: false })
          .limit(20);
        setLeads((allLeads as LeadRow[]) || []);
      }

      setCards(summaries);
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#6366f1] border-r-[#8b5cf6] animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#a5b4fc] animate-spin [animation-direction:reverse]" />
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass neon-border rounded-[2rem] p-10 max-w-md text-center">
          <FaIdCard className="text-5xl mx-auto mb-4 text-black/30" />
          <h2 className="text-xl font-semibold mb-2">Henüz kartın yok</h2>
          <p className="text-sm text-black/55">
            Bir NFC kart aldığında ya da bağlı bir kartın varsa burada listelenecek.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-3xl mx-auto space-y-6"
      >
        <motion.div variants={itemVariants}>
          <button
            onClick={() => router.back()}
            className="glass-soft inline-flex items-center gap-2 text-black/70 hover:text-black px-4 py-2 rounded-xl transition-colors mb-4"
          >
            <FaArrowLeft className="text-xs" /> Geri
          </button>
          <h1 className="text-3xl font-bold neon-text">Kartlarım</h1>
          <p className="text-sm text-black/55 mt-1">
            Tüm kartların, görüntülenme ve gelen iletişimler tek yerde.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid gap-3 sm:grid-cols-2"
        >
          {cards.map(({ card, leadCount }) => (
            <motion.div
              key={card.id}
              variants={cardVariants}
              className="neon-border"
            >
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-black/[0.04] flex items-center justify-center text-black/40 font-semibold">
                    {card.avatar_url ? (
                      <Image
                        src={card.avatar_url}
                        alt=""
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        {card.first_name?.[0]}
                        {card.last_name?.[0]}
                      </>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {card.first_name} {card.last_name}
                    </p>
                    <p className="text-xs text-black/50 truncate">
                      /{card.slug}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-center">
                  <div className="glass-soft rounded-lg p-2">
                    <p className="text-[10px] text-black/45 uppercase tracking-wider">
                      Toplam Okutulma
                    </p>
                    <p className="text-lg font-semibold">{card.view_count ?? 0}</p>
                  </div>
                  <div className="glass-soft rounded-lg p-2">
                    <p className="text-[10px] text-black/45 uppercase tracking-wider">
                      Lead
                    </p>
                    <p className="text-lg font-semibold">{leadCount}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Gelen Leadler */}
        <motion.div variants={itemVariants} className="neon-border">
          <div className="glass rounded-2xl p-5">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <FaUserPlus />
              <span>Sana Bilgi Bırakanlar</span>
            </h2>
            {leads.length === 0 ? (
              <p className="text-sm text-black/45 py-6 text-center">
                Henüz kimse bilgi bırakmadı.
              </p>
            ) : (
              <div className="space-y-2">
                {leads.map((l) => (
                  <div
                    key={l.id}
                    className="glass-soft rounded-xl p-3 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{l.name}</p>
                      <p className="text-[10px] text-black/40">
                        {new Date(l.created_at).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <div className="text-xs text-black/55 mt-1 space-x-3">
                      {l.phone && <span>📞 {l.phone}</span>}
                      {l.email && <span>✉️ {l.email}</span>}
                      {l.company && <span>🏢 {l.company}</span>}
                    </div>
                    {l.message && (
                      <p className="text-xs text-black/65 mt-2 italic">
                        “{l.message}”
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center pt-4">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace("/recover");
            }}
            className="text-xs text-black/40 hover:text-black/65 transition-colors"
          >
            Oturumu kapat
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
