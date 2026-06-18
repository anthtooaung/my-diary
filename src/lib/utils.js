import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Parse a diary date string into a valid Date object.
 * Handles both legacy format ("2026-06-18 14:30:00") and ISO 8601.
 */
export function parseDate(str) {
  if (!str) return new Date(NaN)
  // Normalize space-separated datetime to ISO 8601
  const iso = str.includes('T') ? str : str.replace(' ', 'T') + 'Z'
  return new Date(iso)
}
