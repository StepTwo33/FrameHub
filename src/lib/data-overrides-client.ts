import {
  DataOverride,
  getOverrides,
  setOverrideCache,
  notifyDataOverridesUpdated,
  generateOverrideId,
  OVERRIDE_CATEGORIES,
  type OverrideCategory,
} from "@/lib/data-overrides";

const LEGACY_STORAGE_KEY = "framehub_data_overrides";
const MIGRATED_FLAG_KEY = "framehub_data_overrides_migrated";

let loadPromise: Promise<DataOverride[]> | null = null;

function upsertInCache(saved: DataOverride) {
  const next = getOverrides().filter(
    (o) => !(o.targetType === saved.targetType && o.targetId === saved.targetId),
  );
  next.push(saved);
  setOverrideCache(next);
}

/** Fetch shared overrides from the API and populate the in-memory cache. */
export async function loadSharedOverrides(): Promise<DataOverride[]> {
  if (typeof window === "undefined") return [];
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const res = await fetch("/api/data-overrides", { cache: "no-store" });
      if (!res.ok) return getOverrides();
      const data = (await res.json()) as { overrides?: DataOverride[] };
      const list = Array.isArray(data.overrides) ? data.overrides : [];
      setOverrideCache(list);
      notifyDataOverridesUpdated();
      await migrateLegacyLocalOverrides(list.length === 0);
      return list;
    } catch {
      return getOverrides();
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

async function migrateLegacyLocalOverrides(serverEmpty: boolean) {
  if (!serverEmpty || localStorage.getItem(MIGRATED_FLAG_KEY)) return;
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MIGRATED_FLAG_KEY, "1");
      return;
    }
    const legacy = JSON.parse(raw) as DataOverride[];
    if (!Array.isArray(legacy) || legacy.length === 0) {
      localStorage.setItem(MIGRATED_FLAG_KEY, "1");
      return;
    }

    const session = await fetch("/api/auth/session").then((r) => r.json()).catch(() => null);
    const role = session?.user?.role;
    const isStaff = role === "admin" || role === "moderator";
    if (!isStaff) return;

    const res = await fetch("/api/data-overrides", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(legacy),
    });
    if (!res.ok) return;

    localStorage.removeItem(LEGACY_STORAGE_KEY);
    localStorage.setItem(MIGRATED_FLAG_KEY, "1");
    const refresh = await fetch("/api/data-overrides", { cache: "no-store" });
    if (refresh.ok) {
      const data = (await refresh.json()) as { overrides?: DataOverride[] };
      setOverrideCache(Array.isArray(data.overrides) ? data.overrides : []);
      notifyDataOverridesUpdated();
    }
  } catch {
    // keep legacy data until next attempt
  }
}

export async function persistOverride(override: DataOverride): Promise<DataOverride> {
  const res = await fetch("/api/data-overrides", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(override),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(typeof err.error === "string" ? err.error : "Failed to save override");
  }
  const saved = (await res.json()) as DataOverride;
  upsertInCache(saved);
  notifyDataOverridesUpdated();
  return saved;
}

export async function removeOverride(id: string): Promise<void> {
  const res = await fetch(`/api/data-overrides/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(typeof err.error === "string" ? err.error : "Failed to delete override");
  }
  setOverrideCache(getOverrides().filter((o) => o.id !== id));
  notifyDataOverridesUpdated();
}

export async function importSharedOverrides(json: string): Promise<number> {
  let incoming: unknown;
  try {
    incoming = JSON.parse(json);
  } catch {
    return 0;
  }
  const list = Array.isArray(incoming) ? incoming : [];
  const res = await fetch("/api/data-overrides", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(list),
  });
  if (!res.ok) return 0;
  const data = (await res.json()) as { imported?: number };
  await loadSharedOverrides();
  return data.imported ?? 0;
}

export function exportSharedOverrides(): string {
  return JSON.stringify(getOverrides(), null, 2);
}

export function findExistingOverrideId(
  targetType: OverrideCategory,
  targetId: string,
): string | undefined {
  return getOverrides().find(
    (o) => o.targetType === targetType && o.targetId === targetId,
  )?.id;
}

export { generateOverrideId, OVERRIDE_CATEGORIES };
