import type { RGB } from "../types";

/** Une couleur par point de fuite. */
export const VP_COLORS: RGB[] = [
  [31, 95, 168],
  [196, 84, 44],
  [47, 133, 90],
];
export const MONO: RGB = [85, 98, 115];
export const PARALLELS: RGB = [120, 130, 142];
export const HORIZON: RGB = [30, 34, 40];
export const GRID: RGB = [140, 160, 190];

/** Éclaircit une couleur vers le blanc : `t` = 1 garde la couleur, `t` = 0 donne du blanc. */
export function mix(c: RGB, t: number): RGB {
  return c.map((v) => Math.round(255 - (255 - v) * t)) as RGB;
}

export function rgb(c: RGB): string {
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
