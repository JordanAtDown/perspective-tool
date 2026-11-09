/** Couleur RGB, composantes de 0 à 255. */
export type RGB = [number, number, number];

/** Segment en millimètres : [x1, y1, x2, y2]. L'origine est le coin haut-gauche de la feuille. */
export type Seg = [number, number, number, number];

export interface Point {
  x: number;
  y: number;
}

/** Point de fuite ; `i` est l'indice de sa couleur dans la palette. */
export interface VanishingPoint extends Point {
  i: number;
}

/** 1 à 3 : perspective classique. 4 à 6 : perspective curviligne. */
export type Mode = 1 | 2 | 3 | 4 | 5 | 6;
export type Orientation = "portrait" | "landscape";
export type LayerKey = "grid" | "lines" | "hor";

export interface Layer {
  on: boolean;
  /** Opacité en pourcents, de 10 à 100. */
  op: number;
}

/** Tous les réglages de l'utilisateur. Sérialisé tel quel dans le localStorage. */
export interface State {
  mode: Mode;
  orient: Orientation;
  /** Distance de l'horizon au haut de la feuille, en mm (au niveau du milieu de la feuille). */
  hy: number;
  /** Inclinaison de l'horizon en degrés (positif = descend vers la droite). */
  rot: number;
  /** Perspective curviligne : centre (le long de l'horizon) et rayon, en mm. */
  cv: { x: number; r: number };
  lastLin: Mode;
  lastCurv: Mode;
  L: Record<LayerKey, Layer>;
  /** PF 1 et 2 : `x` le long de l'horizon. PF 3 : position libre (x, y). */
  vp: [{ x: number }, { x: number }, { x: number; y: number }];
  /** Nombre de lignes de fuite par point. */
  n: number;
  /** Écart des parallèles en mm (0 = aucune). */
  par: number;
  /** Taille des carreaux de la grille de fond en mm. */
  grid: number;
  /** Une couleur par point de fuite. */
  color: boolean;
  /** Noter les réglages en bas de page. */
  label: boolean;
  /** Identifiant du préréglage actif, `null` dès que l'utilisateur ajuste à la main. Non sauvegardé. */
  preset: string | null;
}

/** Groupe de segments partageant le même style. */
export interface Group {
  c: RGB;
  /** Épaisseur de trait pour l'impression, en mm. */
  w: number;
  /** Épaisseur de trait pour l'aperçu, en pixels écran. */
  px: number;
  segs: Seg[];
}

/** Prolongement d'un rayon entre le point de fuite (hors feuille) et le bord de la feuille. */
export interface Ghost {
  c: RGB;
  segs: Seg[];
}

/** Ce qui est dessiné sur la feuille, indépendamment du support (aperçu, SVG, PDF). */
export interface Scene {
  W: number;
  H: number;
  groups: Group[];
  ghosts: Ghost[];
  label: string;
}
