# Rap Rat

Le minuteur du jeu Rap Rat, en version HD : une tranche de fromage à trous que le rat croque petit à petit.
Quand il n'en reste plus rien, le temps est écoulé. On ne voit jamais le rat, seulement ses coups de dents.
Appli web sans installation : du HTML, du CSS et du JavaScript, rien à compiler.

## Mettre l'appli en ligne avec GitHub Pages

1. Crée un nouveau dépôt sur GitHub (par exemple `rap-rat`).
2. Envoie tous les fichiers de ce dossier à la racine du dépôt (`index.html` doit être à la racine).
3. Dans le dépôt : **Settings → Pages**, source **Deploy from a branch**, branche `main`, dossier `/ (root)`, puis **Save**.
4. Au bout d'une minute ou deux, l'appli est dispo sur `https://<ton-pseudo>.github.io/rap-rat/`.

## L'installer sur l'iPhone

Ouvre l'adresse dans **Safari**, touche **Partager**, puis **Sur l'écran d'accueil**.
L'appli s'ouvre alors en plein écran avec son icône, et marche hors ligne après la première ouverture.

Bon à savoir : le temps se compte avec l'horloge du téléphone. Si l'appli passe en arrière-plan ou si l'écran
se met en veille, le rat rattrape les crocs manqués au retour. Les sons ne retentissent que si l'appli est ouverte.
L'écran reste allumé pendant une partie tant que l'appli est au premier plan. Si iOS ferme complètement l'appli, la partie est perdue.

## Comment ça marche

- Avant de lancer : durée de 10 à 60 minutes (15 minutes par défaut, comme dans l'émission), son, chrono visible ou caché.
- Pendant la partie, le fromage prend tout l'écran. Touche l'écran pour faire apparaître Pause et Recommencer quelques secondes.
- Les crocs ont toujours la taille de ceux de l'émission (environ 75 crocs pour manger tout le fromage). Une durée plus longue les espace davantage : un croc toutes les 8 secondes environ en 10 minutes, toutes les 12 secondes en 15 minutes, toutes les 50 secondes en 60 minutes.
- Le dernier croc tombe pile à la fin du temps.

## Organisation des fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | La page et les commandes |
| `css/style.css` | Le style (plein écran, commandes qui se cachent) |
| `js/app.js` | Toute la logique : dessin du fromage et des trous, crocs, minuteur, sons |
| `sw.js` | Service worker : met l'appli en cache pour le hors ligne |
| `manifest.webmanifest` | Nom, couleurs et icônes pour l'écran d'accueil |
| `icons/` | Les icônes, générées par `node outils/icones.js` |

## Après une modification

Change la valeur de `VERSION` en haut de `sw.js` (par exemple `rap-rat-v2`).
Sans ça, les téléphones qui ont déjà l'appli continuent d'afficher l'ancienne version.

## Tester sur l'ordinateur

Le mode hors ligne ne marche pas en ouvrant `index.html` directement (adresse en `file://`).
Pour tout tester, lance un petit serveur dans le dossier : `npx serve`, puis ouvre l'adresse affichée.
