-- =====================================================================
-- DIJITAL KARTVIZIT - GUVENLIK KURULUMU (RLS + Sahiplik)
-- Bu dosyayi Supabase panelinde: SQL Editor > New query alanina yapistir
-- ve "Run" de. Tek seferlik calistirilir.
-- =====================================================================

-- 1) Sahiplik kolonu: her kart bir auth kullanicisina (anonim de olabilir) baglanir
alter table public.digital_cards
  add column if not exists owner_id uuid references auth.users(id);

-- Kurtarma icin e-postayi da satirda tutalim (opsiyonel, panelde gormek icin)
alter table public.digital_cards
  add column if not exists owner_email text;

-- 2) Row Level Security'yi ac
alter table public.digital_cards enable row level security;

-- Eski politikalar varsa temizle (tekrar calistirilabilir olsun)
drop policy if exists "Herkes okuyabilir"       on public.digital_cards;
drop policy if exists "Bos karti sahiplen"      on public.digital_cards;
drop policy if exists "Sahibi guncelleyebilir"  on public.digital_cards;

-- 3) HERKES kartlari okuyabilir (profil sayfasi herkese acik)
create policy "Herkes okuyabilir"
  on public.digital_cards
  for select
  using (true);

-- 4) BOS bir karti, giris yapmis (anonim dahil) herhangi biri SAHIPLENEBILIR.
--    Sahiplenirken kendini owner_id olarak yazmak zorunda.
create policy "Bos karti sahiplen"
  on public.digital_cards
  for update
  using (status = 'Bos' and owner_id is null)
  with check (owner_id = auth.uid());

-- 5) Bir kart artik birinin ise, SADECE o sahibi guncelleyebilir.
--    Baskasi (veya konsoldan saldiran biri) update yapamaz -> 0 satir etkilenir.
create policy "Sahibi guncelleyebilir"
  on public.digital_cards
  for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- =====================================================================
-- ONEMLI - PANELDEN YAPILACAK 1 AYAR:
-- Authentication > Sign In / Providers > "Anonymous sign-ins" ACIK olmali.
-- (Bu olmadan cihaz otomatik tanima calismaz.)
--
-- NOT: Eski test kartlarinin owner_id'si bos oldugu icin duzenlenemez.
-- Temiz test icin status'u tekrar 'Bos' yapip yeniden kayit olabilirsin:
--   update public.digital_cards set status='Bos', owner_id=null where slug='TEST_SLUG';
-- =====================================================================
