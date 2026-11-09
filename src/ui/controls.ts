import { pointOnHorizon } from "../core/horizon";
import { paperSize } from "../core/paper";
import { setMode, setOrientation, setRotation } from "../state/actions";
import type { LayerKey, Mode, State } from "../types";
import { $, $$, child } from "./dom";
import { whereX, whereY } from "./format";
import { EYE, EYE_OFF } from "./icons";
import { bindPresetsPanel, syncPresetsPanel } from "./presets-panel";

/** `update(refit, keepPreset)` : applique les bornes, redessine, synchronise les contrôles et sauvegarde. */
export type Update = (refit: boolean, keepPreset?: boolean) => void;

const MODE_NOTES: Record<Mode, string> = {
  1: "Vue de face : un point au centre de la scène.",
  2: "Vue d'angle : deux points sur l'horizon.",
  3: "Vue d'angle avec plongée ou contre-plongée.",
  4: "Curviligne : 2 points sur l'horizon et 2 verticaux, les lignes deviennent des arcs.",
  5: "Fisheye : demi-sphère, 4 points sur le cercle et 1 au centre.",
  6: "Sphère complète : deux cercles, devant et derrière.",
};

const round = Math.round;

/* ---------- Synchronisation état → page ---------- */

function setSegmented(id: string, value: string | number): void {
  for (const b of $$("button", $(id))) b.setAttribute("aria-pressed", String(b.dataset.v === String(value)));
}

/** Met à jour un champ numérique, sauf si l'utilisateur est en train de le saisir. */
function setInputValue(id: string, value: number): void {
  const input = $<HTMLInputElement>(id);
  if (document.activeElement !== input) input.value = String(round(value));
}

export function syncControls(state: State): void {
  const { W, H } = paperSize(state.orient);
  const curvilinear = state.mode >= 4;

  // Type, nombre de points, format.
  setSegmented("mode", state.mode);
  setSegmented("family", curvilinear ? "curv" : "lin");
  for (const b of $$("#mode button")) b.hidden = (b.dataset.f === "curv") !== curvilinear;
  setSegmented("orient", state.orient);
  setSegmented("grid", state.grid);
  $("modenote").textContent = MODE_NOTES[state.mode];
  syncPresetsPanel(state);

  // Position.
  const hy = $<HTMLInputElement>("hy");
  hy.min = String(round(-0.6 * H));
  hy.max = String(round(1.6 * H));
  hy.value = String(state.hy);
  $("hyv").textContent = `${round(state.hy)} mm du haut`;
  $<HTMLInputElement>("rot").value = String(state.rot);
  $("rotv").textContent =
    state.rot === 0
      ? "à plat"
      : `${Math.abs(state.rot)}°, ${state.rot > 0 ? "descend vers la droite" : "monte vers la droite"}`;

  // Tracé.
  $<HTMLInputElement>("n").value = String(state.n);
  $("nv").textContent = String(state.n);
  $<HTMLInputElement>("par").value = String(state.par);
  $("parv").textContent = state.par ? `${state.par} mm` : "aucune";
  $("parlbl").textContent = state.mode === 1 ? "Verticales et horizontales" : "Verticales";
  $("parrow").hidden = state.mode >= 3;
  $<HTMLInputElement>("color").checked = state.color;
  $<HTMLInputElement>("label").checked = state.label;

  // Calques.
  for (const el of $$(".layer")) {
    const layer = state.L[el.dataset.l as LayerKey];
    const name = child(el, ".lname").textContent.toLowerCase();
    el.classList.toggle("off", !layer.on);
    const eye = child(el, ".eye");
    eye.innerHTML = layer.on ? EYE : EYE_OFF;
    eye.setAttribute("aria-pressed", String(!layer.on));
    eye.setAttribute("aria-label", `${layer.on ? "Masquer" : "Afficher"} ${name}`);
    child(el, ".op").textContent = `${layer.op} %`;
    const [less, more] = $$<HTMLButtonElement>(".step", el);
    less.disabled = layer.op <= 10;
    more.disabled = layer.op >= 100;
  }
  $("gridrow").hidden = !state.L.grid.on;

  // Champs numériques des points de fuite.
  for (const el of $$("#vpfields .vp")) {
    el.hidden = el.hasAttribute("data-c") ? !curvilinear : curvilinear || Number(el.dataset.i) >= state.mode;
  }
  setInputValue("cvx", state.cv.x);
  setInputValue("cvr", state.cv.r);
  $("cvxd").textContent = "le long de l'horizon";
  setInputValue("vp0x", state.vp[0].x);
  setInputValue("vp1x", state.vp[1].x);
  setInputValue("vp2x", state.vp[2].x);
  setInputValue("vp2y", state.vp[2].y);
  $("vp0d").textContent = whereX(pointOnHorizon(state, state.vp[0].x).x, W);
  $("vp1d").textContent = whereX(pointOnHorizon(state, state.vp[1].x).x, W);
  $("vp2d").textContent = whereY(state.vp[2].y, H);
}

