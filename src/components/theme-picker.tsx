"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Palette, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

const THEMES = [
  { id: "void",     label: "Void",     color: "#a0a0a0", desc: "Default neutral" },
  { id: "lotus",    label: "Lotus",    color: "#4d8bff", desc: "Tenno blue" },
  { id: "orokin",   label: "Orokin",   color: "#e0b040", desc: "Golden age" },
  { id: "grineer",  label: "Grineer",  color: "#e06030", desc: "Industrial red" },
  { id: "corpus",   label: "Corpus",   color: "#70b8e0", desc: "Cold tech" },
  { id: "infested", label: "Infested", color: "#50d060", desc: "Toxic growth" },
  { id: "sentient", label: "Sentient", color: "#b050e0", desc: "Anomaly purple" },
  { id: "stalker",  label: "Stalker",  color: "#d03030", desc: "Crimson shadow" },
  { id: "entrati",  label: "Entrati",  color: "#c8a050", desc: "Bone & amber" },
  { id: "duviri",   label: "Duviri",   color: "#c8c8c8", desc: "Monochrome" },
  { id: "tenno",    label: "Tenno",    color: "#40b0a0", desc: "Jade teal" },
  { id: "narmer",   label: "Narmer",   color: "#d0a030", desc: "Veiled gold" },
] as const;

function applyTheme(themeId: string) {
  const html = document.documentElement;
  THEMES.forEach((t) => html.classList.remove(`theme-${t.id}`));
  if (themeId !== "void") {
    html.classList.add(`theme-${themeId}`);
  }
}

function applyMode(mode: "dark" | "light") {
  const html = document.documentElement;
  if (mode === "dark") {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }
}

export function ThemePicker() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("void");
  const [mode, setMode] = useState<"dark" | "light">("dark");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const savedTheme = localStorage.getItem("framehub_theme") || "void";
      const savedMode = (localStorage.getItem("framehub_mode") || "dark") as "dark" | "light";
      setCurrent(savedTheme);
      setMode(savedMode);
      applyTheme(savedTheme);
      applyMode(savedMode);
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectTheme = useCallback((id: string) => {
    setCurrent(id);
    applyTheme(id);
    localStorage.setItem("framehub_theme", id);
    setOpen(false);
  }, []);

  const selectMode = useCallback((next: "dark" | "light") => {
    setMode(next);
    applyMode(next);
    localStorage.setItem("framehub_mode", next);
  }, []);

  const currentTheme = THEMES.find((t) => t.id === current) || THEMES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
        title="Appearance"
      >
        <span
          className="w-3 h-3 rounded-full border border-white/20"
          style={{ backgroundColor: currentTheme.color }}
        />
        <Palette className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-popover shadow-xl z-50 overflow-hidden">
          {/* Dark / Light toggle */}
          <div className="px-3 py-2.5 border-b border-border">
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground block mb-2">APPEARANCE</span>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => selectMode("light")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
                  mode === "light"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Sun className="h-3.5 w-3.5" /> Light
              </button>
              <button
                onClick={() => selectMode("dark")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
                  mode === "dark"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Moon className="h-3.5 w-3.5" /> Dark
              </button>
            </div>
          </div>

          {/* Color themes */}
          <div className="px-3 py-2 border-b border-border">
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground">COLOR THEME</span>
          </div>
          <div className="p-1.5 max-h-64 overflow-y-auto">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => selectTheme(theme.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all",
                  current === theme.id
                    ? "bg-primary/10 text-foreground"
                    : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "w-4 h-4 rounded-full border-2 shrink-0 transition-all",
                    current === theme.id ? "border-foreground scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: theme.color }}
                />
                <div className="min-w-0">
                  <div className="text-xs font-medium">{theme.label}</div>
                  <div className="text-[10px] text-muted-foreground/70">{theme.desc}</div>
                </div>
                {current === theme.id && (
                  <span className="ml-auto text-[10px] text-primary font-medium">Active</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
