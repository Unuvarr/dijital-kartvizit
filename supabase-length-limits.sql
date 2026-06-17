-- =====================================================================
-- VERITABANI UZUNLUK SINIRLARI (spam / asiri veri korumasi)
-- Form bypass edilse bile DB asiri uzun veriyi REDDEDER.
-- Supabase > SQL Editor > New query > yapistir > Run
-- =====================================================================

-- digital_cards alan uzunluklari
alter table public.digital_cards
  drop constraint if exists chk_lengths,
  add constraint chk_lengths check (
    char_length(coalesce(first_name, '')) <= 30 and
    char_length(coalesce(last_name, ''))  <= 30 and
    char_length(coalesce(title, ''))      <= 60 and
    char_length(coalesce(company, ''))    <= 60 and
    char_length(coalesce(phone, ''))      <= 30 and
    char_length(coalesce(email, ''))      <= 160 and
    char_length(coalesce(whatsapp, ''))   <= 30 and
    char_length(coalesce(website, ''))    <= 300 and
    char_length(coalesce(iban, ''))       <= 40 and
    char_length(coalesce(address, ''))    <= 400 and
    char_length(coalesce(owner_email, '')) <= 160
  );

-- social_links dizisi cok buyumesin (en fazla 30 baglanti)
alter table public.digital_cards
  drop constraint if exists chk_social_links_count,
  add constraint chk_social_links_count check (
    jsonb_array_length(coalesce(social_links, '[]'::jsonb)) <= 30
  );

-- card_leads alan uzunluklari (ziyaretci spam'ine ek kalkan)
alter table public.card_leads
  drop constraint if exists chk_lead_lengths,
  add constraint chk_lead_lengths check (
    char_length(coalesce(name, ''))    <= 120 and
    char_length(coalesce(phone, ''))   <= 40  and
    char_length(coalesce(email, ''))   <= 160 and
    char_length(coalesce(company, '')) <= 120 and
    char_length(coalesce(message, '')) <= 1000
  );

-- =====================================================================
-- Not: Bu kisitlar DB seviyesinde calisir; formu/anon key'i bypass eden
-- biri bile asiri uzun veri yazamaz. Mevcut (kisa) test verisi etkilenmez.
-- =====================================================================
