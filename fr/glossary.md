---
title: Glossaire des termes du streaming en direct
description: "Les termes du streaming en direct et de la diffusion TV en mots simples, du débit adaptatif et du HLS aux images clés, au SRT, au MPEG-TS et au TR 101 290, et où chacun apparaît dans Unda."
outline: [2, 2]
---

# Glossaire des termes du streaming en direct

La vidéo en direct s'accompagne de beaucoup d'abréviations. Les voici en mots simples, avec une note sur l'endroit où chacune apparaît dans Unda Media Server. Il en manque une ? [Demandez-nous](/fr/contact).

## AAC {#aac}

Le format de son le plus courant pour le streaming (Advanced Audio Coding). Les téléphones, les navigateurs et les télévisions connectées le lisent tous. Unda transmet l'AAC sans y toucher et convertit en AAC, pour les spectateurs sur le web, les autres formats de son, comme le MP2 et l'AC-3 du matériel broadcast.

## AC-3 {#ac-3}

Un format de son utilisé à la télévision, aussi appelé Dolby Digital. Unda peut le recevoir du matériel broadcast et peut l'envoyer dans ses sorties TV.

## Bande passante en envoi {#upload-bandwidth}

La quantité de données que le serveur peut envoyer chaque seconde. Elle décide du nombre de spectateurs qu'un serveur peut servir : chaque spectateur et chaque destination de rediffusion a besoin du débit du flux.

## CBR et VBR {#cbr-and-vbr}

Le débit constant (CBR) envoie exactement la même quantité de données chaque seconde, en comblant la place libre par du bourrage ; les modulateurs et les multiplexeurs TV en ont besoin. Le débit variable (VBR) n'envoie que ce dont l'image a besoin, ce qui économise de la bande passante sur les liaisons IP. Les [sorties TV](/fr/features/tv-outputs) d'Unda savent faire les deux.

## CDN {#cdn}

Un réseau de diffusion de contenu : de nombreux serveurs dans le monde qui gardent des copies d'un flux près des spectateurs. Utile pour les très grands publics. Unda sert les spectateurs directement ; le guide explique comment placer un CDN devant sa sortie HLS.

## Clé de diffusion {#stream-key}

La partie secrète de l'adresse d'un encodeur, qui prouve qu'il a le droit de publier sur une chaîne. Quiconque a la clé peut diffuser sur cette chaîne : gardez-la privée. Dans Unda, chaque chaîne a sa propre clé, distincte du nom public sous lequel les spectateurs la regardent.

## Codec {#codec}

La méthode utilisée pour compresser la vidéo ou le son, comme le H.264 ou l'AAC. L'encodeur compresse, le lecteur décompresse, et les deux doivent prendre en charge le même codec.

## DASH {#dash}

MPEG-DASH, une façon de diffuser la vidéo sur le web en petits segments, comme le HLS. C'est une norme internationale utilisée par beaucoup d'applications et de télévisions connectées. Unda propose le DASH à côté du HLS, avec les mêmes qualités.

## Débit {#bitrate}

La quantité de données qu'utilise un flux chaque seconde, en kilobits (kb/s) ou en mégabits (Mb/s). Un flux 720p fait en général 2 à 4 Mb/s. Chaque spectateur reçoit sa propre copie : le débit multiplié par le nombre de spectateurs est donc ce que doit porter l'envoi du serveur. Voir [combien de spectateurs un serveur peut porter](/fr/blog/how-many-viewers-can-one-server-carry).

## Débit adaptatif (ABR) {#adaptive-bitrate-abr}

Fabriquer plusieurs copies d'un flux à des qualités différentes, pour que le lecteur de chaque spectateur choisisse celle que sa connexion peut porter et change quand la connexion change. Les spectateurs sur données mobiles lentes continuent de regarder, tandis que les connexions rapides ont la pleine HD. Voir [Débit adaptatif](/fr/features/adaptive-bitrate).

## Délai (latence) {#latency}

Le temps entre ce qui se passe devant la caméra et le moment où les spectateurs le voient. À travers Unda, il est d'environ un dixième de seconde pour les spectateurs RTMP et SRT, et d'environ 7 secondes en HLS avec des images clés toutes les 2 secondes.

## Diffusion programmée (playout) {#playout}

Passer des programmes à l'antenne selon une grille, comme le fait une chaîne de télévision. Voir [Chaînes 24h/24](/fr/features/24-7-channels).

## Encodeur {#encoder}

Le logiciel ou l'appareil qui compresse l'image de la caméra et l'envoie au serveur : OBS Studio, vMix, un ATEM Mini, une application de téléphone ou un encodeur broadcast. Voir [diffuser depuis OBS, vMix ou ffmpeg](/fr/guide/streaming).

