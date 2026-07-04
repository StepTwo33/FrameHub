"use client";

import type { ReactNode } from "react";
import { Flag, Wrench, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GameAssetImage } from "@/components/game-asset-image";
import { PanelHeading } from "@/components/page-shell";
import {
  formatCompanionType,
  formatWeaponCategory,
  getCodexWikiUrl,
  pct,
  weaponElementEntries,
} from "@/lib/codex-catalog";
import { getWeaponImage, getWarframeImage, getCompanionImage } from "@/lib/images";
import { Weapon, Warframe, Companion } from "@/lib/types";
import { Archwing, Necramech } from "@/data/archwing";
import { cn } from "@/lib/utils";

export function CodexActionLinks({
  reportType,
  id,
  name,
  overrideCategory,
  wikiUrl,
}: {
  reportType: string;
  id: string;
  name: string;
  overrideCategory: string;
  wikiUrl?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2 border-t border-border pt-3">
      {wikiUrl && (
        <a
          href={wikiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[10px] text-muted-foreground hover:border-purple-500/40 hover:text-purple-300"
        >
          <ExternalLink className="h-2.5 w-2.5" /> Wiki
        </a>
      )}
      <a
        href={`/report-issue?type=${encodeURIComponent(reportType)}&name=${encodeURIComponent(name)}&id=${encodeURIComponent(id)}`}
        className="inline-flex items-center gap-1 rounded border border-amber-500/30 px-2 py-1 text-[10px] text-amber-400/70 hover:bg-amber-500/5 hover:text-amber-400"
      >
        <Flag className="h-2.5 w-2.5" /> Report
      </a>
      <a
        href={`/report-issue?tab=overrides&overrideCategory=${encodeURIComponent(overrideCategory)}&overrideId=${encodeURIComponent(id)}`}
        className="inline-flex items-center gap-1 rounded border border-purple-500/30 px-2 py-1 text-[10px] text-purple-400/70 hover:bg-purple-500/5 hover:text-purple-400"
      >
        <Wrench className="h-2.5 w-2.5" /> Override
      </a>
    </div>
  );
}

function CodexEntityRow({
  selected,
  onSelect,
  accent,
  image,
  title,
  subtitle,
  badge,
}: {
  selected: boolean;
  onSelect: () => void;
  accent: "blue" | "cyan" | "orange" | "sky" | "slate";
  image: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: ReactNode;
}) {
  const borderActive: Record<typeof accent, string> = {
    blue: "border-blue-500/50 bg-blue-500/5",
    cyan: "border-cyan-500/50 bg-cyan-500/5",
    orange: "border-orange-500/50 bg-orange-500/5",
    sky: "border-sky-500/50 bg-sky-500/5",
    slate: "border-slate-500/50 bg-slate-500/5",
  };
  const borderHover: Record<typeof accent, string> = {
    blue: "hover:border-blue-500/30",
    cyan: "hover:border-cyan-500/30",
    orange: "hover:border-orange-500/30",
    sky: "hover:border-sky-500/30",
    slate: "hover:border-slate-500/30",
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2 rounded-lg border p-2 text-left transition-all",
        selected ? borderActive[accent] : cn("border-border/60", borderHover[accent]),
      )}
    >
      {image}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="truncate text-[10px] text-muted-foreground">{subtitle}</p>
      </div>
      {badge}
    </button>
  );
}

export function CodexWeaponRow({
  weapon,
  selected,
  onSelect,
}: {
  weapon: Weapon;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <CodexEntityRow
      selected={selected}
      onSelect={onSelect}
      accent="blue"
      image={
        <GameAssetImage
          src={getWeaponImage(weapon.name, { category: weapon.category })}
          alt=""
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 rounded object-contain bg-muted/20"
          hideOnError
        />
      }
      title={weapon.name}
      subtitle={`${formatWeaponCategory(weapon.category)} · ${pct(weapon.criticalChance)} crit`}
      badge={
        weapon.isIncarnon ? (
          <Badge variant="outline" className="shrink-0 text-[9px] border-amber-500/30 text-amber-300">
            Incarnon
          </Badge>
        ) : undefined
      }
    />
  );
}

