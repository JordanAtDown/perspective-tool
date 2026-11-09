---
paths:
  - "tests/**"
---

# Tests

- Vitest. `core/` et `state/` se testent comme des fonctions pures, sans DOM.
- `ui.test.ts` charge le vrai `index.html` sous jsdom (`// @vitest-environment jsdom`) et clique dessus : il vérifie le câblage, pas l'apparence.
- Les `!` sont autorisés dans les tests (règle Biome désactivée pour `tests/**`).
- Un test par comportement, nommé en français par ce qu'il garantit. Un bug corrigé reçoit le test qui l'aurait attrapé.
- Ne pas tester l'égalité exacte de longues chaînes SVG ou PDF : vérifier la structure (en-tête, table xref, longueur du flux) ou une propriété.
