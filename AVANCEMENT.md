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
- **Pas de vert** : deux captures de `references/etapes/` montrent la tranche en vert vif. C'est la
  VHS qui déraille, pas le jeu — ne pas chercher à le reproduire.
- **La fin reste hérissée** : douze captures de fin (`references/fin/`, hors dépôt) montrent une
  étoile dentelée jusqu'à la dernière bouchée. Mon code mangeait les pointes en priorité pour
  arrondir le morceau : c'était l'inverse. Le rat mord désormais dans la masse et les piquants
  restent debout. `VERSION` en `rap-rat-v24`.
- **Milieu de partie : le pourtour, partout** : sur les seize étapes, le rat ronge tout le bord à
  la fois, coins compris, et la silhouette reste large et carrée longtemps. La « distance en rond »
  ajoutée au milieu de partie est donc retirée, et la préférence pour le milieu des côtés est
  adoucie (exposant 3 au lieu de 4×REGROUPE, coins à peine retardés). `REGROUPE` ne pilote plus
  que la fin de partie. `VERSION` en `rap-rat-v23`.
- **Ancienne note, tranchée** : sur ces seize étapes, la tranche garde une silhouette large et presque
  rectangulaire très longtemps, le rat rongeant tout le pourtour à la fois. Le peu de « distance
  en rond » ajouté au milieu de partie par `REGROUPE` arrondit peut-être trop tôt. À trancher
  quand Fabien aura envoyé la suite des étapes.
- **La fin vise le trou du rat** : dans l'émission, le rat sort par la trappe ronde du centre, donc
  les dernières bouchées se mangent forcément autour. Sous 15 % de fromage restant, le choix des
  morsures abandonne le milieu de ce qu'il reste et vise le centre de l'écran. `VERSION` en `rap-rat-v22`.
- **Huit foyers, pas quatre** : Fabien a envoyé huit captures de début de partie (`references/debut/`,
  hors dépôt) où l'on compte huit ou neuf zones rongées distinctes tout autour du bord. Mon
  hypothèse des quatre foyers était fausse : `FOYERS` passe de 4 à 8 et `RESTE` de 68 % à 55 %.
  `VERSION` en `rap-rat-v21`.
