import type { HistoryRecord } from "./generator";

const HISTORY_KEY = "quickkey-history";
const SETTINGS_KEY = "quickkey-settings";
const LIMIT = 50;

export function loadHistory(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(history: HistoryRecord[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, LIMIT)));
}

export function pushHistory(record: HistoryRecord): HistoryRecord[] {
  const current = loadHistory();
  const next = [record, ...current].slice(0, LIMIT);
  saveHistory(next);
  return next;
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function loadSettings<T>(fallback: T): T {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as Partial<T>) };
  } catch {
    return fallback;
  }
}

export function saveSettings<T>(settings: T): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
