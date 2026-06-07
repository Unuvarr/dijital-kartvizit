import type { NextRequest } from "next/server";
import { fetchCardBySlug } from "@/lib/supabaseServer";

/**
 * Google Wallet "Save to Wallet" link uretici - ISKELET.
 *
 * Tam calismasi icin gerekli:
 *   - Google Cloud Console'da Issuer ID al (Google Wallet API)
 *   - Service Account JSON key uret
 *   - Generic Pass Class olustur (Issuer paneli veya REST)
 *   - JWT'yi RS256 ile imzala -> https://pay.google.com/gp/v/save/<JWT> ile redirect
 *
 * Env degiskenleri (eklenecek):
 *   GOOGLE_WALLET_ISSUER_ID
 *   GOOGLE_WALLET_CLASS_ID
 *   GOOGLE_WALLET_SA_EMAIL
 *   GOOGLE_WALLET_SA_PRIVATE_KEY (PEM, \n escaped)
 *
 * Lib onerisi: `jose` veya `google-auth-library`. (jose: lightweight)
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return Response.json({ error: "slug required" }, { status: 400 });
  }
  const card = await fetchCardBySlug(slug);
  if (!card || card.status !== "Aktif") {
    return Response.json({ error: "card not found" }, { status: 404 });
  }

  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  const classId = process.env.GOOGLE_WALLET_CLASS_ID;
  const saEmail = process.env.GOOGLE_WALLET_SA_EMAIL;
  const saKey = process.env.GOOGLE_WALLET_SA_PRIVATE_KEY?.replace(/\\n/g, "\n");

  const origin = req.nextUrl.origin;
  const objectId = `${issuerId || "ISSUER"}.${card.id}`;
  const cardObject = {
    id: objectId,
    classId: classId || `${issuerId || "ISSUER"}.kartvizit`,
    state: "ACTIVE",
    cardTitle: {
      defaultValue: { language: "tr-TR", value: `${card.first_name} ${card.last_name}` },
    },
    subheader: {
      defaultValue: { language: "tr-TR", value: card.title || "" },
    },
    header: {
      defaultValue: { language: "tr-TR", value: card.company || "" },
    },
    textModulesData: [
      card.phone && { header: "Telefon", body: card.phone },
      card.email && { header: "E-posta", body: card.email },
      card.website && { header: "Web", body: card.website },
    ].filter(Boolean),
    barcode: { type: "QR_CODE", value: `${origin}/${slug}` },
    hexBackgroundColor: "#4f46e5",
  };

  if (!issuerId || !classId || !saEmail || !saKey) {
    return Response.json(
      {
        status: "scaffold",
        message:
          "Google Wallet env degiskenleri bagli degil. Asagidaki obje, imzalanip JWT olarak gomulecek payload'dur.",
        cardObject,
      },
      { status: 200 }
    );
  }

  // Imza icin ornek (jose ile):
  //   import { SignJWT, importPKCS8 } from "jose";
  //   const claims = {
  //     iss: saEmail,
  //     aud: "google",
  //     typ: "savetowallet",
  //     iat: Math.floor(Date.now() / 1000),
  //     payload: { genericObjects: [cardObject] },
  //   };
  //   const pk = await importPKCS8(saKey, "RS256");
  //   const jwt = await new SignJWT(claims)
  //     .setProtectedHeader({ alg: "RS256", typ: "JWT" })
  //     .sign(pk);
  //   return Response.redirect(`https://pay.google.com/gp/v/save/${jwt}`, 302);

  return Response.json(
    { todo: "JWT imzalama ve redirect" },
    { status: 501 }
  );
}
