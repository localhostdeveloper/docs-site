---
title: "Résultats des tests : capacité, délai et longues durées"
description: "Ce qui a été mesuré sur Unda Media Server : des fonctionnements de 24 et 72 heures, la capacité en spectateurs, le délai, les réseaux avec pertes, les sorties TV et le débit adaptatif."
---

# Résultats des tests

Ce qui a été mesuré, comment, et le résultat. Les chiffres viennent d'essais enregistrés. Sauf mention contraire sur une ligne, la mesure a été faite sur une machine de développement à 10 cœurs, sur sa propre boucle réseau locale : cela montre ce que peut faire le logiciel serveur, pas ce que fera un réseau ou un serveur donné. Le matériel et les lecteurs testés sont listés dans [Ce qui fonctionne avec Unda](/fr/guide/compatibility).

*Dernière mise à jour : 23 novembre 2026.*

## Longues durées {#long-runs}

| Test | Résultat |
|---|---|
| 72 heures sur le serveur de production d'un client, du 5 au 8 novembre 2026 (48 cœurs, une carte graphique NVIDIA RTX A5000, Ubuntu 24.04, Unda v0.1.49) : 35 flux en direct, dont des chaînes 24h/24, du débit adaptatif sur la carte graphique, des chaînes récupérées et une sortie TV ; 1 à 7 spectateurs, environ 6 Mb/s en sortie | Aucun redémarrage. Mémoire : 1 355 Mo après les 8 premières heures et 1 482 Mo à la 72e heure (+9,4 % ; l'objectif est moins de 10 %). Deux relevés de ce que garde le serveur, pris à 44 heures d'intervalle ensuite : 653 Mo, puis 667 Mo |
| 24 heures sur un serveur de production : 3 flux en direct, 3 spectateurs, environ 8,3 Mb/s en sortie | Aucun redémarrage, 0 image perdue, mémoire stable (146 Mo à la 8e heure, 147 Mo à la 24e), mémoire rendue quand un flux s'arrêtait |
| Entrée UDP à 20 Mb/s pendant 26 minutes (3,9 Go) | 0 paquet perdu |
| Un bouquet de 12 chaînes (12 × 720p) reçu à 60 Mb/s pendant 10 minutes | 0 paquet perdu, 0 erreur de continuité, 0 paquet abandonné par le système d'exploitation ; 6 % d'un cœur de processeur pour lister les chaînes, 13 % avec les 12 publiées |

## Capacité {#capacity}

| Test | Résultat |
|---|---|
| 10 flux 720p entrants à 3 Mb/s, avec 5 spectateurs RTMP et 20 spectateurs HLS, pendant 3 minutes | Chaque flux à 30 images/s, 0 image perdue, aucune alerte ; environ un quart d'un cœur de processeur, 480 Mo de mémoire |
| 200 spectateurs HLS d'un flux 1080p à 5 Mb/s (environ 1 Gb/s en sortie) pendant 3 minutes | 0 arrêt sur image d'un quart de seconde ou plus, 0 erreur, 95 % des spectateurs en lecture en 2,6 s ; environ un quart d'un cœur de processeur |
| Démarrage, jusqu'à la première réponse | 0,05 à 0,07 s pour un nouveau serveur, 0,2 s avec 15 chaînes |

## Systèmes d'exploitation {#operating-systems}

