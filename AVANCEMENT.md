# Avancement — Rap Rat

Carnet de bord du projet : où on en est, ce qui est décidé, ce qui vient après.
À relire au début de chaque nouvelle session.

## Objectif du moment

Deux chantiers en cours :

1. **Le son du croc** — remplacer le son synthétisé par un vrai croquement.
   Fabien veut si possible celui de l'émission.
2. **Le plein écran** — la tranche doit occuper tout l'écran de l'iPhone 16 Pro Max,
   quitte à jouer en paysage (en portrait, la barre d'état iOS reste par-dessus).

## Fait

- **Atelier du son** (`outils/atelier-son.html`, commit `a8c6b1d`) : page autonome où on
  dépose une vidéo ou un son, on découpe un croc (forme d'onde, zoom, « serrer sur le son »,
  repères posés depuis la vidéo), on règle vitesse / volume / graves / aigus / fondus /
  normalisation, on écoute en boucle ou « comme dans l'appli », et on exporte un `.wav`
  16 bits mono. Tout reste dans le navigateur, aucun fichier ne part sur Internet.
  Testé dans le volet navigateur avec un son de test : décodage, découpe, rendu, export.
- **Plein écran** : `.stage` passe en `inset:0` (le canevas va sous l'encoche et sous la
  barre du bas, les commandes restent dans les zones sûres) et `MARGIN` passe de `.02` à `0`
  dans `js/app.js`. Vérifié en 956×440 (paysage) et 440×956 (portrait) : pendant la partie,
  la tranche remplit exactement l'écran. `VERSION` de `sw.js` passée à `rap-rat-v10`.

## Décisions prises

- Le son de l'émission est protégé et le dépôt `Shopatat/rap-rat` est **public** : si on
  extrait le croc de la VHS, soit on l'assume, soit on garde le fichier hors dépôt
  (`.gitignore`) avec le son synthétisé en secours. À trancher avec Fabien.
- Candidats libres de droit repérés (tous CC0, aucune attribution obligatoire), listés en
  bas de l'atelier : *Crunch sounds (burnt toast)*, *Crunch sounds (cucumber)*,
  *7 Eating Crunches*, *Apple Bite*, tous sur opengameart.org. Rien n'a encore été téléchargé.
- La tranche ne se reforme qu'à l'arrêt : tourner le téléphone en cours de partie garde la
  forme d'avant (comportement voulu, sinon on perdrait les morsures déjà prises).
- Pas de ffmpeg sur la machine. L'atelier évite d'avoir à l'installer ; si on veut nettoyer
  le son plus finement (enlever la musique, les voix), il faudra `winget install ffmpeg`.

## Prochaine action

Retrouver une vidéo de l'émission (le dossier `references/` n'existe plus sur le Bureau),
la passer dans l'atelier pour en sortir un croc, puis brancher le `.wav` dans `js/app.js`
à la place de `crunch()` — avec repli sur le son synthétisé si le fichier manque.
