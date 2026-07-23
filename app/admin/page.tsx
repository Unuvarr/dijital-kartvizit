"use client";

import { useEffect, useState, useCallback } from "react";

type Row = {
  slug: string;
  name: string;
  status: string;
  title: string | null;
  company: string | null;
  views: number;
  leads: number;
  hasPhoto: boolean;
  hasEmail: boolean;
};
type Ozet = {
  toplamKart: number;
  aktifKart: number;
  toplamOkutulma: number;
  toplamLead: number;
};

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [ozet, setOzet] = useState<Ozet | null>(null);

  const fetchStats = useCallback(async (k: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: k }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Hata");
      setRows(json.rows);
      setOzet(json.ozet);
      setAuthed(true);
      localStorage.setItem("rity_admin_key", k);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bağlantı hatası");
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Kayitli anahtar varsa otomatik dene (senkron setState kaskadindan kacinmak icin ertelenir)
  useEffect(() => {
    const saved = localStorage.getItem("rity_admin_key");
    if (!saved) return;
    const t = setTimeout(() => {
      setKey(saved);
      fetchStats(saved);
    }, 0);
    return () => clearTimeout(t);
  }, [fetchStats]);

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center p-5 bg-[#141416]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (key.trim()) fetchStats(key.trim());
          }}
          className="w-full max-w-xs text-center"
        >
          <p className="text-white font-bold text-xl mb-1">Rity Yönetim</p>
          <p className="text-white/40 text-sm mb-6">Yönetici anahtarını gir</p>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Anahtar"
            autoFocus
            className="w-full h-12 px-4 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-white/40"
          />
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full h-12 rounded-xl bg-white text-[#141416] font-bold disabled:opacity-50"
          >
            {loading ? "Kontrol ediliyor…" : "Giriş"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#141416] text-white px-4 sm:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Rity Yönetim Paneli</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchStats(key)}
              disabled={loading}
              className="text-sm text-white/60 hover:text-white disabled:opacity-50"
            >
              {loading ? "Yenileniyor…" : "↻ Yenile"}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("rity_admin_key");
                setAuthed(false);
                setKey("");
              }}
              className="text-sm text-white/40 hover:text-white"
            >
              Çıkış
            </button>
          </div>
        </div>

        {ozet && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { l: "Toplam Kart", v: ozet.toplamKart },
              { l: "Aktif Kart", v: ozet.aktifKart },
              { l: "Toplam Okutulma", v: ozet.toplamOkutulma },
              { l: "Toplam Lead", v: ozet.toplamLead },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-2xl bg-white/[0.05] border border-white/[0.08] p-4"
              >
                <p className="text-3xl font-extrabold tabular-nums">{s.v}</p>
                <p className="text-[12px] text-white/45 mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 text-[12px] bg-white/[0.03]">
                <th className="px-4 py-3 font-medium">Kart</th>
                <th className="px-3 py-3 font-medium">Durum</th>
                <th className="px-3 py-3 font-medium text-right">Okutulma</th>
                <th className="px-3 py-3 font-medium text-right">Lead</th>
                <th className="px-3 py-3 font-medium text-center">Foto</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.slug}
                  className="border-t border-white/[0.06] hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-[12px] text-white/40">
                      /{r.slug}
                      {r.company ? ` · ${r.company}` : ""}
                      {r.title ? ` · ${r.title}` : ""}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        r.status === "Aktif"
                          ? "bg-white text-[#141416]"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {r.status === "Aktif" ? "Aktif" : "Kayıt bekliyor"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-bold tabular-nums text-lg">
                    {r.views}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-white/70">
                    {r.leads}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {r.hasPhoto ? "📷" : <span className="text-white/25">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`/${r.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] text-white/50 hover:text-white"
                    >
                      Profili aç ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[12px] text-white/30 mt-4">
          Okutulmaya göre sıralı · Kayıt bekleyenler henüz aktive edilmemiş
          &quot;yarı hazır&quot; kartlar
        </p>
      </div>
    </main>
  );
}
