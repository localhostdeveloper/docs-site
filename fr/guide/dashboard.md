---
title: "Une visite du tableau de bord d'Unda"
description: "Des images de chaque page du tableau de bord d'Unda : flux, mosaïque, spectateurs et événements, chaînes et personnes, enregistrements, chaînes 24h/24 et réglages du serveur."
---

# Une visite du tableau de bord

Tout, dans Unda, se pilote depuis le tableau de bord, à l'adresse `https://votre-serveur/dashboard` : les flux, les spectateurs, les enregistrements, les chaînes 24h/24, les personnes et les réglages. Ces images viennent d'un serveur de démonstration avec quelques flux en direct, une chaîne 24h/24 et des spectateurs simulés. Sélectionnez une image pour la voir en taille réelle.

Le tableau de bord est en anglais : les noms des pages et des boutons sont écrits ici tels qu'ils y apparaissent.

Chacun ne voit que ce que permet son rôle. Un diffuseur voit ses propres chaînes et ses propres flux ; les opérateurs et les administrateurs en voient davantage (voir [Comptes et chaînes](/fr/guide/accounts#roles)).

Les explications se trouvent derrière un petit **i** à côté d'un réglage ou d'un titre : pointez-le, touchez-le, ou atteignez-le avec Tab et appuyez sur Entrée. Ce que vous devez voir tout de suite (état, avertissements, erreurs) reste sur la page.

## Overview {#overview}

[![La page Overview : les flux en direct, les spectateurs, le trafic entrant et sortant de la dernière heure, et ce qui demande de l'attention](/screens/overview.webp)](/screens/overview.webp)

La première page après la connexion. Les flux en direct, les spectateurs, la bande passante entrante et sortante (avec un plafond de bande passante réglé, combien de spectateurs de plus le serveur peut accueillir), et les graphiques de la dernière heure. **Needs attention** liste les alertes ouvertes, la plus grave en premier : ici, une caméra dont les images clés sont trop espacées. **Clear** apaise une alerte que vous avez vue, pour tout le monde, jusqu'à ce qu'elle s'aggrave ou se reproduise ([Effacer une alerte](/fr/guide/monitoring#clearing-an-alert)). Le point en bas de la barre latérale montre la connexion en direct avec le serveur ; si elle tombe, la page se grise et l'indique.

## Streams {#streams}

[![La liste Streams : l'état, le protocole, la résolution, le débit, les spectateurs, la durée et la santé de chaque flux en direct](/screens/streams.webp)](/screens/streams.webp)

Chaque flux en direct avec son protocole, la taille de son image, sa fréquence d'images mesurée, son débit, ses spectateurs et sa santé. Des étiquettes montrent ce qui arrive à chacun : enregistrement, débit adaptatif, rediffusion, sources de secours. Les flux qui ont un problème sont toujours classés en haut. Ouvrez une ligne pour voir qui récupère le flux et si l'un d'eux prend du retard.

## La page d'un flux {#a-streams-page}

[![La page d'un flux avec un aperçu en direct, son vumètre et le choix du lecteur, son entrée, ses chiffres de santé et ses spectateurs](/screens/stream.webp)](/screens/stream.webp)

Un aperçu en direct avec un vumètre, ce qu'envoie l'encodeur, et sa santé : fréquence d'images, intervalle d'images clés, décalage audio/vidéo, débit par rapport à son niveau habituel, et reconnexions. D'ici, vous enregistrez, arrêtez le flux ou ouvrez le lecteur.

Sous l'aperçu, choisissez comment il est lu : **HLS** (le flux tel qu'il arrive, quelques secondes derrière le direct), **Adaptive** (les qualités d'un flux transcodé) ou **Low latency** (WebRTC, moins d'une seconde derrière, quand le serveur l'a). Ce navigateur se souvient du choix. L'aperçu démarre sans le son et ne lit que pendant que l'onglet du navigateur est au premier plan. Le vumètre à côté de l'image montre le son qui arrive au serveur, y compris quand l'aperçu est muet ; en HLS il bouge quelques secondes en avance sur l'image, en Low latency il suit l'image. Sur un flux qui garde une [fenêtre de retour en arrière](/fr/guide/watching#rewind), une barre sur l'image permet de revenir en arrière, et **Go live** vous ramène au direct.

À côté du choix figurent la taille, la fréquence d'images et le débit du flux, et en dessous la vitesse à laquelle votre connexion charge l'aperçu. **Link** copie l'adresse de la page de lecture et **Embed** le code qui place la page de lecture dans votre propre page web. Quand votre connexion est trop lente pour le flux, une note sous l'aperçu le signale : **Show a picture instead** montre sa dernière image toutes les quelques secondes plutôt qu'une vidéo qui s'arrête sans cesse (et qui ralentit le reste de la page), et ce navigateur s'en souvient jusqu'à ce que vous cliquiez sur **Play video** ; **Keep playing** laisse la vidéo.

Les onglets contiennent les autres réglages du flux :

- **Input** : les [entrées de la chaîne dans l'ordre](/fr/guide/channel-inputs) : son encodeur en direct (et un encodeur de secours), un flux récupéré et une playlist ; la première qui a des images est à l'antenne.
- **Restream** : les [destinations](/fr/guide/restreaming) comme YouTube et Facebook.
- **EPG** : le [guide des programmes](/fr/guide/playout#live-channels-a-typed-in-guide) d'une chaîne en direct.
- **Output** : chaque adresse pour la regarder, qui peut la regarder ([liens signés](/fr/guide/protect-playback)), jusqu'où les spectateurs peuvent revenir en arrière ([retour en arrière](/fr/guide/watching#rewind)) et le [débit adaptatif](/fr/guide/transcoding).

## Multiview (mosaïque) {#multiview}

[![Multiview : une image de chaque chaîne avec ses niveaux sonores ; une caméra muette est marquée No sound](/screens/multiview.webp)](/screens/multiview.webp)

Chaque chaîne à l'antenne d'un coup d'œil. Une barre en haut les résume : combien sont à l'antenne, combien ont une alarme ou un avertissement, combien de personnes regardent, et (pour l'équipe) ce qu'envoie le serveur et son processeur. Choisissez **Wall** (mur) ou **List** (liste) en haut à droite ; ce navigateur se souvient du choix, du tri et de la taille des vignettes.

**Wall.** Une image de chaque chaîne, mise à jour toutes les quelques secondes. Les images sont fixes : le mur coûte donc peu au serveur, quel que soit le nombre de chaînes. Pointez une image pour voir son âge. Sous chaque image figurent le nom de la chaîne, une étiquette pour ce qui l'alimente (**ENCODER**, **24/7** ou **PULL**), et une ligne avec son débit, la taille de son image, ses spectateurs et un petit graphique de son débit, ou, quand elle demande de l'attention, ce qui ne va pas. Cliquez sur une image pour voir les détails de la chaîne à droite : une image plus grande, ses chiffres, les spectateurs des 30 dernières minutes, son son, ce que passe une chaîne 24h/24, ses événements récents, et des boutons vers sa page de flux, sa page de lecture et ses chiffres d'audience. Sur les écrans de moins d'environ 1100 pixels de large, il n'y a pas de place pour les détails, et une image ouvre plutôt la page du flux de la chaîne. **Full screen** remplit l'écran avec la mosaïque, pour un écran mural.

Une alerte que vous avez vue peut être effacée avec le ✓ à côté de la ligne de sa vignette (ou **Clear** dans la liste et les détails) : la vignette se calme pour tout le monde, avec une petite marque grise **1 cleared**, jusqu'à ce que l'alerte s'aggrave ou se reproduise ([Effacer une alerte](/fr/guide/monitoring#clearing-an-alert)).

**List.** Une ligne par chaîne, regroupées en encodeurs, chaînes 24h/24 et flux récupérés : son image, son état, son débit et son graphique, son son, ses spectateurs, ce qui est à l'antenne (ou depuis combien de temps elle est en marche), ce qui demande de l'attention, et **Open**.

**Couleurs.** Un cadre rouge signifie que les spectateurs de la chaîne la perdent : rien n'arrive, pas de son, une chaîne 24h/24 hors antenne ou sans images, une récupération hors antenne depuis des minutes, ou de fortes pertes de paquets. Tout le reste qui mérite un coup d'œil est orange : une rediffusion qui échoue, des images clés trop espacées, un encodeur qui se reconnecte, un débit faible. Une chaîne sur une [source de secours](/fr/guide/backup-encoder) est à l'antenne : être sur son secours n'est donc pas une alerte, et son étiquette dit quelle entrée passe. Un problème du secours lui-même (pas de son, par exemple) est orange, jamais rouge, puisque les spectateurs reçoivent toujours la chaîne.

Au-dessus du mur ou de la liste, tapez dans **Filter channels** pour trouver une chaîne par son nom, n'affichez que les **Encoders**, les chaînes **24/7**, les flux **Pull** ou ceux qui **Need attention**, et triez : ce qui demande de l'attention d'abord, par nom (dans un sens ou dans l'autre), le plus ou le moins de spectateurs, le débit le plus haut ou le plus bas, le plus longtemps ou le moins longtemps à l'antenne, par type (encodeurs, puis 24h/24, puis récupérés), la plus grande image, ou le son le plus faible d'abord. Dans la liste, cliquez sur un titre de colonne (Channel, Bitrate, Sound, Viewers, On air, Problem) pour trier selon elle, et une seconde fois pour inverser l'ordre.

Une chaîne avec des [entrées](/fr/guide/channel-inputs) a une seule vignette : ce que voient ses spectateurs, son étiquette disant ce qui est à l'antenne (**ENCODER**, **BACKUP**, **PULL**, **PLAYLIST** ou **SLATE**). Les images de ses entrées sont dans l'onglet Input de la chaîne. La page Overview et le compteur Streams du menu comptent une telle chaîne une fois, comme la licence.

Chaque image a deux vumètres sur son bord droit, pour le canal gauche et le canal droit : vert, jaune au-dessus de -18 dBFS, rouge au-dessus de -6 dBFS, avec une ligne qui marque le dernier pic (dans la liste, ils sont couchés dans la colonne Sound). Une chaîne silencieuse depuis 10 secondes affiche **NO SOUND** avec la durée ; un flux qui ne porte aucun son affiche **No sound track**, en orange. La même alarme apparaît dans **Needs attention** et dans Events, que quelqu'un ait ou non la mosaïque ouverte (voir [Pas de son](/fr/guide/monitoring#no-sound)).

## Spectateurs et événements {#viewers-and-events}

[![Sessions : chaque lecteur qui regarde en ce moment, avec son adresse, son lecteur, son heure de début et son trafic](/screens/sessions.webp)](/screens/sessions.webp)

**Sessions** liste chaque lecteur qui regarde en ce moment, en HLS, DASH, RTMP ou SRT, avec son adresse, son lecteur, depuis combien de temps il regarde et combien il a reçu. Les autres onglets gardent l'historique (téléchargeable en CSV) et l'additionnent par flux et par spectateur.

[![Events : ce qui s'est passé sur le serveur, le plus récent en premier](/screens/events.webp)](/screens/events.webp)

**Events** raconte ce qui s'est passé, le plus récent en premier : les flux qui démarrent et s'arrêtent, les reconnexions, les bascules vers un encodeur de secours, les enregistrements, les destinations de rediffusion qui se connectent ou échouent, les alertes qui s'ouvrent et se résolvent. Une ligne qui se répète est affichée une fois avec un compteur.

## Chaînes et personnes {#channels-and-people}

[![Channels : chaque chaîne, si elle est en direct, son propriétaire, ses spectateurs et son temps d'antenne, et ses boutons Inputs et Encoder settings](/screens/channels.webp)](/screens/channels.webp)

Une **chaîne** est un nom public pour les spectateurs et une clé secrète pour l'encodeur. Chaque ligne indique si elle est en direct (et, pour une chaîne avec des [entrées](/fr/guide/channel-inputs), laquelle est à l'antenne), son propriétaire, ses spectateurs et son temps d'antenne ; une chaîne hors ligne indique quand elle a été en direct pour la dernière fois. La recherche et le filtre par propriétaire aident quand il y en a beaucoup. Une chaîne qui diffuse avec des réglages qui feront charger les spectateurs reçoit un avertissement avec la correction.

- **Inputs** règle ce que passe la chaîne : son encodeur, un flux récupéré ou une playlist.
- **Encoder settings** contient ce qu'il faut mettre dans OBS ou vMix : l'adresse du serveur et la clé de diffusion (RTMP, ou SRT et WHIP quand le serveur les a), la clé de secours quand les sources de secours sont actives, le lien de lecture et les réglages d'encodeur recommandés. Les clés restent cachées jusqu'à ce que vous choisissiez l'œil ; **Copy** copie une clé sans l'afficher, ce qui est sûr pendant un partage d'écran.
- Le menu **⋯** contient le reste : **Copy stream key**, **New stream key**, **New backup key**, **Change owner** (administrateurs), **Pause channel** et **Delete channel**.
- **Pause channel** retire une chaîne de l'antenne sans la supprimer : un encodeur en direct est déconnecté, et sa clé de diffusion (et sa clé de secours) est refusée jusqu'à ce que vous choisissiez **Resume** sur sa ligne ou sa page. Son flux récupéré et sa playlist s'arrêtent aussi. Ses réglages, ses clés, ses liens de lecture, son guide et ses enregistrements sont conservés, elle reste en pause après un redémarrage, et une chaîne en pause ne compte pas dans votre licence.

**New channel** (en haut à droite) demande le nom, montre le lien de lecture pendant que vous le tapez, et ouvre les réglages d'encodeur de la nouvelle chaîne.

<a href="/screens/encoder-settings.webp"><img src="/screens/encoder-settings.webp" width="560" alt="Encoder settings : l'adresse du serveur, les clés de diffusion et de secours cachées derrière des points avec les boutons Show et Copy, le lien de lecture et les réglages d'encodeur recommandés" loading="lazy"></a>

[![Users : inviter des personnes et régler leurs rôles](/screens/users.webp)](/screens/users.webp)

Les personnes rejoignent sur invitation, avec un rôle : propriétaire, administrateur, opérateur ou diffuseur. La connexion en deux étapes peut être exigée par rôle. **Server → API keys** et l'**Audit log** sont juste à côté dans la barre latérale.

## Enregistrements {#recordings}

[![Recordings : les fichiers de chaque flux avec leur durée et leur taille, à lire, télécharger ou supprimer](/screens/recordings.webp)](/screens/recordings.webp)

Chaque enregistrement avec sa durée et sa taille. Lisez-le dans le navigateur, téléchargez-le ou supprimez-le. Voir [Enregistrement](/fr/guide/recording).

## Chaînes 24h/24 {#247-channels}

[![Une chaîne 24h/24 à l'antenne, avec ce qui passe ensuite](/screens/playout.webp)](/screens/playout.webp)

Une [chaîne 24h/24](/fr/guide/playout) passe vos fichiers selon une grille et peut laisser la main à un direct. Sa page montre ce qui est à l'antenne et ce qui vient ensuite ; la playlist se modifie sur la même page. **Pause** la retire de l'antenne jusqu'à ce que vous choisissiez **Resume**, qui reprend là où elle s'était arrêtée (voir [Mettre une chaîne en pause](/fr/guide/playout#pausing-a-channel)). Les vidéos propres à une chaîne s'envoient avec **Add videos** sur sa playlist ; la page **Media** contient tous les fichiers, partagés compris. La page **Guide** montre les programmes de chaque chaîne pour les jours à venir, avec le lien XMLTV pour les applications IPTV (voir [Guide des programmes](/fr/guide/playout#programme-guide)). Le guide d'une chaîne en direct se saisit dans son onglet **EPG** (Streams → la chaîne).

[![La page Guide : ce que montre chaque chaîne en ce moment, et les programmes du jour sur une frise](/screens/guide.webp)](/screens/guide.webp)

## Broadcast {#broadcast}

La diffusion TV et IPTV, pour les opérateurs et au-dessus, de ce qui entre à ce qui sort : **UDP inputs** (encodeurs matériels et têtes de réseau IPTV), **Pull inputs** (flux que le serveur va chercher), **MPTS inputs** et **MPTS outputs** ([bouquets multi-chaînes](/fr/guide/mpts)), **Relays** ([un flux de transport transmis tel quel](/fr/guide/relays)) et **Analyse** ([l'analyseur de flux](/fr/guide/analyser)).

## Réglages du serveur {#server-settings}

[![La page Server : la bande passante, le processeur et la mémoire maintenant et sur la dernière heure](/screens/server.webp)](/screens/server.webp)

L'état du serveur (bande passante, processeur, mémoire sur la dernière heure, requêtes refusées), avec des onglets pour son **History** sur des jours et des mois, **Capacity**, **Encoders** (les adresses et les clés à donner à OBS, à vMix ou à un encodeur), les certificats **HTTPS**, **Transcoding**, **Playback** (liens signés et retour en arrière), les liens du **Guide** des programmes, **API keys** (administrateurs), la **License** et votre **Account**. Les clients ne voient pas cette page : leur **Account** est dans le menu.

**Database backups** (onglet Status, administrateurs et propriétaires) montre la copie quotidienne la plus récente, combien de jours sont gardés et quand la prochaine sera faite. Un propriétaire peut aussi **télécharger une sauvegarde verrouillée** sur son propre ordinateur : une copie de la base de données verrouillée par une phrase secrète de son choix, après avoir saisi à nouveau son mot de passe. La fenêtre liste ce qu'elle contient et ce qui est laissé de côté (le fichier de licence, les personnes connectées, les invitations en attente et l'historique des spectateurs). La restauration se fait en une commande sur le serveur ; voir [Sauvegardes et mises à jour](/guide/install#8-backups-and-upgrades) (en anglais).

<a href="/screens/backup-download.webp"><img src="/screens/backup-download.webp" width="560" alt="Télécharger une sauvegarde verrouillée : ce qu'elle contient et ce qui est laissé de côté, une phrase secrète saisie deux fois, et votre mot de passe" loading="lazy"></a>

## Licence {#license}

**Server → License** (opérateurs et au-dessus).

[![Server → License : à qui est la licence, sa date de fin, ses limites et ses outils](/screens/license.webp)](/screens/license.webp)

À qui est la licence, quand elle se termine, ce qui en est utilisé, et quels outils elle comprend. Le propriétaire y installe une nouvelle licence, et peut donner au fournisseur un accès d'assistance limité dans le temps. Voir [Licence](/fr/guide/license).

## Clair ou sombre {#light-or-dark}

Le tableau de bord est clair par défaut. Le bouton lune en bas de la barre latérale passe au sombre, et **Server → Account → Appearance** (clients : **Account → Appearance**) peut suivre plutôt le réglage de votre ordinateur.

[![La page Overview avec le thème sombre](/screens/overview-dark.webp)](/screens/overview-dark.webp)
