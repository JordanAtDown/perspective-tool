import { describe, expect, it } from "vitest";
import { buildScene } from "../src/core/scene";
import { buildPDF } from "../src/export/pdf";
import { buildSVG } from "../src/export/svg";
import { defaultState } from "../src/state/defaults";

const latin1 = (b: Uint8Array) => Buffer.from(b).toString("latin1");

describe("buildPDF", () => {
  const pdf = latin1(buildPDF(buildScene(defaultState())));

  it("est un PDF 1.4 bien terminé", () => {
    expect(pdf.startsWith("%PDF-1.4\n")).toBe(true);
    expect(pdf.endsWith("%%EOF")).toBe(true);
  });

  it("a la taille d'un A4 paysage en points", () => {
    expect(pdf).toContain("/MediaBox [0 0 841.89 595.28]");
  });

  it("a une table xref dont les décalages pointent sur chaque objet", () => {
    const start = Number(/startxref\n(\d+)\n/.exec(pdf)![1]);
    expect(pdf.slice(start, start + 4)).toBe("xref");
    const entries = [...pdf.slice(start).matchAll(/(\d{10}) 00000 n /g)].map((m) => Number(m[1]));
    expect(entries.length).toBe(5);
    for (const [i, offset] of entries.entries()) {
      expect(pdf.slice(offset, offset + 7)).toBe(`${i + 1} 0 obj`);
    }
  });

  it("déclare la bonne longueur du flux", () => {
    const len = Number(/\/Length (\d+) >>\nstream\n/.exec(pdf)![1]);
    const body = pdf.slice(pdf.indexOf("stream\n") + 7, pdf.indexOf("\nendstream"));
    expect(body.length).toBe(len);
  });

  it("échappe les parenthèses de la légende et garde les accents Latin-1", () => {
    const s = defaultState();
    const sc = buildScene(s);
    sc.label = "a (b) \\ é·";
    const out = latin1(buildPDF(sc));
    expect(out).toContain("(a \\(b\\) \\\\ é·) Tj");
  });
});

describe("buildSVG", () => {
  it("est à l'échelle réelle en mm", () => {
    const svg = buildSVG(buildScene(defaultState()));
    expect(svg).toContain('width="297mm" height="210mm" viewBox="0 0 297 210"');
    expect(svg).toContain("<path");
    expect(svg.trim().endsWith("</svg>")).toBe(true);
  });

  it("échappe la légende", () => {
    const sc = buildScene(defaultState());
    sc.label = "a < b & c";
    expect(buildSVG(sc)).toContain("a &lt; b &amp; c");
  });
});
