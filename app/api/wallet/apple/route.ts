import type { NextRequest } from "next/server";
import { fetchCardBySlug } from "@/lib/supabaseServer";

/**
 * Apple Wallet (.pkpass) endpoint - ISKELET.
 *
 * Tam calismasi icin gerekli (run-time):
 *   - Apple Developer Program ($99/yil) -> Pass Type ID + sertifika (.p12)
 *   - Apple WWDR sertifikasi
 *   - Bir Node lib: `passkit-generator` veya `@walletpass/pass-js`
 *
 * Env degiskenleri (eklenecek):
 *   APPLE_WALLET_CERT_P12_BASE64
 *   APPLE_WALLET_CERT_PASSWORD
 *   APPLE_WALLET_WWDR_BASE64
 *   APPLE_WALLET_PASS_TYPE_ID  (orn. pass.com.sirketin.kartvizit)
 *   APPLE_WALLET_TEAM_ID
 *
 * Bu iskelet, sertifikalar yokken JSON formatinda kartin "pass payload"unu
 * dondurur ki frontend test edebilsin. Sertifikalar bagliyken passkit-generator
 * ile .pkpass binary'sini dondurmek tek bir if-block degisikligi.
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return new Response(JSON.stringify({ error: "slug required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  const card = await fetchCardBySlug(slug);
  if (!card || card.status !== "Aktif") {
    return new Response(JSON.stringify({ error: "card not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }

  const origin = req.nextUrl.origin;
  const passPayload = {
    formatVersion: 1,
    passTypeIdentifier: process.env.APPLE_WALLET_PASS_TYPE_ID || "pass.example.placeholder",
    teamIdentifier: process.env.APPLE_WALLET_TEAM_ID || "PLACEHOLDER",
    serialNumber: card.id,
    organizationName: card.company || `${card.first_name} ${card.last_name}`,
    description: `${card.first_name} ${card.last_name} - Dijital Kartvizit`,
    foregroundColor: "rgb(255,255,255)",
    backgroundColor: "rgb(79,70,229)",
    labelColor: "rgb(220,220,255)",
    generic: {
      primaryFields: [
        { key: "name", label: "AD", value: `${card.first_name} ${card.last_name}` },
      ],
      secondaryFields: [
        card.title
          ? { key: "title", label: "UNVAN", value: card.title }
          : null,
        card.company
          ? { key: "company", label: "ŞİRKET", value: card.company }
          : null,
      ].filter(Boolean),
      auxiliaryFields: [
        card.phone ? { key: "phone", label: "TELEFON", value: card.phone } : null,
        card.email ? { key: "email", label: "E-POSTA", value: card.email } : null,
      ].filter(Boolean),
    },
    barcodes: [
      {
        format: "PKBarcodeFormatQR",
        message: `${origin}/${slug}`,
        messageEncoding: "iso-8859-1",
      },
    ],
  };

  const ready = !!process.env.APPLE_WALLET_CERT_P12_BASE64;
  if (!ready) {
    // Sertifika yok -> debug JSON don
    return new Response(
      JSON.stringify(
        {
          status: "scaffold",
          message:
            "Apple Wallet sertifikalari env'de bagli degil. Yukaridaki JSON, .pkpass icin uretilen pass payload'udur.",
          pass: passPayload,
        },
        null,
        2
      ),
      { headers: { "content-type": "application/json" } }
    );
  }

  // Sertifikalar varsa burada passkit-generator ile binary uret ve dondur:
  //   const { PKPass } = await import("passkit-generator");
  //   const pass = await PKPass.from({...});
  //   const buffer = pass.getAsBuffer();
  //   return new Response(buffer, {
  //     headers: {
  //       "content-type": "application/vnd.apple.pkpass",
  //       "content-disposition": `attachment; filename="${slug}.pkpass"`,
  //     },
  //   });
  return new Response(JSON.stringify({ todo: "pkpass binary generation" }), {
    status: 501,
    headers: { "content-type": "application/json" },
  });
}
