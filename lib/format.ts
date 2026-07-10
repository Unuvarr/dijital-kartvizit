/** Telefonu okunur biçimde göster: 05551234567 → 0555 123 45 67 (yalnızca görüntü; tel: linki ham kalır). */
export function formatPhone(raw: string): string {
  const plus = raw.trim().startsWith("+");
  const digits = raw.replace(/\D/g, "");
  // +90 5xx xxx xx xx
  if (plus && digits.length === 12 && digits.startsWith("90"))
    return `+90 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
  // 0 5xx xxx xx xx → 0555 123 45 67
  if (!plus && digits.length === 11 && digits.startsWith("0"))
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
  // 5xx xxx xx xx (başında 0 yok)
  if (!plus && digits.length === 10)
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
  return raw; // tanınmayan biçimi olduğu gibi bırak
}
