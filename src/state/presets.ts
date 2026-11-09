import type { Mode, State } from "../types";
import { setRotation } from "./actions";

export type PresetGroup = "Classique" | "Curviligne";

export interface Preset {
  group: PresetGroup;
  id: string;
  name: string;
  description: string;
  /** Étiquette du nombre de points, par exemple « 2 pts ». */
  badge: string;
  /** Règle l'état pour une feuille de W × H mm. Le portrait / paysage est conservé. */
  apply: (state: State, W: number, H: number) => void;
}

export const PRESET_GROUPS: PresetGroup[] = ["Classique", "Curviligne"];

/**
 * Perspective classique. Les positions sont des proportions de la feuille :
 * `hy` de la hauteur, `a` et `b` de la largeur (PF 1 et 2), `v3` = [x, y] du PF 3.
 */
function linear(mode: Mode, hy: number, a: number, b?: number, rot?: number, v3?: [number, number]): Preset["apply"] {
  return (state, W, H) => {
    const round = Math.round;
    state.mode = mode;
    state.lastLin = mode;
    setRotation(state, 0);
    state.hy = round(hy * H);
    state.vp[0].x = round(a * W);
    if (b != null) state.vp[1].x = round(b * W);
    if (v3) {
      state.vp[2].x = round(v3[0] * W);
      state.vp[2].y = round(v3[1] * H);
    }
    if (rot) setRotation(state, rot);
  };
}

/** Perspective curviligne : cercle centré sur la feuille, rayon donné par `radius(W, H)`. */
function curvilinear(mode: Mode, radius: (W: number, H: number) => number, rot?: number): Preset["apply"] {
  return (state, W, H) => {
    state.mode = mode;
    state.lastCurv = mode;
    setRotation(state, 0);
    state.hy = Math.round(H / 2);
    state.cv.x = Math.round(W / 2);
    state.cv.r = Math.round(radius(W, H));
    if (rot) setRotation(state, rot);
  };
}

// biome-ignore format: tableau lisible, une ligne par préréglage
export const PRESETS: Preset[] = [
  { group: "Classique", id: "face", name: "Vue de face", description: "Rue ou couloir droit devant toi, point au centre.", badge: "1 pt", apply: linear(1, 0.5, 0.5) },
  { group: "Classique", id: "piece", name: "Intérieur de pièce", description: "Mur du fond face à toi, point décalé pour voir un côté.", badge: "1 pt", apply: linear(1, 0.45, 0.38) },
  { group: "Classique", id: "route", name: "Route vers l'horizon", description: "Horizon haut, le sol occupe presque toute la feuille.", badge: "1 pt", apply: linear(1, 0.22, 0.5) },
  { group: "Classique", id: "angle", name: "Coin de rue", description: "Bâtiment vu par l'angle, à hauteur d'yeux.", badge: "2 pts", apply: linear(2, 0.55, -0.6, 1.6) },
  { group: "Classique", id: "asym", name: "Angle asymétrique", description: "Une face de l'objet bien visible, l'autre fuit vite.", badge: "2 pts", apply: linear(2, 0.5, -0.12, 2.4) },
  { group: "Classique", id: "table", name: "Objet posé sur une table", description: "Nature morte vue d'un peu au-dessus.", badge: "2 pts", apply: linear(2, 0.18, -0.3, 1.3) },
  { group: "Classique", id: "bas", name: "À hauteur d'enfant", description: "Horizon bas : tout paraît plus grand.", badge: "2 pts", apply: linear(2, 0.8, -0.35, 1.5) },
  { group: "Classique", id: "sol", name: "Au ras du sol", description: "Œil presque posé par terre, horizon tout en bas.", badge: "2 pts", apply: linear(2, 0.94, -0.5, 1.5) },
  { group: "Classique", id: "penche", name: "Cadrage penché", description: "Horizon incliné pour une image plus nerveuse.", badge: "2 pts", apply: linear(2, 0.55, -0.5, 1.6, -12) },
  { group: "Classique", id: "contre", name: "Contre-plongée", description: "Bâtiment ou personnage vu d'en bas, imposant.", badge: "3 pts", apply: linear(3, 0.88, -0.5, 1.5, 0, [0.5, -1.6]) },
  { group: "Classique", id: "plongee", name: "Plongée", description: "Vue du haut d'un immeuble vers la rue.", badge: "3 pts", apply: linear(3, -0.12, -0.5, 1.5, 0, [0.5, 2.4]) },
  { group: "Classique", id: "action", name: "Contre-plongée penchée", description: "Scène d'action dynamique, cadre basculé.", badge: "3 pts", apply: linear(3, 0.85, -0.45, 1.45, 10, [0.55, -1.4]) },
  { group: "Curviligne", id: "pano", name: "Panorama", description: "Grand angle horizontal, le cercle dépasse la feuille.", badge: "4 pts", apply: curvilinear(4, (W, H) => Math.max(W, H) * 0.62) },
  { group: "Curviligne", id: "c4", name: "Arcs dans le cadre", description: "Les quatre points tiennent sur la feuille.", badge: "4 pts", apply: curvilinear(4, (W, H) => Math.min(W, H) / 2 - 5) },
  { group: "Curviligne", id: "fish", name: "Fisheye rond", description: "Demi-sphère entière dans un cercle, comme un judas de porte.", badge: "5 pts", apply: curvilinear(5, (W, H) => Math.min(W, H) / 2 - 5) },
  { group: "Curviligne", id: "fishfull", name: "Fisheye plein cadre", description: "Le cercle couvre toute la feuille, sans bord visible.", badge: "5 pts", apply: curvilinear(5, (W, H) => Math.sqrt(W * W + H * H) / 2 + 2) },
  { group: "Curviligne", id: "sphere", name: "Sphère complète", description: "Vue à 360°, devant et derrière côte à côte.", badge: "6 pts", apply: curvilinear(6, (W, H) => Math.min(W / 4, H / 2) - 4) },
];
