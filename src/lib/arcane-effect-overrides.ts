import { ARCANE_EFFECTS, ArcaneEffectDef } from "@/data/arcane-effects";
import { getOverrides } from "@/lib/data-overrides";
import { deepMergeOverrideFields } from "@/lib/override-merge";

/** Merge shared data overrides onto static ARCANE_EFFECTS. */
export function applyArcaneEffectOverrides(
  base: Record<string, ArcaneEffectDef> = ARCANE_EFFECTS,
): Record<string, ArcaneEffectDef> {
  const overrides = getOverrides().filter((o) => o.targetType === "arcane_effect");
  if (overrides.length === 0) return base;

  const result = { ...base };

  for (const ovr of overrides) {
    if (ovr.action === "remove") {
      delete result[ovr.targetId];
      continue;
    }
    const existing = result[ovr.targetId];
    if (ovr.action === "add") {
      result[ovr.targetId] = ovr.fields as unknown as ArcaneEffectDef;
    } else if (ovr.action === "modify" && existing) {
      result[ovr.targetId] = deepMergeOverrideFields(existing, ovr.fields as Partial<ArcaneEffectDef>);
    } else if (ovr.action === "modify" && !existing) {
      result[ovr.targetId] = ovr.fields as unknown as ArcaneEffectDef;
    }
  }

  return result;
}

export function getArcaneEffectDef(
  arcaneId: string,
  effects?: Record<string, ArcaneEffectDef>,
): ArcaneEffectDef | undefined {
  const map = effects ?? applyArcaneEffectOverrides();
  return map[arcaneId];
}
