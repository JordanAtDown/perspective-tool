---
paths:
  - "src/state/**"
  - "src/types.ts"
---

# État et sauvegarde

- Modifier les réglages via les fonctions de `state/actions.ts` : elles gardent l'état cohérent et borné. Ne pas assigner des champs depuis l'UI quand une action existe.
- `State` est sérialisé tel quel dans le `localStorage` (clé `grille-persp-v1`). En ajoutant ou renommant un champ : l'ajouter à `defaultState()` et gérer les anciennes sauvegardes dans `mergeSaved()`. Ne changer la clé que si le format devient incompatible.
- `preset` n'est jamais restauré depuis la sauvegarde : un état ajusté à la main n'est plus un préréglage.
- Le tableau `PRESETS` est exclu du formatage (`biome-ignore format`) pour rester une ligne par préréglage. Y ajouter un préréglage sur une seule ligne.
- Tester les actions et la migration dans `tests/actions.test.ts` et `tests/storage.test.ts`, sans DOM.
