# Grille de perspective A4

Générateur de grilles de perspective à imprimer en A4, à glisser sous un calque pour dessiner.

- Perspective classique à 1, 2 ou 3 points de fuite, et curviligne à 4, 5 ou 6 points (fisheye et sphère complète)
- Points de fuite et ligne d'horizon à déplacer au doigt ou à la souris, même hors de la feuille
- Horizon inclinable
- 17 préréglages (vue de face, coin de rue, contre-plongée, fisheye…)
- Calques masquables avec opacité réglable : lignes de fuite, horizon et repères, grille de fond
- Export PDF A4 vectoriel et SVG, à imprimer à 100 %
- Les réglages sont gardés dans le `localStorage` du navigateur

**Site en ligne : https://jordanatdown.github.io/perspective-tool/**

## Développer

Il faut Node.js 22 ou plus.

```sh
npm install
npm run dev        # http://localhost:5173
```

| Commande            | Rôle                                               |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Serveur de développement avec rechargement à chaud |
| `npm test`          | Tests unitaires (Vitest)                           |
| `npm run check`     | Formatage et lint ([Biome](https://biomejs.dev))   |
| `npm run fix`       | Corrige ce que Biome sait corriger                 |
| `npm run typecheck` | Vérification TypeScript                            |
| `npm run build`     | Typecheck et build de production dans `dist/`      |
| `npm run preview`   | Sert `dist/` pour vérifier le build                |

Un hook pre-commit ([Husky](https://typicode.github.io/husky/)) lance Biome, les tests et le build avant chaque commit : un commit qui casse l'un d'eux est refusé. Il s'installe tout seul avec `npm install`.

Les messages de commit suivent les [Conventional Commits](https://www.conventionalcommits.org/fr/v1.0.0/) (`feat: …`, `fix(pdf): …`), vérifiés par un second hook. L'historique reste linéaire : tout va sur `main`, en commits cohérents et squashés.

## Structure

```
index.html          Page : aperçu SVG et panneau de réglages
src/
  types.ts          Types partagés
  core/             Géométrie pure : découpe, rayons, curviligne, scène
  state/            Réglages, préréglages, actions, sauvegarde
  export/           PDF (écrit à la main, sans bibliothèque), SVG, téléchargement
  ui/               Aperçu interactif, panneau de réglages
  main.ts           Câblage
  style.css         Styles, thème clair et sombre
tests/              Tests unitaires et test de l'interface (jsdom)
```

Le principe : un objet `State` contient tous les réglages. `buildScene(state)` en tire une liste de groupes de segments en millimètres, déjà découpés au format de la feuille. **La même scène** sert à l'aperçu, à l'export SVG et à l'export PDF.

- **Perspective classique** : faisceaux de droites depuis chaque point de fuite et familles de parallèles.
- **Perspective curviligne** : projection stéréographique de la sphère de vision. Les droites de l'espace deviennent des arcs de cercle passant par deux points de fuite opposés.
- **PDF** : PDF 1.4 d'une page, avec des tracés vectoriels et la police Helvetica standard (encodage WinAnsi pour les accents).

Le détail de l'architecture et les pièges à connaître sont dans [CLAUDE.md](CLAUDE.md).

## Déploiement

Chaque commit sur `main` lance [le workflow](.github/workflows/deploy.yml) qui vérifie les types, lance les tests, construit le site et le publie sur GitHub Pages.

À faire une seule fois : dans le dépôt GitHub, **Settings → Pages → Build and deployment → Source : GitHub Actions**.

## Polices

Les polices de l'interface (Archivo, Public Sans, IBM Plex Mono) sont hébergées avec le site grâce à [Fontsource](https://fontsource.org) : le site fonctionne hors ligne et n'appelle aucun service tiers. Les exports n'en dépendent pas.
