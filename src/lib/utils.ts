import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseStudentIds(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s.length > 0);
}

export function formatCount(n: number): string {
  return n.toLocaleString("en-IN");
}

export function percentOf(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}