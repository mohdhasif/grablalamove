-- GrabLalaMove: earnings log for Grab & Lalamove orders
-- Run in Supabase > SQL Editor (or `supabase db push`).

create type public.platform as enum ('grab', 'lalamove');
create type public.order_status as enum ('accepted', 'rejected');

create table public.orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users (id) on delete cascade,
  platform         public.platform not null,
  -- Gross amount shown by the platform app (RM)
  gross_amount     numeric(10, 2) not null check (gross_amount > 0 and gross_amount < 100000),
  -- Commission rate is STORED per order (e.g. 0.2100 = 21%) so history
  -- stays correct even if the platform's rate changes in the future.
  commission_rate  numeric(5, 4) not null default 0 check (commission_rate >= 0 and commission_rate < 1),
  commission_amount numeric(10, 2) generated always as (round(gross_amount * commission_rate, 2)) stored,
  net_amount       numeric(10, 2) generated always as (gross_amount - round(gross_amount * commission_rate, 2)) stored,
  status           public.order_status not null,
  note             text check (char_length(note) <= 200),
  created_at       timestamptz not null default now()
);

create index orders_user_created_idx on public.orders (user_id, created_at desc);

-- Row Level Security: each user can only see & modify their own rows.
alter table public.orders enable row level security;

create policy "orders_select_own" on public.orders
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "orders_insert_own" on public.orders
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "orders_update_own" on public.orders
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "orders_delete_own" on public.orders
  for delete to authenticated using ((select auth.uid()) = user_id);
