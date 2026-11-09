import type { State } from "../types";
import { defaultState } from "./defaults";

/** Clé du localStorage. Le suffixe `-v1` est conservé pour ne pas perdre les réglages déjà enregistrés. */
export const STORAGE_KEY = "grille-persp-v1";

/** Format d'une sauvegarde : l'état courant, ou celui des anciennes versions. */
type Saved = Partial<State> & { it?: number };

/**
 * Fusionne une sauvegarde dans un état par défaut.
 * Gère aussi l'ancien format, avant l'introduction des calques (`L`) : `grid` valait 0 (masquée) ou la taille,
 * et `it` l'opacité des lignes.
 */
export function mergeSaved(saved: unknown): State {
  const state = defaultState();
  const s = saved as Saved | null;
  if (!s || !Array.isArray(s.vp) || s.vp.length !== 3) return state;

  const hadLayers = !!s.L;
  const target = state as unknown as Record<string, unknown>;
  for (const key of Object.keys(state)) {
    // `preset` n'est pas restauré : l'état ajusté à la main n'est plus un préréglage.
    if (key !== "preset" && key in s) target[key] = (s as Record<string, unknown>)[key];
  }
  if (!hadLayers) {
    if (s.grid) state.L.grid.on = true;
    if (s.it) state.L.lines.op = s.it;
  }
  if (!state.grid) state.grid = 5;
  return state;
}

export function loadState(): State {
  try {
    return mergeSaved(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null"));
  } catch {
    return defaultState();
  }
}

export function saveState(state: State): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Stockage indisponible (navigation privée, quota) : on continue sans sauvegarde.
  }
}
