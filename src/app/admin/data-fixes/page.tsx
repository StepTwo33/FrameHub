"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { DataFixesPanel } from "@/components/data-fixes-panel";
import type { DataFixesPrefill } from "@/lib/overrides/data-fixes-url";
import { decodeReturnTo } from "@/lib/nav-return";
import { OVERRIDE_CATEGORIES, type OverrideCategory } from "@/lib/overrides/data-overrides";

function isOverrideCategory(v: string | null): v is OverrideCategory {
  return v != null && (OVERRIDE_CATEGORIES as readonly string[]).includes(v);
}

function DataFixesPageContent() {
  const searchParams = useSearchParams();

  const initialPrefill = useMemo((): DataFixesPrefill | undefined => {
    const category = searchParams.get("category") ?? searchParams.get("overrideCategory");
    const itemId = searchParams.get("id") ?? searchParams.get("overrideId");
    const action = searchParams.get("action");
    if (!category && !itemId) return undefined;
    return {
      category: isOverrideCategory(category) ? category : undefined,
      itemId: itemId ?? undefined,
      action: action === "add" || action === "remove" || action === "modify" ? action : undefined,
      existingOverrideId: searchParams.get("editId") ?? undefined,
    };
  }, [searchParams]);

  const returnTo = decodeReturnTo(searchParams.get("returnTo"));

  return (
    <PageShell>
      <main className="container mx-auto flex-1 px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <DataFixesPanel
            key={`${initialPrefill?.category ?? ""}-${initialPrefill?.itemId ?? ""}`}
            initialPrefill={initialPrefill}
            returnTo={returnTo}
          />
        </div>
      </main>
    </PageShell>
  );
}

export default function AdminDataFixesPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-sm text-muted-foreground">Loading…</div>}>
      <DataFixesPageContent />
    </Suspense>
  );
}
