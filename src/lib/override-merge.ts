/** Deep-merge override patches onto item records (objects merge; arrays replace). */
export function deepMergeOverrideFields<T extends object>(
  base: T,
  patch: Record<string, unknown>,
): T {
  const result = { ...(base as Record<string, unknown>) };

  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;

    const existing = result[key];

    if (isPlainObject(value) && isPlainObject(existing)) {
      result[key] = deepMergeOverrideFields(
        existing as Record<string, unknown>,
        value as Record<string, unknown>,
      );
      continue;
    }

    result[key] = value;
  }

  return result as T;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Build a nested patch from dotted paths, e.g. { "stats.damage": 100 } → { stats: { damage: 100 } }. */
export function buildNestedPatch(flat: Record<string, unknown>): Record<string, unknown> {
  const root: Record<string, unknown> = {};

  for (const [path, value] of Object.entries(flat)) {
    if (!path.includes(".")) {
      if (isPlainObject(value) && isPlainObject(root[path])) {
        root[path] = deepMergeOverrideFields(
          root[path] as Record<string, unknown>,
          value as Record<string, unknown>,
        );
      } else {
        root[path] = value;
      }
      continue;
    }

    const parts = path.split(".");
    let cursor = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const next = cursor[part];
      if (!isPlainObject(next)) cursor[part] = {};
      cursor = cursor[part] as Record<string, unknown>;
    }
    cursor[parts[parts.length - 1]] = value;
  }

  return root;
}

/** Flatten nested record fields for editor display (one level: stats.foo, statBonuses.bar). */
export function flattenRecordFields(
  prefix: string,
  record: Record<string, unknown> | undefined,
): { key: string; path: string; value: unknown }[] {
  if (!record) return [];
  return Object.entries(record).map(([k, v]) => ({
    key: k,
    path: `${prefix}.${k}`,
    value: v,
  }));
}
