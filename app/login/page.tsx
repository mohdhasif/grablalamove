import { AuthButtons } from "@/components/AuthButtons";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">GrabLalaMove</h1>
        <p className="text-sm text-zinc-500">Track your earnings for every order.</p>
      </div>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
      <form className="flex flex-col gap-3">
        <input name="email" type="email" required placeholder="Email" autoComplete="email"
          className="rounded-xl border border-zinc-300 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900" />
        <input name="password" type="password" required minLength={8} placeholder="Password"
          autoComplete="current-password"
          className="rounded-xl border border-zinc-300 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900" />
        <AuthButtons />
      </form>
    </main>
  );
}
