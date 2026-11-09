import { getHorizon, pointOnHorizon } from "../core/horizon";
import { paperSize } from "../core/paper";
import type { Mode, Orientation, Point, State } from "../types";

/*
 * Toutes les modifications de l'état passent par ces fonctions : elles gardent les réglages cohérents
 * (bornes, pivot de l'inclinaison…). Elles modifient `state` en place et ne touchent pas au DOM.
 */

const round = Math.round;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** Rayon minimal du cercle curviligne, en mm. */
export const MIN_RADIUS = 15;

/** Change l'inclinaison de l'horizon ; le PF 3 tourne avec la scène autour du pivot. */
export function setRotation(state: State, deg: number): void {
  deg = clamp(deg, -60, 60);
  const h = getHorizon(state);
  const d = ((deg - state.rot) * Math.PI) / 180;
  const dx = state.vp[2].x - h.cx;
  const dy = state.vp[2].y - h.cy;
  state.vp[2].x = h.cx + dx * Math.cos(d) - dy * Math.sin(d);
  state.vp[2].y = h.cy + dx * Math.sin(d) + dy * Math.cos(d);
  state.rot = deg;
}

/** Garde tous les réglages dans des bornes raisonnables, relatives à la taille de la feuille. */
export function clampAll(state: State): void {
  const { W, H } = paperSize(state.orient);
  state.hy = clamp(state.hy, -3 * H, 4 * H);
  for (const v of state.vp) v.x = clamp(v.x, -6 * W, 7 * W);
  state.vp[2].y = clamp(state.vp[2].y, -8 * H, 9 * H);
  state.cv.r = clamp(state.cv.r, MIN_RADIUS, 3000);
  state.cv.x = clamp(state.cv.x, -6 * W, 7 * W);
}

/** Passe à un autre nombre de points de fuite en repartant d'une disposition lisible. */
export function setMode(state: State, mode: Mode): void {
  const { W, H } = paperSize(state.orient);
  const prev = state.mode;
  state.mode = mode;
  if (mode >= 4) {
    state.lastCurv = mode;
    if (prev < 4 || (prev === 6) !== (mode === 6)) {
      state.rot = 0;
      state.hy = round(H / 2);
      state.cv.x = round(W / 2);
      state.cv.r = round(mode === 6 ? Math.min(W / 4, H / 2) - 4 : Math.min(W, H) / 2 - 5);
    }
  } else {
    state.lastLin = mode;
    if (prev >= 4) state.hy = round(H * 0.55);
  }
  if (mode === 1 && (state.vp[0].x < 0 || state.vp[0].x > W)) state.vp[0].x = W / 2;
  if (mode >= 2 && mode <= 3 && state.vp[0].x >= 0 && state.vp[0].x <= W && state.vp[1].x <= state.vp[0].x + W * 0.5) {
    state.vp[0].x = round(-0.6 * W);
    state.vp[1].x = round(1.6 * W);
  }
}

/** Passe en portrait ou paysage en gardant les positions proportionnelles à la feuille. */
export function setOrientation(state: State, orient: Orientation): void {
  if (orient === state.orient) return;
  const a = paperSize(state.orient);
  state.orient = orient;
  const b = paperSize(orient);
  const sx = b.W / a.W;
  const sy = b.H / a.H;
  state.hy = round(state.hy * sy);
  for (const p of state.vp) p.x = round(p.x * sx);
  state.vp[2].y = round(state.vp[2].y * sy);
  state.cv.x = round(state.cv.x * sx);
  state.cv.r = round(state.cv.r * Math.min(sx, sy));
}

/** Ce que l'utilisateur est en train de déplacer dans l'aperçu. */
export type DragTarget = "horizon" | "rotate" | "center" | "radius" | "vp0" | "vp1" | "vp2";

/** Applique le déplacement de la poignée `target` jusqu'au point `p` (coordonnées de la feuille, en mm). */
export function applyDrag(state: State, target: DragTarget, p: Point): void {
  const h = getHorizon(state);
  switch (target) {
    case "horizon":
      state.hy = round(p.y - ((p.x - h.cx) * h.s) / h.c);
      break;
    case "rotate": {
      let a = (Math.atan2(p.y - h.cy, p.x - h.cx) * 180) / Math.PI;
      if (Math.abs(a) > 90) a = a > 0 ? a - 180 : a + 180;
      a = round(a);
      if (Math.abs(a) < 2) a = 0; // aimant sur l'horizontale
      setRotation(state, a);
      break;
    }
    case "center": {
      const u = (p.x - h.cx) / h.c;
      state.cv.x = round(h.cx + u);
      state.hy = round(p.y - u * h.s);
      break;
    }
    case "radius": {
      const C = pointOnHorizon(state, state.cv.x);
      const along = (p.x - C.x) * h.c + (p.y - C.y) * h.s;
      state.cv.r = round(Math.max(MIN_RADIUS, along / (state.mode === 6 ? 2 : 1)));
      break;
    }
    case "vp0":
    case "vp1": {
      const u = (p.x - h.cx) / h.c;
      state.vp[target === "vp0" ? 0 : 1].x = round(h.cx + u);
      state.hy = round(p.y - u * h.s);
      break;
    }
    case "vp2":
      state.vp[2].x = round(p.x);
      state.vp[2].y = round(p.y);
      break;
  }
  state.preset = null;
  clampAll(state);
}
