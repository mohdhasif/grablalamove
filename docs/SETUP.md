# Panduan Setup: Supabase + Vercel

Anggaran masa: 15 minit. Semua percuma (Supabase Free + Vercel Hobby).

---

## Bahagian A: Supabase (database + login)

### A1. Buat projek
1. Pergi ke https://supabase.com, log masuk guna GitHub.
2. Klik **New project**.
   - **Name**: `grablalamove`
   - **Database Password**: tekan *Generate* dan **simpan** di tempat selamat
   - **Region**: **Southeast Asia (Singapore)**, paling dekat dengan Malaysia, jadi app laju
3. Klik **Create new project** dan tunggu ± 2 minit.

### A2. Buat jadual (run migration)
1. Menu kiri: **SQL Editor**, kemudian **New query**.
2. Buka fail [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql) dalam GitHub, salin semua, paste, tekan **Run**.
   Kena nampak `Success. No rows returned`.
3. Ulang dengan [`supabase/migrations/0002_distance_expenses.sql`](../supabase/migrations/0002_distance_expenses.sql).
   > ⚠️ Mesti ikut turutan: 0001 dulu, baru 0002. Setiap fail run **sekali** sahaja.
4. Semak: menu **Table Editor** kena ada jadual `orders` dan `expenses`, dua-dua bertanda 🔒 RLS enabled.

### A3. Setting login
1. **Authentication → Sign In / Providers → Email**:
   - Pastikan **Enable Email provider** ON.
   - Untuk guna sendiri, OFF **Confirm email** supaya terus boleh login lepas daftar. Kalau ON, kena klik link dalam email dulu.
2. Jangan tutup tab ni. Lepas deploy Vercel, kita akan datang balik ke sini.

### A4. Ambil API key
**Project Settings (ikon gear) → API Keys**. Salin dua benda:
- **Project URL**: `https://xxxx.supabase.co` (ada juga di *Project Settings → Data API*)
- **Publishable key**: `sb_publishable_...` (atau *anon public key* kalau projek lama)

> ❌ **JANGAN** guna `secret` / `service_role` key. Itu bypass semua security. App ni tak perlukannya.

---

## Bahagian B: Vercel (hosting)

### B1. Import repo
1. Pergi ke https://vercel.com, **Sign up / Log in with GitHub**.
2. **Add New… → Project**, pilih repo `mohdhasif/grablalamove`, klik **Import**.
   (Kalau repo tak muncul: *Adjust GitHub App Permissions* dan beri akses ke repo ni.)
3. Framework Preset akan auto-detect **Next.js**. Biarkan setting build default.

### B2. Masukkan Environment Variables
Dalam bahagian **Environment Variables**, tambah:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL dari A4 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key dari A4 |

Klik **Deploy** dan tunggu ± 1 minit. Anda akan dapat URL macam `https://grablalamove.vercel.app`.

> Alternatif: Vercel → **Storage / Marketplace → Supabase** boleh link projek dan set env secara automatik
> (ia set `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan app ni sokong nama tu juga).

### B3. Production branch
Vercel guna branch `main` sebagai production. Setiap kali ada perubahan merge ke `main`, Vercel auto-deploy.
Branch lain dapat *Preview URL* sendiri, jadi boleh test dulu sebelum masuk production.

---

## Bahagian C: Sambung Supabase dengan URL Vercel

1. Supabase → **Authentication → URL Configuration**:
   - **Site URL**: `https://grablalamove.vercel.app` (URL Vercel anda)
   - **Redirect URLs**: tambah `https://grablalamove.vercel.app/**`
     (dan `http://localhost:3000/**` kalau nak run di komputer)
2. **Save**.

Tanpa langkah ni, link pengesahan email akan pergi ke `localhost` dan gagal.

---

## Bahagian D: Daftar & kunci akaun

1. Buka URL Vercel di telefon, masukkan email + kata laluan (min 8 aksara), tekan **Daftar akaun baru**.
2. Lepas berjaya login, pergi ke Supabase → **Authentication → Sign In / Providers**
   dan **OFF "Allow new users to sign up"**.
   Sekarang hanya anda boleh guna app ni, walaupun orang lain tahu URL-nya.
3. Di telefon:
   - **iPhone (Safari)**: Share, kemudian **Add to Home Screen**
   - **Android (Chrome)**: menu ⋮, kemudian **Add to Home screen / Install app**

---

## Bahagian E (pilihan): Run di komputer

```bash
git clone https://github.com/mohdhasif/grablalamove.git
cd grablalamove
cp .env.example .env.local   # isi URL & key dari A4
npm install
npm run dev                  # buka http://localhost:3000
```

---

## Masalah biasa

| Simptom | Punca / penyelesaian |
|---|---|
| Halaman putih / error `Invalid URL` | Env var salah atau tiada di Vercel. Semak B2, kemudian **Redeploy**. |
| `relation "orders" does not exist` | Migration belum run (A2). |
| `column orders.distance_km does not exist` | Migration `0002` belum run. |
| `Email not confirmed` | OFF *Confirm email* (A3), atau klik link dalam email. |
| Link email pergi ke localhost | Site URL belum ditukar (C1). |
| `new row violates row-level security policy` | Anda tak login / sesi tamat. Log keluar dan masuk semula. |
| Tukar env var tapi tiada kesan | Env `NEXT_PUBLIC_*` dibaca masa build, jadi kena **Redeploy** di Vercel. |

## Backup
Free plan Supabase **tiada backup automatik yang boleh dipulihkan sendiri**. Sekali sebulan:
**Table Editor → orders / expenses → Export → CSV**. Atau upgrade ke Pro bila data dah penting.
