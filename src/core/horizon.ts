import type { Point, Seg, State } from "../types";
import { clip, FAR } from "./clip";
import { paperSize } from "./paper";

/**
 * L'horizon passe par le pivot (milieu de la feuille, hauteur `hy`) avec l'angle `rot`.
 * `c` et `s` sont le cosinus et le sinus de cet angle.
 */
export interface Horizon {
  cx: number;
  cy: number;
  c: number;
  s: number;
}

export function getHorizon(state: Pick<State, "orient" | "hy" | "rot">): Horizon {
  const a = (state.rot * Math.PI) / 180;
  return { cx: paperSize(state.orient).W / 2, cy: state.hy, c: Math.cos(a), s: Math.sin(a) };
}

/**
 * Point de l'horizon d'abscisse `x`, comptée comme si l'horizon était à plat
 * (c'est ainsi que sont stockées les positions des PF 1 et 2 et du centre curviligne).
 */
export function pointOnHorizon(state: Pick<State, "orient" | "hy" | "rot">, x: number): Point {
  const h = getHorizon(state);
  const u = x - h.cx;
  return { x: h.cx + u * h.c, y: h.cy + u * h.s };
}

/** Portion de l'horizon visible dans le rectangle (rx, ry, rw, rh), en coordonnées absolues. */
export function horizonSegment(
  state: Pick<State, "orient" | "hy" | "rot">,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
): Seg | null {
  const h = getHorizon(state);
  const s = clip(h.cx - h.c * FAR - rx, h.cy - h.s * FAR - ry, h.cx + h.c * FAR - rx, h.cy + h.s * FAR - ry, rw, rh);
  return s ? [s[0] + rx, s[1] + ry, s[2] + rx, s[3] + ry] : null;
}