## EPG et programme en cours et suivant {#epg-and-nownext}

Le guide électronique des programmes qu'affichent les décodeurs. « En cours et suivant » (dans le DVB, la table EIT present/following) nomme le programme à l'antenne et celui qui le suit. Unda le remplit automatiquement pour les chaînes 24h/24 dans ses sorties multi-chaînes.

## FEC {#fec}

La correction d'erreurs directe (forward error correction) : des données supplémentaires envoyées avec un flux, pour que le récepteur puisse reconstruire les paquets perdus en route sans les redemander. Unda prend en charge le FEC SMPTE 2022-1 sur les sorties RTP.

## Fréquence d'images {#frame-rate}

Le nombre d'images par seconde d'une vidéo, comme 25, 30, 50 ou 60 images/s. L'Europe, l'Afrique et une grande partie de l'Asie utilisent 25 et 50 pour la télévision ; les Amériques utilisent 30 et 60.

## GOP et intervalle d'images clés {#gop-and-keyframe-interval}

Une image clé est une image complète ; les images qui suivent ne décrivent que les changements. Un groupe d'images (GOP) va d'une image clé à la suivante. Un lecteur ne peut démarrer que sur une image clé : un long intervalle fait donc attendre les spectateurs et met le HLS loin derrière le direct. Réglez votre encodeur sur une image clé toutes les 2 secondes. Voir [pourquoi votre direct a 30 secondes de retard](/fr/blog/why-your-hls-stream-is-30-seconds-behind).

## H.264 {#h264}

Aussi appelé AVC : le codec vidéo le plus largement pris en charge, lu par pratiquement tous les navigateurs, téléphones et télévisions connectées. Les flux d'Unda sont en H.264.

## HEVC {#hevc}

Aussi appelé H.265 : un codec vidéo plus récent qui demande environ la moitié du débit du H.264 pour la même qualité, mais qui est pris en charge par moins d'appareils. Unda peut envoyer du HEVC dans ses sorties TV.

## HLS {#hls}

HTTP Live Streaming : diffuser la vidéo en petits fichiers (segments) listés dans une playlist que le lecteur recharge sans cesse. Il se lit dans tous les navigateurs, téléphones et télévisions connectées et traverse les pare-feu comme n'importe quelle page web, au prix de quelques secondes de délai. La page de lecture d'Unda utilise le HLS.

## Journal de diffusion {#as-run-log}

Un relevé de ce qui est réellement passé à l'antenne et quand, par opposition à ce qui était prévu. Les diffuseurs s'en servent comme preuve de diffusion pour les annonceurs. Unda en tient un pour chaque [chaîne 24h/24](/fr/features/24-7-channels).

## Lien signé {#signed-link}

Une adresse de lecture avec un jeton qui prouve qu'elle a été créée par quelqu'un qui détient le secret du serveur, et qui dit jusqu'à quand elle est valable. Utilisé pour les événements payants et les flux privés. Voir [Liens de lecture signés](/fr/features/signed-links).

## MDI {#mdi}

Le Media Delivery Index (RFC 4445) : deux chiffres pour un flux transporté sur un réseau IP, affichés sous la forme DF:MLR. Le facteur de délai (DF) indique combien le réseau a regroupé ou étalé les paquets, en millisecondes : la mémoire tampon dont un récepteur a besoin. Le taux de perte de média (MLR) indique combien de paquets ont été perdus par seconde. L'[analyseur de flux](/fr/guide/analyser) d'Unda mesure les deux pour les flux UDP et RTP.

## Mire {#slate}

Une image fixe ou une courte vidéo en boucle affichée quand il n'y a rien d'autre à montrer, comme « Nous revenons tout de suite ». Unda en utilise une pour les trous d'une grille 24h/24 et quand toutes les sources d'un flux avec des secours sont coupées.

## MPEG-TS {#mpeg-ts}

Le flux de transport MPEG : le format conteneur de la télévision numérique, fait de petits paquets de 188 octets. Unda l'utilise pour les enregistrements, le SRT, l'UDP, le RTP et le RIST, et pour ses sorties TV.

## MPTS et SPTS {#mpts-and-spts}

Un flux de transport à programme unique (SPTS) porte une chaîne ; un flux de transport multi-programmes (MPTS) porte plusieurs chaînes dans un seul flux, comme le fait un multiplexeur TV. Unda peut extraire des chaînes d'un MPTS et construire le sien. Voir [Sorties TV et IPTV](/fr/features/tv-outputs).

## Multicast et unicast {#multicast-and-unicast}

