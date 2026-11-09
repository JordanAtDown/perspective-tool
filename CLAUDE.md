# perspective-tool

Générateur de grilles de perspective A4 imprimables (1 à 3 points de fuite, curviligne à 4 à 6). Site statique en français, TypeScript + Vite, sans framework d'UI, publié sur GitHub Pages. Présentation et usage : `README.md`.

Les règles propres à une zone du code sont dans `.claude/rules/` (chargées quand tu touches aux fichiers concernés). La procédure de commit est dans le skill `/commit`.

## Commandes

- `npm run dev` : serveur de développement
- `npm run check` : Biome (formatage + lint) ; `npm run fix` applique les corrections
- `npm run typecheck` : TypeScript strict
- `npm test` : Vitest (un seul fichier : `npx vitest run tests/<fichier>.test.ts`)
- `npm run build` : typecheck + build dans `dist/`

Avant de conclure une modification : `npm run check && npm test && npm run build`. Un hook pre-commit (Husky) lance ces trois contrôles avant chaque commit, et la CI refait la même chose avant de déployer. Ne jamais contourner un hook avec `--no-verify`.

## Git

- Tout va sur `main`. Pas de branches de fonctionnalité ni de pull requests.
- Un commit = un changement complet et cohérent (code, tests et doc ensemble). Squasher les petits commits avant de pousser.
- Ne jamais réécrire l'historique déjà poussé : chaque push déclenche un déploiement.
- Messages en Conventional Commits (`type(portée): description`, 72 caractères maximum), vérifiés par le hook `commit-msg`.
- Pour commiter : `/commit`.

## Architecture

Flux : `State` (objet unique, muté en place) → `buildScene(state)` → `Scene` (segments en mm) → aperçu, SVG ou PDF.

Dépendances à sens unique :

- `src/core/` : géométrie pure. Ne dépend ni du DOM, ni de `ui/`, ni de `state/storage.ts`.
- `src/state/` : réglages, préréglages, sauvegarde. Pas de DOM.
- `src/export/` : `Scene` → SVG, PDF, téléchargement.
- `src/ui/` : tout le DOM. Peut importer le reste.
- `src/main.ts` : câblage uniquement.

## Règles générales

- Calculer la géométrie dans `core/` seulement. Aperçu et exports consomment la même `Scene` ; ne jamais la recalculer dans un exporteur, sinon l'aperçu et l'impression divergent.
- Ajouter un test pour tout bug de géométrie ou d'état corrigé.
- Textes d'interface et commentaires en français.
- Ne pas formater à la main : `npm run fix`.
- `vite.config.ts` fixe `base: "./"` : ne pas le remplacer par un chemin absolu, le site est servi sous `/<dépôt>/`.
