import { buildScene } from "../core/scene";
import { downloadFile } from "../export/download";
import { buildPDF } from "../export/pdf";
import { buildSVG } from "../export/svg";
import type { State } from "../types";
import { $ } from "./dom";

function fileName(state: State, ext: string): string {
  return `grille-perspective-${state.mode}pt-${state.orient === "portrait" ? "portrait" : "paysage"}.${ext}`;
}

export function bindExportButtons(state: State): void {
  const status = $("status");
  const run = (ext: string, data: () => BlobPart, mime: string) => () => {
    const name = fileName(state, ext);
    downloadFile(name, data(), mime);
    status.textContent = `Fichier enregistré : ${name}`;
  };
  $("pdf").addEventListener(
    "click",
    run("pdf", () => buildPDF(buildScene(state)) as BlobPart, "application/pdf"),
  );
  $("svg").addEventListener(
    "click",
    run("svg", () => buildSVG(buildScene(state)), "image/svg+xml"),
  );
}
