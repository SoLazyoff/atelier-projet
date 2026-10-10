# Atelier : outil de création de marque de vêtements

Un seul fichier : `atelier.html` (HTML + CSS + JS, aucune dépendance sauf Google Fonts). Pas de build.
Tester : ouvrir le fichier dans un navigateur, et lancer `node --test tests/*.test.mjs` (fonctions pures, faux DOM dans `tests/charger.mjs`).
En ligne : https://solazyoff.github.io/atelier-projet/ (GitHub Pages, branche `main`). Les données sont dans le localStorage (clé `atelier-marque-v1`).
Langue de l'interface : français. Le téléphone est la cible principale (mobile d'abord).

## Structure du script (dans l'ordre du fichier)
- Données : `TOPS`, `BOTTOMS`, `FABRICS`, `ACC` (accessoires), `PRESETS`, `LOGOS`, `PL` (emplacements de logos), `SHAPES`, `QUICK`, `DEF` (état par défaut).
- État : objet global `S` (chargé par `load()`, sauvegardé par `persist()`).
  Champs clés : `mode` (`piece` ou `outfit`), `cat` (`top`/`bottom`/`acc`), `top`, `bottom`, `fabric` (haut), `fabricB` (bas), `pat` (motif `{top,bottom}` parmi `PATS`, couleur dans `c.tPat`/`c.bPat`, appliqué aux zones de `PATZ` par `patDef()`), `c` (couleurs par zone), `acc`, `marks` (logos), `looks` (collection : pièces `kind:'piece'` et tenues), `brand`, `biz`.
- Rendu : `build(G, uid, sel)` génère le SVG du mannequin. Les zones colorables ont un `id` (`tBody`, `bLegs`, `aHead`…). `ZOOM` gère le cadrage en mode pièce.
- Onglets : `studio()` (Atelier), `marquage()` (logos brodés/imprimés), `brand()` (Marque), `collection()`, `lookbook()`, `biz()` (Business).
- Lookbook : `S.lookbook` contient des looks qui **référencent** des pièces par id (`top`, `bottom`, `acc:{groupe:id}`), sans copier leurs couleurs. `lookG()` les reconstruit via `mergePiece()` ; une pièce supprimée apparaît dans `miss`. `S.lb` = look en cours de composition. `renderTab()` choisit l'onglet.
- Export de fiche : `sheetData(kind,id)` (`kind` = `look` pour la collection, `lb` pour le Lookbook) alimente `exportPdf()` (zone `#print` + `window.print()`) et `exportPng()` (canvas, partage natif sinon téléchargement).
- Patronage : `SPEC` (mesures taille M par coupe), `POM` (libellés), `GRADE` (pas par taille), `TOL` (tolérances) ; `specRows(p)` donne la grille S→XXL avec les surcharges `p.spec`. `flatSVG(p,view)` dessine la pièce à plat (mode `flat` de `build()`) et place les cotes A, B… sur sa géométrie. Toute nouvelle coupe doit avoir son entrée dans `SPEC` (un test le vérifie). Ce sont des mesures de vêtement fini pour un tech pack, pas des pièces de patron 1:1.
- Événements : un seul écouteur `click` (attributs `data-act`, `data-k`) et un seul `input` (attribut `data-in`).

## Règles pour modifier
- Ajouter un vêtement : l'ajouter dans `TOPS` ou `BOTTOMS` (avec ses zones), puis dessiner sa forme dans `build()` (face et dos). `tests/coupes.test.mjs` vérifie automatiquement que chaque zone déclarée est dessinée. Si la coupe sort du cadre du mode pièce, lui donner un cadrage dans `ZOOMP`. Ordre de dessin : bas, tête, haut ; la bavette de salopette (`bib()`) passe après le haut pour les hauts de dessous (`INNER`). Les chemins SVG mirrorés utilisent `P(id, d, true)` et `mir()`.
- Ajouter un accessoire : l'ajouter dans `ACC` / `ACC0` / `ACCC` / `AZL`, puis le dessiner dans `build()`.
- Garder les anciens looks lisibles : toujours donner une valeur par défaut aux nouveaux champs dans `load()`.
- Ne pas utiliser de balise `<form>`. Ne pas dépendre d'un serveur.
- Après une modification, vérifier : aucune erreur dans la console, les 3 modes de vue (face, dos, pièce zoomée), et le mobile (390 px de large).
