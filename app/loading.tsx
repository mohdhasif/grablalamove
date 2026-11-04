import { LoadingOverlay } from "@/components/LoadingOverlay";

// Shown by Next.js while a page is rendering on the server.
export default function Loading() {
  return <LoadingOverlay show label="Loading…" />;
}
