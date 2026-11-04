# GrabLalaMove

Log your earnings for every **Grab** and **Lalamove** order (MYR).
Next.js 16 (Vercel) + Supabase (Postgres + Auth). Mobile-first — supports "Add to Home Screen".

## Features

- Pick a platform → enter the amount → see **Amount / Commission / Net** live
  - **Grab**: net = the amount you enter
  - **Lalamove**: net = amount − **21%**
- **Accept** / **Reject** buttons — both are recorded (rejects don't count toward earnings, but do count toward *accept rate*)
- Optional **distance (km)** gives you **RM/km**, so you can see whether an order is worth it before tapping Accept/Reject
- Log **expenses** (fuel, toll, parking, service, other) — the summary shows **profit = net earnings − expenses**
- Today's summary (profit, per platform, RM/km, accept rate, Lalamove commission)
- **History** page: filter by Today / This week / This month / All time and by platform; delete wrong entries

## Setup

📘 Step-by-step guide: **[docs/SETUP.md](docs/SETUP.md)** (Supabase + Vercel, ~15 minutes).

In short: create a Supabase project (Singapore), run `supabase/migrations/0001_init.sql` then `0002_distance_expenses.sql`,
import this repo into Vercel with `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
set the Site URL in Supabase, sign up, then disable sign-ups.

## Design decisions

| Decision | Why |
|---|---|
| Commission rate stored **per order** (`commission_rate`) | If Lalamove changes its rate (e.g. 21% → 20%), past records stay accurate. Change the new rate in `lib/money.ts` only. |
| `net_amount` is a **generated column** in Postgres | Single source of truth; reports and SQL use the same value. |
| Money math in **sen (integers)** in the UI | Avoids float errors (0.1 + 0.2). Same logic as the DB, covered by unit tests (`npm test`). |
| Rate decided in the **server action**, not the client | The client can't tamper with the rate. |
| **Row Level Security** | Even though the Supabase key is public, each user can only access their own rows. |
| Rejects are recorded too | Accept rate and "money left on the table" show which times/platforms are worth it. |
| **Asia/Kuala_Lumpur** time zone | "Today" follows Malaysian time, not UTC. |
| Friendly `/setup` page | Missing or malformed Supabase env vars show what's wrong instead of a blank 500. |

## Next phase ideas

- **RM/hour**: Start/End shift buttons to measure real hourly earnings
- **Minimum RM/km target**: automatic red/green colour while keying in
- **Tips & incentives/bonuses** as a separate record type
- **Daily target** (progress bar) & weekly charts
- **CSV export** for tax filing / bookkeeping
- Editable commission rates from the UI (`platform_rates` table with `effective_from`)
- Offline mode (PWA + queue) for areas with weak signal
