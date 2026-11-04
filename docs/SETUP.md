# Setup Guide: Supabase + Vercel

Estimated time: 15 minutes. Everything is free (Supabase Free + Vercel Hobby).

---

## Part A: Supabase (database + login)

### A1. Create a project
1. Go to https://supabase.com and sign in with GitHub.
2. Click **New project**.
   - **Name**: `grablalamove`
   - **Database Password**: click *Generate* and **save it** somewhere safe
   - **Region**: **Southeast Asia (Singapore)**, closest to Malaysia, so the app is fast
3. Click **Create new project** and wait ~2 minutes.

### A2. Create the tables (run migrations)
1. Left menu: **SQL Editor**, then **New query**.
2. Open [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql) on GitHub, copy everything, paste, and click **Run**.
   You should see `Success. No rows returned`.
3. Repeat with [`supabase/migrations/0002_distance_expenses.sql`](../supabase/migrations/0002_distance_expenses.sql).
   > ⚠️ Order matters: 0001 first, then 0002. Run each file **once** only.
4. Check: **Table Editor** should list `orders` and `expenses`, both marked 🔒 RLS enabled.

### A3. Login settings
1. **Authentication → Sign In / Providers → Email**:
   - Make sure **Enable Email provider** is ON.
   - For personal use, turn OFF **Confirm email** so you can sign in right after signing up. If it's ON, you must click the link in the confirmation email first.
2. Keep this tab open. You'll come back here after deploying to Vercel.

### A4. Get the API keys
**Project Settings (gear icon) → API Keys**. Copy two things:
- **Project URL**: `https://xxxx.supabase.co` (also under *Project Settings → Data API*)
- **Publishable key**: `sb_publishable_...` (or the *anon public key* on older projects)

> ❌ **DO NOT** use the `secret` / `service_role` key. It bypasses all security, and this app doesn't need it.

---

## Part B: Vercel (hosting)

### B1. Import the repo
1. Go to https://vercel.com and **Sign up / Log in with GitHub**.
2. **Add New… → Project**, choose `mohdhasif/grablalamove`, click **Import**.
   (If the repo doesn't show up: *Adjust GitHub App Permissions* and grant access to this repo.)
3. Framework Preset is auto-detected as **Next.js**. Leave the build settings as default.

### B2. Add Environment Variables
Under **Environment Variables**, add:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL from A4 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key from A4 |

Make sure **Production** is ticked. Click **Deploy** and wait ~1 minute. You'll get a URL like `https://grablalamove.vercel.app`.

> Alternative: Vercel → **Storage / Marketplace → Supabase** can link the project and set env vars automatically
> (it sets `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_URL`, which this app also supports).

### B3. Production branch
Vercel uses `main` as production. Every merge into `main` auto-deploys.
To change it: **Settings → Environments → Production → Branch Tracking** (older UI: **Settings → Git → Production Branch**).
Other branches get their own *Preview URL*, so you can test before going to production.

---

## Part C: Connect Supabase to your Vercel URL

1. Supabase → **Authentication → URL Configuration**:
   - **Site URL**: `https://grablalamove.vercel.app` (your Vercel URL)
   - **Redirect URLs**: add `https://grablalamove.vercel.app/**`
     (and `http://localhost:3000/**` if you run it locally)
2. **Save**.

Without this step, email confirmation links go to `localhost` and fail.

---

## Part D: Sign up & lock down

1. Open the Vercel URL on your phone, enter email + password (min 8 characters), and tap **Create new account**.
2. Once signed in, go to Supabase → **Authentication → Sign In / Providers**
   and turn **OFF "Allow new users to sign up"**.
   Now only you can use the app, even if someone else knows the URL.
3. On your phone:
   - **iPhone (Safari)**: Share, then **Add to Home Screen**
   - **Android (Chrome)**: menu ⋮, then **Add to Home screen / Install app**

---

## Part E (optional): Run locally

```bash
git clone https://github.com/mohdhasif/grablalamove.git
cd grablalamove
cp .env.example .env.local   # fill in the URL & key from A4
npm install
npm run dev                  # open http://localhost:3000
```

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| "Setup incomplete" page | Env vars missing/wrong in Vercel. The page lists what's wrong. Fix it in B2, then **Redeploy**. |
| `relation "orders" does not exist` | Migrations haven't been run (A2). |
| `column orders.distance_km does not exist` | Migration `0002` hasn't been run. |
| `Email not confirmed` | Turn OFF *Confirm email* (A3) and either click the email link, or run in SQL Editor: `update auth.users set email_confirmed_at = now() where email = 'you@example.com';` |
| Email link goes to localhost | Site URL not updated (C1). |
| `new row violates row-level security policy` | You're not signed in / session expired. Sign out and back in. |
| Changed env vars but nothing happened | **Redeploy** in Vercel so the new values are picked up. |

## Backups
Supabase Free plan **has no self-service restorable backups**. Once a month:
**Table Editor → orders / expenses → Export → CSV**. Or upgrade to Pro once the data matters.
