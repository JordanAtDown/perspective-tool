import { describe, expect, it } from "vitest";
import { parallelFamily, rays } from "../src/core/lines";

describe("rays", () => {
  it("point sur la feuille : au moins 8 rayons sur 360°", () => {
    const r = rays(100, 100, 3, 210, 297);
    expect(r.segs.length).toBe(8);
    expect(r.ghosts).toEqual([]);
  });

  it("point hors feuille : n rayons, tous prolongés par un fantôme", () => {
    const r = rays(-300, 150, 12, 297, 210);
    expect(r.segs.length).toBe(12);
    expect(r.ghosts.length).toBe(12);
    for (const g of r.ghosts) expect([g[0], g[1]]).toEqual([-300, 150]);
  });

  it("tous les rayons restent dans la feuille", () => {
    for (const s of rays(-300, 150, 24, 297, 210).segs) {
      for (const [x, y] of [
        [s[0], s[1]],
        [s[2], s[3]],
      ]) {
        expect(x).toBeGreaterThanOrEqual(-1e-6);
        expect(x).toBeLessThanOrEqual(297 + 1e-6);
        expect(y).toBeGreaterThanOrEqual(-1e-6);
        expect(y).toBeLessThanOrEqual(210 + 1e-6);
      }
    }
  });
});

describe("parallelFamily", () => {
  it("verticales espacées de 20 mm sur une feuille de 100 mm, origine au bord", () => {
    const segs = parallelFamily(0, 0, 0, 1, 20, 100, 100, false);
    expect(segs.map((s) => s[0]).sort((a, b) => a - b)).toEqual([0, 20, 40, 60, 80, 100]);
  });

  it("saute la droite qui passe par l'origine si demandé", () => {
    const segs = parallelFamily(50, 50, 0, 1, 25, 100, 100, true);
    expect(segs.map((s) => s[0]).sort((a, b) => a - b)).toEqual([0, 25, 75, 100]);
  });
});
