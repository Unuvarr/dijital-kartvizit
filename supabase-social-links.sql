-- =====================================================================
-- ESNEK SOSYAL BAGLANTILAR
-- Supabase > SQL Editor > New query > yapistir > Run
-- =====================================================================

-- Sinirsiz sosyal/ozel baglanti dizisi: [{ "platform": "tiktok", "value": "..." }, ...]
alter table public.digital_cards
  add column if not exists social_links jsonb not null default '[]'::jsonb;

-- (Opsiyonel) Mevcut kartlardaki eski kolonlari yeni alana bir kez tasi.
-- social_links bos olanlar icin instagram/linkedin/twitter degerlerini aktarir.
update public.digital_cards d
set social_links = (
  select coalesce(jsonb_agg(elem), '[]'::jsonb)
  from (
    select jsonb_build_object('platform','instagram','value',d.instagram) as elem
      where d.instagram is not null and d.instagram <> ''
    union all
    select jsonb_build_object('platform','linkedin','value',d.linkedin)
      where d.linkedin is not null and d.linkedin <> ''
    union all
    select jsonb_build_object('platform','x','value',d.twitter)
      where d.twitter is not null and d.twitter <> ''
  ) t
)
where (d.social_links is null or d.social_links = '[]'::jsonb)
  and (coalesce(d.instagram,'') <> '' or coalesce(d.linkedin,'') <> '' or coalesce(d.twitter,'') <> '');

-- =====================================================================
-- Not: Eski instagram/linkedin/twitter kolonlari DB'de kalir (zarari yok),
-- ama uygulama artik social_links uzerinden calisir.
-- =====================================================================
