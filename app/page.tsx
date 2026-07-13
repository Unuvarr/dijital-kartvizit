import type { Metadata } from "next";
import LandingClient from "./LandingClient";

export const metadata: Metadata = {
  title: "Rity Card — NFC Dijital Kartvizit | Telefona Dokundur, Tanış",
  description:
    "İsmine özel NFC kartvizit: telefona dokundur, profilin açılsın. Uygulama gerekmez, bilgilerin ömür boyu güncellenir. 499₺ kargo dahil.",
  openGraph: {
    title: "Rity Card — Telefona dokundur, tanış.",
    description:
      "İsmine özel NFC kartvizit. Dokundur — telefonun, WhatsApp'ın, sosyal medyan tek ekranda açılsın. 499₺ kargo dahil.",
    url: "https://ritycard.one",
    siteName: "Rity Card",
    locale: "tr_TR",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Rity Card — NFC Dijital Kartvizit" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rity Card — Telefona dokundur, tanış.",
    description: "İsmine özel NFC kartvizit. 499₺ kargo dahil.",
    images: ["/og.png"],
  },
};

export default function Home() {
  return <LandingClient />;
}
