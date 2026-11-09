// Polices hébergées avec le site (sous-ensemble latin : accents français compris).
import "@fontsource/archivo/latin-500.css";
import "@fontsource/archivo/latin-700.css";
import "@fontsource/public-sans/latin-400.css";
import "@fontsource/public-sans/latin-500.css";
import "@fontsource/public-sans/latin-600.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "./style.css";
import { clampAll } from "./state/actions";
import { loadState, saveState } from "./state/storage";
import { bindControls, syncControls } from "./ui/controls";
import { $ } from "./ui/dom";
import { bindExportButtons } from "./ui/export-buttons";
import { buildPresetsPanel } from "./ui/presets-panel";
import { createPreview } from "./ui/preview";

const state = loadState();

const preview = createPreview($<SVGSVGElement>("view"), state, {
  onDrag() {
    preview.render();
    syncControls(state);
  },
  onDragEnd() {
    preview.fit();
    preview.render();
    saveState(state);
  },
});

/** Après un changement de réglage : bornes, recadrage éventuel, redessin, contrôles, sauvegarde. */
function update(refit: boolean, keepPreset = false): void {
  if (!keepPreset) state.preset = null;
  clampAll(state);
  if (refit) preview.fit();
  preview.render();
  syncControls(state);
  saveState(state);
}

buildPresetsPanel();
bindControls(state, update);
bindExportButtons(state);
window.addEventListener("resize", () => preview.render());

preview.fit();
preview.render();
syncControls(state);
// Une seconde passe une fois la mise en page faite, pour que les poignées aient la bonne taille.
requestAnimationFrame(() => preview.render());
