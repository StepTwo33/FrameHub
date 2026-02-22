"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";
import { Crosshair, Shield, Heart, Flame, Plus, X, ChevronDown, ChevronRight, Zap } from "lucide-react";
import {
  EnemyType, ENEMY_TYPES,
  HEALTH_MODIFIERS, ARMOR_MODIFIERS, SHIELD_MODIFIERS,
  getMod, scaleArmor, scaleHealth, scaleShield, avgCritMult,
} from "@/lib/ttk";

const FACTION_COLORS: Record<string, string> = {
  Grineer: "#FF6B35", Corpus: "#00B4D8", Infested: "#2ECC71",
  Corrupted: "#9B59B6", Stalker: "#E91E63",
};

const ELEMENT_COLORS: Record<string, string> = {
  impact: "#94a3b8", puncture: "#a8a29e", slash: "#f87171",
  heat: "#fb923c", cold: "#67e8f9", toxin: "#4ade80", electricity: "#93c5fd",
  blast: "#facc15", corrosive: "#a3e635", gas: "#6ee7b7", magnetic: "#a5b4fc",
  radiation: "#fcd34d", viral: "#5eead4",
};

const DAMAGE_TYPES = [
  { key: "impact", label: "Impact" }, { key: "puncture", label: "Puncture" }, { key: "slash", label: "Slash" },
  { key: "heat", label: "Heat" }, { key: "cold", label: "Cold" }, { key: "toxin", label: "Toxin" },
  { key: "electricity", label: "Electricity" }, { key: "blast", label: "Blast" },
  { key: "corrosive", label: "Corrosive" }, { key: "gas", label: "Gas" },
  { key: "magnetic", label: "Magnetic" }, { key: "radiation", label: "Radiation" }, { key: "viral", label: "Viral" },
];

interface SimResult {
  // Enemy
  hp: number; shield: number; armor: number;
  armorDR: number; effectiveHP: number;
  // Per-type breakdowns
  typeBreakdown: { type: string; raw: number; vsShield: number; vsHealth: number; weight: number }[];
  // Aggregate
  avgCrit: number;
  rawPerShot: number;
  shieldDmgPerShot: number;
  healthDmgPerShot: number;
  // Status
  procsPerSec: number;
  viralMult: number;
  corrosiveStrippedArmor: number;
  slashDotDps: number;
  heatDotDps: number;
  toxinDotDps: number;
  totalDotDps: number;
  // DPS
  burstDps: number;
  sustainedDps: number;
  shieldBurstDps: number;
  healthBurstDps: number;
  // Time
  shieldTime: number;
  healthTime: number;
  ttk: number;
  shotsToKill: number;
}

