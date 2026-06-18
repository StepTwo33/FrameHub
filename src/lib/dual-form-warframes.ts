import type { ModSlot } from "@/lib/types";
import type { WarframeBuildData } from "@/lib/build-storage";

export interface DualFormDef {
  id: string;
  label: string;
  /** Signature melee weapon id when this form is active (e.g. Pride / Wrath). */
  signatureMeleeId?: string;
}

export interface DualFormWarframeConfig {
  /** Stored in `mods` / `slotPolarities` on save. */
  defaultFormId: string;
  forms: DualFormDef[];
}

/** Warframes that occupy one slot but have independent mod configurations per form. */
export const DUAL_FORM_WARFRAMES: Record<string, DualFormWarframeConfig> = {
  sirius_orion: {
    defaultFormId: "sirius",
    forms: [
      { id: "sirius", label: "Sirius", signatureMeleeId: "pride" },
      { id: "orion", label: "Orion", signatureMeleeId: "wrath" },
    ],
  },
};

export function getDualFormConfig(warframeId: string): DualFormWarframeConfig | null {
  return DUAL_FORM_WARFRAMES[warframeId] ?? null;
}

export function isDualFormWarframe(warframeId: string): boolean {
  return warframeId in DUAL_FORM_WARFRAMES;
}

export interface DualFormBuildSlice {
  mods: ModSlot[];
  slotPolarities: Record<number, string>;
}

export function emptyDualFormBuilds(warframeId: string): Record<string, DualFormBuildSlice> | undefined {
  const config = getDualFormConfig(warframeId);
  if (!config) return undefined;
  const builds: Record<string, DualFormBuildSlice> = {};
  for (const form of config.forms) {
    if (form.id === config.defaultFormId) continue;
    builds[form.id] = { mods: [], slotPolarities: {} };
  }
  return builds;
}

/** Reconstruct all form mod slices from persisted build data. */
export function dualFormStatesFromBuild(d: WarframeBuildData): Record<string, DualFormBuildSlice> | null {
  const config = getDualFormConfig(d.warframeId);
  if (!config) return null;
  const states: Record<string, DualFormBuildSlice> = {};
  for (const form of config.forms) {
    if (form.id === config.defaultFormId) {
      states[form.id] = {
        mods: d.mods ?? [],
        slotPolarities: d.slotPolarities ?? {},
      };
    } else {
      const slice = d.dualFormBuilds?.[form.id];
      states[form.id] = {
        mods: slice?.mods ?? [],
        slotPolarities: slice?.slotPolarities ?? {},
      };
    }
  }
  return states;
}

/** Merge live form states into WarframeBuildData fields (default form → top-level, others → dualFormBuilds). */
export function serializeDualFormBuilds(
  warframeId: string,
  formStates: Record<string, DualFormBuildSlice>,
): Pick<WarframeBuildData, "mods" | "slotPolarities" | "dualFormBuilds"> {
  const config = getDualFormConfig(warframeId);
  if (!config) {
    const only = formStates.sirius ?? Object.values(formStates)[0] ?? { mods: [], slotPolarities: {} };
    return { mods: only.mods, slotPolarities: only.slotPolarities };
  }
  const defaultState = formStates[config.defaultFormId] ?? { mods: [], slotPolarities: {} };
  const dualFormBuilds: Record<string, DualFormBuildSlice> = {};
  for (const form of config.forms) {
    if (form.id === config.defaultFormId) continue;
    const slice = formStates[form.id] ?? { mods: [], slotPolarities: {} };
    dualFormBuilds[form.id] = {
      mods: slice.mods,
      slotPolarities: slice.slotPolarities,
    };
  }
  return {
    mods: defaultState.mods,
    slotPolarities: defaultState.slotPolarities,
    dualFormBuilds,
  };
}

/** All warframe mod slots across every form (for set-bonus linkage). */
export function allDualFormMods(build: NonNullable<WarframeBuildData>): ModSlot[] {
  const config = getDualFormConfig(build.warframeId);
  if (!config) return build.mods ?? [];
  const extra = Object.values(build.dualFormBuilds ?? {}).flatMap((s) => s.mods ?? []);
  return [...(build.mods ?? []), ...extra];
}

export function dualFormModCountSummary(build: NonNullable<WarframeBuildData>): string {
  const config = getDualFormConfig(build.warframeId);
  if (!config) {
    const n = build.mods?.length ?? 0;
    return `${n} mod${n === 1 ? "" : "s"} filled`;
  }
  const parts = config.forms.map((form) => {
    const n =
      form.id === config.defaultFormId
        ? (build.mods?.length ?? 0)
        : (build.dualFormBuilds?.[form.id]?.mods?.length ?? 0);
    return `${form.label} ${n}`;
  });
  return parts.join(" · ");
}
