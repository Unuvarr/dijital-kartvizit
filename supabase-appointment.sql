-- "Randevu Al" butonu (WhatsApp üzerinden) aç/kapa bayrağı.
-- Supabase > SQL Editor (DOĞRU proje: smyaxlrqghiwpsuxowzk) çalıştır.

alter table digital_cards
  add column if not exists show_appointment boolean not null default false;
