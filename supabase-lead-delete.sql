-- Kart sahibinin, kendi kartına bırakılan lead'leri silebilmesi için RLS izni.
-- Supabase > SQL Editor'de (DOĞRU proje: smyaxlrqghiwpsuxowzk) çalıştır.

alter table card_leads enable row level security;

drop policy if exists "owner deletes own card leads" on card_leads;

create policy "owner deletes own card leads"
on card_leads
for delete
using (
  exists (
    select 1 from digital_cards d
    where d.id = card_leads.card_id
      and d.owner_id = auth.uid()
  )
);

-- Not: Okutulma sayacını sıfırlama (view_count = 0) digital_cards UPDATE
-- iznini kullanır; düzenleme zaten bu izinle çalıştığı için ek politika gerekmez.
