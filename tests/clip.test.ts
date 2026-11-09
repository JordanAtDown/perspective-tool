import { describe, expect, it } from "vitest";
import { clip } from "../src/core/clip";

describe("clip (Liang-Barsky)", () => {
  it("garde un segment entièrement dedans", () => {
    expect(clip(10, 10, 50, 40, 100, 100)).toEqual([10, 10, 50, 40]);
  });

  it("rejette un segment entièrement dehors", () => {
    expect(clip(-10, -10, -1, -1, 100, 100)).toBeNull();
    expect(clip(-5, 50, -5, 80, 100, 100)).toBeNull();
  });

  it("découpe un segment qui traverse la feuille", () => {
    expect(clip(-50, 50, 150, 50, 100, 100)).toEqual([0, 50, 100, 50]);
  });

  it("découpe un segment qui part de l'intérieur", () => {
    const s = clip(50, 50, 50, 500, 100, 100)!;
    expect(s[0]).toBe(50);
    expect(s[1]).toBe(50);
    expect(s[3]).toBeCloseTo(100);
  });

  it("rejette un segment qui ne fait que toucher un coin", () => {
    expect(clip(-10, 110, 110, -10, 100, 100)).not.toBeNull();
    expect(clip(100, 100, 200, 200, 100, 100)).toBeNull();
  });
});
