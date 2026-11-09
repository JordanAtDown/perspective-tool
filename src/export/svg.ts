import { rgb } from "../core/colors";
import { escapeXml, segmentsToPath } from "../core/svg-path";
import type { Scene } from "../types";

/** SVG à l'échelle réelle : 1 unité = 1 mm, taille de la feuille A4. */
export function buildSVG(scene: Scene): string {
  const { W, H } = scene;
  const out = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">`,
    `<rect width="${W}" height="${H}" fill="#fff"/>`,
  ];
  for (const g of scene.groups) {
    if (g.segs.length) {
      out.push(
        `<path d="${segmentsToPath(g.segs)}" fill="none" stroke="${rgb(g.c)}" stroke-width="${g.w}" stroke-linecap="round"/>`,
      );
    }
  }
  if (scene.label) {
    out.push(
      `<text x="5" y="${H - 4}" font-size="2.1" fill="#9aa3ad" font-family="Helvetica, Arial, sans-serif">${escapeXml(scene.label)}</text>`,
    );
  }
  out.push("</svg>");
  return out.join("\n");
}
