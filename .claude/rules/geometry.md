---
paths:
  - "src/core/**"
  - "src/export/**"
---

# Géométrie et exports

- `core/` est pur : pas de DOM, pas d'état global. Les fonctions reçoivent `state` (ou ses champs) en paramètre.
- Unités : millimètres, origine en haut à gauche de la feuille. Le PDF inverse l'axe Y à l'écriture.
- Les `x` des PF 1 et 2 et du centre curviligne sont comptés **le long de l'horizon, comme s'il était à plat**. Utiliser `pointOnHorizon()` pour la vraie position. Seul le PF 3 est en coordonnées absolues.
- `Group.w` est l'épaisseur d'impression en mm, `Group.px` l'épaisseur de l'aperçu en pixels écran.
- Tout segment doit être découpé à la feuille avec `clip()` avant d'entrer dans la `Scene`.
- PDF : un caractère = un octet (Latin-1) ; le reste devient `?`. Garder le PDF sans bibliothèque externe.
- Tester sans DOM : une fonction de `core/` ou `export/` doit rester testable avec Vitest seul.
