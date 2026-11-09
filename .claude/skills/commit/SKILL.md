---
name: commit
description: Crée un commit propre sur main (vérifications, squash, message Conventional Commits). À utiliser pour commiter les changements en cours.
disable-model-invocation: true
---

# Commiter

Historique visé : linéaire, sur `main`, un commit par changement complet et cohérent.

1. **Regarder l'état** : `git status`, `git diff` (stagé et non stagé) et `git log --oneline -10`. S'il n'y a rien à commiter, le dire et s'arrêter.
2. **Vérifier** : `npm run check && npm test && npm run build`. Si ça échoue, corriger la cause (jamais `--no-verify`), puis recommencer.
3. **Un seul commit par changement** : si plusieurs changements indépendants sont mélangés, le signaler et proposer de les séparer. Si des commits locaux non poussés se rapportent au même changement, les squasher : `git reset --soft <commit-de-base>` puis un nouveau commit. Ne jamais toucher à des commits déjà poussés.
4. **Écrire le message** en Conventional Commits :
   - Première ligne : `type(portée optionnelle): description`, à l'impératif ou à l'infinitif, sans point final, 72 caractères maximum.
   - Types : `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. Un changement qui casse le format de sauvegarde ou l'API publique prend `!` (`refactor!: …`).
   - Corps facultatif, après une ligne vide : le _pourquoi_, pas le _quoi_.
5. **Commiter** les fichiers concernés (pas de `git add -A` aveugle : ne pas embarquer de fichiers parasites), puis afficher `git log --oneline -3`.
6. **Ne pas pousser** sans demande explicite. Chaque push sur `main` déclenche un déploiement GitHub Pages.