function InputField({ label, value, onChange, step, min, suffix }: {
  label: string; value: number; onChange: (v: number) => void;
  step?: number; min?: number; suffix?: string;
}) {
  return (
    <div>
      <label className="text-[10px] text-muted-foreground block mb-0.5">{label}</label>
      <div className="relative">
        <input
          type="number"
          step={step ?? 1}
          min={min ?? 0}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full bg-background border border-border rounded px-2 py-1 text-xs font-mono"
        />
        {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

function ResultRow({ label, value, color, bold, tooltip }: {
  label: string; value: string; color?: string; bold?: boolean; tooltip?: string;
}) {
  return (
    <div className="flex justify-between items-center py-0.5" title={tooltip}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-xs font-mono", color, bold && "font-bold")}>{value}</span>
    </div>
  );
}

function Section({ title, icon, children, defaultOpen }: {
  title: string; icon?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        {icon}
        {title}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function fmt(n: number): string {
  if (n === Infinity || isNaN(n)) return "∞";
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(n < 10 ? 2 : 0);
}

export default function DamageSimulatorPage() {
  // Weapon stats
  const [dmgTypes, setDmgTypes] = useState<Record<string, number>>({ impact: 50, puncture: 50, slash: 100 });
  const [fireRate, setFireRate] = useState(5);
  const [critChance, setCritChance] = useState(0.3);
  const [critMulti, setCritMulti] = useState(2.2);
  const [multishot, setMultishot] = useState(1);
  const [statusChance, setStatusChance] = useState(0.3);
  const [magazine, setMagazine] = useState(30);
  const [reloadTime, setReloadTime] = useState(2);
  const [addingType, setAddingType] = useState("");

  // Enemy
  const [selectedEnemy, setSelectedEnemy] = useState<EnemyType | null>(null);
  const [enemyLevel, setEnemyLevel] = useState(100);
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);

  const factions = useMemo(() => ["all", ...new Set(ENEMY_TYPES.map((e) => e.faction))], []);
  const filteredEnemies = selectedFaction && selectedFaction !== "all"
    ? ENEMY_TYPES.filter((e) => e.faction === selectedFaction)
    : ENEMY_TYPES;

  const totalRaw = useMemo(() => Object.values(dmgTypes).reduce((s, v) => s + v, 0), [dmgTypes]);

  // Full simulation
  const sim = useMemo((): SimResult | null => {
    if (!selectedEnemy || totalRaw <= 0) return null;

    const hp = scaleHealth(selectedEnemy.baseHealth, enemyLevel, selectedEnemy.faction);
    let armor = scaleArmor(selectedEnemy.baseArmor, enemyLevel);
    const shield = scaleShield(selectedEnemy.baseShield, enemyLevel);

    // Status procs/sec
    const procsPerSec = fireRate * statusChance * multishot;

    // Corrosive strip: 26% per stack, max 10, avg over ~3s window
    const corrosiveRaw = dmgTypes["corrosive"] ?? 0;
    let corrosiveStrippedArmor = armor;
    if (corrosiveRaw > 0 && armor > 0 && procsPerSec > 0) {
      const corPPS = procsPerSec * (corrosiveRaw / totalRaw);
      const avgStacks = Math.min(10, corPPS * 3);
      corrosiveStrippedArmor = armor * Math.pow(0.74, avgStacks);
    }
    armor = corrosiveStrippedArmor;

    // Viral health multiplier
    const viralRaw = dmgTypes["viral"] ?? 0;
    let viralMult = 1.0;
    if (viralRaw > 0 && procsPerSec > 0) {
      const virPPS = procsPerSec * (viralRaw / totalRaw);
      const avgStacks = Math.min(10, virPPS * 3);
      if (avgStacks >= 1) viralMult = 2.0 + Math.min(avgStacks - 1, 9) * 0.25;
    }

    const armorDR = armor > 0 ? armor / (armor + 300) : 0;

    // Per-type damage breakdown vs shield and health
    const types = Object.entries(dmgTypes).filter(([, v]) => v > 0);
    const typeBreakdown = types.map(([type, raw]) => {
      const weight = raw / totalRaw;

      // vs shield
      let vsShield = raw;
      if (shield > 0 && selectedEnemy.shieldType !== "none") {
        vsShield = raw * (1 + getMod(SHIELD_MODIFIERS, selectedEnemy.shieldType, type));
      }

      // vs health (through armor)
      const hm = getMod(HEALTH_MODIFIERS, selectedEnemy.healthType, type);
      let vsHealth = raw * (1 + hm);
      if (armor > 0 && selectedEnemy.armorType !== "none") {
        const am = getMod(ARMOR_MODIFIERS, selectedEnemy.armorType, type);
        const effArmor = armor * Math.max(0, 1 - am);
        const effDR = effArmor > 0 ? effArmor / (effArmor + 300) : 0;
        vsHealth *= (1 - effDR);
      }
      vsHealth *= viralMult;

      return { type, raw, vsShield, vsHealth, weight };
    });

    // Aggregate per-shot
    const acm = avgCritMult(critChance, critMulti);
    const shieldSum = typeBreakdown.reduce((s, t) => s + t.vsShield, 0);
    const healthSum = typeBreakdown.reduce((s, t) => s + t.vsHealth, 0);

    const rawPerShot = totalRaw * multishot * acm;
    const shieldDmgPerShot = shieldSum * multishot * acm;
    const healthDmgPerShot = healthSum * multishot * acm;

    // DoT DPS
    let slashDotDps = 0;
    const slashRaw = dmgTypes["slash"] ?? 0;
    if (slashRaw > 0 && procsPerSec > 0) {
      const pps = procsPerSec * (slashRaw / totalRaw);
      const tickDmg = totalRaw * 0.35;
      const hm = getMod(HEALTH_MODIFIERS, selectedEnemy.healthType, "slash");
      slashDotDps = pps * tickDmg * (7 / 6) * (1 + hm) * viralMult;
    }

    let heatDotDps = 0;
    const heatRaw = dmgTypes["heat"] ?? 0;
    if (heatRaw > 0 && procsPerSec > 0) {
      const pps = procsPerSec * (heatRaw / totalRaw);
      const tickDmg = totalRaw * 0.5;
      const hm = getMod(HEALTH_MODIFIERS, selectedEnemy.healthType, "heat");
      heatDotDps = pps * tickDmg * (1 + hm) * (1 - armorDR);
    }

    let toxinDotDps = 0;
    const toxinRaw = dmgTypes["toxin"] ?? 0;
    if (toxinRaw > 0 && procsPerSec > 0) {
      const pps = procsPerSec * (toxinRaw / totalRaw);
      const tickDmg = totalRaw * 0.5;
      const hm = getMod(HEALTH_MODIFIERS, selectedEnemy.healthType, "toxin");
      toxinDotDps = pps * tickDmg * (1 + hm) * (1 - armorDR);
    }

    const totalDotDps = slashDotDps + heatDotDps + toxinDotDps;

    // DPS
    const shieldBurstDps = shieldDmgPerShot * fireRate;
    const healthBurstDps = healthDmgPerShot * fireRate + totalDotDps;

    const sustainFactor = magazine > 0 && reloadTime > 0 && fireRate > 0
      ? (magazine / fireRate) / (magazine / fireRate + reloadTime)
      : 1;
    const burstDps = healthBurstDps;
    const sustainedDps = healthBurstDps * sustainFactor;

    // TTK
    const shieldTime = shield > 0 && shieldBurstDps > 0 ? shield / shieldBurstDps : 0;
    const healthTime = healthBurstDps > 0 ? hp / healthBurstDps : Infinity;
    let ttk = shieldTime + healthTime;

    if (magazine > 0 && reloadTime > 0 && fireRate > 0) {
      const magDur = magazine / fireRate;
      if (ttk > magDur) {
        const totalShots = ttk * fireRate;
        const fullReloads = Math.floor(totalShots / magazine);
        ttk += fullReloads * reloadTime;
      }
    }

    const stk = shieldDmgPerShot > 0 && healthDmgPerShot > 0
      ? Math.ceil(shield / shieldDmgPerShot) + Math.ceil(hp / healthDmgPerShot)
      : Infinity;

    const effectiveHP = hp + shield;

    return {
      hp, shield, armor, armorDR, effectiveHP,
      typeBreakdown, avgCrit: acm,
      rawPerShot, shieldDmgPerShot, healthDmgPerShot,
      procsPerSec, viralMult, corrosiveStrippedArmor,
      slashDotDps, heatDotDps, toxinDotDps, totalDotDps,
      burstDps, sustainedDps, shieldBurstDps, healthBurstDps,
      shieldTime, healthTime, ttk,
      shotsToKill: Math.max(1, stk),
    };
  }, [selectedEnemy, enemyLevel, dmgTypes, totalRaw, fireRate, critChance, critMulti, multishot, statusChance, magazine, reloadTime]);

  const setDmg = (type: string, val: number) => setDmgTypes((prev) => ({ ...prev, [type]: val }));
  const removeDmg = (type: string) => setDmgTypes((prev) => { const n = { ...prev }; delete n[type]; return n; });

  const unusedTypes = DAMAGE_TYPES.filter((t) => !(t.key in dmgTypes));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-lg sm:text-2xl font-bold mb-6 flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Damage Simulator
          </h1>

          <div className="grid lg:grid-cols-[1fr_420px] gap-6">
            {/* Left: Inputs */}
            <div className="space-y-4">
              {/* Weapon Core Stats */}
              <Section title="WEAPON STATS" icon={<Crosshair className="h-3.5 w-3.5" />}>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  <InputField label="Fire Rate" value={fireRate} onChange={setFireRate} step={0.1} />
                  <InputField label="Crit Chance" value={critChance} onChange={setCritChance} step={0.01} />
                  <InputField label="Crit Multi" value={critMulti} onChange={setCritMulti} step={0.1} suffix="x" />
                  <InputField label="Multishot" value={multishot} onChange={setMultishot} step={0.1} />
                  <InputField label="Status Chance" value={statusChance} onChange={setStatusChance} step={0.01} />
                  <InputField label="Magazine" value={magazine} onChange={setMagazine} step={1} />
                  <InputField label="Reload (s)" value={reloadTime} onChange={setReloadTime} step={0.1} />
                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-0.5">Total Damage</label>
                    <div className="bg-muted/30 border border-border rounded px-2 py-1 text-xs font-mono font-bold text-primary">
                      {totalRaw.toFixed(1)}
                    </div>
                  </div>
                </div>
              </Section>

              {/* Damage Type Breakdown */}
              <Section title="DAMAGE TYPES" icon={<Flame className="h-3.5 w-3.5" />}>
                <div className="space-y-1.5">
                  {Object.entries(dmgTypes).map(([type, val]) => (
                    <div key={type} className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: ELEMENT_COLORS[type] || "#888" }}
                      />
                      <span className="text-xs font-medium w-20 capitalize" style={{ color: ELEMENT_COLORS[type] }}>{type}</span>
                      <input
                        type="number"
                        value={val}
                        onChange={(e) => setDmg(type, parseFloat(e.target.value) || 0)}
                        className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs font-mono"
                      />
                      <span className="text-[10px] text-muted-foreground w-10 text-right">
                        {totalRaw > 0 ? `${((val / totalRaw) * 100).toFixed(0)}%` : "0%"}
                      </span>
                      <button onClick={() => removeDmg(type)} className="text-red-400/60 hover:text-red-400">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                {unusedTypes.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <select
                      value={addingType}
                      onChange={(e) => setAddingType(e.target.value)}
                      className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs"
                    >
                      <option value="">Add element...</option>
                      {unusedTypes.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                    </select>
                    <button
                      onClick={() => { if (addingType) { setDmg(addingType, 100); setAddingType(""); } }}
                      disabled={!addingType}
                      className="px-2 py-1 text-xs rounded bg-primary text-primary-foreground disabled:opacity-40"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </Section>

              {/* Enemy Selection */}
              <Section title="ENEMY TARGET" icon={<Shield className="h-3.5 w-3.5" />}>
                <div className="flex gap-1 mb-2 flex-wrap">
                  {factions.map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFaction(f === "all" ? null : f)}
                      className={cn(
                        "px-2 py-0.5 text-[10px] rounded border transition-colors capitalize",
                        (f === "all" && !selectedFaction) || selectedFaction === f
                          ? "border-primary text-primary bg-primary/10"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="space-y-0.5 max-h-40 overflow-y-auto">
                  {filteredEnemies.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setSelectedEnemy(e)}
                      className={cn(
                        "w-full text-left px-2.5 py-1.5 rounded-lg border text-xs transition-all",
                        selectedEnemy?.id === e.id ? "border-primary/50 bg-primary/5" : "border-border/50 hover:border-primary/30"
                      )}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{e.name}</span>
                        <span className="text-[9px]" style={{ color: FACTION_COLORS[e.faction] }}>{e.faction}</span>
                      </div>
                      <div className="flex gap-3 text-[9px] text-muted-foreground mt-0.5">
                        <span>HP {e.baseHealth}</span>
                        {e.baseShield > 0 && <span>SH {e.baseShield}</span>}
                        {e.baseArmor > 0 && <span>AR {e.baseArmor}</span>}
                        <span className="text-muted-foreground/50">{e.healthType} / {e.armorType !== "none" ? e.armorType : "–"}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedEnemy && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-muted-foreground">Level</span>
                      <input
                        type="range"
                        min={1} max={200} value={enemyLevel}
                        onChange={(e) => setEnemyLevel(Number(e.target.value))}
                        className="flex-1 h-1 accent-primary"
                      />
                      <input
                        type="number"
                        min={1} max={9999} value={enemyLevel}
                        onChange={(e) => setEnemyLevel(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-14 bg-background border border-border rounded px-1.5 py-0.5 text-xs font-mono text-right"
                      />
                    </div>
                  </div>
                )}
              </Section>
            </div>

            {/* Right: Results */}
            <div className="space-y-4">
              {selectedEnemy && sim && (
                <>
                  {/* Enemy Scaled Stats */}
                  <Section title={`${selectedEnemy.name} Lv.${enemyLevel}`} icon={<Heart className="h-3.5 w-3.5 text-red-400" />}>
                    <ResultRow label="Health" value={fmt(sim.hp)} color="text-red-400" />
                    {sim.shield > 0 && <ResultRow label="Shield" value={fmt(sim.shield)} color="text-cyan-300" />}
                    {sim.armor > 0 && <ResultRow label="Armor" value={`${fmt(sim.armor)} (${(sim.armorDR * 100).toFixed(1)}% DR)`} color="text-yellow-400" />}
                    <ResultRow label="Effective HP" value={fmt(sim.effectiveHP)} bold color="text-primary" />
                    <div className="text-[9px] text-muted-foreground/60 mt-1">
                      {selectedEnemy.healthType} health · {selectedEnemy.armorType !== "none" ? `${selectedEnemy.armorType} armor` : "no armor"} · {selectedEnemy.shieldType !== "none" ? `${selectedEnemy.shieldType} shields` : "no shields"}
                    </div>
                  </Section>

                  {/* Per-Type Damage Breakdown */}
                  <Section title="DAMAGE BREAKDOWN" icon={<Flame className="h-3.5 w-3.5" />} defaultOpen={false}>
                    <div className="text-[9px] text-muted-foreground mb-2 grid grid-cols-4 gap-1">
                      <span>Type</span><span className="text-right">Raw</span>
                      <span className="text-right">vs Shield</span><span className="text-right">vs Health</span>
                    </div>
                    {sim.typeBreakdown.map((t) => (
                      <div key={t.type} className="grid grid-cols-4 gap-1 py-0.5 text-[10px]">
                        <span className="capitalize font-medium" style={{ color: ELEMENT_COLORS[t.type] }}>{t.type}</span>
                        <span className="text-right font-mono">{t.raw.toFixed(0)}</span>
                        <span className="text-right font-mono text-cyan-300">{t.vsShield.toFixed(0)}</span>
                        <span className="text-right font-mono text-red-300">{t.vsHealth.toFixed(0)}</span>
                      </div>
                    ))}
                    <div className="border-t border-border/50 mt-1 pt-1 grid grid-cols-4 gap-1 text-[10px] font-bold">
                      <span>Total</span>
                      <span className="text-right font-mono">{totalRaw.toFixed(0)}</span>
                      <span className="text-right font-mono text-cyan-300">{sim.typeBreakdown.reduce((s, t) => s + t.vsShield, 0).toFixed(0)}</span>
                      <span className="text-right font-mono text-red-300">{sim.typeBreakdown.reduce((s, t) => s + t.vsHealth, 0).toFixed(0)}</span>
                    </div>
                  </Section>

                  {/* Per-Shot Calculations */}
                  <Section title="PER-SHOT" icon={<Crosshair className="h-3.5 w-3.5" />}>
                    <ResultRow label="Avg Crit Multiplier" value={`${sim.avgCrit.toFixed(2)}x`} />
                    <ResultRow label={`Multishot × ${multishot.toFixed(1)}`} value={`${multishot > 1 ? multishot.toFixed(1) + " pellets" : "1 pellet"}`} />
                    <ResultRow label="Raw / Shot" value={fmt(sim.rawPerShot)} />
                    {sim.shield > 0 && <ResultRow label="vs Shield / Shot" value={fmt(sim.shieldDmgPerShot)} color="text-cyan-300" />}
                    <ResultRow label="vs Health / Shot" value={fmt(sim.healthDmgPerShot)} color="text-red-300" bold />
                  </Section>

                  {/* Status Effects */}
                  {sim.procsPerSec > 0 && (
                    <Section title="STATUS EFFECTS" icon={<Zap className="h-3.5 w-3.5" />} defaultOpen={false}>
                      <ResultRow label="Procs / Sec" value={sim.procsPerSec.toFixed(1)} color="text-teal-400" />
                      {sim.viralMult > 1 && (
                        <ResultRow label="Viral Multiplier" value={`${sim.viralMult.toFixed(2)}x health dmg`} color="text-teal-300"
                          tooltip="Stack 1: +100% health dmg, stacks 2-10: +25% each" />
                      )}
                      {sim.corrosiveStrippedArmor < sim.armor && (
                        <ResultRow label="Corrosive Strip" value={`${fmt(sim.armor)} → ${fmt(sim.corrosiveStrippedArmor)}`} color="text-lime-400"
                          tooltip="-26% armor per stack, max 10 stacks" />
                      )}
                      <div className="border-t border-border/50 mt-1 pt-1" />
                      {sim.slashDotDps > 0 && <ResultRow label="Slash DoT DPS" value={fmt(sim.slashDotDps)} color="text-red-300"
                        tooltip="35% base/tick, 7 ticks over 6s, bypasses armor" />}
                      {sim.heatDotDps > 0 && <ResultRow label="Heat DoT DPS" value={fmt(sim.heatDotDps)} color="text-orange-300"
                        tooltip="50% base/tick, 6 ticks over 6s, reduced by armor" />}
                      {sim.toxinDotDps > 0 && <ResultRow label="Toxin DoT DPS" value={fmt(sim.toxinDotDps)} color="text-green-300"
                        tooltip="50% base/tick, 8 ticks over 8s, bypasses shields" />}
                      {sim.totalDotDps > 0 && <ResultRow label="Total DoT DPS" value={fmt(sim.totalDotDps)} bold color="text-teal-400" />}
                    </Section>
                  )}

                  {/* DPS & TTK */}
                  <Section title="DPS & TIME TO KILL">
                    <ResultRow label="Burst DPS (vs Health)" value={fmt(sim.burstDps)} bold color="text-amber-300" />
                    <ResultRow label="Sustained DPS" value={fmt(sim.sustainedDps)} bold color="text-amber-300"
                      tooltip={`Accounts for ${reloadTime}s reload every ${magazine} shots`} />
                    {sim.totalDotDps > 0 && (
                      <ResultRow label="↳ incl. DoT DPS" value={fmt(sim.totalDotDps)} color="text-teal-400" />
                    )}
                    <div className="border-t border-border/50 my-1" />
                    {sim.shieldTime > 0 && <ResultRow label="Shield Phase" value={`${sim.shieldTime.toFixed(2)}s`} color="text-cyan-300" />}
                    <ResultRow label="Health Phase" value={sim.healthTime === Infinity ? "∞" : `${sim.healthTime.toFixed(2)}s`} color="text-red-300" />
                    <div className="border-t border-border/50 my-1" />
                    <ResultRow label="Time to Kill" value={sim.ttk === Infinity ? "∞" : sim.ttk < 0.01 ? "<0.01s" : `${sim.ttk.toFixed(2)}s`}
                      bold color={sim.ttk < 1 ? "text-green-400" : sim.ttk < 5 ? "text-yellow-400" : sim.ttk < 15 ? "text-orange-400" : "text-red-400"} />
                    <ResultRow label="Shots to Kill" value={sim.shotsToKill === Infinity ? "∞" : sim.shotsToKill.toLocaleString()} bold />
                    {magazine > 0 && (
                      <ResultRow label="Magazines Needed" value={Math.ceil(sim.shotsToKill / magazine).toString()} />
                    )}
                  </Section>

                  {/* Type matchup reference */}
                  <Section title="TYPE MATCHUPS" defaultOpen={false}>
                    <div className="space-y-0.5">
                      {Object.entries(dmgTypes).filter(([, v]) => v > 0).map(([type]) => {
                        const hm = getMod(HEALTH_MODIFIERS, selectedEnemy.healthType, type);
                        const am = selectedEnemy.armorType !== "none" ? getMod(ARMOR_MODIFIERS, selectedEnemy.armorType, type) : 0;
                        const sm = selectedEnemy.shieldType !== "none" ? getMod(SHIELD_MODIFIERS, selectedEnemy.shieldType, type) : 0;
                        return (
                          <div key={type} className="flex items-center gap-1 text-[10px]">
                            <span className="w-16 capitalize font-medium" style={{ color: ELEMENT_COLORS[type] }}>{type}</span>
                            {hm !== 0 && <span className={cn("px-1 rounded", hm > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>
                              HP {hm > 0 ? "+" : ""}{(hm * 100).toFixed(0)}%
                            </span>}
                            {am !== 0 && <span className={cn("px-1 rounded", am > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>
                              AR {am > 0 ? "+" : ""}{(am * 100).toFixed(0)}%
                            </span>}
                            {sm !== 0 && <span className={cn("px-1 rounded", sm > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>
                              SH {sm > 0 ? "+" : ""}{(sm * 100).toFixed(0)}%
                            </span>}
                            {hm === 0 && am === 0 && sm === 0 && <span className="text-muted-foreground/40">neutral</span>}
                          </div>
                        );
                      })}
                    </div>
                  </Section>
                </>
              )}

              {!selectedEnemy && (
                <div className="border border-border rounded-xl p-8 bg-card text-center">
                  <Shield className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Select an enemy target to run the simulation</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
