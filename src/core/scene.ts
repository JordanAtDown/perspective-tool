import type { Ghost, Group, Scene, Seg, State } from "../types";
import { GRID, HORIZON, MONO, mix, PARALLELS, VP_COLORS } from "./colors";
import { curvilinearGroups, curvilinearVanishingPoints } from "./curvilinear";
import { getHorizon, horizonSegment, pointOnHorizon } from "./horizon";
import { labelText } from "./label";
import { parallelFamily, rays } from "./lines";
import { paperSize } from "./paper";
import { linearVanishingPoints } from "./vanishing";

/** Grille de carreaux de fond, centrée sur le milieu de la feuille. */
function gridSegments(grid: number, W: number, H: number): Seg[] {
  const segs: Seg[] = [];
  for (let x = (W / 2) % grid; x <= W + 1e-6; x += grid) segs.push([x, 0, x, H]);
  for (let y = (H / 2) % grid; y <= H + 1e-6; y += grid) segs.push([0, y, W, y]);
  return segs;
}

/** Verticales (et horizontales en mode 1 point), parallèles à l'horizon tourné. */
function parallelSegments(state: State, W: number, H: number): Seg[] {
  const h = getHorizon(state);
  const origin = state.mode === 1 ? pointOnHorizon(state, state.vp[0].x) : { x: h.cx, y: h.cy };
  let segs = parallelFamily(origin.x, origin.y, -h.s, h.c, state.par, W, H, false);
  if (state.mode === 1) segs = segs.concat(parallelFamily(origin.x, origin.y, h.c, h.s, state.par, W, H, true));
  return segs;
}

/** Croix de repère sur chaque point de fuite qui tombe sur la feuille. */
function vanishingPointMarks(state: State, W: number, H: number): Seg[] {
  const marks: Seg[] = [];
  for (const v of [...linearVanishingPoints(state), ...curvilinearVanishingPoints(state)]) {
    if (v.x >= 0 && v.x <= W && v.y >= 0 && v.y <= H) {
      marks.push([v.x - 2, v.y, v.x + 2, v.y], [v.x, v.y - 2, v.x, v.y + 2]);
    }
  }
  return marks;
}

/**
 * Calcule tout ce qui est dessiné sur la feuille, en millimètres.
 * La même scène alimente l'aperçu, l'export SVG et l'export PDF.
 */
export function buildScene(state: State): Scene {
  const { W, H } = paperSize(state.orient);
  const lineOpacity = state.L.lines.op / 100;
  const horizonOpacity = state.L.hor.op / 100;
  const gridOpacity = state.L.grid.op / 100;
  let groups: Group[] = [];
  const ghosts: Ghost[] = [];

  if (state.L.grid.on && state.grid) {
    groups.push({ c: mix(GRID, gridOpacity), w: 0.12, px: 0.6, segs: gridSegments(state.grid, W, H) });
  }

  if (state.L.lines.on && state.par && state.mode < 3) {
    groups.push({ c: mix(PARALLELS, lineOpacity), w: 0.18, px: 0.9, segs: parallelSegments(state, W, H) });
  }

  if (state.L.lines.on) {
    for (const v of linearVanishingPoints(state)) {
      const r = rays(v.x, v.y, state.n, W, H);
      const base = state.color ? VP_COLORS[v.i] : MONO;
      groups.push({ c: mix(base, lineOpacity), w: 0.2, px: 1, segs: r.segs });
      ghosts.push({ c: base, segs: r.ghosts });
    }
  }

  if (state.mode >= 4) groups = groups.concat(curvilinearGroups(state, W, H));

  const horizon = horizonSegment(state, 0, 0, W, H);
  if (horizon && state.L.hor.on) groups.push({ c: mix(HORIZON, horizonOpacity), w: 0.35, px: 1.8, segs: [horizon] });

  const marks = vanishingPointMarks(state, W, H);
  if (marks.length && state.L.hor.on) groups.push({ c: mix(HORIZON, horizonOpacity), w: 0.3, px: 1.6, segs: marks });

  return { W, H, groups, ghosts, label: state.label ? labelText(state) : "" };
}
