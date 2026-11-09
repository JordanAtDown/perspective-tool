import type { State, VanishingPoint } from "../types";
import { pointOnHorizon } from "./horizon";

/** Points de fuite de la perspective classique (vide en mode curviligne), en coordonnées de la feuille. */
export function linearVanishingPoints(state: State): VanishingPoint[] {
  if (state.mode >= 4) return [];
  const p0 = pointOnHorizon(state, state.vp[0].x);
  const out: VanishingPoint[] = [{ ...p0, i: 0 }];
  if (state.mode >= 2) {
    const p1 = pointOnHorizon(state, state.vp[1].x);
    out.push({ ...p1, i: 1 });
  }
  if (state.mode === 3) out.push({ x: state.vp[2].x, y: state.vp[2].y, i: 2 });
  return out;
}