L'unicast envoie une copie distincte d'un flux à chaque récepteur. Le multicast envoie une seule copie sur un réseau, et chaque récepteur qui a rejoint le groupe la reçoit. Les réseaux IPTV utilisent le multicast pour atteindre beaucoup de décodeurs sans multiplier le trafic.

## NIT {#nit}

La table d'informations de réseau (Network Information Table) : la table DVB qui nomme un réseau et liste ses flux de transport et ses chaînes. Les décodeurs la lisent quand ils recherchent les chaînes. Les bouquets et les sorties TV d'Unda en envoient une. Voir [Tables de réseau et d'heure](/fr/guide/mpts#network-and-time-tables).

## Pertes de paquets {#packet-loss}

Des données qui quittent l'émetteur mais n'arrivent jamais, ce qui est courant sur Internet et sur les réseaux chargés. Le SRT et le RIST récupèrent les paquets perdus en les redemandant ; l'UDP non : Unda mesure donc et affiche les pertes sur chaque entrée UDP.

## PID {#pid}

L'identifiant de paquet : le numéro qui indique à quelle chaîne et à quelle piste (vidéo, son, tables) appartient chaque paquet MPEG-TS. Les récepteurs et les multiplexeurs sont souvent réglés par PID : Unda garde donc les PID d'un bouquet fixes d'un redémarrage à l'autre.

## Réception (ingest) {#ingest}

Faire entrer un flux dans le serveur depuis un encodeur. Unda reçoit le RTMP, le SRT, l'UDP, le RTP et le RIST.

## Rediffusion {#restreaming}

Renvoyer un flux reçu par votre serveur vers d'autres plateformes, comme YouTube et Facebook, en même temps. Voir [Rediffusion](/fr/features/restreaming).

## RIST {#rist}

Reliable Internet Stream Transport : un protocole du monde de la diffusion pour envoyer des flux de transport par Internet, qui récupère les paquets perdus en les redemandant. Unda prend en charge le RIST Simple Profile, en entrée et en sortie.

## RTMP et RTMPS {#rtmp-and-rtmps}

Real-Time Messaging Protocol : la façon la plus courante pour les encodeurs comme OBS d'envoyer un flux à un serveur, et la façon dont YouTube et Facebook reçoivent les flux. Le RTMPS est du RTMP dans une connexion chiffrée.

## RTP {#rtp}

Real-time Transport Protocol : une fine enveloppe autour des paquets UDP qui les numérote, pour qu'un récepteur puisse les remettre dans l'ordre et repérer les pertes. Courant dans la diffusion TV et l'IPTV.

## Secours automatique (failover) {#failover}

Passer automatiquement à une source de secours quand la principale tombe, pour que le flux reste à l'antenne. Voir [Encodeur de secours](/fr/features/backup-encoder) et [Entrées de chaîne](/fr/guide/channel-inputs).

## Segment {#segment}

Un court morceau d'un flux, en général de 2 à 6 secondes, que les lecteurs HLS et DASH téléchargent l'un après l'autre. Un segment ne peut commencer que sur une image clé.

## SRT {#srt}

Secure Reliable Transport : un protocole pour envoyer de la vidéo en direct par Internet qui récupère les paquets perdus et peut chiffrer le flux. Idéal pour la contribution depuis un lieu éloigné sur une connexion peu fiable. Voir [SRT](/fr/guide/srt).

## TDT et TOT {#tdt-and-tot}

La table de date et d'heure (Time and Date Table) et la table de décalage horaire (Time Offset Table) : les tables DVB qui portent l'heure actuelle (UTC) et le décalage local avec son prochain changement d'heure d'été. Les récepteurs règlent leur horloge sur elles. Les bouquets et les sorties TV d'Unda envoient les deux (la TOT quand un fuseau horaire est réglé).

## TR 101 290 {#tr-101-290}

La liste de contrôle de l'ETSI dont se servent les ingénieurs de la diffusion pour juger de la santé d'un flux de transport : synchronisation, continuité, tables et cadencement. Unda contrôle en permanence selon elle tout ce qu'il envoie en MPEG-TS (bouquets, sorties TV, destinations UDP, RTP, RIST et SRT) et le MPEG-TS qu'il reçoit (entrées UDP, RTP et SRT, entrées multi-chaînes).

## Transcodage {#transcoding}

Décoder un flux et l'encoder à nouveau dans une autre taille, un autre débit ou un autre codec. C'est ce dont a besoin le débit adaptatif, et la partie du streaming qui utilise le plus de temps de processeur.

## UDP {#udp}

User Datagram Protocol : envoie des paquets sans vérifier qu'ils arrivent. Il est rapide et simple, et c'est ainsi que la plupart du matériel de diffusion TV et IPTV échange des flux de transport sur un réseau local. Voir [UDP / MPEG-TS](/fr/guide/udp).
