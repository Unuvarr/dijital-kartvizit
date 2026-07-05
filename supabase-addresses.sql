-- Profile'a birden fazla (etiketli) adres: jsonb dizi [{ "label": "...", "value": "..." }]
-- Supabase > SQL Editor (DOĞRU proje: smyaxlrqghiwpsuxowzk) çalıştır.

alter table digital_cards
  add column if not exists addresses jsonb not null default '[]'::jsonb;

-- Eski tek "address" kolonu geriye uyumluluk için kalır (ilk adresle senkron tutulur).
