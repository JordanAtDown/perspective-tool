import { describe, expect, it } from "vitest";
import { paperSize } from "../src/core/paper";
import { buildScene } from "../src/core/scene";
import { defaultState } from "../src/state/defaults";
import { PRESETS } from "../src/state/presets";
import type { State } from "../src/types";

function withPreset(id: string, orient: State["orient"] = "landscape"): State {
  const s = defaultState();
  s.orient = orient;
  const { W, H } = paperSize(orient);
  PRESETS.find((p) => p.id === id)!.apply(s, W, H);
  return s;
}

describe("buildScene", () => {
  it("produit des traits pour chaque préréglage, dans les deux orientations", () => {
    for (const orient of ["landscape", "portrait"] as const) {
      for (const p of PRESETS) {
        const sc = buildScene(withPreset(p.id, orient));
        const segs = sc.groups.reduce((n, g) => n + g.segs.length, 0);
        expect(segs, `${p.id} ${orient}`).toBeGreaterThan(10);
      }
    }
  });

  it("garde tous les traits dans la feuille", () => {
    for (const p of PRESETS) {
      const sc = buildScene(withPreset(p.id));
      for (const g of sc.groups) {
        for (const [x1, y1, x2, y2] of g.segs) {
          for (const [x, y] of [
            [x1, y1],
            [x2, y2],
          ]) {
            expect(x, p.id).toBeGreaterThanOrEqual(-1e-6);
            expect(x, p.id).toBeLessThanOrEqual(sc.W + 1e-6);
            expect(y, p.id).toBeGreaterThanOrEqual(-1e-6);
            expect(y, p.id).toBeLessThanOrEqual(sc.H + 1e-6);
          }
        }
      }
    }
  });

  it("n'imprime pas un calque masqué", () => {
    const s = withPreset("angle");
    const full = buildScene(s).groups.length;
    s.L.lines.on = false;
    expect(buildScene(s).groups.length).toBeLessThan(full);
    s.L.hor.on = false;
    expect(buildScene(s).groups).toEqual([]);
  });

  it("un seul groupe de grille de fond quand elle est active", () => {
    const s = withPreset("face");
    const before = buildScene(s).groups.length;
    s.L.grid.on = true;
    expect(buildScene(s).groups.length).toBe(before + 1);
  });

  it("la légende suit l'option", () => {
    const s = withPreset("angle");
    expect(buildScene(s).label).toContain("2 points de fuite");
    s.label = false;
    expect(buildScene(s).label).toBe("");
  });

  it("dimensions A4", () => {
    expect(buildScene(withPreset("face", "portrait"))).toMatchObject({ W: 210, H: 297 });
    expect(buildScene(withPreset("face", "landscape"))).toMatchObject({ W: 297, H: 210 });
  });
});
