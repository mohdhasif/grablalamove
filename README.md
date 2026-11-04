# GrabLalaMove

Sistem key-in pendapatan setiap order **Grab** dan **Lalamove** (RM).
Next.js 16 (Vercel) + Supabase (Postgres + Auth). Mobile-first — boleh "Add to Home Screen".

## Fungsi

- Pilih platform → key in amaun → nampak **Jumlah / Potongan / Bersih** secara live
  - **Grab**: bersih = amaun yang di-key in
  - **Lalamove**: bersih = amaun − **21%**
- Butang **Accept** / **Reject** — dua-dua direkod (reject tak dikira dalam pendapatan, tapi dikira dalam *accept rate*)
- Ringkasan hari ini (bersih, ikut platform, accept rate, jumlah potongan)
- Halaman **Sejarah**: tapis Hari ini / Minggu ini / Bulan ini / Semua, ikut platform, padam rekod salah

## Setup (± 10 minit)

1. **Supabase** → buat projek baru (region **Singapore** paling dekat dengan MY).
2. Supabase → **SQL Editor** → paste & run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
3. Supabase → **Authentication → Sign In / Providers → Email**: untuk guna sendiri, boleh off *Confirm email*.
4. Salin `.env.example` → `.env.local`, isi dari Supabase → **Project Settings → API Keys**.
5. Jalankan:
   ```bash
   npm install
   npm run dev
   ```
6. **Vercel** → Import repo ini → tambah env var yang sama (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) → Deploy.
   (Atau guna integrasi Supabase dalam Vercel Marketplace — ia set env secara automatik.)
7. Supabase → **Authentication → URL Configuration** → set *Site URL* ke domain Vercel anda.
8. Daftar akaun anda, kemudian **off "Allow new users to sign up"** supaya orang lain tak boleh daftar.

## Keputusan reka bentuk

| Keputusan | Sebab |
|---|---|
| Kadar potongan disimpan **per order** (`commission_rate`) | Kalau Lalamove tukar kadar (cth 21% → 20%), sejarah lama kekal tepat. Tukar kadar baru di `lib/money.ts` sahaja. |
| `net_amount` = **generated column** dalam Postgres | Satu sumber kebenaran; laporan/SQL terus guna nilai sama. |
| Kiraan dalam **sen (integer)** di UI | Elak ralat float (0.1 + 0.2). Logik sama dengan DB, ada unit test (`npm test`). |
| Kadar ditentukan di **server action**, bukan client | Client tak boleh manipulasi kadar. |
| **Row Level Security** | Walaupun key Supabase awam, setiap user hanya boleh akses rekod sendiri. |
| Reject turut direkod | Data accept rate & "duit terlepas" berguna untuk tahu waktu/platform mana berbaloi. |
| Zon masa **Asia/Kuala_Lumpur** | "Hari ini" ikut jam Malaysia, bukan UTC. |

## Cadangan fasa seterusnya

- **Kos minyak / tol / parking** → kira untung sebenar (bukan sekadar pendapatan)
- **Jarak (km)** per order → metrik **RM/km** & **RM/jam** — cara paling tepat nak tahu order mana patut accept
- **Tips & insentif/bonus** sebagai jenis rekod berasingan
- **Sasaran harian** (progress bar) & graf mingguan
- **Export CSV** untuk LHDN / akaun
- Kadar potongan boleh ubah dari UI (jadual `platform_rates` dengan `effective_from`)
- Mod offline (PWA + queue) untuk kawasan line lemah
