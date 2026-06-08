"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaTimes } from "react-icons/fa";

/**
 * Yuvarlak avatar kirpma modali.
 * Kullanici fotografi surukleyip yakinlastirarak ortalar; onaylayinca
 * kirpilmis kareyi File olarak dondurur (kayit/duzenleme ayni bileseni kullanir).
 */
export default function AvatarCropper({
  imageSrc,
  open,
  onCancel,
  onComplete,
  aspect = 1,
  cropShape = "round",
  outW = 512,
  outH = 512,
  title = "Fotoğrafı ortala",
}: {
  imageSrc: string | null;
  open: boolean;
  onCancel: () => void;
  onComplete: (file: File) => void;
  aspect?: number;
  cropShape?: "round" | "rect";
  outW?: number;
  outH?: number;
  title?: string;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc || !areaPixels) return;
    setBusy(true);
    try {
      const file = await cropToFile(imageSrc, areaPixels, outW, outH);
      onComplete(file);
    } finally {
      setBusy(false);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    }
  };

  return (
    <AnimatePresence>
      {open && imageSrc && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="neon-border w-full max-w-sm"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
          >
            <div className="glass rounded-[1.75rem] p-5">
              <h3 className="text-sm font-semibold text-[#1d1d1f] mb-3 text-center">
                {title}
              </h3>

              <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-black/[0.04]">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspect}
                  cropShape={cropShape}
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs text-black/45">Yakınlaştır</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-[#4f46e5]"
                  aria-label="Yakınlaştır"
                />
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={busy}
                  className="flex-1 glass-soft rounded-xl py-3 text-sm font-medium text-black/70 hover:text-black hover:bg-black/[0.03] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FaTimes className="text-xs" /> İptal
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={busy}
                  className="flex-1 btn-neon rounded-xl py-3 text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FaCheck className="text-xs" /> {busy ? "Kırpılıyor..." : "Onayla"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Verilen kaynaktan, secilen alani kirpip JPEG File olarak dondurur. */
async function cropToFile(
  src: string,
  area: Area,
  outW: number,
  outH: number
): Promise<File> {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas desteklenmiyor");

  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    outW,
    outH
  );

  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Kırpma başarısız"))),
      "image/jpeg",
      0.9
    )
  );

  return new File([blob], "avatar.jpg", { type: "image/jpeg" });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
