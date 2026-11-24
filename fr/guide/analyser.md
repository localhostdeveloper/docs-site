---
title: "Analyseur de flux de transport (TR 101 290)"
description: "Contrôlez n'importe quel flux de transport comme le fait le matériel de test broadcast : erreurs TR 101 290, débit, PCR, MDI et tables DVB, pendant une minute ou une journée entière."
---

# Analyseur de flux

**Broadcast → Analyse** contrôle n'importe quel flux de transport comme le fait le matériel de test broadcast, pendant une minute ou jusqu'à une journée entière, sans le publier. Utilisez-le pour :

- vérifier un flux avant de compter dessus : la sortie IP d'un récepteur satellite, la liaison SRT d'une chaîne, le groupe multicast d'un partenaire, une chaîne IPTV ;
- voir votre propre sortie comme la voit un récepteur, par exemple le groupe multicast vers lequel envoie un bouquet ou une sortie TV ;
- attraper les erreurs qui vont et viennent (une liaison satellite faible sous la pluie, un réseau saturé tous les soirs) en le laissant tourner des heures ;
- remettre à un fournisseur un rapport qui montre ce qui n'allait pas, et quand.

L'analyseur demande une licence avec les sorties TV (l'offre Broadcast) et est réservé aux opérateurs et au-dessus.

## Lancer une analyse {#starting-an-analysis}

| Flux | Adresse à saisir |
|---|---|
| UDP multicast | `udp://239.1.1.1:5000` (remplissez **Network interface** pour choisir celle sur laquelle le groupe est rejoint) |
| UDP sur un port de ce serveur | `udp://:5000` |
| RTP (MPEG-TS dans du RTP) | `rtp://239.1.1.1:5004` ou `rtp://:5004` |
| SRT, ce serveur appelle l'émetteur | `srt://encoder.example.com:9000` (ajoutez `?streamid=…&passphrase=…` selon ce que demande l'émetteur) |
| SRT, l'émetteur appelle ce serveur | `srt://:9000` |
| RIST | `rist://@:5000`, ou `rist://@:5001?secret=…` pour un émetteur Main Profile chiffré |
| MPEG-TS en HTTP | `http://…/channel.ts` (le lien d'une chaîne IPTV, le lien `/ts` d'un autre serveur) |

Choisissez la durée (de 1 minute à 24 heures) et la façon de juger :

