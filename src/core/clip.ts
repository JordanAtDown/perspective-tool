import type { Seg } from "../types";

/**
 * Découpe un segment au rectangle [0, W] × [0, H] (algorithme de Liang-Barsky).
 * Renvoie `null` si le segment est entièrement dehors.
 */
export function clip(x1: number, y1: number, x2: number, y2: number, W: number, H: number): Seg | null {
  let t0 = 0;
  let t1 = 1;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const p = [-dx, dx, -dy, dy];
  const q = [x1, W - x1, y1, H - y1];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return null;
    } else {
      const r = q[i] / p[i];
      if (p[i] < 0) {
        if (r > t1) return null;
        if (r > t0) t0 = r;
      } else {
        if (r < t0) return null;
        if (r < t1) t1 = r;
      }
    }
  }
  if (t1 - t0 < 1e-9) return null;
  return [x1 + t0 * dx, y1 + t0 * dy, x1 + t1 * dx, y1 + t1 * dy];
}

/** Longueur « infinie » utilisée pour prolonger les droites avant de les découper. */
export const FAR = 50000;
