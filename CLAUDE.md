# Notes pour Claude Code

- Appli web perso, en français, pour Fabien. Interface et commentaires en français, tutoiement dans les textes.
- Minuteur du jeu Rap Rat (émission des années 2000, vue sur VHS) refait en HD. Né comme artifact claude.ai (« Rap Rat », 04/11/2026), devenu appli iPhone.
- Pas de framework ni d'étape de build : HTML + CSS + JS classiques, servis tels quels par GitHub Pages, installés sur l'iPhone via Safari > Sur l'écran d'accueil.
- Le fromage est dessiné dans des canevas à la résolution réelle de l'écran (pas d'image étirée : Fabien trouvait ça flou). Sa forme suit celle de l'écran.
- Choix déjà tranchés avec Fabien :
  - Le rat n'est jamais visible, seules ses morsures enlèvent du fromage. Pas d'effet d'ondes au démarrage (dans l'émission, c'était juste le rat qui sortait d'une trappe).
  - Couleur : orange profond et saturé, centre plus jaune (relevé sur les captures, l'ancienne teinte beige était terne).
  - Trous : des ronds parfaits (bulles éclatées), vus en perspective depuis le centre du fromage. La sortie sombre glisse vers le centre ; plus le trou est loin du milieu, plus sa paroi extérieure (lisse, brillante, ambrée) se voit. Bords nets, sans flou. Fabien a essayé les bords arrondis et les trous qui entaillent le bord de la tranche, et a préféré revenir en arrière : ne pas les remettre sans lui demander.
  - Morsures : comme sur les captures de l’émission, un ou deux grands ronds (deux ronds sont soudés, avec un petit creux à la jonction), centrés sur le bord de la tranche, tout le pourtour découpé en petites dents fines presque régulières ; une paire peut longer le bord ou pencher en biais. Fabien a essayé d’autres formes (incisives droites allongées, grappes de bosses) et a demandé de revenir à celle-ci. Elles arrivent par le milieu des côtés, puis les coins, et le dernier morceau finit au centre.
  - Taille des crocs fixe, calée sur la vidéo (`R0` dans `js/app.js`, environ 75 crocs pour finir la tranche), pour la partie de référence de 15 minutes. Le nombre de crocs est fixe (`BITES` dans `js/app.js`) : une durée plus longue espace seulement les crocs. Le calage pour finir pile à l'heure ne peut que légèrement grossir ou rapetisser un croc.
  - Pendant la partie : plein écran, commandes cachées, un toucher les fait réapparaître 4 secondes.
  - Durée de 10 à 60 minutes, 15 par défaut.
- Le son du croc est synthétisé pour l'instant ; Fabien cherche un vrai son libre de droit (croc de biscuit) pour le remplacer.
- Le minuteur utilise `Date.now()` : il doit continuer à compter si l'écran se met en veille.
- À chaque changement de fichier, incrémenter `VERSION` dans `sw.js` et garder la liste `FILES` à jour.
- Icônes générées par `node outils/icones.js` (pas de module à installer).
- Tester sur mobile en portrait et en paysage (iPhone 16 Pro Max d'abord) : zones sûres (`env(safe-area-inset-*)`) et appli lancée depuis l'écran d'accueil.
- `references/` (captures et vidéos de l'émission) reste en local, hors du dépôt.
