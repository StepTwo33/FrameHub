import type { OverrideCategory } from "@/lib/data-overrides";

export type DataFixesPrefill = {
  existingOverrideId?: string;
  category?: OverrideCategory;
  itemId?: string;
  note?: string;
  action?: "modify" | "add" | "remove";
  fields?: Record<string, unknown>;
};

export function dataFixesHref(prefill?: Partial<DataFixesPrefill> & { returnTo?: string }): string {
  const params = new URLSearchParams();
  if (prefill?.category) params.set("category", prefill.category);
  if (prefill?.itemId) params.set("id", prefill.itemId);
  if (prefill?.action) params.set("action", prefill.action);
  if (prefill?.existingOverrideId) params.set("overrideId", prefill.existingOverrideId);
  if (prefill?.returnTo) params.set("returnTo", prefill.returnTo);
  const q = params.toString();
  return q ? `/admin/data-fixes?${q}` : "/admin/data-fixes";
}

/** Legacy codex/report-issue deep links still supported on report-issue. */
export function legacyOverrideHref(category: string, id: string, returnTo?: string): string {
  const params = new URLSearchParams({
    tab: "overrides",
    overrideCategory: category,
    overrideId: id,
  });
  if (returnTo) params.set("returnTo", returnTo);
  return `/report-issue?${params.toString()}`;
}
