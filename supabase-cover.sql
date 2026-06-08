-- =====================================================================
-- KAPAK (BANNER) FOTOGRAFI
-- Supabase > SQL Editor > New query > yapistir > Run
-- =====================================================================

alter table public.digital_cards
  add column if not exists cover_url text;
