-- AVATAR STORAGE GÜVENLİĞİ (defacement + çöp yükleme önlemi)
-- Supabase > SQL Editor (DOĞRU proje: smyaxlrqghiwpsuxowzk) çalıştır.
--
-- Sorun: eski politikalar yalnız bucket_id='avatars' kontrol ediyordu →
-- giriş yapmış herkes HERHANGİ bir avatarı üzerine yazabiliyordu.
-- Çözüm: yeni yol şeması <owner_uid>/<slug>-<ts>.<ext>; yazma yalnız kişinin
-- kendi klasörüne. Eski kök-dizin dosyalar okunmaya devam eder ama artık ezilemez.

-- Insert: yalnız kendi klasörüne
drop policy if exists "Avatar yukle" on storage.objects;
create policy "Avatar yukle"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Update: yalnız kendi klasörüne
drop policy if exists "Avatar guncelle" on storage.objects;
create policy "Avatar guncelle"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Delete: yalnız kendi klasörü (opsiyonel temizlik)
drop policy if exists "Avatar sil" on storage.objects;
create policy "Avatar sil"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- SELECT (herkese açık okuma) aynen kalır — dokunma:
-- "Avatar herkese acik": for select using (bucket_id = 'avatars')
