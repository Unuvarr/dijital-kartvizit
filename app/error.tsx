"use client";

import { useEffect } from "react";

/** Yeni deploy sonrası eski HTML'in silinmiş JS parçalarını (chunk) çağırması
 *  tipik bir "Failed to load chunk" hatasıdır. Kod hatası değil, önbellek. */
function isChunkError(error?: Error): boolean {
  const s = `${error?.name || ""} ${error?.message || ""}`;
  return /ChunkLoadError|Loading chunk|Failed to load chunk|dynamically imported module/i.test(
    s
  );
}

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const chunk = isChunkError(error);

  useEffect(() => {
    console.error("App error:", error);
    // Chunk hatasında sayfayı otomatik bir kez sert yenile (döngüye girmeden)
    if (chunk && typeof window !== "undefined") {
      const key = "rc-chunk-reloaded";
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
      }
    } else if (!chunk && typeof window !== "undefined") {
      // Chunk dışı normal hatadan sonra bayrağı temizle
      sessionStorage.removeItem("rc-chunk-reloaded");
    }
  }, [error, chunk]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass neon-border rounded-[2rem] p-10 text-center max-w-md">
        <div className="text-5xl mb-3">{chunk ? "🔄" : "⚠️"}</div>
        <h1 className="text-xl font-semibold mb-2">
          {chunk ? "Güncelleniyor…" : "Bir şeyler ters gitti"}
        </h1>
        <p className="text-sm text-black/55 mb-6">
          {chunk
            ? "Yeni sürüm yükleniyor, birkaç saniye sürebilir."
            : error.message || "Beklenmeyen bir hata oluştu."}
        </p>
        <button
          onClick={() =>
            chunk ? window.location.reload() : reset()
          }
          className="btn-neon px-6 py-3 rounded-xl text-white font-semibold"
        >
          {chunk ? "Şimdi yenile" : "Tekrar dene"}
        </button>
        {error.digest && !chunk && (
          <p className="text-[10px] text-black/30 mt-4 font-mono">
            id: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
