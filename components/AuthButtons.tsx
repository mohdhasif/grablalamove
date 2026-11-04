"use client";

import { useFormStatus } from "react-dom";
import { signIn, signUp } from "@/app/login/actions";
import { LoadingOverlay } from "./LoadingOverlay";

export function AuthButtons() {
  const { pending, action } = useFormStatus();
  return (
    <>
      <button formAction={signIn} disabled={pending}
        className="rounded-xl bg-zinc-900 py-3 font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-zinc-900">
        Sign in
      </button>
      <button formAction={signUp} disabled={pending}
        className="rounded-xl border border-zinc-300 py-3 font-semibold disabled:opacity-60 dark:border-zinc-700">
        Create new account
      </button>
      <LoadingOverlay show={pending} label={action === signUp ? "Creating account…" : "Signing in…"} />
    </>
  );
}
