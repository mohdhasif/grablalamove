-- Fasa 2: jarak per order (untuk RM/km) + rekod kos (minyak, tol, parking, dll)

alter table public.orders
  add column distance_km numeric(6, 1) check (distance_km > 0 and distance_km < 1000);

create type public.expense_category as enum ('fuel', 'toll', 'parking', 'maintenance', 'other');

create table public.expenses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category   public.expense_category not null,
  amount     numeric(10, 2) not null check (amount > 0 and amount < 100000),
  note       text check (char_length(note) <= 200),
  spent_at   timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index expenses_user_spent_idx on public.expenses (user_id, spent_at desc);

alter table public.expenses enable row level security;

create policy "expenses_select_own" on public.expenses
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "expenses_insert_own" on public.expenses
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "expenses_update_own" on public.expenses
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "expenses_delete_own" on public.expenses
  for delete to authenticated using ((select auth.uid()) = user_id);
