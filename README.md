# GrabLalaMove

Sistem key-in pendapatan setiap order **Grab** dan **Lalamove** (RM).
Next.js 16 (Vercel) + Supabase (Postgres + Auth). Mobile-first — boleh "Add to Home Screen".

## Fungsi

- Pilih platform → key in amaun → nampak **Jumlah / Potongan / Bersih** secara live
  - **Grab**: bersih = amaun yang di-key in
  - **Lalamove**: bersih = amaun − **21%**
- Butang **Accept** / **Reject** — dua-dua direkod (reject tak dikira dalam pendapatan, tapi dikira dalam *accept rate*)
- Ringkasan hari ini (bersih, ikut platform, accept rate, jumlah potongan)
- Isi **jarak (km)** (pilihan) untuk dapat **RM/km**, jadi nampak terus sama ada order tu berbaloi sebelum tekan Accept/Reject
- Rekod **kos** (minyak, tol, parking, servis, lain-lain), dan ringkasan tunjuk **untung = pendapatan bersih − kos**
- Halaman **Sejarah**: tapis Hari ini / Minggu ini / Bulan ini / Semua, ikut platform, padam rekod salah

## Setup

📘 Panduan langkah demi langkah: **[docs/SETUP.md](docs/SETUP.md)** (Supabase + Vercel, ± 15 minit).

Ringkasnya: buat projek Supabase (Singapore), run `supabase/migrations/0001_init.sql` kemudian `0002_distance_expenses.sql`,
import repo ke Vercel dengan env `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
set Site URL di Supabase, daftar, kemudian off signup.

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

- **RM/jam**: butang Mula/Tamat shift supaya tahu pendapatan sejam sebenar
- **Sasaran RM/km minimum**: warna merah/hijau automatik masa key in
- **Tips & insentif/bonus** sebagai jenis rekod berasingan
- **Sasaran harian** (progress bar) & graf mingguan
- **Export CSV** untuk LHDN / akaun
- Kadar potongan boleh ubah dari UI (jadual `platform_rates` dengan `effective_from`)
- Mod offline (PWA + queue) untuk kawasan line lemah
