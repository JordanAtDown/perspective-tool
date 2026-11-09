import type { Seg } from "../types";
import { clip, FAR } from "./clip";

/** Famille de droites parallèles de direction (dx, dy), espacées de `step`, passant par (ox, oy). */
export function parallelFamily(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  step: number,
  W: number,
  H: number,
  skipCenter: boolean,
): Seg[] {
  const nx = -dy;
  const ny = dx;
  let lo = Infinity;
  let hi = -Infinity;
  for (const [px, py] of [
    [0, 0],
    [W, 0],
    [0, H],
    [W, H],
  ]) {
    const d = (px - ox) * nx + (py - oy) * ny;
    lo = Math.min(lo, d);
    hi = Math.max(hi, d);
  }
  const out: Seg[] = [];
  for (let k = Math.ceil(lo / step); k <= Math.floor(hi / step); k++) {
    if (skipCenter && k === 0) continue;
    const px = ox + nx * k * step;
    const py = oy + ny * k * step;
    const s = clip(px - dx * FAR, py - dy * FAR, px + dx * FAR, py + dy * FAR, W, H);
    if (s) out.push(s);
  }
  return out;
}

export interface Rays {
  /** Rayons découpés à la feuille. */
  segs: Seg[];
  /** Pour un point hors feuille : le trait entre le point et l'endroit où le rayon entre dans la feuille. */
  ghosts: Seg[];
}

/** Faisceau de `n` droites partant du point de fuite (vx, vy), limité à ce qui touche la feuille. */
export function rays(vx: number, vy: number, n: number, W: number, H: number): Rays {
  const inside = vx >= 0 && vx <= W && vy >= 0 && vy <= H;
  const angles: number[] = [];
  if (inside) {
    // Point sur la feuille : faisceau sur 360°.
    const m = Math.max(n, 8);
    for (let i = 0; i < m; i++) angles.push((i * 2 * Math.PI) / m);
  } else {
    // Point hors feuille : on répartit les rayons dans le cône qui couvre la feuille.
    const center = Math.atan2(H / 2 - vy, W / 2 - vx);
    let lo = Infinity;
    let hi = -Infinity;
    for (const [px, py] of [
      [0, 0],
      [W, 0],
      [0, H],
      [W, H],
    ]) {
      let a = Math.atan2(py - vy, px - vx) - center;
      while (a > Math.PI) a -= 2 * Math.PI;
      while (a <= -Math.PI) a += 2 * Math.PI;
      lo = Math.min(lo, a);
      hi = Math.max(hi, a);
    }
    for (let j = 1; j <= n; j++) angles.push(center + lo + (j * (hi - lo)) / (n + 1));
  }

  const segs: Seg[] = [];
  const ghosts: Seg[] = [];
  for (const a of angles) {
    const s = clip(vx, vy, vx + Math.cos(a) * FAR, vy + Math.sin(a) * FAR, W, H);
    if (s) {
      segs.push(s);
      if (!inside) ghosts.push([vx, vy, s[0], s[1]]);
    }
  }
  return { segs, ghosts };
}
