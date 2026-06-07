"use client";

import { QRCodeCanvas } from "qrcode.react";

interface BrandedQRProps {
  value: string;
  logoUrl?: string | null;
  size?: number;
}

/**
 * Logosu ortada gomulu QR. qrcode.react'in imageSettings ozelligini
 * kullanir; logo varsa hata duzelmesi (level "H") devrede.
 */
export default function BrandedQR({
  value,
  logoUrl,
  size = 220,
}: BrandedQRProps) {
  const hasLogo = !!logoUrl;
  const logoSize = Math.round(size * 0.22);

  return (
    <QRCodeCanvas
      value={value}
      size={size}
      level={hasLogo ? "H" : "M"}
      marginSize={2}
      imageSettings={
        hasLogo
          ? {
              src: logoUrl!,
              height: logoSize,
              width: logoSize,
              excavate: true,
              crossOrigin: "anonymous",
            }
          : undefined
      }
    />
  );
}
