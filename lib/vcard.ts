import type { Profile } from "./types";

/** Avatar URL'yi base64'e cevirip vCard PHOTO alanina gomer. Hata olursa atlanir. */
async function fetchPhotoBase64(
  url: string
): Promise<{ b64: string; mime: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const mime = res.headers.get("content-type") || "image/jpeg";
    const buf = await res.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary);
    return { b64, mime };
  } catch {
    return null;
  }
}

/** vCard 3.0 satirlarini 75 karakterde katlama (RFC 6350) */
function fold(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let i = 0;
  while (i < line.length) {
    const chunk = line.slice(i, i === 0 ? 75 : i + 74);
    parts.push((i === 0 ? "" : " ") + chunk);
    i += i === 0 ? 75 : 74;
  }
  return parts.join("\r\n");
}

function esc(v: string | null | undefined): string {
  if (!v) return "";
  return v.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

/**
 * Profil'den zenginlestirilmis vCard 3.0 metni uretir.
 * Sosyal medya, WhatsApp, foto (varsa base64) dahil.
 */
export async function buildVCard(p: Profile): Promise<string> {
  const lines: string[] = [];
  lines.push("BEGIN:VCARD");
  lines.push("VERSION:3.0");
  lines.push(`FN:${esc(`${p.first_name} ${p.last_name}`.trim())}`);
  lines.push(`N:${esc(p.last_name)};${esc(p.first_name)};;;`);

  if (p.title) lines.push(`TITLE:${esc(p.title)}`);
  if (p.company) lines.push(`ORG:${esc(p.company)}`);
  if (p.phone) lines.push(`TEL;TYPE=CELL,VOICE:${esc(p.phone)}`);
  if (p.whatsapp) {
    const wa = p.whatsapp.replace(/\D/g, "");
    lines.push(`TEL;TYPE=CELL,TEXT:${esc(wa)}`);
  }
  if (p.email) lines.push(`EMAIL;TYPE=INTERNET:${esc(p.email)}`);

  // Adres ve sosyal medya bilerek vCard'a EKLENMEZ (sade rehber kartı);
  // ikisi de profil sayfasında görünür.

  if (p.website) {
    const w = /^https?:\/\//i.test(p.website) ? p.website : `https://${p.website}`;
    lines.push(`URL:${esc(w)}`);
  }
  // IBAN da vCard'a EKLENMEZ: ödeme bilgisi, iletişim değil (profilde kopyalanır).

  if (p.avatar_url) {
    const photo = await fetchPhotoBase64(p.avatar_url);
    if (photo) {
      const ext =
        photo.mime.includes("png") ? "PNG" :
        photo.mime.includes("webp") ? "WEBP" : "JPEG";
      lines.push(fold(`PHOTO;ENCODING=b;TYPE=${ext}:${photo.b64}`));
    } else {
      lines.push(`PHOTO;VALUE=URI:${esc(p.avatar_url)}`);
    }
  }

  lines.push(`REV:${new Date().toISOString()}`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}
