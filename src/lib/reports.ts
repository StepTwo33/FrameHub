export interface IssueReport {
  id: string;
  timestamp: number;
  reporter: string;
  itemType: "weapon" | "mod" | "warframe" | "companion" | "archon_shard" | "other";
  itemName: string;
  itemId: string;
  issues: {
    doesNotExist: boolean;
    wrongStats: boolean;
    missingData: boolean;
    wrongCost: boolean;
    wrongRank: boolean;
    wrongCategory: boolean;
    wrongPolarity: boolean;
    wrongRarity: boolean;
  };
  statDiscrepancies: { stat: string; currentValue: string; expectedValue: string }[];
  comment: string;
  status: "open" | "resolved" | "wontfix";
}

const STORAGE_KEY = "framehub_issue_reports";

export function getReports(): IssueReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveReport(report: IssueReport): void {
  const reports = getReports();
  reports.push(report);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function updateReport(id: string, updates: Partial<IssueReport>): void {
  const reports = getReports();
  const idx = reports.findIndex((r) => r.id === id);
  if (idx >= 0) {
    reports[idx] = { ...reports[idx], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }
}

export function deleteReport(id: string): void {
  const reports = getReports().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function exportReports(): string {
  return JSON.stringify(getReports(), null, 2);
}

export function importReports(json: string): number {
  try {
    const incoming: IssueReport[] = JSON.parse(json);
    if (!Array.isArray(incoming)) return 0;
    const existing = getReports();
    const existingIds = new Set(existing.map((r) => r.id));
    const newReports = incoming.filter((r) => r.id && !existingIds.has(r.id));
    const merged = [...existing, ...newReports];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return newReports.length;
  } catch {
    return 0;
  }
}

export function generateReportId(): string {
  return `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