- **Incoming feed** (par défaut) : une table compte dès qu'elle a été vue, comme pour toute entrée. Beaucoup de flux satellite et IPTV ne portent ni table de réseau ni table d'heure, et ce n'est pas une erreur pour un flux reçu. Les erreurs de l'horloge ou des tables de l'émetteur sont des remarques, puisqu'Unda fabrique les siennes pour tout ce qu'il envoie ; le rapport dit **Plays fine** quand il n'y a que cela ([ce qui atteint les spectateurs](/fr/guide/mpts#plays-fine-or-viewers-may-see-glitches)).
- **TV output** : chaque table que demande le DVB (PAT, PMT, SDT, NIT, TDT) est attendue dès le départ, comme en a besoin un modulateur ou un décodeur, et chaque erreur compte. Utilisez-le pour un flux sur le point de passer à l'antenne.

Analyser une adresse vers laquelle l'une de vos sorties envoie en SRT fait d'Unda un second appelant à cet endroit, et la plupart des récepteurs SRT n'en acceptent qu'un : la sortie ne peut pas se connecter pendant l'analyse. Analysez plutôt ce qui arrive au récepteur, ou arrêtez l'analyse quand vous avez fini.

Deux analyses peuvent tourner en même temps. Un port sur lequel écoute l'une des entrées de ce serveur ne peut pas être analysé (l'entrée a déjà son propre rapport : cliquez sur son étiquette **TR 101 290**) ; un groupe multicast qu'une entrée a rejoint peut l'être.

Une adresse HLS (`.m3u8`) est refusée : donnez plutôt l'adresse MPEG-TS. Une adresse qui contient un compte (`http://host/live/user/password/101.ts`) est affichée sans lui.

## Le rapport {#the-report}

Cliquez sur **View** sur une analyse pour voir son rapport. Une analyse en cours se met à jour toutes les 3 secondes. Le rapport commence par une phrase sur ce que les erreurs de toute l'analyse signifient pour les spectateurs, puis ce qu'il faut faire ; les remarques pour l'ingénieur de l'émetteur et le rapport TR 101 290 complet sont repliés en dessous. Le rapport téléchargé commence de la même façon.

- **Rate** (débit) : mesuré à partir du PCR, bourrage compris. **Constant** signifie que chaque fenêtre de 10 secondes concorde à 50 parties par million près, comme la sortie d'un multiplexeur. Chaque PCR est alors aussi contrôlé selon sa position dans le flux (précision du PCR, ±500 ns). **Variable** est normal pour l'IPTV et les flux Internet, mais pas pour un modulateur DVB ou une liaison montante satellite.
- **Packets** (paquets) : 188 octets, ou 204 quand l'émetteur ajoute les octets Reed-Solomon (comme le font certaines passerelles ASI et satellite). Unda les retire avant le contrôle, mais la plupart des récepteurs IP attendent 188 : réglez la passerelle sur 188 si vous le pouvez.
- **Lost** (perdus) : les paquets manquants en route, comptés d'après les compteurs de continuité.
- **MDI (DF:MLR)**, pour l'UDP et le RTP seulement : le Media Delivery Index (RFC 4445), pour la dernière seconde et la pire seconde. **DF** (facteur de délai) indique combien le réseau a regroupé ou étalé les paquets, en millisecondes. C'est la mémoire tampon dont un récepteur a besoin. Quelques ms sont normales ; des dizaines de ms signifient des rafales ou de la gigue en route, que les récepteurs à petite mémoire tampon transforment en paquets perdus. **MLR** (taux de perte de média) correspond aux paquets TS perdus par seconde ; pour la vidéo, 0 est la seule bonne valeur.
- **Link** (liaison) : pour SRT, RIST et HTTP, si la connexion est établie et la dernière raison pour laquelle elle a décroché.
- **Minute par minute** : une barre par minute (par quelques minutes sur une longue analyse), rouge pour les erreurs de priorité 1, jaune pour la priorité 2, bleue pour la priorité 3, verte pour une minute sans erreur, grise quand rien n'est arrivé. Pointez une barre pour voir ses chiffres, son débit, son pire DF et ses paquets perdus.
- En dessous, le rapport TR 101 290 complet. Il commence par la cause probable des erreurs de toute l'analyse et ce qu'il faut faire (paquets perdus en route, signal satellite abîmé, réglages des tables ou du PCR d'un émetteur, paquets arrivant en rafales), puis chaque contrôle avec son nombre, ses dernières erreurs et leurs causes, chaque PID avec son débit et son intervalle de PCR, la fréquence de chaque table, et les noms de chaîne, le réseau et l'heure que portent les tables. Les contrôles sont expliqués dans [Contrôles des flux de transport](/fr/guide/mpts#transport-stream-checks-tr-101-290).

**Download report** enregistre le tout dans un fichier texte (y compris le tableau minute par minute), à garder ou à envoyer.

Une analyse se termine d'elle-même à la fin de sa durée, ou avec **Stop** ; son rapport reste jusqu'à ce que vous le supprimiez. Les dix dernières analyses terminées sont gardées jusqu'au redémarrage du serveur. **Run again**, sur une analyse terminée, en lance une nouvelle avec la même adresse, la même durée et le même jugement (y compris une phrase secrète contenue dans l'adresse : il n'y a rien à retaper) ; le rapport précédent reste à côté.

## Le lire {#reading-it}

- **Des erreurs de continuité avec un MLR élevé** : le réseau perd des paquets. Utilisez SRT, RIST ou RTP avec FEC sur ce chemin, ou réparez la liaison.
- **Un DF élevé, sans perte pour l'instant** : les paquets arrivent en rafales. Un récepteur à petite mémoire tampon va commencer à en perdre. Vérifiez le cadencement de l'émetteur, ou les commutateurs et les liaisons entre les deux.
- **Des erreurs d'intervalle de PCR ou de saut de PCR** : la référence d'horloge de l'encodeur ou du multiplexeur, pas le réseau (sauf si des paquets sont aussi perdus).
- **Des erreurs de précision du PCR sur un flux à débit constant** : quelque chose en route a modifié le flux sans corriger son PCR (un remultiplexeur, une passerelle qui retire le bourrage).
- **NIT, SDT ou TDT manquante, jugé comme sortie TV** : un récepteur n'affichera pas les noms de chaîne, ou affichera une mauvaise heure. Les bouquets et les sorties TV envoyés par Unda les portent toutes ([Tables de réseau et d'heure](/fr/guide/mpts#network-and-time-tables)).

## Par l'API {#over-the-api}

`POST /api/v1/analyses` en lance une, `GET /api/v1/analyses/{id}` lit son rapport : voir l'[API REST](/reference/api) (en anglais).
