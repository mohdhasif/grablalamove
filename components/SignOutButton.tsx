"use client";

import { useFormStatus } from "react-dom";
import { LoadingOverlay } from "./LoadingOverlay";

export function SignOutButton() {
  const { pending } = useFormStatus();
  return (
    <>
      <button disabled={pending} className="text-zinc-400">Sign out</button>
      <LoadingOverlay show={pending} label="Signing out…" />
    </>
  );
}
