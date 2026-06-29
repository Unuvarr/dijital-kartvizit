"use client";

/**
 * Premium acik arka plan: yumusak acik gri zemin uzerinde
 * cok hafif tek imza isigi. Ferah ve sakin.
 */
export default function Aurora() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#f4f4f6]">
      {/* Tek hafif imza isigi (ust orta) */}
      <div
        className="signature-glow"
        style={{
          width: 720,
          height: 720,
          top: "-26%",
          left: "50%",
          marginLeft: -360,
          background:
            "radial-gradient(circle, rgba(20,20,22,0.06) 0%, transparent 70%)",
          animation: "signature-drift 32s ease-in-out infinite",
        }}
      />
    </div>
  );
}