| Test | Résultat |
|---|---|
| Installation sur un serveur Ubuntu 24.04 neuf avec la commande d'installation en une ligne | En marche en moins de 2 minutes |
| Installation sur un serveur Debian 13 neuf (4 cœurs, 4 Go) avec la commande en une ligne, Let's Encrypt et le FFmpeg 7.1.5 de Debian (Unda v0.1.49) | En marche avec HTTPS ; une chaîne en direct lue depuis un autre réseau en HLS, en RTMP et en MPEG-TS en HTTP, avec 0 erreur de décodage |
| Debian 13 : débit adaptatif, 5 qualités du 144p au 720p | Chaque qualité décodée avec 0 erreur ; avec une sortie TV SD en plus, Unda utilisait environ 1,3 des 4 cœurs |
| Debian 13 : une sortie TV SD récupérée par Internet, analysée par TSDuck | Exactement 1 500 000 b/s, constant ; les 1 741 références d'horloge (PCR) à moins de 1 ms ; aucun paquet perdu ou hors d'ordre ; les tables DVB présentes |
| Debian 13 : une chaîne 24h/24, puis un redémarrage de la machine | A continué à travers la boucle de sa playlist ; après le redémarrage, Unda, la chaîne 24h/24 et la sortie TV sont revenus d'eux-mêmes |
| Installation sur un serveur AlmaLinux 10.2 neuf (4 cœurs, 4 Go, SELinux actif) avec la commande en une ligne et Let's Encrypt, après avoir ouvert les ports dans firewalld et installé FFmpeg 7.1.5 depuis RPM Fusion (Unda v0.1.49) | En marche avec HTTPS ; une chaîne en direct lue depuis un autre réseau en HLS, en RTMP et en MPEG-TS en HTTP, avec 0 erreur de décodage ; SELinux n'a rien bloqué |
| AlmaLinux 10 : débit adaptatif (5 qualités, du 144p au 720p) sur une chaîne en direct et une chaîne 24h/24 | Chaque qualité décodée avec 0 erreur |
| AlmaLinux 10 : une sortie TV 720p50 à 2 000 kb/s récupérée par Internet, analysée par TSDuck | Exactement 2 000 000 b/s, constant ; les 1 764 références d'horloge (PCR) correctes ; aucun paquet perdu ; les tables DVB présentes ; 0 erreur de décodage dès la première image clé. Avec les deux échelles de qualités en marche, Unda utilisait environ 2 des 4 cœurs |
| AlmaLinux 10 : une chaîne 24h/24, puis un redémarrage de la machine | 75 s de lecture à travers la boucle de sa playlist avec 0 erreur ; après le redémarrage, Unda et la chaîne 24h/24 sont revenus d'eux-mêmes, toujours sans rien de bloqué par SELinux |
| Alpine Linux 3.24.3 (4 cœurs, 4 Go) : la simple installation en une ligne | Arrêt immédiat avec « systemd is required », rien de modifié |
| Alpine 3.24 : Docker 29.9 depuis les paquets d'Alpine, puis le script d'installation avec `--docker` (Unda v0.1.49) | Signature de la version vérifiée, image fixée par sa somme de contrôle, HTTPS Let's Encrypt ; une chaîne en direct lue depuis un autre réseau en HLS, en RTMP et en MPEG-TS en HTTP, avec 0 erreur de décodage |
| Alpine 3.24 : débit adaptatif (5 qualités), une sortie TV 720p50 avec un son MP2 à 2 000 kb/s (TSDuck), une chaîne 24h/24 en 1080p25 | Chaque qualité et 75 s de la chaîne 24h/24 à travers sa boucle avec 0 erreur ; la sortie TV à exactement 2 000 000 b/s, les 1 763 PCR correctes, 0 discontinuité, les tables DVB présentes. Les quatre tâches ensemble remplissaient les 4 cœurs (charge 17) : dimensionnez le travail HD selon les cœurs |
| Alpine 3.24 : un redémarrage de la machine | Docker (OpenRC) et Unda sont revenus d'eux-mêmes ; la chaîne 24h/24 a repris avec 0 erreur |

## Délai (latence) {#delay-latency}

Mesuré en inscrivant l'heure dans l'image à l'encodeur et en la relisant dans ce qu'affiche le lecteur (Chrome).

| Chemin | Délai |
|---|---|
| RTMP en entrée, RTMP en sortie | 0,1 s |
| RTMP en entrée, WebRTC (WHEP) en sortie | 0,11 s ; première image en 0,5 s |
| WebRTC (WHIP) en entrée, WebRTC en sortie | 0,14 s |
| RTMP en entrée, HLS en sortie, image clé toutes les 2 s | 6,8 s |
| RTMP en entrée, HLS en sortie, image clé toutes les 8 s | 28,8 s (gardez les images clés à 2 s) |
| RTMP en entrée, HLS en sortie : la première image pour un spectateur qui l'ouvre | 0,2 s (3,3 s avant la v0.1.48) |

## Réseaux avec pertes {#lossy-networks}

