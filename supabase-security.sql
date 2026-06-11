-- =====================================================================
-- GUVENLIK SIKILASTIRMA
-- Supabase > SQL Editor > New query > yapistir > Run
-- =====================================================================

-- 1) STORAGE: 'avatars' bucket'i sadece resim + 5MB
update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif']
where id = 'avatars';

-- 2) LEAD: dogrudan anon insert'i KAPAT.
--    Artik leadler sadece /api/lead (service-role) uzerinden eklenir;
--    bu da rate-limit + honeypot + dogrulamadan gecer.
drop policy if exists "Lead insert" on public.card_leads;
-- (Owner reads leads politikasi aynen kalir; sahibi kendi leadlerini gorur.)

-- =====================================================================
-- Not: Service-role anahtari RLS'i bypass ettigi icin /api/lead yine yazar.
-- Anon istemci artik dogrudan card_leads'e insert YAPAMAZ -> spam zorlasir.
-- =====================================================================
