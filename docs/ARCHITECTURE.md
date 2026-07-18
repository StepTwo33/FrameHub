# FrameHub architecture (for maintainers)

Short map of where things live. Prefer small, targeted changes over rewrites.

## App surface

| Area | Path | Notes |
|------|------|--------|
| Builders | `src/app/*-builder/` | Weapon, warframe, companion, modular, etc. |
| Codex | `src/app/codex/` | Browse items; detail UI in `codex-entity-panels.tsx` + `codex-item-panels.tsx` |
| Compare / damage sim | `src/app/compare/`, `src/app/damage-simulator/` | |
| Admin | `src/app/admin/` | Reports, data fixes, users, site updates, newsletter |
| Auth / profile | `src/app/api/auth/`, `src/app/profile/` | JWT cookie sessions (`src/lib/auth.ts`) |
| Discord bot | `bot/` | Separate process; `npm run bot` |

UI shells and shared layout: `src/components/` (e.g. `stats/` barrel, mod picker, override editors).

### Data Fixes / override UI

Admin editor shell: `override-editor.tsx` (item picker + save). Field UIs are split by domain:

| Module | Role |
|--------|------|
| `override-field-editors.tsx` | Thin barrel — prefer specific modules for new code |
| `override-arcane-editors.tsx` | Arcane trigger + effect lines |
| `override-abilities-editor.tsx` | Warframe / companion abilities |
| `override-stat-rows-editor.tsx` | Nested mod/shard/stat maps |
| `override-radial-editors.tsx` | Weapon radial attack drafts |

Schemas / merge: `src/lib/override-schemas.ts`, `override-merge.ts`, `data-overrides*.ts`.

## Data vs behavior

**Catalogs** (`src/data/*.ts`) hold identity and base stats: mods, weapons, warframes, arcanes, companions, stances, etc. Files are large on purpose — that is fine.

**Behaviors** live beside catalogs when logic is more than a flat number:

| Kind | Where |
|------|--------|
| Mod effects | `src/data/mod-behaviors/` (batched by category; see `index.ts`) |
| Arcane effects | `src/data/arcane-behaviors.ts`, `arcane-effects.ts`, `arcane-manual-overrides.json` |
| Stance → melee class | `src/data/stances.ts` + wiki tags in `mod-weapon-tags.ts` |
| Weapon extras | `weapon-passives.ts`, `weapon-radial-attacks.ts`, `incarnon*.ts` |
| Runtime overrides | DB `DataOverride` + `src/lib/data-overrides*.ts` / admin Data Fixes UI |

### Editing item data

- **Edit one item at a time** (or a short, explicitly reviewed list). Do not blanket-transform catalogs.
- Changing how a mod *works* usually means `mod-behaviors/`, not only `mods.ts` `stats`.
- Stance eligibility: mod `category: "stance"` + entry in `STANCE_WEAPON_TYPE` + correct weapon `stanceType`.
- Prefer id-keyed maps over rewriting hundreds of rows.

See also `.cursor/rules/no-blanket-item-edits.mdc`.

## Calculation stack

| Concern | Start here |
|---------|------------|
| Weapon DPS / stats | `src/lib/calculator.ts` (re-exports helpers) |
| Crit / fire rate / melee combo | `crit-utils.ts`, `effective-fire-rate.ts`, `melee-combo.ts` |
| TTK / damage sim | `ttk.ts`, `damage-sim.ts`, `ability-ttk.ts` |
| Arcanes | `arcane-calculator.ts`, `arcane-handlers.ts`, `arcane-behavior-registry.ts` |
| Companions / archwing / railjack | `companion-calculator.ts`, `archwing-calculator.ts`, `railjack-calculator.ts` |
| Mod eligibility | `mod-weapon-eligibility.ts`, `mod-weapon-tags.ts` data |
| Capacity | `mod-capacity.ts`, `compute-used-capacity.ts` |

Tests live next to modules as `*.test.ts` (Vitest: `npm test`).

## `src/lib` by domain (not exhaustive)

| Domain | Typical files |
|--------|----------------|
| Auth / admin | `auth.ts`, `admin.ts`, `email.ts`, `rate-limit.ts` |
| Builds / share | `build-url.ts`, `build-storage.ts` (`persistSavedBuild`), `share-build.ts`, `use-*-from-url.ts`, `SavedBuildsDialog` |
| Overrides / reports | `override-schemas.ts`, `override-merge.ts`, `data-overrides*.ts`, `report-types.ts` |
| Display | `mod-display.ts`, `arcane-display.ts`, `shard-display.ts`, `images.ts` |
| Site | `site-updates.ts`, `site-metadata.ts`, `public-origin.ts` |

When adding a helper, name it for the domain (`arcane-*`, `weapon-*`, `override-*`) rather than a generic catch-all.

## Database

- Schema: `prisma/schema.prisma`
- Migrations: `prisma/migrations/` — apply with `npm run db:migrate` (or `start.sh`)
- Client is generated into `src/generated/prisma` (gitignored)

## Ops scripts

Deploy and a few admin helpers live under `scripts/`. Most other files there are data-pipeline / audit tooling — see [`scripts/README.md`](../scripts/README.md).
