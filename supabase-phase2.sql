-- =====================================================================
-- FAZ 2 - Yeni alanlar (unvan, sirket, profil fotografi)
-- Supabase > SQL Editor > New query > yapistir > Run
-- =====================================================================

-- 1) Yeni kolonlar
alter table public.digital_cards add column if not exists title   text; -- Unvan
alter table public.digital_cards add column if not exists company text; -- Sirket
alter table public.digital_cards add column if not exists avatar_url text; -- Profil fotografi linki

-- =====================================================================
-- 2) PROFIL FOTOGRAFI ICIN STORAGE (Depolama) KURULUMU
--
-- ONCE PANELDEN: Storage > "New bucket" > isim: avatars > "Public bucket" ACIK > Create
-- (Public olmasi onemli ki fotograflar herkese gorunsun)
--
-- SONRA bu policy'leri calistir (yukleme izni icin):
-- =====================================================================

-- Herkes avatar fotograflarini gorebilir (zaten public bucket ama net olsun)
drop policy if exists "Avatar herkese acik" on storage.objects;
create policy "Avatar herkese acik"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Giris yapmis (anonim dahil) herkes avatar yukleyebilir
drop policy if exists "Avatar yukle" on storage.objects;
create policy "Avatar yukle"
  on storage.objects for insert
  with check (bucket_id = 'avatars');

-- Yuklenen avatari guncelleyebilsin (uzerine yazma)
drop policy if exists "Avatar guncelle" on storage.objects;
create policy "Avatar guncelle"
  on storage.objects for update
  using (bucket_id = 'avatars');
