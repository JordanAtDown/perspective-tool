import type { Group, Point, Seg, State, VanishingPoint } from "../types";
import { clip } from "./clip";
import { HORIZON, MONO, mix, VP_COLORS } from "./colors";
import { getHorizon, pointOnHorizon } from "./horizon";

/**
 * Perspective curviligne : projection stéréographique de la sphère de vision.
 * Les droites de l'espace deviennent des arcs de cercle passant par deux points de fuite opposés.
 */

/** Centres des cercles : un seul, ou deux côte à côte (devant / derrière) en mode 6. */
export function curvilinearCenters(state: State): [number, number][] {
  const h = getHorizon(state);
  const C = pointOnHorizon(state, state.cv.x);
  const R = state.cv.r;
  return state.mode === 6
    ? [
        [C.x - R * h.c, C.y - R * h.s],
        [C.x + R * h.c, C.y + R * h.s],
      ]
    : [[C.x, C.y]];
}

/** Points de fuite curvilignes : 4 sur le cercle (+ 1 au centre à partir du mode 5). */
export function curvilinearVanishingPoints(state: State): VanishingPoint[] {
  if (state.mode < 4) return [];
  const h = getHorizon(state);
  const R = state.cv.r;
  const out: VanishingPoint[] = [];
  const place = (o: [number, number], u: number, v: number): Point => ({
    x: o[0] + u * h.c - v * h.s,
    y: o[1] + u * h.s + v * h.c,
  });
  for (const o of curvilinearCenters(state)) {
    // [u, v, indice de couleur] : gauche/droite sur l'horizon, haut/bas sur la verticale.
    for (const [u, v, i] of [
      [-R, 0, 0],
      [R, 0, 0],
      [0, -R, 2],
      [0, R, 2],
    ]) {
      out.push({ ...place(o, u, v), i });
    }
    if (state.mode >= 5) out.push({ ...place(o, 0, 0), i: 1 });
  }
  return out;
}

/** Nombre de segments qui approchent chaque arc de cercle. */
const ARC_SEGMENTS = 48;
/** Nombre de segments qui approchent le cercle de bord. */
const BORDER_SEGMENTS = 120;

/** Groupes de traits d'une perspective curviligne (modes 4 à 6), déjà découpés à la feuille. */
export function curvilinearGroups(state: State, W: number, H: number): Group[] {
  const h = getHorizon(state);
  const R = state.cv.r;
  const n = state.n;
  const place = (o: [number, number], u: number, v: number): [number, number] => [
    o[0] + u * h.c - v * h.s,
    o[1] + u * h.s + v * h.c,
  ];
  const pushPolyline = (pts: [number, number][], into: Seg[]) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const q = clip(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], W, H);
      if (q) into.push(q);
    }
  };

  const horizontalArcs: Seg[] = [];
  const verticalArcs: Seg[] = [];
  const radials: Seg[] = [];
  const border: Seg[] = [];

  for (const o of curvilinearCenters(state)) {
    for (let k = 1; k <= n; k++) {
      const phi = -Math.PI / 2 + (k * Math.PI) / (n + 1);
      const sp = Math.sin(phi);
      const cp = Math.cos(phi);
      const ax: [number, number][] = [];
      const ay: [number, number][] = [];
      for (let j = 0; j <= ARC_SEGMENTS; j++) {
        const t = (Math.PI * j) / ARC_SEGMENTS;
        const X = Math.cos(t);
        const Y = Math.sin(t) * sp;
        const Z = Math.sin(t) * cp;
        const d = 1 + Z;
        ax.push(place(o, (R * X) / d, (R * Y) / d));
        ay.push(place(o, (R * Y) / d, (R * X) / d));
      }
      pushPolyline(ax, horizontalArcs);
      pushPolyline(ay, verticalArcs);
    }
    if (state.mode >= 5) {
      for (let m = 0; m < 2 * n; m++) {
        const a = (m * Math.PI) / n;
        const e = place(o, R * Math.cos(a), R * Math.sin(a));
        const q = clip(o[0], o[1], e[0], e[1], W, H);
        if (q) radials.push(q);
      }
    }
    const circle: [number, number][] = [];
    for (let z = 0; z <= BORDER_SEGMENTS; z++) {
      const g = (z * 2 * Math.PI) / BORDER_SEGMENTS;
      circle.push(place(o, R * Math.cos(g), R * Math.sin(g)));
    }
    pushPolyline(circle, border);
  }

  const lineOpacity = state.L.lines.op / 100;
  const horizonOpacity = state.L.hor.op / 100;
  const color = (i: number) => mix(state.color ? VP_COLORS[i] : MONO, lineOpacity);
  const groups: Group[] = [];
  if (state.L.lines.on) {
    groups.push(
      { c: color(0), w: 0.2, px: 1, segs: horizontalArcs },
      { c: color(2), w: 0.2, px: 1, segs: verticalArcs },
    );
    if (radials.length) groups.push({ c: color(1), w: 0.2, px: 1, segs: radials });
  }
  if (state.L.hor.on) groups.push({ c: mix(HORIZON, horizonOpacity), w: 0.25, px: 1.3, segs: border });
  return groups;
}
