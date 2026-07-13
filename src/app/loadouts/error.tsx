"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PageShell, PageMain, ContentPanel } from "@/components/page-shell";

export default function LoadoutsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Loadouts page error", error);
  }, [error]);

  return (
    <PageShell>
      <PageMain maxWidth="md">
        <ContentPanel className="p-8 text-center space-y-4">
          <h1 className="text-xl font-semibold">Couldn&apos;t load loadouts</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Something went wrong on this page. Your loadouts are still in browser storage — try again or reload.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              Reload
            </button>
            <Link href="/" className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
              Home
            </Link>
          </div>
        </ContentPanel>
      </PageMain>
    </PageShell>
  );
}
