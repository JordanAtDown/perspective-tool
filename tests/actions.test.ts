import { describe, expect, it } from "vitest";
import { applyDrag, clampAll, setMode, setOrientation, setRotation } from "../src/state/actions";
import { defaultState } from "../src/state/defaults";

describe("setRotation", () => {
  it("borne l'inclinaison à ±60°", () => {
    const s = defaultState();
    setRotation(s, 200);
    expect(s.rot).toBe(60);
    setRotation(s, -200);
    expect(s.rot).toBe(-60);
  });

  it("fait tourner le PF 3 autour du pivot, et revient au point de départ", () => {
    const s = defaultState();
    const { x, y } = s.vp[2];
    setRotation(s, 25);
    expect(s.vp[2]).not.toEqual({ x, y });
    setRotation(s, 0);
    expect(s.vp[2].x).toBeCloseTo(x);
    expect(s.vp[2].y).toBeCloseTo(y);
  });
});

describe("setOrientation", () => {
  it("garde les positions proportionnelles à la feuille", () => {
    const s = defaultState();
    s.hy = 105; // moitié de 210
    setOrientation(s, "portrait");
    expect(s.hy).toBe(149); // ≈ moitié de 297
    expect(s.orient).toBe("portrait");
  });

  it("ne fait rien si l'orientation ne change pas", () => {
    const s = defaultState();
    const before = JSON.stringify(s);
    setOrientation(s, "landscape");
    expect(JSON.stringify(s)).toBe(before);
  });
});

describe("setMode", () => {
  it("passer en curviligne centre le cercle sur la feuille", () => {
    const s = defaultState();
    setMode(s, 5);
    expect(s).toMatchObject({ mode: 5, lastCurv: 5, rot: 0, hy: 105 });
    expect(s.cv.x).toBe(149); // round(297 / 2)
    expect(s.cv.r).toBe(100); // 210 / 2 - 5
  });

  it("mémorise le dernier mode de chaque famille", () => {
    const s = defaultState();
    setMode(s, 3);
    setMode(s, 6);
    expect(s.lastLin).toBe(3);
    expect(s.lastCurv).toBe(6);
  });

  it("1 point : ramène le point au centre s'il est hors feuille", () => {
    const s = defaultState(); // vp[0].x = -180
    setMode(s, 1);
    expect(s.vp[0].x).toBe(148.5);
  });
});

describe("applyDrag", () => {
  it("déplacer l'horizon règle sa hauteur et annule le préréglage", () => {
    const s = defaultState();
    s.preset = "angle";
    applyDrag(s, "horizon", { x: 148.5, y: 60.4 });
    expect(s.hy).toBe(60);
    expect(s.preset).toBeNull();
  });

  it("la poignée de rotation s'aimante sur l'horizontale", () => {
    const s = defaultState();
    applyDrag(s, "rotate", { x: 300, y: s.hy + 3 });
    expect(s.rot).toBe(0);
    applyDrag(s, "rotate", { x: 300, y: s.hy + 100 });
    expect(s.rot).toBeGreaterThan(5);
  });

  it("un PF d'horizon glisse le long de l'horizon et le déplace verticalement", () => {
    const s = defaultState();
    applyDrag(s, "vp0", { x: -100, y: 130 });
    expect(s.vp[0].x).toBe(-100);
    expect(s.hy).toBe(130);
  });

  it("le rayon ne descend pas sous le minimum", () => {
    const s = defaultState();
    setMode(s, 5);
    applyDrag(s, "radius", { x: s.cv.x, y: s.hy });
    expect(s.cv.r).toBe(15);
  });
});

describe("clampAll", () => {
  it("borne les valeurs extrêmes", () => {
    const s = defaultState();
    s.hy = 1e6;
    s.vp[0].x = -1e6;
    s.vp[2].y = 1e6;
    s.cv.r = 1e6;
    clampAll(s);
    expect(s.hy).toBe(4 * 210);
    expect(s.vp[0].x).toBe(-6 * 297);
    expect(s.vp[2].y).toBe(9 * 210);
    expect(s.cv.r).toBe(3000);
  });
});
