"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserId } from "@/lib/auth";
import { containerVariants, itemVariants, cardVariants } from "@/lib/motion";
import { FaUserPlus, FaIdCard, FaArrowLeft, FaRedo, FaTrashAlt } from "react-icons/fa";
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

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<Profile[]>([]);
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

      if (list.length > 0) {
        const ids = list.map((c) => c.id);
        const { data: allLeads } = await supabase
          .from("card_leads")
          .select("*")
          .in("card_id", ids)
          .order("created_at", { ascending: false })
          .limit(50);
        setLeads((allLeads as LeadRow[]) || []);
      }

      setCards(list);
      setLoading(false);
    })();
  }, [router]);

  // Okutulma sayacını sıfırla
  async function resetViews(cardId: string) {
    if (!confirm("Bu kartın okutulma sayısı sıfırlansın mı?")) return;
    const { error } = await supabase
      .from("digital_cards")
      .update({ view_count: 0 })
      .eq("id", cardId);
    if (!error) {
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, view_count: 0 } : c))
      );
    }
  }

  // Bırakılan kişiyi (lead) sil
  async function deleteLead(id: number) {
    if (!confirm("Bu kişiyi listeden silmek istiyor musun?")) return;
    const { error } = await supabase.from("card_leads").delete().eq("id", id);
    if (!error) setLeads((prev) => prev.filter((l) => l.id !== id));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#141416] border-r-[#3a3a3d] animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#8a8a8d] animate-spin [animation-direction:reverse]" />
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Geri"
              className="glass-soft inline-flex items-center justify-center w-10 h-10 rounded-xl text-black/70 hover:text-black hover:bg-black/[0.04] transition-colors flex-shrink-0"
            >
              <FaArrowLeft className="text-sm" />
            </button>
            <h1 className="text-3xl font-bold neon-text">Kartlarım</h1>
          </div>
          <p className="text-sm text-black/55 mt-1">
            Tüm kartların, okutulma sayısı ve bırakılan bilgiler tek yerde.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid gap-3 sm:grid-cols-2"
        >
          {cards.map((card) => (
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

                <div className="mb-1 rounded-lg p-3 bg-black/[0.03] border border-black/[0.06] flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-black/45 uppercase tracking-wider">
                      Toplam Okutulma
                    </p>
                    <p className="text-xl font-semibold">{card.view_count ?? 0}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => resetViews(card.id)}
                    title="Sayacı sıfırla"
                    className="inline-flex items-center gap-1.5 text-[11px] text-black/55 hover:text-black px-2.5 py-1.5 rounded-lg hover:bg-black/[0.06] transition-colors"
                  >
                    <FaRedo className="text-[10px]" /> Sıfırla
                  </button>
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
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{l.name}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <p className="text-[10px] text-black/40">
                          {new Date(l.created_at).toLocaleDateString("tr-TR")}
                        </p>
                        <button
                          type="button"
                          onClick={() => deleteLead(l.id)}
                          title="Sil"
                          aria-label="Sil"
                          className="text-black/30 hover:text-red-600 transition-colors p-1"
                        >
                          <FaTrashAlt className="text-xs" />
                        </button>
                      </div>
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
