import type { Orientation } from "../types";

export interface Size {
  W: number;
  H: number;
}

/** Dimensions de la feuille A4 en mm. */
export function paperSize(orient: Orientation): Size {
  return orient === "portrait" ? { W: 210, H: 297 } : { W: 297, H: 210 };
}
