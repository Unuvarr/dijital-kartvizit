-- GERÇEK RANDEVU SİSTEMİ
-- Supabase > SQL Editor (DOĞRU proje: smyaxlrqghiwpsuxowzk) çalıştır.

-- 1) Randevu talepleri tablosu
create table if not exists appointments (
  id bigint generated always as identity primary key,
  card_id uuid not null references digital_cards(id) on delete cascade,
  date date not null,
  visitor_name text not null,
  visitor_phone text,
  note text,
  status text not null default 'beklemede',   -- beklemede | onaylandı | iptal
  created_at timestamptz not null default now()
);

create index if not exists appointments_card_idx on appointments(card_id);

alter table appointments enable row level security;

-- Sahip kendi kartının randevularını görür / günceller / siler
drop policy if exists "owner reads appointments" on appointments;
create policy "owner reads appointments" on appointments for select
  using (exists (select 1 from digital_cards d
    where d.id = appointments.card_id and d.owner_id = auth.uid()));

drop policy if exists "owner updates appointments" on appointments;
create policy "owner updates appointments" on appointments for update
  using (exists (select 1 from digital_cards d
    where d.id = appointments.card_id and d.owner_id = auth.uid()));

drop policy if exists "owner deletes appointments" on appointments;
create policy "owner deletes appointments" on appointments for delete
  using (exists (select 1 from digital_cards d
    where d.id = appointments.card_id and d.owner_id = auth.uid()));

-- Not: INSERT yalnızca service-role (API) ile yapılır; anon insert politikası YOK
-- (doğrudan spam engellenir, /api/appointment üzerinden akar).

-- 2) Müsaitlik: hangi hafta günleri açık (0=Pazar .. 6=Cumartesi). Boş dizi = tüm günler.
alter table digital_cards
  add column if not exists appointment_days smallint[] not null default '{}';
