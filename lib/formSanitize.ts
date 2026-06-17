/** Alanlara gore canli giris temizleme (kayit + duzenleme ortak). */
export function sanitizeField(name: string, value: string): string {
  switch (name) {
    case "first_name":
    case "last_name":
      // Sadece harf (Turkce dahil) + bosluk/'/-, en fazla 15
      return value.replace(/[^\p{L}\s'-]/gu, "").slice(0, 15);
    case "phone":
    case "whatsapp":
      // Sadece rakam, + ve bosluk, en fazla 20
      return value.replace(/[^\d+\s]/g, "").slice(0, 20);
    case "iban":
      // TR + rakam (buyuk harf), bosluklu, en fazla 32
      return value.toUpperCase().replace(/[^A-Z0-9\s]/g, "").slice(0, 32);
    case "title":
    case "company":
      return value.slice(0, 40);
    case "email":
      return value.replace(/\s/g, "").slice(0, 120);
    case "website":
      return value.slice(0, 200);
    case "address":
      return value.slice(0, 300);
    default:
      return value.slice(0, 200);
  }
}

/** Gonderim oncesi temel dogrulama. Hata varsa mesaji, yoksa null doner. */
export function validateContactForm(f: {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  iban?: string | null;
}): string | null {
  if (!f.first_name.trim()) return "Ad boş bırakılamaz";
  if (!f.last_name.trim()) return "Soyad boş bırakılamaz";
  if (!f.phone.trim()) return "Telefon boş bırakılamaz";
  if (f.phone.replace(/\D/g, "").length < 10)
    return "Geçerli bir telefon numarası gir";
  if (!f.email.trim()) return "E-posta boş bırakılamaz";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()))
    return "Geçerli bir e-posta adresi gir";
  if (f.iban && f.iban.trim()) {
    const iban = f.iban.replace(/\s/g, "").toUpperCase();
    if (!/^TR\d{24}$/.test(iban))
      return "Geçerli bir IBAN gir (TR ile başlayıp 24 rakam)";
  }
  return null;
}