/* ---------- Réactions de la page → état ---------- */

function bindSegmented(id: string, onPick: (value: string) => void): void {
  $(id).addEventListener("click", (e) => {
    const b = (e.target as Element).closest<HTMLElement>("button");
    if (b?.dataset.v !== undefined) onPick(b.dataset.v);
  });
}

/** Champ numérique en mm : applique la valeur saisie, si valide, à la validation du champ. */
function bindNumber(id: string, apply: (value: number) => void, update: Update): void {
  $<HTMLInputElement>(id).addEventListener("change", (e) => {
    const v = parseFloat((e.target as HTMLInputElement).value);
    if (Number.isFinite(v)) apply(round(v));
    update(true);
  });
}

export function bindControls(state: State, update: Update): void {
  bindPresetsPanel(state, () => update(true, true));

  bindSegmented("family", (v) => {
    const current = state.mode >= 4 ? "curv" : "lin";
    if (v === current) return;
    setMode(state, v === "curv" ? state.lastCurv : state.lastLin);
    update(true);
  });
  bindSegmented("mode", (v) => {
    setMode(state, Number(v) as Mode);
    update(true);
  });
  bindSegmented("orient", (v) => {
    setOrientation(state, v === "portrait" ? "portrait" : "landscape");
    update(true);
  });
  bindSegmented("grid", (v) => {
    state.grid = Number(v);
    update(false, true);
  });

  const hy = $<HTMLInputElement>("hy");
  hy.addEventListener("input", () => {
    state.hy = Number(hy.value);
    update(false);
  });
  hy.addEventListener("change", () => update(true));
  const rot = $<HTMLInputElement>("rot");
  rot.addEventListener("input", () => {
    setRotation(state, Number(rot.value));
    update(false);
  });
  rot.addEventListener("change", () => update(true));
  $("flat").addEventListener("click", () => {
    setRotation(state, 0);
    update(true);
  });

  const n = $<HTMLInputElement>("n");
  n.addEventListener("input", () => {
    state.n = Number(n.value);
    update(false, true);
  });
  const par = $<HTMLInputElement>("par");
  par.addEventListener("input", () => {
    state.par = Number(par.value);
    update(false, true);
  });
  const color = $<HTMLInputElement>("color");
  color.addEventListener("change", () => {
    state.color = color.checked;
    update(false, true);
  });
  const label = $<HTMLInputElement>("label");
  label.addEventListener("change", () => {
    state.label = label.checked;
    update(false, true);
  });

  $("layers").addEventListener("click", (e) => {
    const b = (e.target as Element).closest<HTMLElement>("button");
    if (!b) return;
    const layerEl = b.closest<HTMLElement>(".layer");
    if (!layerEl) return;
    const layer = state.L[layerEl.dataset.l as LayerKey];
    if (b.classList.contains("eye")) {
      layer.on = !layer.on;
    } else {
      layer.op = Math.max(10, Math.min(100, layer.op + Number(b.dataset.d)));
      layer.on = true;
    }
    update(false, true);
  });

  bindNumber("cvx", (v) => (state.cv.x = v), update);
  bindNumber("cvr", (v) => (state.cv.r = v), update);
  bindNumber("vp0x", (v) => (state.vp[0].x = v), update);
  bindNumber("vp1x", (v) => (state.vp[1].x = v), update);
  bindNumber("vp2x", (v) => (state.vp[2].x = v), update);
  bindNumber("vp2y", (v) => (state.vp[2].y = v), update);
}
