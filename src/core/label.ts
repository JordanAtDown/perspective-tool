import type { State } from "../types";

const round = (v: number) => Math.round(v);

/** Légende imprimée en bas de page : résume les réglages pour pouvoir refaire la même grille. */
export function labelText(state: State): string {
  const horizon = `horizon à ${round(state.hy)} mm du haut${state.rot ? ` incliné de ${state.rot}°` : ""}`;
  if (state.mode >= 4) {
    return `${state.mode} points de fuite (curviligne) · ${horizon} · centre ${round(state.cv.x)} · rayon ${round(state.cv.r)} (mm)`;
  }
  let s = `${state.mode} ${state.mode > 1 ? "points" : "point"} de fuite · ${horizon} · PF1 x ${round(state.vp[0].x)}`;
  if (state.mode >= 2) s += ` · PF2 x ${round(state.vp[1].x)}`;
  if (state.mode === 3) s += ` · PF3 x ${round(state.vp[2].x)} y ${round(state.vp[2].y)}`;
  return `${s} (mm)`;
}