| Test | Résultat |
|---|---|
| SRT à travers 5 % de pertes de paquets dans chaque sens, 80 ms d'aller-retour, 500 ms de latence SRT | Chaque image à partir de la première image clé livrée, dans l'ordre, sans trou (l'essai témoin avec 60 ms de latence a perdu la plupart des images, comme prévu) |
| RIST d'Unda vers VLC (librist) à travers 5 % de pertes dans chaque sens | Tout récupéré sauf le tout premier paquet du flux (envoyé avant que le récepteur ne connaisse le flux) ; 276 paquets renvoyés |
| RIST de VLC (librist) vers Unda à travers 5 % de pertes | 1 474 paquets récupérés, 0 perdu |
| Publication WebRTC (WHIP) à travers 3 % de pertes | 30 images par seconde conservées (6 avant la v0.1.47) |
| Mesure des pertes d'une entrée UDP, face à un relais qui abandonnait 0,92 % des datagrammes | 0,88 % indiqués |

## Sorties TV {#broadcast-outputs}

| Test | Résultat |
|---|---|
| Un bouquet de 3 chaînes à 8 Mb/s (une chaîne 24h/24 avec son guide, une chaîne en direct, une chaîne hors ligne affichant du noir) analysé par TSDuck pendant 12 minutes | 0 erreur de synchronisation, de transport ou de continuité ; les 108 570 références d'horloge (PCR) à moins d'un tic de leur position ; un PCR toutes les 23 ms ou moins ; liste des chaînes toutes les 100 ms, noms toutes les 0,5 s, guide chaque seconde |
| Sorties TV d'une chaîne, SD (H.264, MPEG-2) | Chaque seconde à moins de 0,5 % du débit réglé (0,7 % pour le MPEG-2), un PCR toutes les 22 ms ou moins |
| Sorties TV d'une chaîne, HD (720p50, 1080i25 ; H.264, HEVC) | Chaque seconde à moins de 1 % du débit réglé, un PCR toutes les 40 ms ou moins |
| Sorties TV d'une chaîne, HD 1080p25 et 1080p50 (H.264 ; HEVC 1080p50) | Chaque seconde à moins de 0,5 % du débit réglé, un PCR toutes les 21 ms ou moins, chaque image au moins une demi-seconde avant son heure de décodage. Comme chaîne d'un bouquet à côté d'une chaîne SD (4 minutes) : aucune image en retard, rien d'abandonné, TR 101 290 propre |
| Tables de réseau et d'heure sur les cinq formats de sortie TV (TSDuck) | Présentes et correctes dans chacun ; références d'horloge exactes par rapport à leur position |
| La sortie TV SD d'Unda analysée comme la voit un récepteur (l'analyseur d'Unda lui-même, jugé comme sortie TV) | Propre sur les trois priorités TR 101 290 ; débit d'exactement 1300 kb/s, constant ; précision du PCR : 0 erreur ; gigue réseau (MDI) 8,8 ms, 0 perdu |
| Le même bouquet de 2 chaînes analysé à la fois par TSDuck et par l'analyseur d'Unda | Pour les deux : 3 000 000 b/s, les mêmes chaînes et PID, bourrage à 0,4 % près, aucune erreur |
| VLC qui ouvre un bouquet de 3 chaînes | Les trois chaînes listées par leur nom ; le passage de l'une à l'autre fonctionne |

Les sorties TV sont testées avec les versions de FFmpeg que portent les systèmes des clients : 4.4 (Ubuntu 22.04), 6.1 (Ubuntu 24.04), 7.1 (Debian 13, et AlmaLinux 10 depuis RPM Fusion), 8.0 (Ubuntu 26.04), 8.1 (l'image Docker) et 9.

## Débit adaptatif et DASH {#adaptive-bitrate-and-dash}

| Test | Résultat |
|---|---|
| Une échelle de 7 qualités à partir d'une source 4K | Le débit réel de chaque qualité dans les limites annoncées par la playlist ; la qualité 4K se décode proprement |
| Lecteurs DASH (dash.js, Shaka) forcés à passer par chaque qualité toutes les 6 s | 0 interruption |
| Une liaison ralentie (HLS dans Chrome, Shaka) | Descente vers une qualité plus petite et remontée quand la liaison s'est rétablie ; Shaka avec 0 interruption |
| Manifestes DASH | Valides selon le schéma de MPEG ; les temps des segments correspondent au manifeste |

## Comment le logiciel est contrôlé {#how-the-software-is-checked}

- Chaque modification passe la suite de tests complète avec le détecteur de concurrence de Go, `go vet` et un analyseur de code.
- Chaque analyseur qui lit des données venant du réseau (RTMP, SRT, UDP, RTP, RIST, WebRTC, MPEG-TS, les tables DVB, les playlists) est soumis à des entrées aléatoires (fuzzing) à chaque modification.
- Couverture des tests du cœur et des paquets de protocoles : de 64 % à 100 % (le cœur : 96 %).
- Chaque version est contrôlée contre les vulnérabilités connues de Go et de chaque bibliothèque utilisée (govulncheck) : aucune atteignable dans la v0.1.50.
- Comment signaler un problème de sécurité, et comment les versions et les comptes sont protégés : [Sécurité](/fr/security).

Voir [Versions et assistance](/fr/guide/releases) pour la façon dont les versions sont faites, et les [notes de version](/release-notes) (en anglais) pour ce que chacune a changé.
