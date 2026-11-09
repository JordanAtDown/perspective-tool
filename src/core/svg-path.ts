import type { Seg } from "../types";

/** Arrondi à 2 décimales, sans zéros inutiles. */
export const fmt = (v: number): number => +v.toFixed(2);

/** Chemin SVG (attribut `d`) qui trace tous les segments. */
export function segmentsToPath(segs: Seg[]): string {
  return segs.map((s) => `M${fmt(s[0])} ${fmt(s[1])}L${fmt(s[2])} ${fmt(s[3])}`).join("");
}

export function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}
