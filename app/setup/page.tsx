import { connection } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

export default async function SetupPage() {
  await connection(); // baca env masa runtime, bukan masa build
  const env = getSupabaseEnv();
  const problems = env.ok ? [] : env.problems;
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">⚙️ Setup belum lengkap</h1>
      <p className="text-zinc-600 dark:text-zinc-400">App tak dapat sambung ke Supabase sebab:</p>
      <ul className="list-disc space-y-1 rounded-xl bg-red-50 p-4 pl-8 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
        {problems.map((p) => <li key={p}>{p}</li>)}
      </ul>
      <ol className="list-decimal space-y-2 pl-5 text-sm">
        <li>Supabase → <b>Project Settings → API Keys</b>: salin <b>Project URL</b> dan <b>Publishable key</b>.</li>
        <li>Vercel → projek → <b>Settings → Environment Variables</b>: tambah
          <code className="mx-1 rounded bg-zinc-200 px-1 dark:bg-zinc-800">NEXT_PUBLIC_SUPABASE_URL</code> dan
          <code className="mx-1 rounded bg-zinc-200 px-1 dark:bg-zinc-800">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>.
          Pastikan tick <b>Production</b>.</li>
        <li>Vercel → <b>Deployments</b> → deployment terkini → <b>⋯ → Redeploy</b>.</li>
      </ol>
    </main>
  );
}
