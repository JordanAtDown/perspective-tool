import type { Scene } from "../types";

/** Points PostScript par millimètre (1 pt = 1/72 pouce). */
const PT_PER_MM = 72 / 25.4;

/**
 * PDF 1.4 d'une page, écrit à la main : tracés vectoriels et police Helvetica standard
 * (encodage WinAnsi pour les accents). Aucune bibliothèque nécessaire.
 */
export function buildPDF(scene: Scene): Uint8Array {
  const K = PT_PER_MM;
  const pageW = scene.W * K;
  const pageH = scene.H * K;
  // Le PDF place l'origine en bas à gauche, la scène en haut à gauche.
  const X = (v: number) => (v * K).toFixed(2);
  const Y = (v: number) => ((scene.H - v) * K).toFixed(2);

  const content: string[] = [`q 0 0 ${pageW.toFixed(2)} ${pageH.toFixed(2)} re W n 1 J`];
  for (const g of scene.groups) {
    if (!g.segs.length) continue;
    const [r, gr, b] = g.c.map((v) => (v / 255).toFixed(3));
    content.push(`${r} ${gr} ${b} RG ${(g.w * K).toFixed(3)} w`);
    for (const s of g.segs) content.push(`${X(s[0])} ${Y(s[1])} m ${X(s[2])} ${Y(s[3])} l`);
    content.push("S");
  }
  content.push("Q");
  if (scene.label) {
    const text = scene.label.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    content.push(`BT 0.604 0.639 0.678 rg /F1 6 Tf ${X(5)} ${Y(scene.H - 4)} Td (${text}) Tj ET`);
  }
  const stream = content.join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW.toFixed(2)} ${pageH.toFixed(2)}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>`,
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  ];

  // Corps, puis table des références croisées (position en octets de chaque objet).
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const o of offsets) out += `${String(o).padStart(10, "0")} 00000 n \n`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  // Un caractère = un octet (Latin-1) ; les caractères hors Latin-1 deviennent « ? ».
  const bytes = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) {
    const code = out.charCodeAt(i);
    bytes[i] = code < 256 ? code : 63;
  }
  return bytes;
}