export function CodexWarframeRow({
  warframe,
  selected,
  onSelect,
}: {
  warframe: Warframe;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <CodexEntityRow
      selected={selected}
      onSelect={onSelect}
      accent="cyan"
      image={
        <GameAssetImage
          src={getWarframeImage(warframe.name)}
          alt=""
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 rounded object-contain bg-muted/20"
          hideOnError
        />
      }
      title={warframe.name}
      subtitle={`${warframe.health} HP · ${warframe.shield} shield · ${warframe.armor} armor`}
    />
  );
}

export function CodexCompanionRow({
  companion,
  selected,
  onSelect,
}: {
  companion: Companion;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <CodexEntityRow
      selected={selected}
      onSelect={onSelect}
      accent="orange"
      image={
        <GameAssetImage
          src={getCompanionImage(companion.name)}
          alt=""
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 rounded object-contain bg-muted/20"
          hideOnError
        />
      }
      title={companion.name}
      subtitle={formatCompanionType(companion.type)}
    />
  );
}

export function CodexArchwingRow({
  archwing,
  selected,
  onSelect,
}: {
  archwing: Archwing;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <CodexEntityRow
      selected={selected}
      onSelect={onSelect}
      accent="sky"
      image={
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-sky-500/10 text-[10px] font-bold text-sky-300">
          AW
        </div>
      }
      title={archwing.name}
      subtitle={`${archwing.health} HP · speed ${archwing.speed}`}
    />
  );
}

export function CodexNecramechRow({
  necramech,
  selected,
  onSelect,
}: {
  necramech: Necramech;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <CodexEntityRow
      selected={selected}
      onSelect={onSelect}
      accent="slate"
      image={
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-slate-500/10 text-[10px] font-bold text-slate-300">
          NM
        </div>
      }
      title={necramech.name}
      subtitle={`${necramech.health} HP · ${necramech.armor} armor`}
    />
  );
}

function StatGrid({ items, compact }: { items: { label: string; value: string }[]; compact?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-1.5 text-xs">
      {items.map(({ label, value }) => (
        <div key={label} className="rounded border border-border/60 p-1.5">
          <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
          <p className={cn("font-mono", compact ? "text-sm" : "text-base")}>{value}</p>
        </div>
      ))}
    </div>
  );
}

