import { describe, expect, it } from "vitest";
import { defaultState } from "../src/state/defaults";
import { mergeSaved } from "../src/state/storage";

describe("mergeSaved", () => {
  it("renvoie l'état par défaut si rien n'est sauvegardé ou si c'est invalide", () => {
    expect(mergeSaved(null)).toEqual(defaultState());
    expect(mergeSaved({ vp: [1] })).toEqual(defaultState());
    expect(mergeSaved("n'importe quoi")).toEqual(defaultState());
  });

  it("restaure une sauvegarde actuelle", () => {
    const saved = { ...defaultState(), mode: 3 as const, hy: 77, color: false };
    expect(mergeSaved(JSON.parse(JSON.stringify(saved)))).toMatchObject({ mode: 3, hy: 77, color: false });
  });

  it("ne restaure pas le préréglage actif", () => {
    const saved = { ...defaultState(), preset: "angle" };
    expect(mergeSaved(saved).preset).toBeNull();
  });

  it("ignore les clés inconnues", () => {
    const merged = mergeSaved({ ...defaultState(), inconnue: 1 }) as unknown as Record<string, unknown>;
    expect(merged.inconnue).toBeUndefined();
  });

  it("migre l'ancien format sans calques (grid = taille, it = opacité)", () => {
    const old: Record<string, unknown> = { ...defaultState(), grid: 10, it: 70 };
    delete old.L;
    const merged = mergeSaved(old);
    expect(merged.L.grid.on).toBe(true);
    expect(merged.L.lines.op).toBe(70);
    expect(merged.grid).toBe(10);
  });

  it("ancien format avec grille masquée (grid = 0) : taille par défaut", () => {
    const old: Record<string, unknown> = { ...defaultState(), grid: 0 };
    delete old.L;
    const merged = mergeSaved(old);
    expect(merged.L.grid.on).toBe(false);
    expect(merged.grid).toBe(5);
  });
});
