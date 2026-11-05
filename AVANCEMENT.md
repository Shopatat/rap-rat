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
- **Le vrai croc** : `sons/croc.wav` (200 ms, mono 44,1 kHz, découpé par Fabien dans l'atelier)
  remplace le son synthétisé. Chargé au démarrage de la partie, rejoué avec de petites
  variations de volume et de hauteur ; repli automatique sur le synthétisé si le fichier manque.
  Ajouté à `FILES` dans `sw.js`, `VERSION` en `rap-rat-v11`.
- **Croc nettoyé** : les 57 premières ms de frottement sont coupées (fondu d'entrée 2 ms, sortie 12 ms),
  le son dure 143 ms et commence directement au craquement. `VERSION` en `rap-rat-v12`. L'original de
  200 ms est dans l'historique git (commit fb024cd) si on veut y revenir.
- **Paysage obligatoire** : en portrait, un panneau « Tourne ton téléphone » (`.turn` dans
  `index.html` + `css/style.css`) couvre tout l'écran. Le manifeste demande `"orientation":
  "landscape"` (suivi par Android, ignoré par iOS, d'où le panneau). La partie en cours continue
  de compter pendant le portrait et se retrouve intacte en tournant : la tranche ne se reforme
  plus qu'en paysage (`fit()` dans `js/app.js`). `VERSION` en `rap-rat-v13`.
- **Écran figé** : plus de double-touché pour zoomer (`touch-action:manipulation` sur tout,
  `.stage` reste en `none`), plus de pincement (les gestes iOS `gesturestart` et suivants sont
  annulés dans `js/app.js`), et le viewport refuse l'échelle. `VERSION` en `rap-rat-v14`.
- **Chrono retiré** : le bouton « Chrono », l'élément `#clock`, sa règle CSS et la fonction `fmt()`
  sont supprimés. Il ne reste que la durée et le son dans la barre. `VERSION` en `rap-rat-v15`.
- **Plus de secousse** : la toile ne tressautait plus qu'à cause de moi, pas de l'émission ;
  l'animation `jolt` est supprimée. Le croc ne se signale plus que par le trou et le son.
  `VERSION` en `rap-rat-v16`.
- **Foyers de morsures** : relevé sur `references/progression/` (10 captures de l'émission,
  hors dépôt), le rat ouvre quatre foyers et les élargit. Quatre premiers crocs = quatre foyers,
  ensuite deux sur trois tombent contre un foyer existant, qui ne suit la morsure qu'à 30 %
  pour grossir sur place. `FOYERS`, `RESTE`, `PRES` dans `js/app.js`. `VERSION` en `rap-rat-v17`.
  Nouveau raccourci de test : `RapRat.bites(n)` applique n morsures d'un coup.
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

Écouter le croc nettoyé en situation sur l'iPhone (une partie entière espace les crocs d'environ
12 secondes) et dire s'il manque de corps depuis la coupe du début, ou s'il faut varier davantage.

## Ensuite : la musique

Fabien veut ajouter la musique du jeu. Points à trancher avant de coder :

- **Boucle ou morceau entier.** La partie dure de 10 à 60 minutes : une boucle courte (30 s à
  1 min, bouclée proprement) pèse quelques centaines de Ko, un morceau entier de 15 min en mp3
  pèse une quinzaine de Mo — trop lourd pour le cache hors ligne de `sw.js`.
- **La veille de l'écran.** Le minuteur tient avec `Date.now()`, mais sur iPhone le son se coupe
  quand l'appli passe en arrière-plan. À tester : un élément `<audio>` tient mieux que Web Audio,
  et il faudra sans doute relancer la musique au retour (`visibilitychange`), là où le croc
  reste en Web Audio.
- **Les réglages.** Prévoir « Musique : oui/non » à côté de « Son : oui/non », avec un volume
  séparé, et baisser légèrement la musique au moment du croc pour qu'il reste net.
- **La fin.** Fondu de sortie sur les dernières secondes, ou coupure franche quand la tranche
  est finie.
- **Les droits.** Même question que pour le croc : le dépôt est public.

L'atelier du son sert aussi pour ça : il décode n'importe quel fichier, mais il est taillé pour
des extraits courts. Pour une boucle, il faudra vérifier le raccord début/fin à l'oreille.
