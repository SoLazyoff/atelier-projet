# Brief pour Claude Code : projet « Atelier »

## Le projet
Un outil web pour aider à créer une marque de vêtements (inspiré de designs 3D de survêtements, hoodies et bombers vus sur Instagram). Il tient dans un seul fichier : `atelier.html`. Il est pensé pour le téléphone, en français.
Lis d'abord `CLAUDE.md` (structure du code et règles), pas tout `atelier.html` d'un coup : le fichier fait environ 94 Ko. Utilise la recherche dans le fichier pour aller à la fonction concernée.

## Ce qui existe déjà
- **Atelier** : mannequin en SVG (face et dos). Deux modes : « Pièce par pièce » (un haut, un bas ou un accessoire seul, zoomé) et « Tenue complète ». 18 hauts, 10 bas, 9 familles d'accessoires, 4 matières (haut et bas indépendants). Chaque zone se colore au toucher.
- **Marquage** : logos brodés, imprimés, écussons, flocage, relief 3D, avec 14 emplacements, taille, rotation et position fine.
- **Marque** : nom, générateur de noms, univers, logo en 5 styles, présentation de la marque.
- **Collection** : pièces classées (hauts, bas, accessoires) et tenues, avec fiche technique copiable.
- **Business** : calcul de marge et seuil de rentabilité, check-list de lancement.
- Tout est sauvegardé dans le navigateur (localStorage).

## Comment travailler
- Fais des changements ciblés, une tâche à la fois, et garde les anciens looks enregistrés compatibles (valeurs par défaut dans `load()`).
- Après chaque modification : ouvre le fichier dans un navigateur, vérifie la console (aucune erreur), les vues face et dos, le mode pièce, et une largeur de 390 px.
- Reste en un seul fichier HTML sans dépendance, sans `<form>`, sans serveur.
- Réponds en français.

## Pistes d'amélioration (par ordre d'intérêt)
1. Un onglet « Lookbook » : voir toutes les pièces côte à côte et composer plusieurs tenues à partir d'elles.
2. Des motifs sur les vêtements (rayures, carreaux, camouflage, dégradé).
3. Plus de coupes : veste en jean longue, pantalon parachute, salopette, cagoule intégrée, doudoune sans manches.
4. Export de la fiche technique en PDF ou en image pour l'envoyer à un atelier.
5. Un vrai gabarit de patronage à plat (face et dos, avec cotes) pour chaque pièce.
6. Un mode sombre/clair réglable à la main.

## Première demande à lancer
« Lis CLAUDE.md et BRIEF.md, ouvre atelier.html dans un navigateur pour vérifier qu'il fonctionne, puis propose-moi un plan court pour l'onglet Lookbook avant de coder. »
