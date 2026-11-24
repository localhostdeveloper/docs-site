---
title: "Entrées de chaîne : bascule entre direct, flux récupéré et playlist"
description: "Classez l'encodeur en direct d'une chaîne, un flux récupéré et une playlist : la première entrée qui a des images est à l'antenne, la suivante prend le relais quand elle tombe, et les spectateurs continuent de regarder."
---

# Entrées de chaîne (direct, flux récupéré, playlist)

Une chaîne peut avoir jusqu'à trois entrées, classées en première, deuxième et troisième :

| Entrée | Ce que c'est |
| --- | --- |
| **Live stream** (direct) | Votre encodeur (OBS, vMix, un encodeur matériel) avec la clé de diffusion de la chaîne, plus un [encodeur de secours](/fr/guide/backup-encoder) avec sa clé de secours |
| **Pull stream** (flux récupéré) | Un lien depuis lequel Unda va chercher le flux : l'adresse HLS (`.m3u8`) d'une chaîne de télévision, ou du MPEG-TS en HTTP ; les opérateurs peuvent aussi indiquer un serveur RTMP ou une caméra RTSP |
| **Playlist or looped video** (playlist ou vidéo en boucle) | Des vidéos de la page [Media](/fr/guide/playout), lues en boucle |

La première entrée de votre ordre qui a des images est à l'antenne. Quand elle s'arrête, la suivante prend le relais. Quand une meilleure entrée revient et se stabilise, elle reprend la main. Les spectateurs continuent de regarder la chaîne sous son propre nom, et les destinations de rediffusion continuent de la recevoir.

Par exemple, une chaîne dont les programmes sont récupérés depuis son propre lien HLS peut mettre **Pull stream** en premier, **Live stream** en deuxième pour un encodeur de studio, et une **Playlist** d'habillages de la chaîne en troisième pour quand les deux sont en panne.

