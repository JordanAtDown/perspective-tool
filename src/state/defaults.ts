import type { State } from "../types";

export function defaultState(): State {
  return {
    mode: 2,
    orient: "landscape",
    hy: 118,
    rot: 0,
    cv: { x: 148, r: 100 },
    lastLin: 2,
    lastCurv: 5,
    L: {
      grid: { on: false, op: 35 },
      lines: { on: true, op: 55 },
      hor: { on: true, op: 80 },
    },
    vp: [{ x: -180 }, { x: 477 }, { x: 148, y: -500 }],
    n: 24,
    par: 20,
    grid: 5,
    color: true,
    label: true,
    preset: null,
  };
}
