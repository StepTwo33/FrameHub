"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export function StatRow({ label, value, highlighted, color, tooltip }: {
  label: string; value: string; highlighted?: boolean; color?: string; tooltip?: string;
}) {
  return (
    <div className="flex justify-between items-center py-0.5 group" title={tooltip}>
      <span className={`text-xs ${color || "text-muted-foreground"}`}>{label}</span>
      <span className={highlighted ? "text-xs font-bold text-blue-400" : `text-xs font-mono ${color || ""}`}>
        {value}
      </span>
    </div>
  );
}

export function CollapsibleSection({ title, defaultOpen, children }: {
  title: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 w-full text-left py-2.5 text-[10px] font-semibold tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronDown className="h-3 w-3 inline-block" /> : <ChevronRight className="h-3 w-3 inline-block" />}
        {title}
      </button>
      {open && <div className="ml-1 min-w-0 overflow-x-hidden">{children}</div>}
    </div>
  );
}

export function SimSlider({ label, value, min, max, onChange, suffix, tooltip }: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void; suffix?: string; tooltip?: string;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div className="w-full min-w-0 space-y-0.5" title={tooltip}>
      <span className="block text-[10px] text-muted-foreground leading-tight">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          value={Math.min(value, max)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="min-w-0 flex-1 h-1 accent-primary cursor-pointer"
        />
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!isNaN(v)) onChange(clamp(v));
          }}
          className="w-10 shrink-0 text-[10px] font-mono text-right bg-background border border-border rounded px-1 py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && <span className="shrink-0 text-[10px] text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

