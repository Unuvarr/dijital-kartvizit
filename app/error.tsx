"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass neon-border rounded-[2rem] p-10 text-center max-w-md">
        <div className="text-5xl mb-3">⚠️</div>
        <h1 className="text-xl font-semibold mb-2">Bir şeyler ters gitti</h1>
        <p className="text-sm text-black/55 mb-6">
          {error.message || "Beklenmeyen bir hata oluştu."}
        </p>
        <button
          onClick={() => reset()}
          className="btn-neon px-6 py-3 rounded-xl text-white font-semibold"
        >
          Tekrar dene
        </button>
        {error.digest && (
          <p className="text-[10px] text-black/30 mt-4 font-mono">
            id: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
