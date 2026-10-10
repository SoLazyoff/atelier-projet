# Atelier : outil de création de marque de vêtements

Un seul fichier : `atelier.html` (HTML + CSS + JS, aucune dépendance sauf Google Fonts). Pas de build.
Tester : ouvrir le fichier dans un navigateur, et lancer `node --test tests/*.test.mjs` (fonctions pures, faux DOM dans `tests/charger.mjs`).
En ligne : https://solazyoff.github.io/atelier-projet/ (GitHub Pages, branche `main`). Les données sont dans le localStorage (clé `atelier-marque-v1`).
Langue de l'interface : français. Le téléphone est la cible principale (mobile d'abord).

## Structure du script (dans l'ordre du fichier)
- Données : `TOPS`, `BOTTOMS`, `FABRICS`, `ACC` (accessoires), `PRESETS`, `LOGOS`, `PL` (emplacements de logos), `SHAPES`, `QUICK`, `DEF` (état par défaut).
- État : objet global `S` (chargé par `load()`, sauvegardé par `persist()`).
  Champs clés : `mode` (`piece` ou `outfit`), `cat` (`top`/`bottom`/`acc`), `top`, `bottom`, `fabric` (haut), `fabricB` (bas), `c` (couleurs par zone), `acc`, `marks` (logos), `looks` (collection : pièces `kind:'piece'` et tenues), `brand`, `biz`.
- Rendu : `build(G, uid, sel)` génère le SVG du mannequin. Les zones colorables ont un `id` (`tBody`, `bLegs`, `aHead`…). `ZOOM` gère le cadrage en mode pièce.
- Onglets : `studio()` (Atelier), `marquage()` (logos brodés/imprimés), `brand()` (Marque), `collection()`, `lookbook()`, `biz()` (Business).
- Lookbook : `S.lookbook` contient des looks qui **référencent** des pièces par id (`top`, `bottom`, `acc:{groupe:id}`), sans copier leurs couleurs. `lookG()` les reconstruit via `mergePiece()` ; une pièce supprimée apparaît dans `miss`. `S.lb` = look en cours de composition. `renderTab()` choisit l'onglet.
- Événements : un seul écouteur `click` (attributs `data-act`, `data-k`) et un seul `input` (attribut `data-in`).

## Règles pour modifier
- Ajouter un vêtement : l'ajouter dans `TOPS` ou `BOTTOMS` (avec ses zones), puis dessiner sa forme dans `build()` (face et dos). Les chemins SVG mirrorés utilisent `P(id, d, true)` et `mir()`.
- Ajouter un accessoire : l'ajouter dans `ACC` / `ACC0` / `ACCC` / `AZL`, puis le dessiner dans `build()`.
- Garder les anciens looks lisibles : toujours donner une valeur par défaut aux nouveaux champs dans `load()`.
- Ne pas utiliser de balise `<form>`. Ne pas dépendre d'un serveur.
- Après une modification, vérifier : aucune erreur dans la console, les 3 modes de vue (face, dos, pièce zoomée), et le mobile (390 px de large).
