"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="tr">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f4f4f6",
          color: "#1d1d1f",
          margin: 0,
        }}
      >
        <div style={{ textAlign: "center", padding: 32, maxWidth: 420 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💥</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
            Uygulama hatası
          </h1>
          <p style={{ color: "#666", fontSize: 14 }}>
            Sayfayı yenile veya birazdan tekrar dene.
          </p>
        </div>
      </body>
    </html>
  );
}
