import { MONO, rgb, VP_COLORS } from "../core/colors";
import { curvilinearVanishingPoints } from "../core/curvilinear";
import { getHorizon, horizonSegment, pointOnHorizon } from "../core/horizon";
import { paperSize } from "../core/paper";
import { buildScene } from "../core/scene";
import { escapeXml, fmt, segmentsToPath } from "../core/svg-path";
import { linearVanishingPoints } from "../core/vanishing";
import { applyDrag, type DragTarget } from "../state/actions";
import type { State } from "../types";

/*
 * Aperçu interactif : un SVG en coordonnées « feuille » (1 unité = 1 mm). Les poignées sont dessinées à
 * une taille constante à l'écran en les multipliant par `k` (mm par pixel écran).
 */

const NON_SCALING = ' vector-effect="non-scaling-stroke"';
const FONT = "Helvetica, Arial, sans-serif";
const HANDLE_FILL = "#2a313b";

const DRAG_TARGETS: Record<string, DragTarget> = {
  horizon: "horizon",
  rotate: "rotate",
  center: "center",
  radius: "radius",
  vp0: "vp0",
  vp1: "vp1",
  vp2: "vp2",
};

export interface Preview {
  /** Recadre la vue pour que tous les points restent visibles. */
  fit(): void;
  render(): void;
}

export interface PreviewHooks {
  /** Appelé à chaque mouvement de poignée, après mise à jour de l'état. */
  onDrag(): void;
  /** Appelé au relâchement : l'état est stable, on peut recadrer et sauvegarder. */
  onDragEnd(): void;
}

