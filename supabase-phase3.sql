-- =====================================================================
-- FAZ 3 - Analytics, Lead Capture, Tema
-- Supabase > SQL Editor > New query > yapistir > Run
-- =====================================================================

-- 1) TEMA + GORUNTULENME SAYACI
alter table public.digital_cards add column if not exists theme text default 'indigo';
alter table public.digital_cards add column if not exists view_count int not null default 0;

-- 2) GORUNTULENME TABLOSU
create table if not exists public.card_views (
  id bigserial primary key,
  card_id uuid not null references public.digital_cards(id) on delete cascade,
  slug text not null,
  viewed_at timestamptz not null default now(),
  ip_hash text,
  user_agent text,
  referrer text
);

create index if not exists idx_card_views_card_id on public.card_views(card_id);
create index if not exists idx_card_views_slug_date on public.card_views(slug, viewed_at desc);

alter table public.card_views enable row level security;

-- Insert: herkes ekleyebilir (anonim dahil)
drop policy if exists "View insert" on public.card_views;
create policy "View insert"
  on public.card_views
  for insert
  with check (true);

-- Select: sadece kart sahibi kendi kartinin gorunumlerini gorur
drop policy if exists "Owner reads views" on public.card_views;
create policy "Owner reads views"
  on public.card_views
  for select
  using (
    exists (
      select 1 from public.digital_cards d
      where d.id = card_views.card_id and d.owner_id = auth.uid()
    )
  );

-- 3) VIEW INCREMENT RPC (atomic, view_count'u guncellestirir)
create or replace function public.increment_view(p_slug text)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_card_id uuid;
  v_new_count int;
begin
  select id into v_card_id from public.digital_cards where slug = p_slug;
  if v_card_id is null then
    return null;
  end if;

  insert into public.card_views (card_id, slug)
  values (v_card_id, p_slug);

  update public.digital_cards
     set view_count = view_count + 1
   where id = v_card_id
   returning view_count into v_new_count;

  return v_new_count;
end;
$$;

grant execute on function public.increment_view(text) to anon, authenticated;

-- 4) LEAD CAPTURE
create table if not exists public.card_leads (
  id bigserial primary key,
  card_id uuid not null references public.digital_cards(id) on delete cascade,
  created_at timestamptz not null default now(),
  name text not null,
  phone text,
  email text,
  company text,
  message text
);

create index if not exists idx_card_leads_card_id on public.card_leads(card_id, created_at desc);

alter table public.card_leads enable row level security;

-- Anonim dahil herkes lead birakabilir
drop policy if exists "Lead insert" on public.card_leads;
create policy "Lead insert"
  on public.card_leads
  for insert
  with check (true);

-- Sadece kart sahibi leadlerini gorur
drop policy if exists "Owner reads leads" on public.card_leads;
create policy "Owner reads leads"
  on public.card_leads
  for select
  using (
    exists (
      select 1 from public.digital_cards d
      where d.id = card_leads.card_id and d.owner_id = auth.uid()
    )
  );

-- =====================================================================
-- TAMAM. Yeni alanlar:
--   digital_cards.theme        : 'indigo' | 'emerald' | 'rose' | 'amber' | 'slate'
--   digital_cards.view_count   : int (otomatik artiriliyor)
-- Yeni tablolar:
--   card_views                 : ham gorunum logu (owner gorur)
--   card_leads                 : ziyaretciden gelen iletisim (owner gorur)
-- Yeni RPC:
--   increment_view(slug)       : 1 view kaydeder, toplam donem sayar
-- =====================================================================