export function WeaponDetailPanel({ weapon, compact }: { weapon: Weapon; compact?: boolean }) {
  const elements = weaponElementEntries(weapon);

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      <div className="flex items-start gap-2.5">
        <GameAssetImage
          src={getWeaponImage(weapon.name, { category: weapon.category })}
          alt={weapon.name}
          width={compact ? 48 : 64}
          height={compact ? 48 : 64}
          className={cn("rounded object-contain bg-muted/20", compact ? "h-12 w-12" : "h-16 w-16")}
          hideOnError
        />
        <div className="min-w-0 flex-1">
          <h2 className={cn("font-semibold leading-tight", compact && "text-sm")}>{weapon.name}</h2>
          <p className="font-mono text-[10px] text-muted-foreground">{weapon.id}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            <Badge variant="outline" className="text-[10px] capitalize">
              {formatWeaponCategory(weapon.category)}
            </Badge>
            {weapon.isIncarnon && (
              <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-300">
                Incarnon
              </Badge>
            )}
            {weapon.isExalted && (
              <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-300">
                Exalted
              </Badge>
            )}
          </div>
        </div>
      </div>

      <StatGrid
        compact={compact}
        items={[
          { label: "Total damage", value: String(Math.round(weapon.damage)) },
          { label: "Fire rate", value: weapon.fireRate.toFixed(2) },
          { label: "Crit chance", value: pct(weapon.criticalChance) },
          { label: "Crit mult", value: `${weapon.criticalMultiplier.toFixed(1)}x` },
          { label: "Status chance", value: pct(weapon.statusChance) },
          { label: "Magazine", value: String(weapon.magazine) },
          { label: "Reload", value: `${weapon.reloadTime.toFixed(1)}s` },
          { label: "Mod slots", value: String(weapon.modSlots) },
        ]}
      />

      <div>
        <PanelHeading>Damage types</PanelHeading>
        <div className="mt-1 flex flex-wrap gap-1 font-mono text-[10px]">
          <span className="rounded bg-muted px-1.5 py-0.5">Impact {Math.round(weapon.impact)}</span>
          <span className="rounded bg-muted px-1.5 py-0.5">Puncture {Math.round(weapon.puncture)}</span>
          <span className="rounded bg-muted px-1.5 py-0.5">Slash {Math.round(weapon.slash)}</span>
          {elements.map(({ label, value }) => (
            <span key={label} className="rounded bg-muted px-1.5 py-0.5 capitalize">
              {label} {Math.round(value)}
            </span>
          ))}
        </div>
      </div>

      {weapon.passive && (
        <div>
          <PanelHeading>Passive</PanelHeading>
          <p className={cn("text-muted-foreground", compact ? "text-xs leading-snug" : "text-sm")}>
            {weapon.passive}
          </p>
        </div>
      )}

      <CodexActionLinks
        reportType="weapon"
        id={weapon.id}
        name={weapon.name}
        overrideCategory="weapon"
        wikiUrl={getCodexWikiUrl(weapon.name)}
      />
    </div>
  );
}

