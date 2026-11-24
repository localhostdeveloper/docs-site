---
title: "Encodeurs broadcast et IRD en UDP ou en RTP"
description: "Réglez un encodeur broadcast ou un IRD (ARRIS, Harmonic, Ericsson, Cisco) pour envoyer du MPEG-TS à Unda en UDP ou en RTP : les réglages nécessaires et comment vérifier l'arrivée."
---

# Encodeurs broadcast (sortie IP)

Comment régler un encodeur broadcast ou un IRD avec une sortie IP (Motorola / ARRIS, Harmonic, Ericsson, Cisco et d'autres) pour envoyer du MPEG-TS en UDP ou en RTP à Unda. Les noms des menus diffèrent d'une marque à l'autre ; les réglages ci-dessous sont ce dont Unda a besoin, quel que soit leur nom sur votre appareil.

Unda accepte ce qu'envoient ces appareils : de la vidéo H.264, MPEG-2 ou HEVC avec de l'audio AAC, MP2 ou AC-3, en UDP ou en RTP, comme une seule chaîne ou un bouquet multi-chaînes (voir [Ce qui fonctionne avec Unda](/fr/guide/compatibility)).

## Les réglages en un coup d'œil {#settings-at-a-glance}

| Réglage de l'encodeur | À mettre sur |
|---|---|
| Interface de sortie | Le port IP / Gigabit Ethernet, pas l'ASI |
| Protocole | UDP, ou RTP (cochez alors RTP sur l'entrée d'Unda) |
| Paquets TS par paquet IP | 7 (1316 octets) |
| Taille des paquets TS | 188 octets (204 est refusé) |
| FEC (SMPTE 2022-1 / Pro-MPEG) | Désactivé : Unda ne l'utilise pas en entrée |
| Destination | L'adresse du serveur Unda et le port de l'entrée |
| Flux de transport | SPTS (une chaîne) ; un bouquet MPTS demande une entrée multi-chaînes |
| Contrôle du débit | CBR, avec paquets nuls |
| Intervalle de PCR | 40 ms ou moins |
| Embrouillage (BISS, CA) | Désactivé : Unda ne sait pas désembrouiller |
| Vidéo | H.264 Main ou High |
| Fréquence d'images | 25 ou 50 images/s (dans les pays à 50 Hz) |
| GOP / intervalle d'images clés | 1 à 2 secondes : 25 ou 50 images à 25 images/s |
| Audio | AAC-LC, 48 kHz, stéréo, 128 ou 192 kb/s |

## Quelle entrée ajouter {#which-input-to-add}

Unda a deux entrées pour le MPEG-TS en UDP et en RTP. Le choix dépend de ce qu'envoie l'encodeur :

| L'encodeur envoie | Ajoutez | Où |
|---|---|---|
| Une chaîne, de la vidéo H.264 et de l'audio AAC (ADTS) | Une entrée UDP (la plus légère), ou une entrée multi-chaînes | Broadcast → UDP inputs |
| Du H.264 avec du MP2, de l'AC-3, ou de l'AAC empaqueté en LATM/LOAS | Une entrée MPTS : elle convertit l'audio en AAC | Broadcast → MPTS inputs |
| De la vidéo MPEG-2 ou HEVC | Une entrée MPTS avec `transcode_video: true` : elle convertit la vidéo en H.264, environ 1 à 2 cœurs de processeur par chaîne HD | Broadcast → MPTS inputs |
| Plusieurs chaînes (un bouquet MPTS) | Une entrée MPTS | Broadcast → MPTS inputs |

::: warning MP2 ou HEVC sur une simple entrée UDP
Une simple entrée UDP n'accepte que du H.264 avec de l'AAC. Un flux avec un son MP2 passe en direct sans son, et un flux HEVC ne donne pas d'image. Utilisez pour ceux-là une entrée multi-chaînes, même quand le flux ne porte qu'une chaîne.
:::

Dans le doute, utilisez une entrée multi-chaînes. Elle liste ce que porte le flux (le numéro, le nom et les formats de chaque chaîne) avant que quoi que ce soit ne passe en direct, et les entrées créées dans le tableau de bord sont conservées quand le serveur redémarre, comme les entrées UDP. Les deux contrôlent le flux comme le fait le matériel de test broadcast (TR 101 290, intervalle de PCR compris). Les deux sont décrites dans [UDP / MPEG-TS](/fr/guide/udp) et [Multi-chaînes (MPTS)](/fr/guide/mpts).

## Réglages de l'encodeur {#encoder-settings}

### Sortie réseau {#network-output}

- **Interface de sortie :** la sortie IP ou Gigabit Ethernet. Unda n'a pas d'entrée ASI ; pour un appareil qui n'a pas de sortie IP, utilisez une passerelle ASI vers IP.
- **UDP ou RTP :** les deux fonctionnent. Avec RTP, cochez _The sender wraps MPEG-TS in RTP_ sur l'entrée UDP (`rtp: true` dans le fichier de configuration), ou utilisez une adresse `rtp://` sur une entrée multi-chaînes. RTP permet à Unda de remettre dans l'ordre les paquets en retard et de compter exactement combien ont été perdus. Le type de charge doit être 33 (MPEG-TS).
- **7 paquets TS par paquet IP**, chacun de **188 octets**. Unda accepte n'importe quel nombre entier de paquets de 188 octets par datagramme, mais pas les paquets de 204 octets (avec les octets Reed-Solomon) : ils sont refusés, et le journal du serveur indique que les datagrammes ne sont « not whole MPEG-TS packets ».
- **FEC :** Unda n'utilise pas la correction d'erreurs SMPTE 2022-1 (Pro-MPEG) sur ses entrées : elle n'aide donc pas ici. Laissez-la désactivée plutôt que d'envoyer un trafic qui sera jeté.
- **Destination :** l'adresse du serveur Unda et le port que vous avez donné à l'entrée. L'unicast (une seule adresse de serveur) est le plus simple. Le multicast, sur un réseau local, demande des commutateurs qui gèrent l'IGMP. Le tableau de bord affiche le port de l'entrée ; l'adresse est celle du serveur lui-même (sur un serveur cloud, son IP publique, celle vers laquelle pointe votre domaine).

### Flux de transport {#transport-stream}

- **SPTS** (une chaîne) pour une entrée UDP. Une entrée MPTS accepte une chaîne ou un bouquet.
- **CBR avec paquets nuls.** Unda accepte aussi un débit variable, mais un débit constant rend le flux prévisible. C'est surtout important quand la chaîne repart telle quelle dans un bouquet TV : son débit doit rester sous sa part dans le bouquet, sinon les images arrivent en retard aux télévisions (Unda lève une alerte quand cela arrive).
- **Un PCR toutes les 40 ms ou moins** (la limite du DVB). Une entrée MPTS signale un intervalle plus long comme une erreur TR 101 290, et une entrée UDP aussi.
- **Pas d'embrouillage :** le BISS et l'accès conditionnel doivent être désactivés sur la sortie envoyée à Unda.

### Vidéo {#video}

- **Le H.264, profil Main ou High**, passe tel quel, pour un coût presque nul. Le MPEG-2 et le HEVC sont convertis en H.264 par une entrée multi-chaînes (voir le tableau plus haut).
- **25 ou 50 images par seconde** dans les pays à 50 Hz. Une chaîne qui repart telle quelle dans un bouquet DVB à 30 ou 60 images par seconde reçoit un avertissement.
- **Une image clé toutes les 1 à 2 secondes** (GOP de 25 ou 50 à 25 images/s ; IBBP ou IP conviennent tous deux). Les nouveaux spectateurs commencent sur une image clé, et le délai HLS en dépend : mesuré à 6,8 s avec un intervalle de 2 secondes et à 28,8 s avec 8 secondes. Unda prévient quand les images clés sont espacées de plus de 4 secondes.
- **Le H.264 entrelacé** (1080i25) passe tel quel, et un navigateur web peut l'afficher avec des effets de peigne sur les mouvements. Pour un flux regardé en ligne, préférez un format progressif (720p50 ou 1080p25). Le MPEG-2 entrelacé converti par Unda est désentrelacé.
- **Les images B** ne posent pas de problème. Seule la lecture WebRTC à faible délai préfère un flux sans elles ; l'onglet Output du flux prévient quand il en contient.

### Audio {#audio}

- **AAC-LC, 48 kHz, stéréo**, à 128 kb/s (un débit courant pour les chaînes SD) ou 192 kb/s.
- L'AAC peut être empaqueté de deux façons : **ADTS** fonctionne sur les deux entrées ; **LATM/LOAS** demande une entrée multi-chaînes, qui le convertit.
- **Le MP2** et **l'AC-3** demandent une entrée multi-chaînes, qui les convertit en AAC.
- 48 kHz est la fréquence du DVB ; une chaîne qui repart dans un bouquet DVB avec un son à 44,1 kHz reçoit un avertissement.

## Par Internet {#over-the-internet}

L'UDP et le RTP n'ont ni mot de passe ni chiffrement, et un paquet perdu est un défaut visible : rien n'est renvoyé. Utilisez-les sur un réseau de confiance : le réseau local du studio, une liaison louée ou un VPN.

Si l'encodeur doit joindre un serveur par Internet :

- **Le mieux :** envoyez en SRT ou en RIST, qui renvoient ce que le réseau perd. Si l'encodeur parle SRT, envoyez vers le port SRT d'Unda avec la clé de la chaîne ([SRT](/fr/guide/srt)). Sinon, placez à côté de l'encodeur une passerelle qui transforme son UDP en SRT ou en RIST, et recevez-le avec une entrée multi-chaînes (`srt://:9000?passphrase=…` ou `rist://@:5000` ; voir [En SRT ou en RIST](/fr/guide/mpts#over-srt-or-rist)).
- **Unda ne parle pas le protocole de Zixi.** Une passerelle Zixi (ou toute autre) doit remettre à Unda de l'UDP, du RTP ou du SRT.
- **De l'UDP ou du RTP simple malgré tout :** donnez à l'entrée une liste d'autorisations avec l'adresse publique de l'encodeur, n'ouvrez le port qu'à cette adresse dans le pare-feu du serveur (voir la partie Pare-feu de l'[installation](/fr/guide/install#6-pare-feu)) et dans le pare-feu de votre hébergeur cloud, et attendez-vous à quelques défauts dus aux paquets perdus.

## Vérifier l'arrivée {#checking-that-it-arrived}

Avant la première diffusion, envoyez un flux de test et vérifiez-le ici :

- La chaîne apparaît dans **Streams** avec la taille de son image et sa fréquence d'images. La page du flux d'une entrée UDP affiche ses **pertes de paquets** (le point passe au jaune à 0,1 % et au rouge à 1 % sur la dernière minute) et ce qui a été écarté : doublons, paquets mal formés, émetteurs absents de la liste d'autorisations, et une ligne **Transport stream** avec son contrôle TR 101 290 : cliquez dessus pour le rapport complet.
- Une entrée MPTS liste chaque chaîne du flux avec ses formats dans Broadcast → MPTS inputs, et les erreurs TR 101 290 de chaque chaîne publiée. Cliquez sur l'étiquette **TR 101 290** du flux pour le rapport complet : quels paquets ont été perdus, l'intervalle de PCR, et les tables qu'envoie l'encodeur.
- **Rien n'arrive ?** Vérifiez le pare-feu du serveur et la destination de l'encodeur. Puis vérifiez la taille des paquets (188, pas 204) et que RTP est coché sur l'entrée quand l'encodeur envoie du RTP : les deux erreurs se voient comme des datagrammes mal formés.
- **Une image mais pas de son** sur une entrée UDP : l'encodeur envoie de l'audio MP2, AC-3 ou LATM. Utilisez plutôt une entrée multi-chaînes.
