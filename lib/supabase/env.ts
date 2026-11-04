// Semua akses Supabase berlaku di server (proxy + server actions + server components),
// jadi env tanpa NEXT_PUBLIC_ juga boleh dibaca masa runtime.

export type SupabaseEnv = { ok: true; url: string; key: string } | { ok: false; problems: string[] };

const first = (...vals: (string | undefined)[]) => vals.map((v) => v?.trim()).find((v) => v);

export function getSupabaseEnv(): SupabaseEnv {
  const rawUrl = first(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_URL);
  const key = first(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    process.env.SUPABASE_ANON_KEY,
  );
  const problems: string[] = [];

  let url: string | undefined;
  if (!rawUrl) {
    problems.push("NEXT_PUBLIC_SUPABASE_URL tiada.");
  } else {
    // Buang tanda petik, "/rest/v1" dan "/" di hujung yang selalu ter-paste.
    url = rawUrl.replace(/^["']|["']$/g, "").replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
    if (!/^https?:\/\/[^/\s]+$/.test(url)) {
      problems.push(`NEXT_PUBLIC_SUPABASE_URL tidak sah. Patut macam https://xxxx.supabase.co (sekarang bermula "${url.slice(0, 12)}…").`);
    }
  }

  if (!key) {
    problems.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (atau NEXT_PUBLIC_SUPABASE_ANON_KEY) tiada.");
  } else if (key.startsWith("sb_secret_")) {
    problems.push("Anda letak SECRET key. Guna Publishable key (sb_publishable_…) sahaja.");
  }

  return problems.length || !url || !key ? { ok: false, problems } : { ok: true, url, key: key.replace(/^["']|["']$/g, "") };
}

export function requireSupabaseEnv() {
  const env = getSupabaseEnv();
  if (!env.ok) throw new Error(`Konfigurasi Supabase salah: ${env.problems.join(" ")}`);
  return env;
}
