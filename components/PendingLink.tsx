"use client";

import Link, { useLinkStatus } from "next/link";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { LoadingOverlay } from "./LoadingOverlay";

function PendingOverlay({ label }: { label: string }) {
  const { pending } = useLinkStatus();
  // Portal keeps the overlay out of the <a> element in the DOM.
  return pending ? createPortal(<LoadingOverlay show label={label} />, document.body) : null;
}

/** <Link> that shows the loading popup while the next page is loading. */
export function PendingLink({ href, className, children, label = "Loading…" }: {
  href: string;
  className?: string;
  children: ReactNode;
  label?: string;
}) {
  return (
    <Link href={href} className={className}>
      {children}
      <PendingOverlay label={label} />
    </Link>
  );
}