export function WarframeDetailPanel({ warframe, compact }: { warframe: Warframe; compact?: boolean }) {
  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      <div className="flex items-start gap-2.5">
        <GameAssetImage
          src={getWarframeImage(warframe.name)}
          alt={warframe.name}
          width={compact ? 48 : 64}
          height={compact ? 48 : 64}
          className={cn("rounded object-contain bg-muted/20", compact ? "h-12 w-12" : "h-16 w-16")}
          hideOnError
        />
        <div className="min-w-0 flex-1">
          <h2 className={cn("font-semibold leading-tight", compact && "text-sm")}>{warframe.name}</h2>
          <p className="font-mono text-[10px] text-muted-foreground">{warframe.id}</p>
        </div>
      </div>

      <StatGrid
        compact={compact}
        items={[
          { label: "Health", value: String(warframe.health) },
          { label: "Shield", value: String(warframe.shield) },
          { label: "Armor", value: String(warframe.armor) },
          { label: "Energy", value: String(warframe.energy) },
          { label: "Sprint speed", value: warframe.sprintSpeed.toFixed(2) },
          { label: "Abilities", value: String(warframe.abilities.length) },
        ]}
      />

      {warframe.passive && (
        <div>
          <PanelHeading>Passive</PanelHeading>
          <p className={cn("text-muted-foreground", compact ? "text-xs leading-snug" : "text-sm")}>
            {warframe.passive}
          </p>
        </div>
      )}

      {warframe.abilities.length > 0 && (
        <div>
          <PanelHeading>Abilities</PanelHeading>
          <ul className={cn("space-y-2", compact ? "max-h-36" : "max-h-48", "overflow-y-auto")}>
            {warframe.abilities.map((ab) => (
              <li key={ab.name} className="rounded border border-border/60 p-2">
                <p className="text-sm font-medium">{ab.name}</p>
                <p className="text-[10px] text-muted-foreground">{ab.energyCost} energy</p>
                <p className={cn("mt-0.5 text-muted-foreground", compact ? "text-[10px] leading-snug" : "text-xs")}>
                  {ab.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <CodexActionLinks
        reportType="warframe"
        id={warframe.id}
        name={warframe.name}
        overrideCategory="warframe"
        wikiUrl={getCodexWikiUrl(warframe.name)}
      />
    </div>
  );
}

export function CompanionDetailPanel({ companion, compact }: { companion: Companion; compact?: boolean }) {
  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      <div className="flex items-start gap-2.5">
        <GameAssetImage
          src={getCompanionImage(companion.name)}
          alt={companion.name}
          width={compact ? 48 : 64}
          height={compact ? 48 : 64}
          className={cn("rounded object-contain bg-muted/20", compact ? "h-12 w-12" : "h-16 w-16")}
          hideOnError
        />
        <div className="min-w-0 flex-1">
          <h2 className={cn("font-semibold leading-tight", compact && "text-sm")}>{companion.name}</h2>
          <p className="font-mono text-[10px] text-muted-foreground">{companion.id}</p>
          <Badge variant="outline" className="mt-1 text-[10px] capitalize">
            {formatCompanionType(companion.type)}
          </Badge>
        </div>
      </div>

      <p className={cn("text-muted-foreground", compact ? "text-xs leading-snug" : "text-sm")}>
        {companion.description}
      </p>

      <StatGrid
        compact={compact}
        items={[
          { label: "Health", value: String(companion.health) },
          { label: "Shield", value: String(companion.shield) },
          { label: "Armor", value: String(companion.armor) },
        ]}
      />

      {companion.precept && (
        <div>
          <PanelHeading>Precept</PanelHeading>
          <p className={cn("text-muted-foreground", compact ? "text-xs leading-snug" : "text-sm")}>
            {companion.precept}
          </p>
        </div>
      )}

      <CodexActionLinks
        reportType="companion"
        id={companion.id}
        name={companion.name}
        overrideCategory="companion"
        wikiUrl={getCodexWikiUrl(companion.name)}
      />
    </div>
  );
}

export function ArchwingDetailPanel({ archwing, compact }: { archwing: Archwing; compact?: boolean }) {
  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      <div>
        <h2 className={cn("font-semibold leading-tight", compact && "text-sm")}>{archwing.name}</h2>
        <p className="font-mono text-[10px] text-muted-foreground">{archwing.id}</p>
      </div>

      <p className={cn("text-muted-foreground", compact ? "text-xs leading-snug" : "text-sm")}>
        {archwing.description}
      </p>

      <StatGrid
        compact={compact}
        items={[
          { label: "Health", value: String(archwing.health) },
          { label: "Shield", value: String(archwing.shield) },
          { label: "Armor", value: String(archwing.armor) },
          { label: "Energy", value: String(archwing.energy) },
          { label: "Speed", value: archwing.speed.toFixed(2) },
        ]}
      />

      <CodexActionLinks
        reportType="other"
        id={archwing.id}
        name={archwing.name}
        overrideCategory="archwing"
        wikiUrl={getCodexWikiUrl(archwing.name)}
      />
    </div>
  );
}

export function NecramechDetailPanel({ necramech, compact }: { necramech: Necramech; compact?: boolean }) {
  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      <div>
        <h2 className={cn("font-semibold leading-tight", compact && "text-sm")}>{necramech.name}</h2>
        <p className="font-mono text-[10px] text-muted-foreground">{necramech.id}</p>
      </div>

      <p className={cn("text-muted-foreground", compact ? "text-xs leading-snug" : "text-sm")}>
        {necramech.description}
      </p>

      <StatGrid
        compact={compact}
        items={[
          { label: "Health", value: String(necramech.health) },
          { label: "Shield", value: String(necramech.shield) },
          { label: "Armor", value: String(necramech.armor) },
          { label: "Energy", value: String(necramech.energy) },
        ]}
      />

      <CodexActionLinks
        reportType="other"
        id={necramech.id}
        name={necramech.name}
        overrideCategory="necramech"
        wikiUrl={getCodexWikiUrl(necramech.name)}
      />
    </div>
  );
}