Les entrées de chaîne sont dans les offres Professional et Broadcast (voir [Licence](#licence) plus bas).

## Les activer {#switch-them-on}

1. Sur la page **Channels**, cliquez sur **Inputs** à côté de la chaîne. Elle n'a pas besoin d'être en direct : une nouvelle chaîne peut passer à l'antenne depuis son flux récupéré ou sa playlist sans qu'aucun encodeur ne se soit jamais connecté.
2. Activez **Use this channel's inputs in order**.

Si le flux est en direct à ce moment-là, son encodeur est déconnecté une fois et se reconnecte de lui-même (OBS et vMix le font automatiquement).

[![L'onglet Input : une image de chaque entrée, l'encodeur en direct à l'antenne, le flux récupéré prêt, et la vidéo en boucle qui démarre si besoin](/screens/inputs.webp)](/screens/inputs.webp)

Le propriétaire de la chaîne peut le faire, pas seulement les opérateurs.

## Choisir l'ordre {#choose-the-order}

Sous **In order of preference**, chaque entrée a :

- sa place (1, 2, 3) et un état : **on air** (à l'antenne), **ready** (elle a des images et attend), ou **no signal** (pas de signal) ;
- une petite image de ce qu'elle envoie, mise à jour toutes les quelques secondes (un cadre gris tant qu'elle n'envoie rien). Une vidéo en boucle ou une playlist ne démarre que quand on en a besoin, et son image peut donc l'indiquer ; avec la bascule sans coupure, elle est lue à l'intérieur de la chaîne, et son image s'affiche donc pendant qu'elle est à l'antenne ;
- **↑** et **↓** pour la monter ou la descendre ;
- un interrupteur pour l'utiliser ou non. Une entrée désactivée n'est jamais mise à l'antenne.

Vous pouvez changer l'ordre pendant que la chaîne est en direct : le flux ne redémarre pas. Une entrée placée au-dessus de celle qui est à l'antenne prend la main une fois stable pendant la durée que vous avez réglée (10 secondes par défaut) ; celle qui est à l'antenne passe la main aussitôt si vous la désactivez.

La page **Channels** affiche l'ordre de chaque chaîne, par exemple `Inputs: Pull → Live → Playlist`.

### Direct {#live-stream}

La clé de diffusion de la chaîne correspond à l'encodeur **principal**. Activer les entrées donne aussi à la chaîne une **clé de secours** pour un second encodeur, qui prend le relais quand le principal s'arrête ; voir [Encodeur de secours](/fr/guide/backup-encoder). Les deux font partie de l'entrée en direct, le principal en premier.

### Flux récupéré {#pull-stream}

Saisissez le lien et choisissez **Save address**. Unda va le chercher, se reconnecte de lui-même quand il décroche, et affiche son état à côté de l'adresse.

- L'adresse est gardée sur le serveur et n'est plus jamais affichée en entier (elle peut contenir un jeton ou un mot de passe). Pour la changer, saisissez la nouvelle.
- Le propriétaire de la chaîne peut saisir **des liens HLS (`.m3u8`) ou MPEG-TS en `http://` ou `https://` sur l'Internet public**. Les adresses sur le serveur lui-même ou sur un réseau privé sont refusées, y compris les liens qui y redirigent. Les serveurs RTMP, les caméras RTSP et les adresses de votre propre réseau sont indiqués par un opérateur.
- Une playlist terminée (`#EXT-X-ENDLIST`, comme en affiche le serveur d'une chaîne quelque temps après sa fin d'antenne) n'est pas lue comme un enregistrement : l'entrée affiche **The playlist has ended** et attend le retour de la chaîne.
- Retirer la récupération de l'ordre arrête d'aller la chercher : elle ne coûte donc pas de bande passante quand elle ne sert pas.

Voir [Entrées récupérées](/fr/guide/pull-inputs) pour ce qu'Unda fait d'un flux récupéré (conversion de l'audio, reconnexion, codecs).

### Playlist ou vidéo en boucle {#playlist-or-looped-video}

Choisissez **Playlist** ou une vidéo, puis **Save**. Avec **Playlist**, son éditeur s'ouvre en dessous : ajoutez les vidéos dans l'ordre où elles doivent passer, puis **Save schedule**. Elle fonctionne comme la [playlist d'une chaîne 24h/24](/fr/guide/playout) et tourne en boucle par défaut.

**When the live stream goes off air** règle où la playlist commence chaque fois qu'elle prend le relais du direct :

- **Carry on where its clock is** (par défaut) : la playlist tourne sur sa propre horloge, comme si une chaîne 24h/24 la jouait en arrière-plan. Quand elle passe à l'antenne, les spectateurs la rejoignent là où elle en est à ce moment-là, pas à sa première vidéo.
- **Start from the first item** : chaque fois que le direct s'arrête, la playlist repart de sa première vidéo (une vidéo en boucle, de son début). Avec la bascule directe, elle redémarre alors à chaque fois, ce qui peut prendre une seconde ou deux de plus que de continuer.

Vous pouvez modifier la playlist à tout moment, même pendant qu'elle est à l'antenne.

Les vidéos sont les fichiers propres à la chaîne et les fichiers partagés de la page [Media](/fr/guide/playout). Pour ajouter les vôtres, cliquez sur **Add videos** à côté de **What plays** : les fichiers vont dans le dossier propre à la chaîne et peuvent être mis en boucle ou dans la playlist dès qu'ils ont été vérifiés.

### Un logo sur la playlist {#a-logo-on-the-playlist}

La carte **Logo** de l'onglet Input place votre logo sur la playlist ou la vidéo en boucle : les spectateurs le voient toujours pendant que le direct est coupé. Elle fonctionne comme le [logo d'une chaîne 24h/24](/fr/guide/playout#the-channels-logo) : choisissez un PNG ou un JPEG, le coin, la taille et l'opacité, puis **Save logo**. Il est à l'antenne dès l'image suivante de la playlist. La carte apparaît dès que la playlist fait partie des entrées de la chaîne.

Le logo ne va que sur la playlist ou la vidéo en boucle. L'encodeur en direct et les flux récupérés passent tels qu'ils arrivent, sans logo ajouté, avec la bascule directe comme avec la bascule sans coupure. Le logo est supprimé avec la chaîne.

## Ce que voient les spectateurs {#what-viewers-see}

| Moment | Les spectateurs voient |
| --- | --- |
| L'entrée à l'antenne se déconnecte | L'entrée suivante qui a des images, en une seconde environ |
| L'entrée à l'antenne se fige (connectée, sans image) | La dernière image pendant 2 secondes (votre réglage), puis l'entrée suivante |
| Une meilleure entrée revient | Cette entrée de nouveau, une fois qu'elle a envoyé des images régulières pendant 10 secondes (votre réglage) |
| La chaîne démarre (le serveur a redémarré, ou le premier encodeur se connecte) | La première entrée qui a des images, aussitôt |
| Aucune entrée n'a d'images | Le flux s'arrête au bout de 10 secondes (votre réglage) : une coupure, avec les alertes habituelles |

L'onglet **Input** montre quelle entrée est à l'antenne et la dernière bascule avec sa raison ; le journal des événements enregistre chaque bascule. Une chaîne à l'antenne depuis une autre entrée que la première ne lève pas d'alerte : elle est à l'antenne, c'est ce qui compte, et son étiquette indique quelle entrée passe. Seule une chaîne dont aucune entrée n'a d'images en lève une.

**Use now** (opérateurs) met à l'antenne une entrée prête, devant les autres, tant qu'elle a des images.

## Bascule directe ou sans coupure {#direct-or-seamless-switching}

### Bascule directe (par défaut) {#direct-switching-the-default}

Unda relaie l'entrée à l'antenne telle quelle, sans réencodage et sans processeur supplémentaire. Il bascule sur l'image clé de la nouvelle entrée et garde l'horloge du flux en marche ; donc :

- **Des entrées encodées de la même façon basculent sans que les spectateurs le remarquent.** « De la même façon » signifie les mêmes réglages vidéo (codec, profil, résolution, fréquence d'images) et les mêmes réglages audio (fréquence d'échantillonnage, canaux). Réglez vos encodeurs pour qu'ils correspondent, par exemple l'encodeur du studio sur ce que porte le lien HLS de la chaîne.
- **Des entrées encodées différemment font redémarrer le flux un instant**, parce que les lecteurs ne peuvent pas suivre de nouveaux réglages d'image au milieu d'un flux. La page de lecture d'Unda repart d'elle-même, une dizaine de secondes plus tard ; d'autres lecteurs peuvent devoir être relancés, selon le lecteur. Les destinations de rediffusion se reconnectent d'elles-mêmes. Un enregistrement en cours s'arrête ; relancez-le. Le journal des événements indique **restarted on its … (its picture settings differ)**.
- **La playlist est encodée par Unda** : elle correspond donc rarement à un encodeur extérieur, et y basculer ou en revenir fait en général redémarrer le flux.

### Bascule sans coupure (opérateurs) {#seamless-switching-operators}

Un opérateur peut activer **Seamless switching**. Unda décode alors chaque entrée et encode lui-même la chaîne : aucune bascule ne se voit et les lecteurs ne redémarrent jamais, quoi qu'envoie chaque entrée. Les spectateurs reçoivent les réglages d'image que choisit l'opérateur (720p, 30 images/s, 3000 kb/s par défaut).

Cela coûte :

- environ **60 % d'un cœur de processeur** pour une chaîne en 720p, davantage en 1080p ;
- environ **13 % de plus** pour chaque entrée gardée prête ;
- environ **13 % de plus** pendant qu'une vidéo en boucle ou la playlist est à l'antenne.

Un serveur à 4 cœurs peut gérer 2 ou 3 chaînes sans coupure. L'image est réencodée une fois, et le délai augmente d'environ une seconde. La bascule sans coupure est limitée à 16 chaînes, et changer ses réglages fait redémarrer le flux.

## Réglages {#settings}

| Réglage | Par défaut | |
| --- | --- | --- |
| Basculer après une absence d'image de | 2 s | Une absence plus courte se voit comme un arrêt sur image, pas comme une bascule |
| Revenir à une meilleure entrée après | 10 s | Combien de temps une meilleure entrée doit être stable avant de reprendre la main |
| Quand aucune entrée n'a d'images | arrêter le flux au bout de 10 secondes | Ou au bout de 1 ou 5 minutes. Avec la bascule sans coupure : au bout de 1, 5 ou 30 minutes, ou du noir jour et nuit. Avec la bascule sans coupure et une playlist parmi les entrées, il n'y a rien à choisir : la playlist passe et la chaîne reste à l'antenne, y compris après un redémarrage du serveur |

## Qui peut modifier quoi {#who-can-change-what}

| | Propriétaire de la chaîne | Opérateur et au-dessus |
| --- | --- | --- |
| Activer ou désactiver les entrées, choisir l'ordre | ✓ | ✓ |
| Les durées ci-dessus | ✓ | ✓ |
| Adresse de récupération | liens HLS et HTTP publics | n'importe quelle adresse, RTMP, RTSP |
| La playlist ou la vidéo en boucle, et son logo | ✓ | ✓ |
| **Use now**, entrées supplémentaires (une [entrée UDP](/fr/guide/udp), une chaîne d'une [entrée multi-chaînes](/fr/guide/mpts), une autre chaîne) | | ✓ |
| La bascule sans coupure et ses réglages d'image | | ✓ |

## Licence {#licence}

| Option | Comprise dans |
| --- | --- |
| Direct (avec son encodeur de secours) | Professional, Broadcast |
| Flux récupéré | Professional, Broadcast (outil de licence `pull`) |
| Playlist ou vidéo en boucle, bascule sans coupure | Professional, Broadcast (chaînes 24h/24, outil de licence `playout`) |

Sur un serveur Starter, l'onglet **Input** n'affiche que le direct, avec **Pull stream** et **Playlist or looped video** grisés et la mention **Not included in your licence**.

Une chaîne avec des entrées compte pour **un** flux en direct dans votre offre : ses encodeurs, sa récupération et sa playlist ne comptent pas séparément.

## Limites {#limits}

- Les entrées protègent contre la panne d'un encodeur, d'un lien ou d'une chaîne source, pas contre la panne de ce serveur.
- Une adresse de récupération par chaîne.
- Le journal des bascules de l'onglet Input n'est tenu qu'avec la bascule sans coupure ; avec la bascule directe, le journal des événements enregistre chaque bascule.
- Les entrées de chaîne sont pour les chaînes créées sur la page **Channels**. Les chaînes 24h/24 tirées d'une grille ont leur propre entrée en direct (voir [Chaînes 24h/24](/fr/guide/playout)).
- Une entrée n'alimente que sa chaîne. Les destinations de rediffusion, les sorties TV, les enregistrements, les bouquets et les liens de lecture sont pour la chaîne, quelle que soit l'entrée à l'antenne ; une entrée n'a pas de page à elle (dans **Streams**, la ligne d'une entrée ouvre l'onglet Input de sa chaîne). Les destinations créées sur une entrée avant la v0.1.50 continuent d'envoyer et sont listées dans l'onglet Restream de la chaîne, où l'on peut les désactiver ou les supprimer.

## Ce qui a été testé {#what-has-been-tested}

Sur le vrai serveur, avec des encodeurs FFmpeg, une récupération HLS depuis un autre serveur Unda, et des spectateurs HLS et RTMP décodant chaque image :

- Bascule directe entre un encodeur RTMP et une récupération HLS encodés de la même façon, dans les deux sens : pas de redémarrage, et les spectateurs ont décodé sans erreur.
- Changement d'ordre pendant le direct (la récupération en premier, puis l'encodeur en premier à nouveau) : pas de redémarrage ; la page de lecture d'Unda (hls.js dans Chrome) a lu sans interruption.
- Bascule directe vers la playlist : le flux a redémarré, et la page de lecture est repartie d'elle-même une dizaine de secondes plus tard, sans rechargement.
- Bascule sans coupure de l'encodeur vers la récupération, vers la playlist, puis retour : les spectateurs sont restés connectés tout du long, sans erreur.
- Le son par rapport à l'image, mesuré avec une image de test qui clignote quand un bip commence : 0 ms en bascule directe ; en bascule sans coupure, 3 à 13 ms depuis l'encodeur, la récupération et une playlist à 24 images/s (une mesure à 46 ms, une image).
- Un compte client qui saisit un lien HLS public en HTTPS (il a été lu), et une adresse sur un réseau privé (refusée).
- Une licence Starter : les options grisées.
- Le logo de la playlist, mesuré dans les images que reçoivent les spectateurs : sur la vidéo en boucle, pas sur l'encodeur en direct pendant qu'il était à l'antenne, de retour sur la vidéo quand l'encodeur s'est arrêté (bascule directe) ; et en bascule sans coupure, aucun sur les images de l'encodeur en direct, et le logo une fois que le secours a pris le relais.

Pour la bascule directe, réglez de la même façon chaque encodeur qui alimente la chaîne (voir « encodées de la même façon » plus haut), OBS et vMix compris.
