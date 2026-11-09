---
paths:
  - "src/ui/**"
  - "src/main.ts"
  - "src/style.css"
  - "index.html"
---

# Interface

- Après un changement de réglage, appeler `update(refit, keepPreset)` de `main.ts`. `refit` recadre l'aperçu ; un réglage manuel annule le préréglage actif, sauf `keepPreset`.
- `syncControls` (état → page) et `bindControls` (page → état) restent séparés. Ne pas lire l'état dans le DOM.
- Pas de `!` (assertion non nulle) dans `src/`. Pour le DOM, utiliser `$()`, `$$()` et `child()` de `ui/dom.ts`, qui échouent avec un message clair.
- Aperçu : les poignées sont multipliées par `k` (mm par pixel écran) pour garder une taille constante, et les traits utilisent `vector-effect="non-scaling-stroke"`.
- Polices hébergées via `@fontsource` (imports dans `main.ts`). Pour une nouvelle graisse, importer son `latin-<graisse>.css`.
- Biome ne lint ni ne formate `style.css` : le garder lisible à la main.
- Le rendu visuel n'est pas couvert par les tests : après un changement visuel, lancer `npm run dev` et regarder, thèmes clair et sombre, largeur mobile comprise.
