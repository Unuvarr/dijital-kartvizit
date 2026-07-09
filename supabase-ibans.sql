-- Birden fazla (etiketli) IBAN: jsonb dizi [{ "label": "Ziraat", "value": "TR..." }]
-- Supabase > SQL Editor (DOĞRU proje: smyaxlrqghiwpsuxowzk) çalıştır.

alter table digital_cards
  add column if not exists ibans jsonb not null default '[]'::jsonb;

-- Eski tek "iban" kolonu geriye uyumluluk için kalır (ilk IBAN ile senkron tutulur).
