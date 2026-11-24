---
title: "Qu'est-ce qu'Unda Media Server ?"
description: "Unda Media Server est un serveur de diffusion en direct que vous faites tourner vous-même : RTMP, SRT, UDP et WebRTC en entrée ; HLS, DASH, RTMP et rediffusion en sortie. Ce qu'il fait et ce qu'il lui faut."
---

# Qu'est-ce qu'Unda ?

Unda Media Server est un serveur de diffusion en direct que vous faites tourner vous-même. Des encodeurs comme OBS, vMix, des encodeurs matériels, des encodeurs broadcast et des récepteurs satellite lui envoient un flux (voir [Ce qui fonctionne avec Unda](/fr/guide/compatibility)) ; Unda transmet ce flux aux spectateurs dans un navigateur, à des lecteurs comme VLC, à des logiciels de production comme OBS et vMix, et à d'autres plateformes comme YouTube.

C'est un seul programme. Il tourne sur un serveur Linux (ou dans Docker), garde ses données dans un seul fichier et obtient lui-même son certificat HTTPS.

## Ce qu'il fait {#what-it-does}

| | |
|---|---|
| **Reçoit des flux** | RTMP / RTMPS (OBS, vMix, ffmpeg), SRT (contribution par Internet), WebRTC avec WHIP (OBS, un navigateur), MPEG-TS en UDP ou en RTP, unicast ou multicast, et RIST (encodeurs matériels, IPTV), flux multi-chaînes (MPTS) |
| **Va chercher des flux** | Liens HLS, MPEG-TS en HTTP, autres serveurs RTMP et caméras RTSP, publiés comme n'importe quel autre flux |
| **Les diffuse** | Une page de lecture dans le navigateur, du HLS pour les sites et les applications, du MPEG-DASH, du WebRTC avec WHEP (environ une seconde de délai), du RTMP et du SRT pour VLC / OBS / vMix, du MPEG-TS en HTTP pour les applications IPTV, de l'UDP, du RTP ou du RIST pour les décodeurs |
| **Débit adaptatif** | Plusieurs qualités d'un même flux (de la 4K jusqu'au 144p), pour que chaque spectateur en reçoive une que sa connexion peut porter. Sur le processeur ou une carte graphique ; facultatif ; demande FFmpeg |
| **Rediffusion** | Le même flux vers YouTube, Facebook, Twitch ou d'autres serveurs en même temps, en RTMP, RTMPS ou SRT |
| **Télévision et IPTV** | SD (576p25, 576i25) et HD (720p50, 1080i25, 1080p25, 1080p50) en H.264, HEVC ou MPEG-2 (SD seulement), à débit constant avec les noms de chaîne DVB, les tables de réseau et d'heure et un guide des programmes, pour les multiplexeurs et les modulateurs ; plusieurs flux regroupés comme les chaînes d'un même flux de transport (MPTS) ; un flux transmis tel quel avec un relais |
| **Enregistrement** | Enregistre n'importe quel flux en direct dans des fichiers, coupés toutes les heures, avec un nettoyage automatique en option |
| **Tableau de bord** | Flux, mosaïque, spectateurs, santé, alertes et événements en direct ; chaînes, utilisateurs, clés d'API et réglages |
| **Surveillance** | Santé des flux, pertes de paquets sur les entrées UDP, contrôles TR 101 290 des flux de transport en entrée et en sortie, un analyseur de flux, des métriques Prometheus et des alertes par webhook |

[Une visite du tableau de bord](/fr/guide/dashboard) montre à quoi ressemble son utilisation.

## Comment tout s'assemble {#how-it-fits-together}

1. Un administrateur crée une **chaîne**. Une chaîne a un **nom** public (par exemple `main-show`) et une **clé de diffusion** secrète (`sk_…`).
2. L'encodeur publie avec la clé : `rtmp://votre-serveur/live/sk_…`.
3. Les spectateurs regardent avec le nom : `https://votre-serveur/watch/main-show`. Seule la clé permet de diffuser ; connaître le nom permet seulement de regarder.

Chaque flux est disponible sur toutes les sorties dès qu'il arrive, quelle que soit la façon dont il est entré : un flux envoyé en SRT se lit dans le navigateur, dans VLC en RTMP et sur un décodeur en UDP, sans rien à configurer.

## Ce qu'il vous faut {#what-you-need}

- Un serveur Linux. **4 cœurs de processeur et 8 Go de mémoire** suffisent pour faire passer des flux. Convertir demande davantage : environ 1 à 2 cœurs par flux 1080p avec le débit adaptatif.
- De la bande passante en envoi pour vos spectateurs : chaque spectateur a besoin du débit du flux, donc **100 Mbit/s portent environ 25 spectateurs à 3 Mb/s**, 1 Gbit/s environ 250 (voir [Jusqu'où va un serveur](/fr/guide/compatibility#how-far-one-server-goes)).
- Un nom de domaine qui pointe vers le serveur, pour HTTPS sur Internet. Sur votre propre réseau, l'installation Docker fonctionne sans : elle fabrique son propre certificat.
- Un fichier de licence de votre fournisseur. Sans licence, Unda fonctionne en mode évaluation pendant 30 jours : tout marche, jusqu'à 2 flux en direct et 2 comptes en plus du propriétaire.

## Quelle taille de serveur {#how-big-a-server}

Le nombre de spectateurs dépend de la bande passante en envoi du serveur, pas de son processeur : 100 Mbit/s portent environ 25 spectateurs à 3 Mb/s, 1 Gbit/s environ 250, quelle que soit la machine. Le processeur (ou une carte graphique) compte pour convertir : débit adaptatif, flux MPEG-2 et chaînes 24h/24. [Jusqu'où va un serveur](/fr/guide/compatibility#how-far-one-server-goes) explique les deux.

Suite : [installer Unda](/fr/guide/install).
