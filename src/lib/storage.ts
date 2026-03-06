import { Election, AdminCredentials } from "@/types";

const ELECTIONS_KEY = "evm_elections";
const ACTIVE_ELECTION_KEY = "evm_active_election_id";
const POLLING_ELECTION_KEY = "evm_polling_election_id";
const ROLE_KEY = "evm_role";
const ADMIN_CREDS_KEY = "evm_admin_creds";
const THEME_KEY = "evm_theme";

export function loadAdminCredentials(): AdminCredentials {
  const raw = localStorage.getItem(ADMIN_CREDS_KEY);
  if (raw) { try { return JSON.parse(raw) as AdminCredentials; } catch { } }
  return { adminId: "admin", password: "0000" };
}

export function saveAdminCredentials(creds: AdminCredentials): void {
  localStorage.setItem(ADMIN_CREDS_KEY, JSON.stringify(creds));
}

export function loadAllElections(): Election[] {
  const raw = localStorage.getItem(ELECTIONS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as Election[]; } catch { return []; }
}

export function saveAllElections(elections: Election[]): void {
  localStorage.setItem(ELECTIONS_KEY, JSON.stringify(elections));
}

export function loadElectionById(id: string): Election | null {
  return loadAllElections().find((e) => e.id === id) ?? null;
}

export function upsertElection(election: Election): void {
  const all = loadAllElections();
  const idx = all.findIndex((e) => e.id === election.id);
  if (idx >= 0) all[idx] = election;
  else all.push(election);
  saveAllElections(all);
}

export function deleteElection(id: string): void {
  saveAllElections(loadAllElections().filter((e) => e.id !== id));
  if (loadActiveElectionId() === id) clearActiveElection();
}

export function loadActiveElectionId(): string | null {
  return localStorage.getItem(ACTIVE_ELECTION_KEY);
}

export function saveActiveElectionId(id: string): void {
  localStorage.setItem(ACTIVE_ELECTION_KEY, id);
}

export function clearActiveElection(): void {
  localStorage.removeItem(ACTIVE_ELECTION_KEY);
}

export function loadElection(): Election | null {
  const id = loadActiveElectionId();
  if (!id) return null;
  return loadElectionById(id);
}

export function saveElection(election: Election): void {
  upsertElection(election);
}

export function savePollingElectionId(id: string): void {
  sessionStorage.setItem(POLLING_ELECTION_KEY, id);
}

export function loadPollingElectionId(): string | null {
  return sessionStorage.getItem(POLLING_ELECTION_KEY);
}

export function clearPollingElectionId(): void {
  sessionStorage.removeItem(POLLING_ELECTION_KEY);
}

export function loadTheme(): "dark" | "light" {
  return (localStorage.getItem(THEME_KEY) as "dark" | "light") ?? "dark";
}

export function saveTheme(theme: "dark" | "light"): void {
  localStorage.setItem(THEME_KEY, theme);
}

export function saveRole(role: string): void {
  sessionStorage.setItem(ROLE_KEY, role);
}

export function loadRole(): string {
  return sessionStorage.getItem(ROLE_KEY) || "none";
}

export function clearRole(): void {
  sessionStorage.removeItem(ROLE_KEY);
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}