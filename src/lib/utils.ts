import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ensureMillisecondTimestamp(
  ts: number | null | undefined,
): number {
  if (ts === null || ts === undefined) return Date.now();
  // 10,000,000,000 未満なら秒単位 (unix timestamp) とみなす
  if (ts < 10000000000) {
    return ts * 1000;
  }
  return ts;
}
