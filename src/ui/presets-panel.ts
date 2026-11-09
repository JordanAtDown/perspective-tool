import { paperSize } from "../core/paper";
import { PRESET_GROUPS, PRESETS } from "../state/presets";
import type { State } from "../types";
import { $, $$ } from "./dom";

export function buildPresetsPanel(): void {
  const html = PRESET_GROUPS.map((group) => {
    const items = PRESETS.filter((p) => p.group === group)
      .map(
        (p) =>
          `<button type="button" class="preset" data-p="${p.id}"><b>${p.name}</b><i>${p.badge}</i><small>${p.description}</small></button>`,
      )
      .join("");
    return `<details class="pgroup" open><summary>${group}</summary><div class="plist">${items}</div></details>`;
  }).join("");
  $("presets").innerHTML = html;
}

export function bindPresetsPanel(state: State, onChange: () => void): void {
  $("presets").addEventListener("click", (e) => {
    const button = (e.target as Element).closest<HTMLElement>(".preset");
    if (!button) return;
    const id = button.dataset.p;
    const { W, H } = paperSize(state.orient);
    PRESETS.find((p) => p.id === id)?.apply(state, W, H);
    state.preset = id ?? null;
    onChange();
  });
}

export function syncPresetsPanel(state: State): void {
  for (const b of $$(".preset")) b.setAttribute("aria-pressed", String(b.dataset.p === state.preset));
}
