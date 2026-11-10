# Avancement — Rap Rat

Carnet de bord du projet : où on en est, ce qui est décidé, ce qui vient après.
À relire au début de chaque nouvelle session.

## Objectif du moment

**Les morsures, faites par Fabien lui-même** (demandé le 07/11/2026). C'est dur à décrire,
alors il veut un atelier très complet : il y fait les crocs à la main pour me montrer ce qu'il
cherche. Il veut régler leur forme (« littéralement les formes », il enverra peut-être des
photos de près), leur position, leur taille et leur profondeur, surtout au début. Il veut aussi
voir les défauts qui peuvent arriver (îles, etc.). Ensuite, c'est mon travail de caler le temps
pour que ça reste harmonieux jusqu'à la fin.

Plan en trois étapes, chacune utilisable seule :

1. **Atelier des morsures** (`outils/atelier-morsures.html`) — **fait (v34)**, voir plus bas.
2. **Atelier des formes** — **fait (v35)** : onglet « Formes » de l'Atelier des morsures,
   voir plus bas.
3. **Mon travail** — relire les parties que Fabien colle dans la conversation, en tirer les
   règles (où, dans quel ordre, quelle taille, quelle forme), et recaler le rat de l'appli et
   son rythme.

Les anciens chantiers (le son du croc, le plein écran) sont faits, voir « Fait ».

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