- **Regroupement vers le centre** : nouveau réglage `REGROUPE` (1,4 par défaut, curseur dans
  l'Atelier des foyers). Il durcit le choix des morsures vers l'extérieur, mêle un peu de distance
  « en rond » à la distance « en boîte », et déclenche la phase de fin plus tôt. Demandé par Fabien :
  « faut que ça se regroupe plus sur le centre, surtout vers la fin ». `VERSION` en `rap-rat-v20`.
- **Fin de partie arrondie** : en dessous d'un tiers de fromage restant, les foyers sont mis de
  côté et les morsures visent ce qui dépasse — loin du milieu de ce qu'il reste, loin du centre de
  l'écran, et surtout les pointes isolées (peu de fromage autour). Avant, la fin laissait un ruban
  déchiqueté en diagonale, décalé ; maintenant le morceau fond en rond vers le centre.
  `VERSION` en `rap-rat-v19`.
- **Atelier des foyers** (`outils/atelier-foyers.html`) : Fabien y règle lui-même si le rat mord
  partout ou s'acharne — nombre de foyers, part des crocs qui tombent sur un foyer, largeur d'un
  foyer — avec les dix captures de l'émission en dessous pour comparer. La tranche est dessinée par
  le vrai `js/app.js` (markup de l'appli repris dans la page, barres masquées), et une graine rend
  la partie reproductible : deux réglages se comparent honnêtement. Réglages exposés via
  `RapRat.reglages()`, `RapRat.neuf()`, `RapRat.bites()`. **Les valeurs actuelles (4 foyers, 68 %)
  sont une hypothèse de ma part, pas un choix de Fabien** : dix captures sur quinze minutes ne
  prouvent pas grand-chose, il pense que le rat mord plutôt un peu partout. À trancher dans l'atelier.
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

## La musique

- **Fichier source** : `references/musique/theme.mp3` (hors dépôt), 85,4 s, 48 kHz stéréo. Déjà
  monté par quelqu'un à partir de l'émission : **20 collures** repérées, dont une série à 4,9 / 5,9 /
  6,9 / 8,9 / 10,9 s. Le fichier entier ne boucle pas (raccord fin→début à 0,998, où 0 est parfait).
- **Structure** : motif de **3,98 s**, grand motif de 7,96 s. La meilleure boucle sans collure
  dedans démarre à **71,26 s** et dure **7,96 s** (raccord 0,037 : excellent).
- **Atelier de la boucle** (`outils/atelier-boucle.html`) : trouve le motif par autocorrélation,
  repère les collures, propose les meilleures boucles, fait écouter *la jointure seule* en boucle
  serrée, offre un fondu enchaîné et exporte le `.wav`.
- **Le morceau entier est jouable** (demandé par Fabien : « je vois pas pourquoi on pourrait pas
  prendre la musique complète »). Le poids n'a jamais été l'obstacle : le mp3 fait **1,4 Mo**, il
  tient sans peine dans le cache hors ligne. Le seul vrai coût d'une longue boucle, c'est son
  raccord. L'atelier a donc deux modes :
  - *boucle courte* — deux ou quatre motifs, raccord 0,037 (excellent), mais 113 passages en
    quinze minutes, et la moindre collure devient un tic ;
  - *presque tout le morceau* — longueur égale à un nombre entier de motifs pour retomber en phase.
    Meilleur candidat : **début 3,520 s, durée 59,662 s** (15 motifs), raccord **0,084** (bon),
    16 passages. Le morceau quasi complet (21 motifs, 0,50 → 84,05 s) tient aussi, à 0,136.
    Les 20 collures restent dedans — entendues une fois par minute elles passent pour de la musique,
    c'est en boucle courte qu'elles deviennent gênantes.
  Fondu enchaîné porté à 2 s (600 ms par défaut en mode long).
- **Troisième mode, « Tout garder »** : le début glisse après le premier son, la fin avant le
  dernier, et l'atelier cherche le couple qui se recolle le mieux, sans contrainte de motif.
  Résultat : **7,485 → 84,029 s** (76,5 s), raccord **0,178**. C'est deux fois moins bon que la
  boucle de 15 motifs (0,084), et c'est instructif : la recherche fuit d'elle-même les sept
  premières secondes — exactement là où sont les collures du monteur (4,9 / 5,9 / 6,9 / 8,9 /
  10,9 s). Le début du fichier est du rafistolage, pas de la musique.
- **Le raccord se joue à la milliseconde** : décalé de 5 ms, le meilleur passage tombe à 1,004
  (« mauvais »). Les bords ne se règlent donc pas à la main. Les flèches « début ◂ ▸ / fin ◂ ▸ »
  déplacent d'un cinquième de motif, puis l'atelier recale tout seul (± 250 ms au millième).
  « Chercher le mieux autour » fait la même chose sans bouger d'abord.
- **Fondu à puissance constante** (`cos`/`sin` au lieu de `1−k`/`k`) : avec un fondu linéaire, deux
  passages qui ne se ressemblent pas s'effondrent de 3 dB au milieu du raccord et on entend un
  trou — pile le défaut qu'on cherchait à masquer.
- **Note de Fabien** : ce mp3 est déjà un travail de prélèvement fait par quelqu'un, nettoyé à
  coups de raccords. Les 20 collures sont donc de lui, pas de l'émission ; et rien ne garantit
  qu'un raccord parfait existe dans ce fichier.
- **Pas besoin d'exporter un wav** : Web Audio boucle n'importe où dans un son décodé
  (`loopStart` / `loopEnd`). L'appli gardera donc le `.mp3` tel quel et posera les deux repères.
  Un wav de 60 s pèserait 5 Mo contre 1,4 Mo pour le mp3 entier.

## L'Atelier des foyers ne mentait plus

Ses curseurs étaient restés sur mes anciennes hypothèses (4 foyers, 68 %) alors que l'appli
tourne à 8 et 55 % depuis `rap-rat-v21` : l'atelier montrait autre chose que le jeu. Il lit
maintenant les vraies valeurs au démarrage (`RapRat.actuels()`), et « Réglages actuels de
l'appli » y revient pour de bon. Deuxième correction : la toile restait parfois à 300×150 et
s'étirait — `RapRat.ajuste()` la recale sur sa boîte à la résolution réelle de l'écran.
Vérifié en 375×812 : toile 626×288 pour une boîte de 313×144 en dpr 2.

## La musique est dans l'appli (aperçu)

Fabien a écouté les trois boucles proposées : « plutôt à chier les trois ». Il reprendra le
raccord lui-même, chez lui, dans Audacity. En attendant il veut le morceau **entier, tel quel**,
pour l'avoir dans l'oreille et repérer les couacs. `VERSION` en `rap-rat-v25`.

- `sons/musique.mp3` (1,4 Mo), servi tel quel, **sans travail de raccord** : quand il se termine,
  il repart du début (`loop` sur l'élément `<audio>`). Ça s'entendra, c'est assumé pour l'instant.
- Elle démarre **à l'ouverture de l'appli**, pas au lancement d'une partie.
- Un élément `<audio>` plutôt que Web Audio : sur iPhone il tient mieux la veille et les
  allers-retours vers une autre appli. Elle est relancée sur `visibilitychange`, `pageshow`,
  `focus`, et au moindre `pause` inattendu — iOS coupe le son dès qu'on part ailleurs.
- iOS refuse de jouer avant un geste : le premier toucher de l'écran débloque la lecture.
- Bouton **« Musique : oui/non »** à côté de « Son », mémorisé dans `localStorage`.
- **iOS ignore `volume` sur un élément `<audio>`** : la musique sort au volume du téléphone, on ne
  peut pas la baisser sous le croc. Si ça gêne, il faudra la passer en Web Audio (au prix de la
  tenue en arrière-plan) ou baisser le gain dans le fichier lui-même.
- **Le dépôt est public** : poser ce mp3 dans `sons/` le publie sur GitHub Pages sous le nom de
  Fabien. À confirmer avant de pousser.

## Reste à trancher pour la musique

Fabien veut ajouter la musique du jeu. **Décidé** : on part sur la version américaine, plus punchy
et facile à récupérer proprement ; la française viendra plus tard si on arrive à la nettoyer.
Ce sont deux compositions différentes, pas deux repiquages d’une même bande (donc pas de question
de vitesse SECAM/NTSC). La française n’existe que dans un enregistrement du jeu 1 où le rat parle
par-dessus et où les crocs claquent : la piste, si on s’y met, est le nettoyage par répétitions —
la musique boucle, donc une mesure couverte à un passage est souvent dégagée au suivant.

Points à trancher avant de coder :

- **Boucle ou morceau entier.** Tranché côté technique : les deux marchent, le mp3 reste en entier
  dans le dépôt et l'appli choisit ses repères. Reste à écouter les deux jointures et à choisir
  (voir ci-dessus).
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
