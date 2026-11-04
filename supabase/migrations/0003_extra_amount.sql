-- Phase 3: optional extra money per order (e.g. Grab tips/incentives on top of the fare).
-- Extra is NOT subject to commission and is added to net_amount.

alter table public.orders
  add column extra_amount numeric(10, 2) not null default 0
    check (extra_amount >= 0 and extra_amount < 100000);

-- Generated columns can't be altered in place: drop and re-create net_amount
-- (values are recomputed automatically for existing rows).
alter table public.orders drop column net_amount;
alter table public.orders
  add column net_amount numeric(10, 2)
    generated always as (gross_amount - round(gross_amount * commission_rate, 2) + extra_amount) stored;
