-- =====================================================================
-- KURTARMA DUZELTMESI: E-posta ile sahipligi cihaza geri baglama
-- Supabase panelinde: SQL Editor > New query alanina yapistir ve Run de.
-- Tek seferlik calistirilir.
--
-- Sorun: Eski kayitlarda cihazin anonim oturumu kayboldugu icin owner_id
-- eslesmiyor ve sahibe "Duzenle" cikmiyor. Bu politika, e-postasini magic
-- link ile dogrulayan kisinin (owner_email == dogrulanmis e-posta) karti
-- kendi guncel oturumuna (owner_id = auth.uid()) yeniden baglamasina izin
-- verir. Sadece o e-postayi kontrol eden kisi yapabilir -> guvenli.
-- =====================================================================

drop policy if exists "E-posta ile sahiplen" on public.digital_cards;

create policy "E-posta ile sahiplen"
  on public.digital_cards
  for update
  using (
    owner_email is not null
    and auth.jwt() ->> 'email' is not null
    and lower(owner_email) = lower(auth.jwt() ->> 'email')
  )
  with check (
    owner_id = auth.uid()
  );
