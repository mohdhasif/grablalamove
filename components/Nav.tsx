import Link from "next/link";
import { signOut } from "@/app/login/actions";

export function Nav() {
  return (
    <header className="flex items-center justify-between">
      <Link href="/" className="text-lg font-bold">GrabLalaMove</Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/history" className="text-zinc-600 dark:text-zinc-300">History</Link>
        <form action={signOut}>
          <button className="text-zinc-400">Sign out</button>
        </form>
      </nav>
    </header>
  );
}
