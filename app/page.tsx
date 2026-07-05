import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rity Card — Akıllı Dijital Kartvizit",
  description:
    "Tek dokunuşla paylaşılan, güncellenebilir, ölçülebilir dijital kartvizit. NFC & QR ile çalışır.",
};

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-16">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl btn-neon text-white text-2xl font-bold mb-6">
          R
        </div>

        <h1 className="text-4xl font-bold neon-text mb-3">Rity Card</h1>
        <p className="text-base text-black/60 leading-relaxed mb-8">
          Akıllı dijital kartvizit. Tek dokunuşla paylaş, istediğin zaman
          güncelle, kaç kez görüntülendiğini gör. NFC & QR ile çalışır.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { t: "Tek dokunuş", d: "NFC / QR" },
            { t: "Hep güncel", d: "Anında düzenle" },
            { t: "Ölçülebilir", d: "İstatistik" },
          ].map((f) => (
            <div key={f.t} className="glass-soft rounded-2xl p-4">
              <p className="text-sm font-semibold text-[#1d1d1f]">{f.t}</p>
              <p className="text-[11px] text-black/45 mt-0.5">{f.d}</p>
            </div>
          ))}
        </div>

        <a
          href="mailto:destek@ritycard.one"
          className="btn-neon inline-flex items-center justify-center px-7 py-3 rounded-xl text-white font-semibold text-sm"
        >
          İletişime Geç
        </a>

        <p className="mt-10 text-xs text-black/35">
          <Link
            href="/gizlilik"
            className="hover:text-black/55 transition-colors"
          >
            Gizlilik &amp; KVKK
          </Link>
        </p>
      </div>
    </main>
  );
}
