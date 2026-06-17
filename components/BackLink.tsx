"use client";

/**
 * Geri/kapat butonu. Gizlilik gibi sayfalar genelde yeni sekmede acilir;
 * once sekmeyi kapatmayi dener, olmazsa onceki sayfaya doner.
 */
export default function BackLink() {
  const handle = () => {
    // Yeni sekmede acildiysa kapatmayi dene
    window.close();
    // Kapanmadiysa (ayni sekmedeyse) geri git
    if (window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <button
      onClick={handle}
      className="text-xs text-black/45 hover:text-black/70 transition-colors"
    >
      ← Geri
    </button>
  );
}
