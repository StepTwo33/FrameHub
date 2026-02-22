"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/header";
import { getSavedBuilds, saveBuild, generateBuildId } from "@/lib/build-storage";
import { getLoadouts, saveLoadout, generateId } from "@/lib/loadouts";
import type { SavedBuild } from "@/lib/build-storage";
import type { Loadout } from "@/lib/types";
import {
  Upload, Download, Clipboard, Check, AlertCircle, QrCode,
  Link2, Swords, Shield, ChevronRight, Search, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Helpers ──────────────────────────────────────────────────────────────

function compressForShare(data: object): string {
  try {
    const json = JSON.stringify(data);
    return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch { return ""; }
}

function decompressFromShare(code: string): object | null {
  try {
    let b64 = code.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    return JSON.parse(atob(b64));
  } catch { return null; }
}

function getBuildTypeIcon(type: string) {
  if (type === "warframe") return Shield;
  return Swords;
}

function getBuildTypeLabel(type: string) {
  const labels: Record<string, string> = {
    weapon: "Weapon Build",
    warframe: "Warframe Build",
    companion: "Companion Build",
    modular: "Modular Build",
    archwing: "Archwing Build",
    loadout: "Full Loadout",
  };
  return labels[type] || type;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// ── Types for selectable items ──────────────────────────────────────────

interface ExportableItem {
  id: string;
  name: string;
  type: string;
  updatedAt: number;
  data: object;
}

// ── Main Page ───────────────────────────────────────────────────────────

export default function ImportExportPage() {
  const [mode, setMode] = useState<"export" | "import">("export");

  // Export state
  const [builds, setBuilds] = useState<ExportableItem[]>([]);
  const [selected, setSelected] = useState<ExportableItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  // Import state
  const [importCode, setImportCode] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  // Load all exportable builds
  useEffect(() => {
    const items: ExportableItem[] = [];

    // Individual builds
    const savedBuilds = getSavedBuilds();
    for (const b of savedBuilds) {
      items.push({
        id: b.id,
        name: b.name,
        type: b.type,
        updatedAt: b.updatedAt,
        data: b.data,
      });
    }

    // Loadouts
    const loadouts = getLoadouts();
    for (const l of loadouts) {
      items.push({
        id: l.id,
        name: l.name,
        type: "loadout",
        updatedAt: l.updatedAt,
        data: l,
      });
    }

    items.sort((a, b) => b.updatedAt - a.updatedAt);
    setBuilds(items);
  }, []);

  // Generate QR + link when a build is selected
  useEffect(() => {
    if (!selected) {
      setQrDataUrl(null);
      setShareLink("");
      return;
    }

    const shareData = {
      _v: 1,
      type: selected.type,
      name: selected.name,
      data: selected.data,
    };
    const code = compressForShare(shareData);
    const link = typeof window !== "undefined"
      ? `${window.location.origin}/import-export?code=${code}`
      : "";
    setShareLink(link);

    // Generate QR code
    import("qrcode").then((QRCode) => {
      // Use the shorter code string for QR (the link might be too long)
      const qrContent = code.length < 2000 ? link : code;
      QRCode.toDataURL(qrContent, {
        width: 280,
        margin: 2,
        color: { dark: "#ffffffee", light: "#00000000" },
        errorCorrectionLevel: "M",
      }).then((url: string) => setQrDataUrl(url))
        .catch(() => setQrDataUrl(null));
    });
  }, [selected]);

  // Auto-import from URL code param
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      setMode("import");
      setImportCode(code);
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  }, [shareLink]);

  const handleCopyCode = useCallback(async () => {
    if (!selected) return;
    const shareData = { _v: 1, type: selected.type, name: selected.name, data: selected.data };
    const code = compressForShare(shareData);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  }, [selected]);

  const handleImport = useCallback(() => {
    setImportError(null);
    setImportSuccess(null);
    const code = importCode.trim();
    if (!code) {
      setImportError("Please paste a share code or link.");
      return;
    }

    // Extract code from link if needed
    let rawCode = code;
    try {
      const url = new URL(code);
      const param = url.searchParams.get("code");
      if (param) rawCode = param;
    } catch {
      // Not a URL, treat as raw code
    }

    // Try JSON first (legacy format)
    try {
      const jsonData = JSON.parse(rawCode);
      if (jsonData.name) {
        const loadout: Loadout = {
          id: generateId(),
          name: `${jsonData.name} (Imported)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          warframeBuild: jsonData.warframeBuild,
          primaryBuild: jsonData.primaryBuild,
          secondaryBuild: jsonData.secondaryBuild,
          meleeBuild: jsonData.meleeBuild,
          companionBuild: jsonData.companionBuild,
        };
        saveLoadout(loadout);
        setImportSuccess(`Imported loadout "${jsonData.name}" successfully!`);
        setImportCode("");
        return;
      }
    } catch { /* not JSON */ }

    // Try base64 share code
    const decoded = decompressFromShare(rawCode);
    if (!decoded || typeof decoded !== "object") {
      setImportError("Invalid share code. Make sure you copied the full code or link.");
      return;
    }

    const share = decoded as { _v?: number; type?: string; name?: string; data?: object };
    if (!share.name || !share.data) {
      setImportError("Invalid build data in share code.");
      return;
    }

    if (share.type === "loadout") {
      const loadoutData = share.data as Loadout;
      const loadout: Loadout = {
        ...loadoutData,
        id: generateId(),
        name: `${share.name} (Imported)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      saveLoadout(loadout);
      setImportSuccess(`Imported loadout "${share.name}" successfully!`);
    } else {
      const build: SavedBuild = {
        id: generateBuildId(),
        name: `${share.name} (Imported)`,
        type: (share.type || "weapon") as SavedBuild["type"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        data: share.data,
      };
      saveBuild(build);
      setImportSuccess(`Imported ${getBuildTypeLabel(share.type || "weapon").toLowerCase()} "${share.name}" successfully!`);
    }
    setImportCode("");
  }, [importCode]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setImportCode(text);
    } catch { /* fallback */ }
  }, []);

  const filteredBuilds = searchQuery.trim()
    ? builds.filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : builds;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold">Share Builds</h1>
            <div className="flex gap-1 ml-auto">
              <button
                onClick={() => setMode("export")}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                  mode === "export" ? "bg-primary border-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <Download className="h-3.5 w-3.5 inline mr-1.5" />Share
              </button>
              <button
                onClick={() => setMode("import")}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                  mode === "import" ? "bg-primary border-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <Upload className="h-3.5 w-3.5 inline mr-1.5" />Import
              </button>
            </div>
          </div>

          {/* ── EXPORT / SHARE MODE ─────────────────────────────── */}
          {mode === "export" && (
            <div className="grid gap-6 md:grid-cols-[1fr_300px]">
              {/* Build selector */}
              <div className="border border-border rounded-xl bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h2 className="text-[10px] font-semibold tracking-wider text-muted-foreground mb-2">SELECT A BUILD TO SHARE</h2>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search builds..."
                      className="w-full h-8 pl-8 pr-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
                <div className="max-h-[50vh] overflow-y-auto divide-y divide-border">
                  {filteredBuilds.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      {builds.length === 0
                        ? "No saved builds yet. Create a build in the weapon or warframe builder first!"
                        : "No builds match your search."}
                    </div>
                  ) : (
                    filteredBuilds.map((item) => {
                      const Icon = getBuildTypeIcon(item.type);
                      const isSelected = selected?.id === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelected(isSelected ? null : item)}
                          className={cn(
                            "w-full text-left px-4 py-3 flex items-center gap-3 transition-colors",
                            isSelected ? "bg-primary/10" : "hover:bg-muted/30"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            isSelected ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground"
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{item.name}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {getBuildTypeLabel(item.type)} · {formatDate(item.updatedAt)}
                            </div>
                          </div>
                          <ChevronRight className={cn(
                            "h-4 w-4 shrink-0 transition-transform",
                            isSelected ? "text-primary rotate-90" : "text-muted-foreground"
                          )} />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* QR + share panel */}
              <div className="border border-border rounded-xl bg-card p-4 flex flex-col items-center gap-4">
                {selected ? (
                  <>
                    <h3 className="text-sm font-semibold text-center truncate w-full">{selected.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{getBuildTypeLabel(selected.type)}</p>

                    {/* QR Code */}
                    {qrDataUrl ? (
                      <div className="bg-white/10 p-3 rounded-xl">
                        <img src={qrDataUrl} alt="QR Code" className="w-[240px] h-[240px]" />
                      </div>
                    ) : (
                      <div className="w-[240px] h-[240px] bg-muted/20 rounded-xl flex items-center justify-center">
                        <QrCode className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}

                    <p className="text-[10px] text-muted-foreground text-center">Scan to import this build</p>

                    {/* Share buttons */}
                    <div className="w-full space-y-2">
                      <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors font-medium"
                      >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                        {copied ? "Copied!" : "Copy Share Link"}
                      </button>
                      <button
                        onClick={handleCopyCode}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Clipboard className="h-3.5 w-3.5" /> Copy Short Code
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-8">
                    <QrCode className="h-16 w-16 text-muted-foreground/20" />
                    <p className="text-sm text-muted-foreground">Select a build to generate<br />a QR code and share link</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── IMPORT MODE ──────────────────────────────────────── */}
          {mode === "import" && (
            <div className="space-y-4">
              <div className="border border-border rounded-xl p-5 bg-card">
                <h2 className="text-[10px] font-semibold tracking-wider text-muted-foreground mb-3">PASTE A SHARE LINK OR CODE</h2>
                <p className="text-xs text-muted-foreground mb-3">
                  Paste a share link, short code, or legacy JSON build code to import it.
                </p>
                <textarea
                  value={importCode}
                  onChange={(e) => { setImportCode(e.target.value); setImportError(null); setImportSuccess(null); }}
                  placeholder="Paste a share link or code here..."
                  className="w-full h-32 bg-background border border-border rounded-lg p-3 text-sm font-mono resize-none focus:outline-none focus:border-primary/50"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handlePaste}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Clipboard className="h-3.5 w-3.5" /> Paste from Clipboard
                  </button>
                  {importCode && (
                    <button
                      onClick={() => { setImportCode(""); setImportError(null); setImportSuccess(null); }}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-3.5 w-3.5" /> Clear
                    </button>
                  )}
                  <button
                    onClick={handleImport}
                    disabled={!importCode.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors ml-auto font-medium disabled:opacity-50"
                  >
                    <Upload className="h-3.5 w-3.5" /> Import Build
                  </button>
                </div>
              </div>

              {importError && (
                <div className="flex items-center gap-2 p-3 border border-red-500/30 bg-red-500/5 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                  <span className="text-sm text-red-400">{importError}</span>
                </div>
              )}

              {importSuccess && (
                <div className="flex items-center gap-2 p-3 border border-green-500/30 bg-green-500/5 rounded-lg">
                  <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-green-400">{importSuccess}</span>
                </div>
              )}

              {/* How it works */}
              <div className="border border-border rounded-xl p-5 bg-card">
                <h2 className="text-[10px] font-semibold tracking-wider text-muted-foreground mb-3">HOW TO IMPORT</h2>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Get a <strong className="text-foreground">share link</strong> or <strong className="text-foreground">code</strong> from someone</li>
                  <li>Paste it in the box above and click <strong className="text-foreground">Import Build</strong></li>
                  <li>The build will appear in your saved builds or loadouts</li>
                </ol>
                <div className="mt-3 p-2.5 bg-muted/20 rounded-lg">
                  <p className="text-[10px] text-muted-foreground">
                    <strong>Tip:</strong> You can also scan a QR code with your phone&apos;s camera — it opens the import link automatically.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
