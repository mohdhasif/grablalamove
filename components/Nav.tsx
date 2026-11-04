import { signOut } from "@/app/login/actions";
import { PendingLink } from "./PendingLink";
import { SignOutButton } from "./SignOutButton";

export function Nav() {
  return (
    <header className="flex items-center justify-between">
      <PendingLink href="/" className="text-lg font-bold">GrabLalaMove</PendingLink>
      <nav className="flex items-center gap-4 text-sm">
        <PendingLink href="/history" className="text-zinc-600 dark:text-zinc-300">History</PendingLink>
        <form action={signOut}>
          <SignOutButton />
        </form>
      </nav>
    </header>
  );
}