Fabien essaie l'Atelier des morsures sur l'iPhone
(https://shopatat.github.io/rap-rat/outils/atelier-morsures.html), fait une ou plusieurs
parties à la main (et dessine des formes s'il veut), et colle le texte « Copier pour Claude »
dans la conversation. Ensuite, l'étape 3 : lire ses parties et recaler le rat de l'appli.

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

## Mordre partout, et se regrouper au centre

Demandé par Fabien : « j'ai envie que ça morde de manière homogène partout et que ça se regroupe
bien vers le Centre ». Trois changements dans `pickEdge()`, `VERSION` en `rap-rat-v27` :

- **Le bord est mesuré autrement.** Plus de distance « en boîte » (qui mangeait le milieu des
  côtés en premier) ni de distance au centre brute (qui mangerait les coins en premier). On
  compare chaque bout de bord à ce qu'allait la tranche d'origine **dans cette direction-là** :
  sur une tranche entière ce rapport vaut 1 partout, donc le rat attaque le pourtour
  uniformément ; dès qu'un endroit est entamé il passe sous 1 et ce qui dépasse encore devient
  plus tentant. Le front avance ensemble et le reste se resserre en rond.
- **Le rat se souvient de toutes ses morsures** (`ETALE`, 0,95 ; curseur « mordre partout » dans
  l'atelier). Première version : il n'évitait que les six dernières, ce qui laissait encore des
  paquets. Fabien a tranché — « qu'autant que possible ça morde dans un endroit pas déjà mordu,
  c'est ça que je veux depuis le début » — donc on garde tout l'historique de la partie et on
  regarde la morsure la plus proche : un endroit vierge garde tout son poids, un endroit déjà
  croqué s'effondre. Le plancher de hasard passe de 0,012 à 0,002 pour que le bord intact
  l'emporte vraiment. Mesuré à 20 crocs : les quatre côtés sont entamés à 25–34 points sur 40.
  Rayon d'évitement = `PRES` (0,16) ; essayé à 0,26, c'est moins bon (la fin laisse des miettes
  détachées). `VERSION` en `rap-rat-v28`.
- **La fin ne vise plus que le centre de l'écran.** Elle visait un mélange du centre de l'écran
  et du milieu de ce qu'il reste ; ce dernier dérive au fil des morsures et le dernier morceau
  finissait de côté. Le trou du rat, lui, ne bouge pas.
- `RESTE` passe à 0 : les foyers sont désactivés par défaut, puisqu'ils servaient justement à
  faire s'acharner le rat au même endroit. Le mécanisme reste là, réglable dans l'atelier.
- Essais comparés en planches de six étapes (`references/essais/`, hors dépôt) :
  **regroupement 1,4 est le meilleur**. À 2,2 le morceau se recentre plus tôt mais finit en
  lamelle de travers ; à 3,0 il s'étire en serpent et laisse des miettes détachées.

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

## Le relief de la tranche

Fabien, capture de l'émission à l'appui : « tu peux constater que le fromage a un certain
relief ». Il y avait déjà deux ombres intérieures le long des morsures, mais uniformes : aucune
direction, donc aucune épaisseur lisible. `compose()` pose maintenant quatre passes, lumière
venant d'en haut à gauche : ombre douce tout autour, paroi sombre côté opposé à la lumière,
liseré ambré côté lumière, puis un trait net pour que le bord reste franc (pas de flou, règle
déjà tranchée avec Fabien). `VERSION` en `rap-rat-v29`.

Reste ouvert : sur la capture, le cœur de la tranche est nettement plus clair qu'au bord, presque
blanc-jaune. Le dégradé actuel est plus plat. Ne pas y toucher sans Fabien — la teinte « orange
profond et saturé, centre plus jaune » a été choisie avec lui.

## L'épaisseur, la vraie

Précision de Fabien : il ne parlait pas d'ombres mais de **l'épaisseur du fromage, visible sur
certains bords** de la capture — la tranche vue de côté. La version v29 ne faisait que modeler la
face du dessus ; il manquait la paroi elle-même.

`compose()` dessine maintenant deux choses. D'abord la **paroi** : la même silhouette glissée vers
le bas (et un peu à droite), en sept couches de plus en plus sombres, du même ambre que le fromage
vers un brun profond. Chaque couche n'est visible que là où la suivante ne la couvre pas, ce qui
donne une bande dégradée sous tous les bords tournés vers nous. Puis la **face du dessus**, posée
par-dessus, avec son modelé (lumière d'en haut à gauche). Un nouveau canevas `face` sert à la
préparer à part.

`EPAISSEUR` (0,022, soit 2,2 % de la hauteur de l'écran) est réglable dans l'atelier, curseur
« épaisseur de la tranche », de 0 à 6 %. Vérifié : l'aire dessinée grandit bien avec le réglage
(60 354 → 62 209 → 65 126 points sondés à 0 %, 2,2 % et 5 %). `VERSION` en `rap-rat-v30`.

## Le relief, relevé en gros plan (v31)

Fabien a envoyé deux nouvelles captures (`references/relief/`, hors dépôt, avec `zooms.png` :
six gros plans des bords) en demandant d'observer « le relief et l'épaisseur partout où tu
peux ». Ce que montrent les gros plans :

- **La tranche est une dalle épaisse aux bords arrondis.** À chaque bord mordu, la face du dessus
  s'enroule : côté lumière (en haut à gauche) un liseré jaune clair, puis le bord plonge dans un
  brun-rouge chaud avant le noir ; côté ombre (en bas à droite) ce brun-rouge s'étale plus large.
  **Rien ne dépasse de la silhouette** : la paroi décalée sous les bords de la v30 était donc
  fausse (et buguée : sa boucle peignait les sept couches de la même teinte). Retirée.
- **Le trou de la trappe montre l'épaisseur** : paroi intérieure éclairée en bas et à gauche,
  fond noir décalé vers le haut, bord arrondi autour (clair côté lumière, brun-rouge côté ombre).
- **Le couvercle est un disque épais** dont la tranche, plus claire que la face, se voit
  d'autant plus qu'il pivote : maintenant `0,3 × r × |sin φ|`, nulle à plat, pleine de profil.

`compose()` fait quatre passes à l'intérieur du masque (bombé, arrondi côté ombre, liseré côté
lumière, bord qui plonge) ; `EPAISSEUR` (curseur de l'atelier) règle la largeur de l'arrondi.

Remarqué mais **pas touché** (choix déjà faits avec Fabien, à lui de dire) :
- le couvercle et le trou de l'émission sont plus grands (diamètre ≈ 35–40 % de la hauteur de
  l'image, contre 26 % chez nous) ;
- la surface de l'émission est lisse avec de larges ondulations douces ; la nôtre a un grain fin ;
- les trous de l'émission sont moins nombreux et plus gros, groupés vers le milieu, avec un
  halo clair autour comme un cratère.

## Trappe, surface et trous (v32)

Fabien : « occupe-toi de tout ». Les trois différences relevées en v31 sont traitées :

- **La trappe** passe de 26 % à 38 % de la hauteur (rayon `.13` → `.19` dans `drawIntro`). Les
  ondes gardent leur épaisseur d'origine (`r0`), sinon elles auraient grossi avec.
- **La surface** est lisse : plus de petites taches (160 × l'allongement de l'écran, rayon 20–110)
  ni de grain (± 3 par pixel). À la place, 18 larges ondulations (rayon 180–460) claires ou
  sombres, et un tramage d'un seul niveau, invisible, contre les escaliers dans les dégradés.
- **Les trous** : 70 au lieu de 110 (vérifié sur six tranches). Surtout beaucoup moins de trous
  moyens (5 au lieu de 20 avant le facteur d'allongement), les gros montent à 22–34. Tirés de
  préférence vers le milieu (acceptation gaussienne, écart 0,6) et jamais contre le bord de la
  tranche — la marge était de 0,2 × r, un trou pouvait donc entailler le bord, ce que Fabien
  avait refusé. Halo en cratère renforcé autour des gros trous (0,34–0,56 au lieu de 0,18–0,40) ;
  le bord du trou, lui, reste net.
- Nouveau raccourci de test : `RapRat.trous()` donne le nombre de trous posés.

Les choix de relief sont reportés dans `CLAUDE.md`.

## Deux musiques au choix (v33)

Fabien a fourni un nouveau fichier, « Rap Rat thème.mp3 » (étiquettes : « Rap Rat Theme », +TEK,
3 min 38, 128 kb/s, 3,5 Mo) : « mets celle-là à la place de l'autre, ou en choix alternatif ».

- Les deux sont dans `sons/` : `theme.mp3` (le nouveau, **par défaut**) et `instrumental.mp3`
  (l'ancien `musique.mp3`, « Rap Rat Theme (Instrumental) », 1 min 25, renommé).
- Le bouton passe de **« Musique : thème »** à **« Musique : instru »** puis **« Musique : non »**.
  Changer de morceau le reprend au début. Choix gardé dans `localStorage` (`raprat.morceau`) ;
  l'ancien réglage oui/non est repris (non reste non, oui devient le thème).
- L'élément `<audio>` n'a plus de `src` dans `index.html` : c'est `js/app.js` qui met le morceau
  choisi, pour ne pas charger l'autre pour rien.
- **Service worker** : Safari lit une musique par bouts (en-tête `Range`) et peut refuser de la
  jouer si on lui renvoie le fichier entier en 200 — c'était le cas depuis la v25, jamais vérifié
  sur l'iPhone. Les `.mp3` sont maintenant servis depuis le cache (fichier complet rechargé à
  chaque `VERSION`), découpés au bout demandé, en 206. Vérifié sur localhost en installant le
  service worker à la main : 206 pour `0-1`, `1000000-`, `-500`, 416 au-delà de la fin, 200 sans
  `Range`, et la lecture passe par lui.
- **Volume** : le thème est nettement plus fort que l'instrumental (moyenne −16,5 dB contre
  −20,7 dB), au niveau du croc (−16,6 dB). iOS ignore `volume`, donc sur l'iPhone il sort à
  plein. Si le croc est couvert, on peut baisser le gain du mp3 sans le réencoder (comme mp3gain :
  on change le gain global de chaque trame, par pas de 1,5 dB).
- Pas encore entendu sur l'iPhone.

## Atelier des morsures (v34, étape 1 sur 3)

`outils/atelier-morsures.html`, sur la vraie tranche de l'appli (même rendu, même grille), à la
forme de l'iPhone en paysage (956 × 440). Marche au doigt, en paysage (tranche à gauche,
réglages à droite) comme en portrait.

- **Viser, croquer** : toucher la tranche pose un croc fantôme (clair : sa forme, sombre : ce
  qu'il enlèverait), on le glisse au doigt. « Coller au bord » le pose sur le bord le plus
  proche, comme le rat. « Croquer ! » le valide ; en mode rapide, lever le doigt suffit.
- **Le croc** : taille (100 % = le croc de l'appli en début de partie, 0,8 × `baseR`), nombre
  de ronds (1 à 4), avancée des dents, recul, biais, écart, inégalité des ronds, direction
  (comme l'appli, face au bord, vers le centre) et rotation, vagues du bord, « varier un peu »
  comme le rat, « au hasard » tire une forme comme l'appli. Un aperçu montre le croc sur un bord droit.
- **Le rat** : « propose » montre où mordrait l'appli (accepté tel quel → noté `p`),
  « mord » et « finit » le laissent faire (`r`), « dernière bouchée » avale le reste (`f`).
- **Voir** : îles (morceaux détachés d'au moins 0,1 %) et miettes en rouge, numéros dans le
  creux de chaque croc, trajet dans l'ordre, cercle de la trappe, calque photo (une capture
  posée par-dessus, transparence, largeur, hauteur, décalage) et l'heure où tomberait chaque
  croc pour une partie de 10 à 60 min, à côté de ce que l'appli aurait mangé au même moment.
- **Garder** : annuler / refaire, revoir la partie au curseur, la dérouler. Tout s'enregistre
  dans le téléphone (`localStorage`, `raprat.morsures.*`), parties nommées, notes libres.
  Copie de secours automatique avant d'oublier 5 crocs ou plus. « Copier pour Claude », fichier
  `.json`, image `.png`, et relecture d'un texte collé.
- **Le texte envoyé** : un en-tête (forme de la tranche `A`, taille de référence, notes) puis
  une ligne par croc, colonnes décrites dans le texte lui-même : qui, x, y (en largeurs de
  tranche), angle d'où vient le croc, taille, ronds, écart, rayons, biais, avancée, recul,
  vagues, graine, mangé et îles après. La graine redonne le même bord ondulé : relu, le texte
  redonne la même tranche (vérifié : 0 case de différence).

Dans l'appli (`js/app.js`), sans rien changer au jeu : la forme d'un croc est maintenant tirée
par `tirerForme()` (les mêmes tirages qu'avant) puis construite par `shapeTemplate(p)` à partir
d'une graine (`alea`) ; `shapeTemplate` sait faire 1 à 4 ronds. La taille vient de
`tailleCroc()`, `bite()` renvoie ce qu'il a croqué, et `RapRat` a les raccourcis de l'atelier
(`croquer`, `mordre`, `proposer`, `efface`, `grille`, `masque`, `cadre`, `compte`…). Vérifié :
une partie entière de 73 crocs va au bout (moitié mangée au 37ᵉ), l'Atelier des foyers marche.
Le copier-coller n'a été vérifié que dans le navigateur de l'ordinateur, pas sur l'iPhone.

## Les formes (v35, étape 2 sur 3)

Un onglet « Formes » dans l'Atelier des morsures :

- **La bibliothèque** : « Deux ronds, tirés comme l'appli » (toujours là), les ronds réglés dans
  l'onglet Croc qu'on garde, et les formes dessinées. Pour chacune : une vignette, une case
  « le rat » (il a le droit de l'utiliser quand il propose, mord ou finit), un poids (×1 à ×10),
  « Pour moi » (la prendre pour ses propres crocs), supprimer. Gardée dans le téléphone
  (`raprat.morsures.formes`).
- **Dessiner** : la ligne est le bord de la tranche, le fromage dessous, un croc de l'appli en
  clair pour la taille. Un seul trait, qui plonge dans le fromage et en ressort ; il est fermé
  par l'extérieur, lissé (Chaikin) et allégé à 90 points au plus. Une photo peut aller dessous
  (taille, rotation, décalage, fromage plus ou moins transparent par-dessus).
- Une forme dessinée prend la taille, l'avancée, le recul, le biais et la direction de l'onglet
  Croc ; elle n'a pas de vagues (le trait est le bord).
- **Le texte envoyé** contient toute la bibliothèque (`formes`, contours compris) et, pour chaque
  croc, l'id de sa forme (colonne 20). Relu, il redonne la même tranche (vérifié).

Dans l'appli : `shapeTemplate` sait faire un contour (`p.contour`, en rayons de croc), `realize`,
`forCellsIn` (point dans le polygone) et `applyBite` le creusent. `RapRat.choixForme(fn)` laisse
l'atelier choisir les formes du rat ; le jeu, lui, tire toujours les siennes (`tirerForme`).
Corrigé au passage : la tranche ne restait pas collée en haut quand on fait défiler les
réglages (c'était `body` qui défilait).

## La cassette ne jouait qu'une seule partie (relevé par Fabien le 08/11/2026)

Fabien a comparé les trois parties de 15 minutes de la cassette : les morsures sont les mêmes,
dans le même ordre. C'est logique — une VHS ne tire rien au hasard, il n'y a pas d'ordinateur dans
une cassette. Les gens du jeu ont donc animé **une seule partie** et l'ont remise trois fois.

Précisé le 08/11/2026 : **seule l'image est réutilisée.** Les trois parties ont chacune sa musique,
trois morceaux différents, soit environ quarante-cinq minutes écrites pour le jeu. Fabien pense
aussi, et ça se tient, que les animations du rat sont les mêmes dans toutes les langues : c'est un
animatronique, sa mâchoire s'ouvre et se ferme sans articuler de syllabes, donc n'importe quelle
langue colle dessus, et on ne retourne pas un plateau de marionnette pour un doublage. Donc **tout
le visuel serait identique partout** ; seuls la voix et la musique changent. Pas entièrement
revérifié.

Conséquence : les règles que j'ai écrites dans `pickEdge` (`FOYERS`, `RESTE`, `PRES`, `REGROUPE`)
n'ont jamais existé chez eux. Il n'y avait pas de rat qui décide, il y avait un animateur qui
enlevait les bouchées une par une à la main. L'Atelier des morsures n'est donc pas un pis-aller en
attendant que je règle le rat : c'est la méthode d'origine.

Reste à trancher avec Fabien, plus tard : l'appli rejoue-t-elle **une séquence fixe** (fidèle à la
cassette) ou garde-t-elle **un rat qui improvise** (chaque partie différente) ? Rien n'est décidé.
Une séquence fixe marcherait quand même sur tous les écrans, puisque les positions sont en
largeurs de tranche, et une durée plus longue espacerait simplement les crocs.

## Le jeu, et qui a fait la musique (cherché le 08/11/2026)

Ce qu'on appelait « l'émission » est un jeu de société australien de 1992 : **Rap Rat**, conçu par
**A Couple 'A Cowboys** (Brett Clements et Phillip Tanner, Sydney), édité en PAL par
**J. W. Spear & Sons** et en français par **Habourdin International**. Même boîte, même éditeur,
un an plus tôt : **Atmosfear** (sorti sous le nom *Nightmare*), le jeu VHS d'horreur. Il existe
aussi une version italienne (*Il gioco video*) et une espagnole (*El juego de tablero con video*).

Les versions PAL et NTSC n'ont pas les mêmes voix ni le même texte. En revanche **la musique est la
même** : corrigé le 08/11/2026 après écoute par Fabien. Ce qu'il prenait pour « la musique
américaine » était celle d'un autre jeu de la cassette — la personne qui a partagé la version
française n'a mis en ligne que le jeu 1, et les extraits américains du thème viennent du jeu 3.
Les musiques sont funk, avec des guitares électriques de temps en temps, sans boucle perceptible,
et celle du jeu 1 tourne moins vite en rond que celle du jeu 3. Une légère différence de tonalité
entre deux copies vient de la vitesse (conversion de norme, ou dérive de la numérisation) :
mesurable et rattrapable en rééchantillonnant.

Ça ouvre la méthode de nettoyage la plus propre : **la même musique sous des doublages
différents**. On prend à chaque instant la version où le rat se tait. Et comme l'image est
identique partout, elle sert de repère pour caler les copies au photogramme près, ce qui règle du
même coup la dérive de vitesse.

**Le compositeur n'est écrit nulle part en ligne** : la page « Soundtracks » d'IMDb est vide,
Wikipédia ne parle que de bruitages. La piste la plus solide vient d'un recoupement :

- IMDb donne deux sociétés de production pour Rap Rat : A Couple 'A Cowboys et
  **Twilight Productions**.
- La bande-son d'*Atmosfear: The Third Dimension* (CD, EMG Publishing, 1995) est créditée
  **Murray Burns et Colin Bayley**, sous le nom **Twilight Music Productions** (VGMdb, MobyGames).
- Discogs décrit Colin Bayley comme un musicien néo-zélandais « in the group Twilight Productions ».
- Burns et Bayley étaient tous deux dans **Mi-Sex** (le groupe de « Computer Games ») et écrivaient
  ensemble la musique de la série *Beyond 2000* depuis le milieu des années 80.

Donc la musique de Rap Rat est très probablement de **Murray Burns et Colin Bayley**. Ce n'est pas
un crédit lu sur la cassette, c'est une déduction : Twilight est bien sur Rap Rat, et Twilight est
bien eux, mais aucune source ne les relie directement à Rap Rat. Le générique de fin de la
cassette française reste la seule preuve possible, et personne ne l'a transcrit.

Bon à savoir : pour Atmosfear, une version **propre** de la musique (sans les interruptions du
Gatekeeper) a bel et bien été éditée en CD en 1995. Le précédent existe donc. Murray Burns joue
toujours avec Mi-Sex et donne des interviews radio ; Brett Clements a un site (brettclements.net).
Ce sont des gens à qui on peut écrire.

### Récupérer la musique sans la voix du rat

Le problème n'est pas que la voix masque la musique : au mixage, la musique a été **réellement
baissée** sous la voix (du ducking). Aucun séparateur ne peut rendre un niveau qui n'a jamais été
enregistré. Les cloches qu'on entend parfois sont des sons d'événements du jeu ; les séparateurs
les rangent avec la batterie, donc elles restent dans la musique.

Pistes, de la meilleure à la pire :

1. **Écrire aux compositeurs** et demander à acheter le master. Meilleur résultat possible, et
   c'est l'idée de Fabien.
2. **Croiser les versions européennes** (française, italienne, espagnole) : si elles partagent la
   même musique sous des voix différentes, on prend à chaque instant celle qui se tait. À
   vérifier, personne n'a comparé.
3. **Inverser le ducking** : Moises rend deux pistes (musique et voix) ; l'enveloppe de la voix
   donne la courbe de gain à appliquer à l'envers sur la musique. Faisable ici en Node sur des
   WAV, sans rien installer.
4. **Séparateurs modernes** (BS-RoFormer, Mel-Band RoFormer, via MVSEP ou UVR5), meilleurs que
   Moises, pour rapiécer les trous restants.
5. **Suno** en dernier recours : un *Cover* rejoue tout et perd justement les riffs que Fabien
   aime ; un *Extend* peut prolonger un passage propre. On ne peut pas lui donner de consigne sur
   la façon de lire l'audio fourni (ce canal n'existe pas), et l'upload plafonne à 8 minutes.

## Atelier des fromages (v36)

Fabien trouve la tranche **trop propre** à côté des captures : sur les gros plans la pâte est
marbrée par larges plages, elle plonge dans le brun sur les bords, et la bande adoucit tout.
L'atelier (`outils/atelier-fromages.html`) ne touche qu'à la matière : la forme des trous et les
morsures restent telles qu'elles ont été tranchées.

- **Huit styles tout faits** : Comme maintenant, Marbré, Capture d'écran, Vieille bande, Pâte
  chaude, Beurre, Cuir, Cathodique. Chacun ne déclare que ce qu'il change, le reste vient du
  défaut de l'appli.
- **Les réglages** : teinte, saturation, clarté, marbrures (force, taille, nombre), plaques
  brun-rouge, bords qui plongent ; puis ce que la cassette ajoute : image adoucie, couleur qui
  bave horizontalement, grain, lignes de balayage.
- **La graine fige la tranche** : mêmes trous, mêmes marbrures, donc deux styles se comparent sur
  exactement le même fromage. `paintTexture` et `makeHole` tirent désormais leur hasard
  d'`alea(graine)` quand une graine est donnée.
- **Comparer** : « Garder à gauche » fige l'image du moment, et une photo de Fabien peut se
  superposer directement sur la tranche (curseur d'opacité).
- « Copier pour Claude » rend les douze valeurs, plus les défauts de l'appli.

Dans `js/app.js` : `STYLE0` / `STYLE`, `teinter()` pour la couleur de base, `finirImage()` pour ce
qui vient de la cassette (toujours en dernier, après les trous), et les crochets
`RapRat.style()`, `styleParDefaut()`, `styleSet()`, `repeins()`, `toile()`.

L'appli elle-même ne change pas d'aspect : les valeurs par défaut sont la tranche de la v35. Le
flou est à zéro par défaut, parce que Fabien avait tranché que les bords des trous restent nets.
Vérifié dans le navigateur de l'ordinateur ; pas encore sur l'iPhone.

Piège retrouvé au passage, déjà noté dans l'Atelier des foyers : l'appli réserve de la place pour
ses barres tant qu'elles ne sont pas vraiment `hidden`. Les cacher en CSS ne suffit pas, la
tranche se dessine minuscule.

## Un morceau posé sur du noir, pas une plaque (v37)

Fabien, le 09/11/2026, devant deux captures qu'il a envoyées : « notre version ressemble à une
plaque de fromage et celle du jeu a un morceau de fromage posé sur une table noire ».

C'est `MARGIN = 0` : la tranche touche les bords de l'écran, donc **son contour n'est jamais
visible**, et avec lui l'épaisseur qu'on avait relevée sur `references/relief/`. On ne la voyait
qu'aux endroits déjà mordus. Dès qu'il y a du noir autour, la tranche redevient un objet posé.

Précisé par Fabien dans la foulée : **inutile tant que le fromage occupe tout l'écran**, mais dès
qu'il en manque, surtout quand il en manque beaucoup, oui. La marge n'est donc pas constante,
elle **s'ouvre à mesure que la tranche se fait manger** : `marge` (tranche entière), `margeFin`
(tout mangé), `margeCourbe` (tôt ou tard), interpolées dans `draw()` sur `1 - cells / cells0`.

Tout est à 0 par défaut, donc **l'appli ne change pas** tant que Fabien n'a pas tranché. Le style
« Comme la vidéo » part de 0 et finit à 8,5 %, courbe 1,6. Vérifié : tranche entière elle touche
les bords, à moitié mangée elle a recouvré son contour et son épaisseur tout autour.

Dans la même passe, les trous sont devenus réglables, parce que Fabien a relevé sur ses captures
qu'ils sont beaucoup plus nombreux, de toutes les tailles, avec quantité de tout petits entre les
gros, et que chacun se lit comme un vrai cratère : `trousN` (combien), `calibre` (leur taille),
`menus` (les tout petits en plus), `groupe` (serrés vers le milieu ou étalés), `relief` (le halo
en cratère). « Comme la vidéo » monte à environ 190 trous contre 70.

Rien de tout ça ne touche à la **forme** des trous ni aux morsures. Vérifié dans le navigateur de
l'ordinateur, l'appli garde bien l'aspect de la v35 par défaut ; pas encore vu sur l'iPhone.

## La perspective des trous : depuis le milieu, ou parallèle ? (v39)

Fabien a envoyé deux gros plans de fin de partie le 09/11/2026 : « on peut la voir ici la
perspective ». Et ce qu'ils montrent ne correspond pas à ce qu'on avait codé.

Dans l'appli, l'oeil est au-dessus du **milieu du fromage** : chaque trou penche vers le centre,
et les trous du milieu se voient presque de face (c'est écrit dans CLAUDE.md, on l'avait choisi
ensemble). Sur les captures, **tous les trous penchent de la même façon** — creux sombre en haut
à gauche, paroi éclairée en bas à droite — y compris ceux du milieu. C'est ce que donne un oeil
loin du sujet, donc une projection parallèle.

Je n'ai rien tranché, j'ai rendu la chose réglable : `perspective` (1 = depuis le milieu, le
choix d'origine ; 0 = parallèle) et `angleTrous` (la direction quand c'est parallèle, 220° =
vers le haut à gauche). Le mélange se fait sur le vecteur de direction et sur `off`, donc à 1 on
retrouve exactement l'ancien comportement.

**Par défaut `perspective` reste à 1** : l'appli ne change pas. Le style « Comme la vidéo » la met
à 0,1. À Fabien de juger, les captures sous les yeux.

## La couleur est tranchée (v40)

Fabien a renvoyé le style « Comme la vidéo » tel quel, avec une note : « déjà pour la couleur on
peut essayer ça ». J'ai donc passé **le seul bloc « La pâte »** en valeurs par défaut de l'appli :

    teinte −3°, saturation 114 %, clarté 105 %,
    marbrures 0,9 de taille 1,6, combien 1,
    plaques brun-rouge 15 %, bords qui plongent 28 %

Tout le reste garde sa valeur neutre, parce qu'il n'a parlé que de la couleur : les trous
(nombre, calibre, menus, groupe, relief), la perspective, la marge noire et les effets de bande
(flou, bave, grain, lignes). Ils restent réglables dans l'atelier, en attente de son avis.

Dans l'Atelier des fromages, le premier bouton s'appelle maintenant « Comme l'appli » (ce que
donne une vraie partie) et un bouton « La v35 » garde l'ancienne pâte, pour pouvoir revenir en
arrière et comparer.

Vérifié dans le navigateur de l'ordinateur : l'appli ouvre bien sur la nouvelle couleur, avec le
même nombre de trous qu'avant et aucune marge. Pas encore vu sur l'iPhone.

## Les trous, et la couleur relevée sur la capture (v41 et v42)

Quatre remarques de Fabien le 09/11/2026, toutes parties de la même capture :
`references/progression/01.jpg`, la tranche entière avant la première morsure.

### 1. Tous les trous ne traversent pas

« Si tu regardes bien la photo où il y a pas encore de morsure présente, les trous de fromage
ne traversent pas tous le fromage de part en part. » Vérifié : la plupart montrent un **fond
brun**, de la pâte vue au fond d'une poche. Sur le couvercle jaune de la trappe
(`references/relief/02-trappe-ouverte.jpg`), aucun trou n'est noir. Jusqu'à la v40, **tous**
les nôtres débouchaient sur du noir pur.

### 2. C'est proportionnel à la taille

« Les petits traversent rarement mais les gros si. » La chance de traverser suit donc la taille
du trou — `(part - .3) / .45`, où `part` est sa taille dans la gamme — comme une bulle assez
grosse pour percer les deux faces. La profondeur d'une poche borgne suit la même règle :
`fondTrou()` mélange du brun `rgb(150,76,20)` vers le noir selon ce creux.

### 3. Certains sont creusés mais on ne voit pas l'autre bout

« Avec l'angle qu'ils ont on ne voit pas l'autre bout. » Un trou sur trois environ parmi les
borgnes est `profond` : son fond sombre déborde du contour et se fait couper par le bord du
trou, si bien qu'il ne reste qu'un croissant de paroi éclairée d'un seul côté — au lieu de la
petite lucarne nette d'un trou qui traverse.

### 4. Il faut de la variété dans les tailles

« C'est pire, ça paraît bizarre par rapport au jeu de société. » Il avait raison sur la cause :
les trous tombaient dans **quatre calibres serrés** (22–34, 15–21, 8–12, 3,5–6), et ça se
voyait comme un tamis. Maintenant la taille est tirée sur toute la gamme avec `Math.pow`, qui
penche vers les petits, plus une poignée de **gros cratères** qui sortent du lot — sans eux la
tranche reste régulière. `variete` (0 à 1) resserre tout vers une taille moyenne quand on le
baisse.

### La couleur, mesurée au lieu d'être jugée à l'oeil

« Tu peux d'ailleurs te rapprocher de la couleur et des nuances du fromage de la photo. »
Relevé au compte-gouttes sur la capture, en écartant les trous et le fond noir :

| | la cassette | nous avant | nous après |
| --- | --- | --- | --- |
| moyenne | 204,111,5 | 156,101,12 | 189,111,8 |
| clarté | 127 | 105 | 122 |
| écart clair/sombre | 50 | 27 | 44 |
| rouge / vert | 1,84 | 1,55 | 1,70 |

Trois défauts trouvés en cherchant pourquoi les curseurs n'y arrivaient pas :

- **la saturation ne touchait que le fond.** Les marbrures, les plaques et les bords qui
  plongent étaient peints par-dessus en dur, donc la pâte restait terne quoi qu'on règle.
  `teinter()` rend maintenant du rgba et tout passe par lui.
- **les bords ne plongeaient jamais vraiment.** Le dégradé allait jusqu'à `big * .72`, calculé
  sur le grand côté : sur un écran large il s'arrêtait avant les coins. Il suit la diagonale
  maintenant.
- **le halo autour des trous** était un jaune pâle bleuté (`250,208,118`) ; sur soixante-quinze
  trous, ça suffisait à remonter le bleu de toute la tranche. Recalé en `252,194,46`.

Ensuite la palette de base elle-même a été recalée (`#ff9d10` au centre, `#c85401` au bord) et
les réglages sont repartis de valeurs saines autour : teinte 0, saturation 100 %, clarté 112 %,
marbrures 0,8, plaques 20 %, bords 100 %. Les curseurs **plafonnaient** avant : le rouge ne
montait pas au-dessus de 175 quoi qu'on fasse, alors que la cassette est à 204.

Ce que ça remplace : le réglage de couleur que Fabien avait choisi le matin même dans
l'Atelier des fromages (style « Comme la vidéo », teinte −3, saturation 114 %…). Il ne veut
rien dire avec la nouvelle palette, et les deux styles de l'atelier qui s'y référaient ont été
refaits.

Pas touché, toujours à leur valeur neutre : la perspective des trous, la marge noire, le
regroupement vers le milieu, et ce que la cassette ajoute (flou, bave, grain, lignes).

## La taille des trous, mesurée trou par trou (v43)

Fabien, le 09/11/2026, après avoir regardé la v42 : « oui tu peux t'en occuper, je viens de
regarder et effectivement ça manque ». Il parlait des deux écarts que je lui avais signalés :
la taille des trous et leur étalement vers les bords.

### Ce que la mesure a dit

Chaque trou de `references/progression/01.jpg` a été détecté et mesuré, puis les nôtres de la
même façon, en condition de partie. Les rayons sont donnés en millièmes de la hauteur de la
tranche, le radial en part de la demi-tranche (1 = le bord).

| | la cassette | avant | maintenant |
| --- | --- | --- | --- |
| trous | 45 | 38 | 45 |
| aire des trous | 4,6 % | 3,5 % | 4,2 % |
| le dixième des plus petits | 5,3 | 3,6 | 5,6 |
| le quart des plus petits | 8,7 | 5,5 | 8,2 |
| la moitié | 14,7 | 14,5 | 14,5 |
| les trois quarts | 25,2 | 25,3 | 24,4 |
| le dixième des plus gros | 31,9 | 32,3 | 33,2 |
| le plus gros | 44,0 | 35,5 | 40,9 |
| radial médian | 0,66 | 0,58 | 0,64 |
| au-delà de 0,7 | 38 % | 39 % | 42 % |

Le milieu de la gamme était déjà juste. Ce qui manquait, c'était les deux bouts : nos
minuscules étaient deux fois trop fins et notre plus gros cratère un cinquième trop petit.
Résultat, la tranche avait l'air moins creusée que celle de la vidéo. `rMin` passe de 2,2 à
5,6, `rMax` de 38 à 42,5, et le tirage penche un peu moins vers les petits. Tous les chiffres
tombent maintenant dans l'écart-type d'une partie à l'autre (±0,5 sur l'aire, ±2 sur la
médiane, ±3 sur le plus gros).

### Ce que je m'étais trompé

L'étalement vers les bords était **déjà bon**, contrairement à ce que je lui avais dit la
veille. Je l'avais mesuré sur l'écran d'accueil, où la tranche est rentrée pour laisser la
place aux boutons : les trous occupaient donc les deux tiers du cadre, et j'ai lu un
regroupement vers le milieu qui était en fait la marge des boutons. En partie, plein écran,
le radial médian était déjà de 0,58 contre 0,66 à la cassette. **Toute mesure de la tranche
se fait en partie, pas à l'accueil.**

Le curseur « étalement » (`groupe`) n'a donc pas bougé. Poussé à fond il ne change presque
rien, et c'est normal : c'est la marge de sécurité au bord (`r * 1.6 + 8 * U`, qui empêche un
trou de toucher le bord de la tranche) qui décide vraiment jusqu'où les trous vont.

Pas touché, toujours à leur valeur neutre : la perspective des trous, la marge noire, le
nombre de trous, et ce que la cassette ajoute (flou, bave, grain, lignes).

## La fin de partie : les miettes et le dernier morceau (v44)

Fabien, le 09/11/2026, deux captures de chez nous à l'appui : « il y a des petites îles un
peu partout avec des résidus, et en fait c'est naze… le dernier morceau ne ressemble à rien ».
Et : « parfois un tout petit bout qui disparaît est considéré comme une grosse morsure ».

### Ce que la mesure a dit

Huit parties entières jouées en simulation, en comptant après chaque croc les morceaux
séparés et ce que le croc a vraiment emporté (en millièmes de la tranche, la part due étant
de 13,9) :

| | avant | maintenant |
| --- | --- | --- |
| morceaux visibles à la fin | 2 à 6 | 1, toujours |
| crocs qui n'emportent presque rien | 5 à 10 par partie | 0 ou 1 |
| croc le plus maigre | 0,2 | 3 à 7 |
| croc le plus gros | 24 à 40 | 19 à 24 |
| dernier morceau | 1 à 3 % | 4,2 % |
| sa compacité | 0,08 à 0,26 | 0,42 |
| son rayon | 30 à 59 % | 26 % |
| son écart au centre | 21 à 56 % | 7 % |

La cassette (`references/fin/`) donne : un seul morceau, 2 à 5 % de la tranche, compacité
0,38 à 0,41, rayon 20 à 30 %, écart au centre 10 à 14 %.

### Les trois causes

1. **La grille de comptage est trop grossière pour les miettes.** Le jeu suit la tranche sur
   une grille de 160 carreaux de large, soit six pixels par carreau. Un éclat plus fin que ça
   tombe entre deux milieux de carreaux : il est bien dessiné à l'écran, mais le jeu ne le
   connaît pas — jamais compté, jamais visé, jamais mangé. C'était la vraie cause des
   particules qui traînaient jusqu'au bout. Les miettes se cherchent maintenant sur l'image
   elle-même (sur une copie réduite à 640 de large, l'échelle de ce qui se voit), et tout ce
   qui se détache sous `MIETTE` (0,4 % de la tranche) part avec la morsure qui l'a détaché.
   Les vraies îles, au-dessus de ce seuil, restent : Fabien en veut une ou deux. Elles sont
   simplement finies avant la dernière bouchée (`viserIles`, les dix derniers crocs).

2. **Le croc mordait dans le vide.** Il tirait un endroit du bord au hasard et prenait sa
   taille pour rattraper le retard : tombé sur une pointe, il n'emportait presque rien mais
   comptait pour une morsure entière, et le croc d'après devait tout rattraper d'un coup.
   Fabien l'avait bien vu : « ça ne prend pas en compte la quantité de fromage qui disparaît ».
   Le rat essaie maintenant douze endroits et garde le premier où il y a vraiment de quoi
   mordre. Sur la fin, c'est la distance au milieu qui prime — c'est comme ça que le morceau
   se ramasse en étoile au centre — à condition qu'il y ait quand même de quoi mordre.

3. **La dernière bouchée se calait sur la poussière.** Elle visait le centre de gravité de
   *tout* ce qui restait, miettes comprises, donc à côté du morceau. Elle se cale maintenant
   sur le morceau du milieu. Et le partage lui garde un bon vingtième de la tranche
   (`DERNIER`) au lieu d'une part égale : avant, le dernier morceau n'était qu'une miette de
   plus.

Un croc coûte environ 11 ms de plus (l'analyse de l'image), pour un croc toutes les douze
secondes.

## Une tranche deux fois plus épaisse (v45)

Fabien, le 09/11/2026 : « j'ai l'impression que le fromage devrait être 2x plus épais ».
`EPAISSEUR` passe de 0,022 à 0,044 (la hauteur de la paroi, en part de la hauteur de la
tranche). Le curseur de l'Atelier des foyers part de la même valeur.

Ce que la mesure dit, pour mémoire — elle ne va pas dans le même sens, c'est un choix de
goût assumé. En suivant la clarté depuis le bord vers l'intérieur, par quart de tour, sur
`references/progression/01.jpg` et `03.jpg` d'un côté et sur notre tranche de l'autre (en
parts de la hauteur de la tranche, 1 = la pâte loin du bord) :

| distance au bord | 0,25 % | 0,5 % | 1 % | 2 % | 4 % | 8 % |
| --- | --- | --- | --- | --- | --- | --- |
| cassette, côté lumière | 0,73 | 0,81 | 0,82 | 0,84 | 0,82 | 0,86 |
| cassette, côté ombre | 0,75 | 0,84 | 0,88 | 0,86 | 0,85 | 0,87 |
| nous à 2,2 %, lumière | 0,72 | 1,05 | 1,12 | 0,95 | 0,94 | 0,99 |
| nous à 2,2 %, ombre | — | — | 0,63 | 0,71 | 0,87 | 0,95 |
| nous à 4,4 %, lumière | 0,67 | 0,95 | 1,14 | 1,14 | 0,95 | 0,97 |
| nous à 4,4 %, ombre | — | — | 0,61 | 0,64 | 0,74 | 0,89 |

Autrement dit : le bord de la cassette se fond en moins de 1 % de la hauteur et ne dépasse
jamais la clarté de la pâte, tandis que le nôtre met 5 à 8 % à revenir à la pâte et porte un
liseré clair 14 % au-dessus d'elle. Nous étions donc déjà plus épais que la cassette, et
l'épaissir encore nous en éloigne — mais Fabien juge sur l'écran de son iPhone, où le relief
tient la tranche ; c'est lui qui décide. Vérifié que la fin de partie ne s'en trouve pas
délavée : le dernier morceau garde sa pâte au milieu.

## Atelier de la perspective (v46)

Fabien, le 09/11/2026 : « il faudrait que tu puisses le faire orienter la perspective avec un
bout de fromage pour que je puisse la choisir moi-même ». Les deux réglages existaient déjà
(`perspective` et `angleTrous`, perdus au milieu des curseurs de l'Atelier des fromages) ;
ce qui manquait, c'était de pouvoir les choisir à la main.

`outils/atelier-perspective.html` : une galette épaisse qu'on tourne au doigt. Là où le doigt
se pose, c'est là qu'est l'œil. Au milieu, l'œil est à la verticale : `perspective` = 1, les
trous du milieu se voient de face. En s'éloignant, la galette s'écrase, on voit sa tranche, et
`perspective` descend vers 0 pendant que `angleTrous` prend la direction du doigt. En dessous,
la vraie tranche de l'appli se repeint quand on lâche (elle met un instant, d'où l'attente).
Trois raccourcis : « Depuis le milieu » (le défaut), « Comme tes gros plans » (0,1 / 220°),
« Tout à fait de côté ».

La galette est un schéma dessiné dans la page, pas le vrai rendu — c'est la tranche du dessous
qui tranche. Sa géométrie, pour qui y retouche : un point (u, v) de la face du dessus, à la
profondeur w, se projette en `C + dirA*(u*cos θ + w*sin θ) + dirB*v`, où `dirA` est la
direction de l'œil à l'écran et θ son inclinaison. Il en découle que **le fond sombre d'un
trou glisse du côté de l'œil** et que la paroi éclairée se voit du côté opposé : c'est bien ce
que fait `makeHole` dans `js/app.js`, et ça confirme son commentaire d'origine (« l'œil est
au-dessus du milieu » pour `perspective` = 1). Deux bornes pour que ça reste lisible : la
galette ne s'incline pas au-delà de 60°, et le fond d'un trou ne glisse jamais de plus de
0,95 fois son rayon — sinon il sort de l'ouverture et le trou devient une tache claire.

La perspective elle-même n'est pas tranchée : le défaut de l'appli reste `perspective: 1`,
en attendant que Fabien choisisse.

### Le bout de fromage rectangulaire (v47)

Fabien, dans la foulée : « plutôt rectangulaire le morceau si tu peux ou carré afin que cela
ressemble ». La dalle prend donc la forme de la vraie tranche (`RapRat.toile()`, soit celle de
l'écran) au lieu d'être ronde.

Un rond était rotationnellement symétrique, donc la première projection faisait tourner le
repère avec l'angle de l'œil sans que ça se voie. Avec un rectangle, ça se voyait tout de
suite : le morceau pivotait sur lui-même. La projection est maintenant écrite dans le sens de
l'écran — un point (u, v) de la face du dessus, à la profondeur w, va en
`C + (u,v) − (1−cos θ)·((u,v)·dirA)·dirA + w·sin θ·dirA`. La dalle reste droite, s'écrase le
long de l'axe de l'œil, et ce qui est plus profond glisse du côté de l'œil. Sa silhouette est
l'enveloppe convexe des huit coins (dessus et dessous) : l'union des deux rectangles laissait
deux encoches dans les coins quand le décalage était en biais.

## Des creux de fromage, pas des trous de perceuse (v48)

Fabien, 10/11/2026 : « on dirait pas du fromage mais une planche avec des trous de perceuse ».
Constat sur un rendu (graine 4242) : 71 trous, presque tous lus comme un disque noir découpé
net avec un croissant de paroi — les poches borgnes ne se distinguaient pas des trous traversants.

- Poche borgne = cuvette : dégradé de paroi + ombre radiale douce, plus de disque de fond net
  (`drawHole`, branche `!h.travers`). L'ombre ne couvre jamais tout : un anneau de pâte reste.
- Traversants : seulement les gros (`gros = r / rMax`, chance nulle sous 0,6, 60 % au plus).
  Sur la graine 4242 : 8 sur 53.
- `trousN` par défaut 1 → 0,75 (71 → 53 trous).
- Vérifié sur l'ordinateur (tranche entière et après 30 crocs). Pas testé sur l'iPhone.
- Prochaine action : avis de Fabien ; les curseurs « combien » et « trous qui traversent » de
  l'Atelier des fromages permettent d'aller plus loin.

## Les trous recalés sur les captures (v49)

Fabien a envoyé trois captures (rangées dans `references/style/` : `entiere.jpg`,
`fin-etoile.jpg`, `gros-plan.jpg`) : « te rapprocher du style du fromage du jeu sur ces
captures, la perspective, les trous etc. ». Mesure trou par trou avec
`references/style/mesure.js` (se charge dans la page, marche sur une image ou sur `RapRat.toile()`).

| | capture | nous avant | nous après |
|---|---|---|---|
| le sombre glisse vers le centre (pente) | 0,16 | 0,12 | 0,15 |
| part « tous du même côté » | 0,05 | 0,02 | 0,00 |
| noirceur médiane, petits / moyens / gros | 0,29 / 0,28 / 0,05 | — | 0,37 / 0,27 / 0,06 |
| halo à 1,15 · 1,35 · 1,6 · 2 rayons | 0,99 · 1,03 · 1,03 · 1,01 | 1,11 · 1,10 · 1,06 · 1,01 | 1,03 · 1,04 · 1,05 · 1,02 |
| paroi (pâte ≈ 214,140,3) | 160,92,5 | 238,166,58 côté lumière | 164,94,4 |
| fond le plus creusé | 48,6,1 | noir | 45,6,1, cœur 17,2,0 |

- `drawHole` réécrit : une seule cuvette pour tous les trous (paroi kaki, tache sombre aux bords
  fondus), plus de cylindre, de reflet, d'étincelle ni de trait clair au bord.
- `fondTrou` : échelle rouge sombre. `drawHalo` : bosse douce décollée du bord.
- `makeHole` : `profond` plus rare chez les moyens, `creux` plus dispersé.
- Pas touché : la pâte (recalée la veille), le nombre de trous (53, la capture en a ~55 sur sa
  tranche), le flou (bords nets), l'épaisseur du bord.
- Indice non retenu : sur la capture le point de fuite semble un peu plus bas que le milieu
  (vers les deux tiers de la hauteur). Trop peu net pour toucher au réglage.
- Vérifié sur l'ordinateur (tranche entière + 45 crocs). Pas testé sur l'iPhone.
- L'Atelier de la perspective dessine encore ses trous en cylindres (c'est un schéma).

## La pâte recalée sur les captures (v50)

Suite de la v49, sur le « oui on fait ça » de Fabien. `mesurePate` (dans
`references/style/mesure.js`) : couleur médiane de la pâte par zone, du centre au bord.

| zone | capture `style/entiere.jpg` | `progression/01.jpg` (cible de la veille) | nous avant | nous après |
|---|---|---|---|---|
| centre | 217,153,4 | 217,138,6 | 193,131,15 | 220,151,8 |
| mi-chemin | 216,138,3 | 209,116,4 | 194,123,11 | 216,140,7 |
| vers le bord | 210,120,3 | 191,94,8 | 190,109,6 | 207,123,4 |
| au ras du bord | 202,104,2 | 181,78,5 | 172,87,4 | 196,109,3 |
| étendue de clarté | 0,22 | 0,35 | 0,28 à 0,42 | 0,23 |
| écart entre cases voisines | 0,039 | 0,064 | 0,058 à 0,077 | 0,039 |

- `PATE` : la palette, sortie en haut de `js/app.js` ; dégradé elliptique.
- `STYLE0` : clair 1, marbrures 0,7, taches 0,1, vignette 0,3.
- Marbrures recentrées (une claire `#f4b404`, une sombre `#b65c02`, à égale distance de la pâte)
  et fondu corrigé (vers la couleur à 0 %, plus vers du noir transparent).
- `RapRat.pate()` : lire ou remplacer la palette, pour la caler.
- Écart restant, non traité : en fin de partie la cassette pâlit et jaunit (192,144,55 sur
  `style/fin-etoile.jpg`), sans doute l'exposition de la caméra. Chez nous la pâte ne change pas.
- Vérifié sur l'ordinateur (tranche entière + 45 crocs). Pas testé sur l'iPhone.

## Recalage sur une partie entière (v51)

Dix captures d'une même partie dans `references/partie/`. Rectangle de la tranche dans ces
images : `[547, 13, 1486, 1157]` (trouvé par `boiteTranche`).

Part restante par capture : 0,884 · 0,791 · 0,648 · 0,458 · 0,335 · 0,271 · 0,180 · 0,075 · 0,056 · 0,034.

| à part égale | 0,88 | 0,65 | 0,46 | 0,34 | 0,18 | 0,075 | 0,034 |
|---|---|---|---|---|---|---|---|
| éloignement moyen du centre, cassette | 0,79 | 0,70 | 0,64 | 0,53 | 0,45 | 0,29 | 0,20 |
| nous (2 graines, REGROUPE 1,4) | 0,78 | 0,68 | 0,60 | 0,50 | 0,39 | 0,27 | 0,26 |

- Fait : `trousN` 1,25 et nouvelle répartition des tailles ; `PATE` recalée sur la partie ;
  marbrures 0,9.
- Vérifié sans rien changer : taille des morsures, progression vers le centre.
- Laissé : la couleur ne change presque pas au fil de la partie sur ces captures (le vert
  monte de 114 à 127), pas la peine de l'animer.
- **En attente de Fabien : le bord** (épais comme hier, ou fin comme la cassette).
- Pas regardé faute d'usage : la forme fine des morsures (festons plus gros et plus ronds sur
  la cassette que nos petites dents), et les longues pointes en étoile de la cassette.
- Vérifié sur l'ordinateur seulement.

## Le bord fin de la cassette (v52)

Fabien, après la comparaison à trois : « garde le plus fidèle au jeu de la cassette ».
`EPAISSEUR` 4,4 % → 1 %, liseré 0,62 → 0,3, ombre large près des bords (5 % de la hauteur).
Mesuré avec `profilBord` (dans `references/style/mesure.js`) : voir CLAUDE.md. Curseur de
l'Atelier des foyers remis à 1,0 %.

Reste à regarder (pas commencé) : la forme fine des morsures — festons plus gros et plus ronds
sur la cassette, tranche qui finit en étoile à longues pointes. Rien n'est testé sur l'iPhone
depuis la v43.

## Festons mesurés, rien changé (10/11/2026)

Écart du contour mangé à sa version lissée, en millièmes de la hauteur, lissage à 0,4 · 0,8 · 1,6 · 3 % :

| | capture 01 | capture 03 |
|---|---|---|
| cassette | 0,30 · 0,90 · 2,31 · 5,88 | 0,31 · 1,02 · 2,88 · 7,06 |
| nous, `WAVE` actuel (0,08 / 0,37) | 0,36 · 1,04 · 2,18 · 5,16 | 0,39 · 1,24 · 2,65 · 5,75 |
| essai 0,10 / 0,6 | 0,20 · 0,66 · 1,82 · 5,02 | 0,28 · 0,85 · 2,30 · 5,45 |
| essai 0,14 / 0,8 | 0,16 · 0,54 · 1,66 · 5,02 | 0,19 · 0,70 · 2,43 · 6,34 |

Une seule graine (4242), sans trous. Conclusion : `WAVE` reste tel quel.

**Prochaine action** : les pointes en étoile. Balayer `RESTE` (0 aujourd'hui, donc les foyers
ne retiennent plus le rat), `ETALE` (0,95) et `FOYERS` avec `balaye` (voir la v51 : écart sur
l'éloignement moyen et sur le point le plus loin, à part de fromage égale), en ajoutant
l'écart des festons à 3 % comme troisième critère. Arrêté ici à 88 % de la fenêtre d'usage.

## Où le rat mord, recalé sur la partie (v53)

Banc d'essai : `banc.prepare()` puis `banc.partie(reglages, graine)` dans la page (script
`references/style/mesure.js`). **Une partie par appel** : enchaînées dans un seul appel, les
parties se bloquent sans erreur, cause non trouvée. Six graines (11 à 66), sans trous.

| à part égale | 0,88 | 0,79 | 0,65 | 0,46 | 0,34 | 0,27 | 0,18 | 0,075 | 0,056 | 0,034 |
|---|---|---|---|---|---|---|---|---|---|---|
| éloignement moyen, cassette | 0,79 | 0,76 | 0,70 | 0,64 | 0,53 | 0,48 | 0,45 | 0,29 | 0,25 | 0,20 |
| avant (v52) | 0,77 | 0,74 | 0,67 | 0,59 | 0,49 | 0,45 | 0,38 | 0,29 | 0,26 | 0,23 |
| maintenant | 0,78 | 0,75 | 0,71 | 0,65 | 0,55 | 0,50 | 0,42 | 0,30 | 0,24 | 0,24 |
| point le plus loin, cassette | 1,41 | 1,41 | 1,41 | 1,41 | 1,26 | 0,97 | 0,97 | 0,68 | 0,52 | 0,41 |
| avant (v52) | 1,41 | 1,41 | 1,31 | 1,17 | 0,97 | 0,93 | 0,86 | 0,64 | 0,56 | 0,50 |
| maintenant | 1,41 | 1,41 | 1,41 | 1,33 | 1,07 | 1,04 | 0,95 | 0,68 | 0,50 | 0,50 |

Relief à grande échelle (festons, lissage 3 %) aux captures 3, 5, 7 : cassette 7,1 · 10,4 · 12,1 ;
avant 5,9 · 6,0 · 6,1 ; maintenant 6,0 · 6,3 · 6,9. **Les pointes en étoile ne sont pas obtenues.**

- `CREUX` 5, `DEHORS` 1,8, `ETALE` 0,5 ; `FINSEUIL` existe (null = l'ancien seuil).
- Atelier des foyers : deux curseurs ajoutés, et le curseur des miettes rejoue enfin la partie
  quand on le bouge (il n'était pas branché).
- Vérifié sur l'ordinateur (banc + planche de cinq étapes). Pas testé sur l'iPhone.
- Fabien a dit qu'on s'arrête sur cette modification. Rien n'est en cours.

## Les trous sont du vide (v54)

Fabien : « que si ils sont mordus on voit le trou dans le bout manquant du fromage ». Un trou
atteint par une morsure s'ouvre en entier et rejoint le bout manquant (`TROUS`, `trousTouches`,
`applyBite` dans `js/app.js`). Case « les trous s'ouvrent » dans l'Atelier des foyers.

Neuf parties avec trous, chaque mode : avant-dernière part restante 0,044 à 0,079 (avant : 0,044
à 0,072) ; éloignement du dernier morceau au centre, moyenne 0,12 (avant 0,06 ; cassette 0,09 à
0,14). Vérifié sur l'ordinateur seulement.

## La tranche épaisse vue d'en haut (v55, essai)

Proposition faite à Fabien (« leur physique manque de réalisme, tu proposerais quoi ? ») : un
vrai bloc épais en perspective, la même géométrie pour les morsures et les trous. Il a dit
« oui on essaie ». `paroi()` et `PAROI` (0,04) dans `js/app.js`, curseur dans l'Atelier des
foyers. Vérifié sur l'ordinateur : planche à côté des captures 3, 5 et 7, gros plan sur un trou
ouvert, une vraie partie lancée au bouton. Pas testé sur l'iPhone (vitesse comprise).

Restent les deux autres pistes proposées, pas commencées : une seule lumière pour les parois des
trous peints, et le fond des poches borgnes ouvertes par un croc.

## Le dernier morceau : un croc et demi (v56)

Fabien : « la taille du dernier morceau est 3x trop grande […] 1,5 fois ce qu'il mange
normalement ». `DERNIER` (4,5 % de la tranche) devient `DERNIER_CROCS` (1,5 croc), calculé
d'après le nombre de crocs. Deux défauts sont apparus avec la marge réduite, corrigés :
- en fin de partie, le rat prenait l'endroit le plus loin du centre même presque vide ; il lui
  faut maintenant au moins un demi-croc de fromage (au lieu de 12 %) ;
- sur les dix derniers crocs, il visait des « îles » qui n'existaient que dans la grille de
  comptage (trois crocs de suite à 0 %) ; elles sont maintenant rayées du compte.

Quinze parties : dernier morceau entre 1,28 et 1,60 croc, aucun croc vide sur la fin, à 0,02 à
0,13 du centre. Vérifié sur l'ordinateur seulement.

## Une île part avec le bord voisin (v57)

Fabien : « ce qui compte c'est la quantité mangée en fromage par morsure, ce qui fait qu'une île
peut être mangée si elle est plus petite que morsure ainsi qu'un bord du fromage proche ».
`bite()` : les îles plus petites qu'un croc, à portée, partent avec lui (`mangerIles`, effacées
telles qu'on les voit à l'écran) et le croc rapetisse d'autant ; un croc qui tombait sur une
telle île mord le bord principal en face d'elle. `etiqueter()` est sorti de `mangerMiettes`.
Mesuré : un croc avec île emporte 0,85 à 1,2 croc en tout. Vingt-sept parties : dernier morceau
entre 1,47 et 1,74 croc dans 26, une à 2,1 (décentrée à 0,36, pas reproduite) ; aucun croc vide
sur la fin. Vérifié sur l'ordinateur seulement.

## Des flancs de croc arrondis (v58)

Fabien, capture à l'appui : un trait droit le long de certaines morsures. Cause : quand un croc
s'enfonce, `shapeTemplate` le prolongeait jusqu'au bord par une colonne de ronds espacés de
0,2 rayon, donc des flancs parfaitement droits. Maintenant une file de ronds espacés de 0,85 à
1,05 rayon, chacun avec les vagues du bord. Six parties : dernier morceau 1,35 à 1,60 croc,
aucun croc vide, environ 25 ms par croc sur l'ordinateur. Vérifié sur l'ordinateur seulement.

## Des flancs qui s'évasent en courbe (v59)

Fabien, sur la morsure du bas de sa capture : « c'est pas droit, ça fait un arrondi mais pas
circulaire ». Mesurée sur `references/partie/01.jpg` : 26 % de la hauteur au bord, 14 % de
profondeur, flanc droit presque vertical, flanc gauche évasé de 6 % sur les 8 derniers %, en
courbe lisse. `shapeTemplate` : le prolongement est une suite serrée de ronds dont le flanc
extérieur s'élargit vers le bord (`evase`, tiré par croc et par côté, jusqu'à 0,9 rayon, en
t^1,3), sans festons ; remplace la file de ronds festonnés de la v58. Six parties : dernier
morceau 1,32 à 1,60 croc, aucun croc vide. Vérifié sur l'ordinateur seulement.

## Les dômes : deux crocs au même endroit (v60)

Fabien montre la morsure du bord droit de `references/partie/03.jpg`. Mesurée : près de 30 % de
la hauteur au bord, 23 % de profondeur (un croc : 11 %), absente de `02.jpg`. Lecture : deux
crocs au même endroit. `REPRISE` (0,15) dans `bite()` : le rat descend le long de la direction
du croc d'avant jusqu'au fromage et remord là. Une fois de suite au plus, au-dessus de 55 % de
tranche, dans la couronne extérieure. Curseur « remordre au fond du croc d'avant ».

Piège rencontré : pour que la reprise court-circuite la recherche, j'avais arrêté la boucle des
douze essais dès qu'un endroit était choisi ; ça cassait la fin de partie, qui compare ses douze
essais pour garder le plus loin du centre (dernier morceau décentré jusqu'à 0,40). Corrigé.
Vingt et une parties ensuite : 1,31 à 1,58 croc, dernier morceau à 0,01 à 0,15 du centre, deux
ou trois dômes par partie. Vérifié sur l'ordinateur seulement.

## Des dômes plus rares (v61)

Fabien : « plus rare celle-là ». `REPRISE` 0,15 → 0,05, soit à peu près un dôme par partie,
parfois aucun (les dix captures de la partie n'en montrent qu'un). Curseur de l'atelier remis à 5 %.

## Plus aucun trait droit (v62)

Fabien, capture à l'appui, troisième fois : « il y a toujours cette ligne droite […] est-ce que tu
vois un seul trait sur l'original ? ». Cette fois avec une mesure : `traitsDroits` (dans
`references/style/mesure.js`) cherche les bouts de contour mangé rectilignes sur au moins 9 % de
la hauteur. Avant : 6 à 19 par partie (sur 5 instantanés). Deux causes :
1. le prolongement de la dent (suite de ronds serrés, puis en évasement) : enveloppe droite.
   Remplacé par un seul lobe distinct (presque un rayon plus loin, décalé, plus petit) ;
2. la tranche épaisse (v55) : chaque pointe laissait une traînée droite en glissant vers le
   centre — c'est le long trait de la capture. `PAROI` = 0 par défaut, curseur gardé.
Après : 0 à 3 détections par partie, toutes des bords festonnés au seuil (vérifié à l'image).
Huit parties : dernier morceau 1,34 à 1,59 croc, à 0,01 à 0,12 du centre, aucun croc vide.
Vérifié sur l'ordinateur seulement.

## EN COURS — copier les vraies morsures de la cassette (pas commencé, arrêt à 96 % d'usage)

Fabien, sur la v62 : « super maintenant on a un troisième arrondi… je comprends pas pourquoi on
arrive pas à copier l'inspiration du jeu ». Il a raison : le lobe ajouté en v62 au bout des crocs
qui s'enfoncent se voit comme une troisième bosse, et la morsure de la cassette n'en a que deux.

Diagnostic honnête : depuis le début, on fabrique le croc avec des ronds, puis on bricole la
liaison entre les lobes et le bord (colonne serrée, festons, évasement, troisième lobe). Chaque
bricolage laisse sa signature (trait droit, festons, trompette, troisième bosse). La cassette, elle,
c'est deux lobes et des flancs qui descendent vers le bord, un peu irréguliers.

**Prochaine action** (la mécanique existe déjà : \`p.contour\` dans \`shapeTemplate\`, polygone
compté par \`forCellsIn\`/\`dansPoly\`, ouvre les trous via \`dansCroc\`) :
1. Extraire les silhouettes des morsures isolées sur la cassette : \`references/debut/\` (huit ou
   neuf morsures distinctes par capture), \`references/partie/01.jpg\` (morsure du bas, 26 % × 14 %
   de la hauteur ; morsure du haut, 29,5 % × 11,3 %). Pour chacune : contour en coordonnées du
   bord (u le long du bord, v vers l'extérieur, v = 0 sur le bord), normalisé à la largeur de
   notre croc (≈ 2,7 R), lissé, ~40 points.
2. Les mettre en données dans \`js/app.js\` (des nombres, pas d'image : rien de la cassette ne part
   sur GitHub) ; \`tirerForme\` en tire une au hasard, retournée une fois sur deux, légèrement
   tournée. Fermer le contour juste au-delà du bord (v ≈ +0,4 R), pas plus loin (sinon un flanc
   qui traverse du fromage redevient un trait).
3. Retirer le troisième lobe (bloc « if (depth < -.15 * L) » dans \`shapeTemplate\`).
4. Contrôler : \`traitsDroits\` (pas de trait), \`banc\`/\`fin8\` (dernier morceau ≈ 1,5 croc, centré),
   et planche côte à côte avec \`references/partie/\`.