export function createPreview(svg: SVGSVGElement, state: State, hooks: PreviewHooks): Preview {
  let viewBox = { x: 0, y: 0, w: 300, h: 300 };
  let drag: DragTarget | null = null;

  function fit(): void {
    const { W, H } = paperSize(state.orient);
    const xs = [0, W];
    const ys = [0, H, state.hy];
    for (const v of [...linearVanishingPoints(state), ...curvilinearVanishingPoints(state)]) {
      xs.push(v.x);
      ys.push(v.y);
    }
    for (const q of [pointOnHorizon(state, -40), pointOnHorizon(state, W + 40)]) {
      xs.push(q.x);
      ys.push(q.y);
    }
    const x0 = Math.min(...xs);
    const x1 = Math.max(...xs);
    const y0 = Math.min(...ys);
    const y1 = Math.max(...ys);
    const pad = Math.max(x1 - x0, y1 - y0) * 0.07 + 14;
    viewBox = { x: x0 - pad, y: y0 - pad, w: x1 - x0 + 2 * pad, h: y1 - y0 + 2 * pad };
    svg.setAttribute("viewBox", [viewBox.x, viewBox.y, viewBox.w, viewBox.h].map(fmt).join(" "));
  }

  /** Millimètres de la feuille par pixel écran. */
  function mmPerPx(): number {
    const r = svg.getBoundingClientRect();
    if (!r.width || !r.height) return 1;
    return Math.max(viewBox.w / r.width, viewBox.h / r.height);
  }

  function render(): void {
    const scene = buildScene(state);
    const k = mmPerPx();
    const h: string[] = [];
    const hz = horizonSegment(state, viewBox.x, viewBox.y, viewBox.w, viewBox.h);

    // Fond : prolongements des rayons hors feuille, horizon pointillé, ombre et feuille.
    for (const g of scene.ghosts) {
      if (g.segs.length) {
        h.push(
          `<path d="${segmentsToPath(g.segs)}" stroke="${rgb(g.c)}" stroke-opacity="0.22" stroke-width="0.8" fill="none"${NON_SCALING}/>`,
        );
      }
    }
    if (hz) {
      h.push(
        `<line x1="${fmt(hz[0])}" y1="${fmt(hz[1])}" x2="${fmt(hz[2])}" y2="${fmt(hz[3])}" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="4 4" stroke-width="1" fill="none"${NON_SCALING}/>`,
      );
    }
    h.push(
      `<rect x="${fmt(1.5 * k)}" y="${fmt(2 * k)}" width="${scene.W}" height="${scene.H}" fill="#000" fill-opacity="0.14"/>`,
    );
    h.push(`<rect x="0" y="0" width="${scene.W}" height="${scene.H}" fill="#fff"/>`);

    // Contenu de la feuille.
    for (const g of scene.groups) {
      if (g.segs.length)
        h.push(
          `<path d="${segmentsToPath(g.segs)}" stroke="${rgb(g.c)}" stroke-width="${g.px}" fill="none"${NON_SCALING}/>`,
        );
    }
    if (scene.label) {
      h.push(
        `<text x="5" y="${scene.H - 4}" font-size="2.1" fill="#9aa3ad" font-family="${FONT}">${escapeXml(scene.label)}</text>`,
      );
    }
    h.push(
      `<rect x="0" y="0" width="${scene.W}" height="${scene.H}" fill="none" stroke="#000" stroke-opacity="0.25" stroke-width="1"${NON_SCALING}/>`,
    );

    // Poignées.
    h.push(...horizonHandles(hz, k, scene.W));
    h.push(...vanishingPointHandles(k));
    if (state.mode >= 4) h.push(...curvilinearHandles(k));

    svg.innerHTML = h.join("");
  }

  function horizonHandles(hz: ReturnType<typeof horizonSegment>, k: number, paperW: number): string[] {
    const out: string[] = [];
    // Zone de saisie large le long de l'horizon.
    if (hz) {
      out.push(
        `<line data-drag="horizon" x1="${fmt(hz[0])}" y1="${fmt(hz[1])}" x2="${fmt(hz[2])}" y2="${fmt(hz[3])}" stroke="transparent" stroke-width="26" style="cursor:move" pointer-events="stroke" fill="none"${NON_SCALING}/>`,
      );
    }
    // Poignée « H » à gauche de la feuille, poignée de rotation à droite, toutes deux sur l'horizon.
    const left = pointOnHorizon(state, -16 * k);
    const right = pointOnHorizon(state, paperW + 16 * k);
    out.push(
      `<g data-drag="horizon" style="cursor:move" transform="translate(${fmt(left.x)} ${fmt(left.y)}) rotate(${state.rot}) scale(${fmt(k)})"><circle r="22" fill="transparent"/><rect x="-13" y="-9" width="26" height="18" rx="9" fill="${HANDLE_FILL}"/><text font-size="11" fill="#fff" text-anchor="middle" dominant-baseline="central" font-family="${FONT}" font-weight="700">H</text></g>`,
      `<g data-drag="rotate" style="cursor:grab" transform="translate(${fmt(right.x)} ${fmt(right.y)}) scale(${fmt(k)})"><circle r="22" fill="transparent"/><circle r="12" fill="${HANDLE_FILL}" stroke="#fff" stroke-width="2"/><path d="M5.5 0A5.5 5.5 0 1 1 0 -5.5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><path d="M-0.5 -9L3 -5.5L-0.5 -2" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></g>`,
    );
    return out;
  }

  function vanishingPointHandles(k: number): string[] {
    return linearVanishingPoints(state).map((v) => {
      const color = rgb(state.color ? VP_COLORS[v.i] : MONO);
      const r = 12 * k;
      return `<g data-drag="vp${v.i}" style="cursor:move"><circle cx="${fmt(v.x)}" cy="${fmt(v.y)}" r="${fmt(r * 1.9)}" fill="transparent"/><circle cx="${fmt(v.x)}" cy="${fmt(v.y)}" r="${fmt(r)}" fill="${color}" stroke="#fff" stroke-width="2"${NON_SCALING}/><text x="${fmt(v.x)}" y="${fmt(v.y)}" font-size="${fmt(12 * k)}" fill="#fff" text-anchor="middle" dominant-baseline="central" font-family="${FONT}" font-weight="700">${v.i + 1}</text></g>`;
    });
  }

  function curvilinearHandles(k: number): string[] {
    const out = curvilinearVanishingPoints(state).map(
      (v) =>
        `<circle cx="${fmt(v.x)}" cy="${fmt(v.y)}" r="${fmt(5 * k)}" fill="${rgb(state.color ? VP_COLORS[v.i] : MONO)}" stroke="#fff" stroke-width="1.5"${NON_SCALING}/>`,
    );
    const h = getHorizon(state);
    const C = pointOnHorizon(state, state.cv.x);
    const reach = state.mode === 6 ? 2 : 1;
    const radiusHandle = { x: C.x + state.cv.r * reach * h.c, y: C.y + state.cv.r * reach * h.s };
    out.push(
      `<g data-drag="center" style="cursor:move" transform="translate(${fmt(C.x)} ${fmt(C.y)}) rotate(${state.rot}) scale(${fmt(k)})"><circle r="22" fill="transparent"/><circle r="12" fill="${HANDLE_FILL}" stroke="#fff" stroke-width="2"/><path d="M-6 0H6M0 -6V6" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></g>`,
      `<g data-drag="radius" style="cursor:ew-resize" transform="translate(${fmt(radiusHandle.x)} ${fmt(radiusHandle.y)}) rotate(${state.rot}) scale(${fmt(k)})"><circle r="22" fill="transparent"/><circle r="11" fill="${HANDLE_FILL}" stroke="#fff" stroke-width="2"/><path d="M-5.5 0H5.5M-3 -2.5L-5.5 0L-3 2.5M3 -2.5L5.5 0L3 2.5" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g>`,
    );
    return out;
  }

  /** Position du pointeur en coordonnées de la feuille (mm). */
  function toPaper(e: PointerEvent): { x: number; y: number } | null {
    const ctm = svg.getScreenCTM();
    if (!ctm) return null; // SVG pas encore affiché
    const p = svg.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    return p.matrixTransform(ctm.inverse());
  }

  svg.addEventListener("pointerdown", (e) => {
    const handle = (e.target as Element).closest("[data-drag]");
    const target = handle && DRAG_TARGETS[handle.getAttribute("data-drag") ?? ""];
    if (!target) return;
    drag = target;
    try {
      svg.setPointerCapture(e.pointerId);
    } catch {
      // Capture indisponible : le glisser fonctionne quand même tant que le pointeur reste sur le SVG.
    }
    e.preventDefault();
  });
  svg.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const point = toPaper(e);
    if (!point) return;
    applyDrag(state, drag, point);
    hooks.onDrag();
  });
  const endDrag = () => {
    if (!drag) return;
    drag = null;
    hooks.onDragEnd();
  };
  svg.addEventListener("pointerup", endDrag);
  svg.addEventListener("pointercancel", endDrag);

  return { fit, render };
}
