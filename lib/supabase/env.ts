// All Supabase access happens on the server (proxy + server actions + server components),
// so env vars without the NEXT_PUBLIC_ prefix can also be read at runtime.

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
    problems.push("NEXT_PUBLIC_SUPABASE_URL is missing.");
  } else {
    // Strip quotes, a trailing "/rest/v1" and trailing "/" that often get pasted in.
    url = rawUrl.replace(/^["']|["']$/g, "").replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
    if (!/^https?:\/\/[^/\s]+$/.test(url)) {
      problems.push(`NEXT_PUBLIC_SUPABASE_URL is invalid. It should look like https://xxxx.supabase.co (currently starts with "${url.slice(0, 12)}…").`);
    }
  }

  if (!key) {
    problems.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) is missing.");
  } else if (key.startsWith("sb_secret_")) {
    problems.push("You set a SECRET key. Use the Publishable key (sb_publishable_…) only.");
  }

  return problems.length || !url || !key ? { ok: false, problems } : { ok: true, url, key: key.replace(/^["']|["']$/g, "") };
}

export function requireSupabaseEnv() {
  const env = getSupabaseEnv();
  if (!env.ok) throw new Error(`Invalid Supabase configuration: ${env.problems.join(" ")}`);
  return env;
}
