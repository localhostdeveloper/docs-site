---
title: "Encodeurs, lecteurs et matériel compatibles"
description: "Les encodeurs, lecteurs et équipements broadcast qui fonctionnent avec Unda Media Server, d'OBS, vMix et VLC aux encodeurs matériels, récepteurs et décodeurs."
---

# Ce qui fonctionne avec Unda

Unda n'est pas lié à OBS ou à vMix. Il parle les protocoles standard de la vidéo en direct (RTMP, SRT, MPEG-TS en UDP et en RTP, RIST, HLS, DASH et WebRTC) : tout ce qui envoie ou reçoit l'un d'eux peut donc fonctionner avec lui, qu'il s'agisse d'une application de téléphone, d'un encodeur logiciel, d'un boîtier de diffusion matériel, d'un encodeur broadcast ou d'un récepteur satellite sur votre réseau local, d'un multiplexeur DVB, ou de YouTube.

Cette page distingue trois choses :

- **Testé :** nous l'avons fait tourner et avons vérifié le résultat.
- **Devrait fonctionner :** l'équipement parle un protocole et un format testés avec Unda.
- **Non pris en charge :** ne comptez pas dessus.

Les mesures qui sont derrière (longues durées, capacité, délai, réseaux avec pertes, analyse broadcast) se trouvent dans [Résultats des tests](/fr/guide/test-results).

## Le serveur {#the-server}

Unda tourne sous Linux, sur des processeurs Intel/AMD (x86-64) ou ARM (arm64).

| Système | État |
|---|---|
| Ubuntu 24.04 | Testé : la commande d'installation en une ligne, sur des serveurs de production |
| Debian 13 | Testé : la commande en une ligne avec Let's Encrypt et le FFmpeg 7.1 de Debian, le débit adaptatif, les sorties TV, les chaînes 24h/24 et un redémarrage de la machine |
| AlmaLinux 10 | Testé : la commande en une ligne avec SELinux actif, FFmpeg 7.1 depuis RPM Fusion, le débit adaptatif, les sorties TV, les chaînes 24h/24 et un redémarrage de la machine. Deux étapes à faire vous-même d'abord : [pare-feu et FFmpeg](/fr/guide/install#1-install) |
| Ubuntu 22.04 et 26.04, Debian 12 | Devrait fonctionner : le même script d'installation ; le FFmpeg d'Ubuntu 22.04 (4.4) et de 26.04 (8.0) est testé avec Unda |
| Rocky Linux et Red Hat Enterprise Linux 9 et 10, AlmaLinux 9 | Devrait fonctionner : les mêmes étapes qu'AlmaLinux 10 |
| Alpine Linux 3.24 | Testé avec Docker (Alpine n'a pas systemd pour l'installation en service) : Docker depuis les paquets d'Alpine, puis le script d'installation avec `--docker` ; Let's Encrypt, débit adaptatif, sorties TV, une chaîne 24h/24 et un redémarrage de la machine. [Les étapes](/fr/guide/install#1-install) |
| Autres Linux (Fedora, openSUSE…) | Devrait fonctionner avec l'image Docker |
| Windows | Par WSL ou Docker Desktop : voir [Unda sous Windows](/fr/guide/windows) |
| macOS | Non pris en charge comme serveur |

## Envoyer vers Unda {#sending-to-unda}

| Source | Se connecte avec | État |
|---|---|---|
| OBS Studio | RTMP, SRT | Testé (OBS 32) |
| OBS Studio 30 et plus récent | WebRTC (WHIP) | Devrait fonctionner : le même standard que le client ffmpeg testé |
| ffmpeg | RTMP, SRT, UDP, RTP, RIST, WebRTC (WHIP) | Testé |
| VLC | RIST | Testé |
| vMix | RTMP, SRT | Devrait fonctionner |
| Wirecast, Streamlabs, Larix Broadcaster (téléphone) | RTMP, SRT | Devrait fonctionner |
| Encodeurs de diffusion matériels avec RTMP ou SRT (Blackmagic ATEM Mini et Web Presenter, Teradek, Magewell, Kiloview, Haivision, AJA et d'autres) | RTMP, SRT | Devrait fonctionner |
| Encodeurs broadcast et récepteurs satellite/IRD avec une sortie IP (Motorola / ARRIS, Harmonic, Ericsson, Cisco et d'autres) | MPEG-TS en UDP ou en RTP, une chaîne ou un bouquet multi-chaînes | Devrait fonctionner : les formats qu'ils envoient sont testés (voir plus bas) ; [réglages](/fr/guide/broadcast-encoders) |
| Caméras IP qui savent pousser du RTMP ou du SRT | RTMP, SRT | Devrait fonctionner |
| Caméras IP qui ne proposent que le RTSP | [Entrée récupérée](/fr/guide/pull-inputs) (Unda récupère le RTSP en TCP ou en UDP) | Devrait fonctionner : le RTSP est testé en TCP et en UDP, avec de la vidéo H.264, de l'audio G.711 et un mot de passe |
| Liens HLS et MPEG-TS en HTTP (fournisseurs IPTV, CDN, autres serveurs) | [Entrée récupérée](/fr/guide/pull-inputs) | Testé avec des sources HLS et HTTP, un flux HLS public sur Internet et un autre serveur Unda |
| Un autre serveur RTMP | [Entrée récupérée](/fr/guide/pull-inputs) | Testé (en récupérant depuis le serveur RTMP de FFmpeg) |
| ASI ou SDI | — | Non pris en charge ; placez devant une passerelle ASI vers IP ou un encodeur SDI |
| NDI | — | Non pris en charge |

### Formats vidéo et audio {#video-and-audio-formats}

| La source envoie | Ce qui se passe | Coût |
|---|---|---|
| Vidéo H.264, audio AAC | Transmis tel quel, sur n'importe quelle entrée | Presque rien |
| Vidéo H.264, audio MP2 ou AC-3, ou AAC empaqueté en LATM/LOAS (UDP/RTP) | Audio converti en AAC | Très peu |
| Vidéo MPEG-2 (typique des encodeurs broadcast et des IRD) | Convertie en H.264, les images entrelacées désentrelacées | 1 à 2 cœurs de processeur par chaîne HD (voir le [dimensionnement](#converting-the-cpu-or-gpu)) |
| Vidéo HEVC (H.265) en UDP/RTP | Convertie en H.264, comme le MPEG-2 | Un peu plus que le MPEG-2 : le HEVC est plus lourd à décoder |
| HEVC en RTMP ou en SRT | Non pris en charge : envoyez du H.264 | — |

La conversion est faite par une [entrée multi-chaînes](/fr/guide/mpts) avec `transcode_video: true`, **y compris quand le flux ne porte qu'une chaîne**. La simple [entrée UDP](/fr/guide/udp) n'accepte que du H.264 avec de l'AAC.

Bon à savoir aussi :

- **Le matériel SRT plus ancien** (SRT 1.3 ou 1.4.0) fonctionne dans les deux sens depuis Unda v0.1.50 : testé avec libsrt 1.3.4 et 1.4.0, ainsi qu'avec la version 1.5 actuelle.
- **Les chaînes embrouillées** (BISS, accès conditionnel) ne peuvent pas être désembrouillées par Unda. Le récepteur doit les envoyer en clair.
- Chaque flux garde **une piste vidéo et une piste audio**, avec les sous-titres codés contenus dans la vidéo ([CEA-608/708](/fr/guide/watching#closed-captions)). Les autres sous-titres, le télétexte et les messages de repères SCTE-35 ne sont pas transmis.

### Exemple : un encodeur broadcast sur le même réseau {#example-a-broadcast-encoder-on-the-same-network}

Un encodeur ou un IRD Motorola / ARRIS (ou de toute autre marque) avec une sortie IP se trouve sur le même sous-réseau que le serveur Unda et envoie un flux MPEG-2 avec de l'audio AC-3.

**Ce que nous avons testé :** un flux MPEG-2 entrelacé 1920×1080 à 12 Mb/s avec de l'audio AC-3, envoyé en UDP. Unda l'a converti en H.264 1080p à 59,94 images par seconde avec un son AAC stéréo, et il s'est lu en HLS sans un seul avertissement du décodeur. Prévoyez 1 à 2 cœurs de processeur par chaîne HD convertie de cette façon.

1. Sur l'encodeur, réglez la sortie IP sur l'adresse du serveur et un port (unicast, le plus simple), ou sur un groupe multicast.
2. Dans `unda.yaml` (ou dans le tableau de bord : Broadcast → MPTS inputs) :

   ```yaml
   mpts_inputs:
     - name: motorola
       source: udp://:5000              # unicast vers le port 5000 du serveur
       # source: udp://239.1.1.1:5000   # ou un groupe multicast
       # interface: eth1                # multicast : la carte réseau côté encodeur
       allow: [192.168.10.20]           # n'accepter que les paquets de l'encodeur
       programs:
         - program: 1                   # le numéro de la chaîne dans le flux
           stream: channel-1            # son nom dans Unda
           transcode_video: true        # MPEG-2 → H.264
   ```

3. Vous ne savez pas ce que porte le flux ? Ajoutez d'abord `discover_only: true` : Unda liste chaque chaîne avec son numéro, son nom et ses formats, sans rien publier.
4. Au-delà d'environ 20 Mb/s, augmentez la mémoire de réception de Linux (voir [UDP / MPEG-TS](/fr/guide/udp)).

**Le multicast** demande un commutateur avec IGMP snooping et un querier, sinon le trafic inonde tous les ports.

Tous les réglages d'encodeur dont Unda a besoin (taille des paquets, PCR, images clés, audio), quelle entrée ajouter pour quels formats, et l'envoi par Internet : [Encodeurs broadcast (sortie IP)](/fr/guide/broadcast-encoders).

### Caméras IP qui ne parlent que le RTSP {#ip-cameras-that-only-speak-rtsp}

Ajoutez la caméra comme [entrée récupérée](/fr/guide/pull-inputs) : Unda récupère son flux RTSP et convertit de lui-même l'audio de la caméra en AAC (la vidéo H.264 passe telle quelle). Sans l'outil de récupération dans votre licence, faites tourner ffmpeg à côté d'Unda pour récupérer la caméra et la pousser vers lui :

```bash
ffmpeg -rtsp_transport tcp -i "rtsp://user:pass@192.168.1.64/stream1" \
       -c:v copy -c:a aac -f flv "rtmp://votre-serveur/live/sk_…"
```

## Sortir les flux d'Unda {#getting-streams-out-of-unda}

| Destination | Comment | État |
|---|---|---|
| Navigateurs web (le lecteur intégré, votre site) | HLS | Testé dans Chrome ; Safari et Firefox lisent le même HLS |
| Navigateurs web, faible délai (l'interrupteur Low latency de la page de lecture, ou un lecteur WHEP) | WebRTC (WHEP) | Testé dans Chrome ; Safari et Firefox prennent en charge le même standard |
| Téléphones, tablettes et télévisions connectées | HLS | Devrait fonctionner (le même HLS) |
| Décodeurs IPTV, applications et panneaux IPTV | MPEG-TS en HTTP (`/ts/<nom>.ts`) ou HLS | Devrait fonctionner : le lien est testé avec FFmpeg comme lecteur |
| VLC | RTMP, SRT, HLS | Testé |
| OBS comme récepteur | SRT (Source média) | Testé |
| vMix comme récepteur | UDP | Utilisé par un client |
| Transcodeur PikoTV (le récepteur d'une chaîne de télévision) | SRT, Unda appelant : une sortie TV SD (720×576 H.264, AAC, 1,5 Mb/s à débit constant) | Utilisé par une chaîne de télévision |
| YouTube, Facebook | RTMP, RTMPS | Testé en production |
| Twitch et d'autres plateformes RTMP | RTMP | Devrait fonctionner |
| Lecteurs DASH | MPEG-DASH, une qualité ou l'échelle du débit adaptatif | Testé avec dash.js et Shaka Player dans Chrome, et avec VLC |
| Multiplexeurs, modulateurs, IRD et décodeurs DVB | MPEG-TS en UDP, RTP, SRT ou RIST : chaînes seules ou bouquets multi-chaînes, débit constant, noms de chaîne DVB et un guide des programmes sur 8 jours | Devrait fonctionner : la sortie est contrôlée par le moniteur TR 101 290 d'Unda lui-même et a été analysée avec TSDuck sans aucune erreur |
| Un autre serveur de diffusion | RTMP, SRT, UDP, RIST, MPEG-TS en HTTP | Testé avec Unda et VLC à l'autre bout (MPEG-TS en HTTP : un autre Unda qui le récupère) |

## Jusqu'où va un serveur {#how-far-one-server-goes}

Deux choses décident de ce que peut faire un serveur, et elles se dimensionnent séparément : sa **connexion réseau** décide du nombre de spectateurs qu'il peut servir, et son **processeur (ou sa carte graphique)** de la quantité de conversion qu'il peut faire. Une machine plus puissante ne sert pas plus de spectateurs sur la même connexion.

### Spectateurs : la bande passante en envoi {#viewers-the-upload-bandwidth}

Chaque spectateur reçoit sa propre copie du flux : l'envoi du serveur doit donc porter le débit du flux une fois par spectateur. C'est de l'arithmétique, la même sur n'importe quel serveur, aussi puissant soit-il. En gardant 20 % de marge :

| Envoi du serveur | Spectateurs à 3 Mb/s | Spectateurs à 5 Mb/s |
|---|---|---|
| 100 Mbit/s | environ 25 | environ 15 |
| 1 Gbit/s | environ 250 | environ 150 |
| 10 Gbit/s | environ 2 500 | environ 1 500 |

- Les destinations de rediffusion (YouTube, Facebook…) utilisent le même envoi : chacune coûte autant qu'un spectateur à son débit.
- Les flux entrants utilisent la réception, qui est en général séparée.
- Avec le débit adaptatif, les spectateurs sur des connexions lentes prennent une qualité plus petite : il en tient donc davantage.
- Réglez `limits.max_egress_mbps` pour que, quand la liaison montante est pleine, les nouveaux spectateurs soient refusés au lieu que tout le monde charge (voir [Surveillance](/fr/guide/monitoring)).

Servir des spectateurs demande peu de processeur : transmettre des flux, c'est copier, pas convertir. Un serveur modeste peut remplir une connexion à 1 Gbit/s.

### Convertir : le processeur ou la carte graphique {#converting-the-cpu-or-gpu}

Faire passer des flux (H.264 avec AAC en entrée, la même chose en sortie) ne coûte presque rien, quel que soit le nombre de flux. Le travail qui demande des cœurs :

| Travail | Besoin approximatif |
|---|---|
| Débit adaptatif d'un flux 1080p (6 qualités), sur le processeur | 1 à 2 cœurs et environ 1 Go de mémoire |
| Une chaîne HD MPEG-2 convertie en H.264 | 1 à 2 cœurs et environ 0,5 Go |
| Une chaîne 24h/24 en 720p | Environ 1 cœur |
| Séparer un bouquet multi-chaînes (sans conversion) | Une petite fraction d'un cœur |

Le chiffre bas vaut pour un processeur récent, le chiffre haut pour les processeurs de serveur plus anciens. Une carte graphique (NVIDIA, Intel ou AMD) retire la conversion au processeur : la page **Transcoding** détecte vos cartes et fait un encodage de test sur chacune avant de la proposer. Ce sont des points de départ : vérifiez le graphique du processeur sur la page Server avec votre charge réelle avant d'ajouter davantage.

### Limites intégrées {#built-in-limits}

| | Par serveur |
|---|---|
| Flux en direct | Fixé par votre licence |
| Entrées UDP | 32 |
| Entrées multi-chaînes et bouquets en sortie | 8 de chaque, jusqu'à 32 chaînes chacun |
| Destinations de rediffusion | 16 par flux, 64 au total |

### Délai {#delay}

- **RTMP et SRT :** environ 0,1 s à travers le serveur (mesuré pour le RTMP), plus les mémoires tampons propres à l'encodeur et au lecteur.
- **HLS :** environ 7 s avec une image clé toutes les 2 secondes ; beaucoup plus avec des intervalles d'images clés plus longs (29 s avec des images clés toutes les 8 s).
- **WebRTC :** environ 0,1 s à travers le serveur jusqu'à la page de lecture en mode faible délai (mesuré dans Chrome, encodeur, serveur et spectateur sur une même machine ; un vrai réseau ajoute son propre délai). L'image démarre environ une demi-seconde après l'ouverture de la page. Voir [WebRTC](/fr/guide/webrtc).

## Au-delà d'un serveur {#beyond-one-server}

- **Plus de spectateurs :** placez un CDN devant le HLS. Réglez `hls.disable_session_ids: true` pour que le CDN puisse mettre les segments en cache ; le nombre de spectateurs vient alors des statistiques du CDN. Les flux protégés par des liens signés demandent que le CDN vérifie ses propres liens, ou pas de mise en cache ([Avec un CDN](/fr/guide/protect-playback#with-a-cdn)).
- **Un serveur par installation :** Unda n'a ni grappe de serveurs, ni répartition de charge, ni bascule automatique entre serveurs. Les [entrées de chaîne](/fr/guide/channel-inputs) protègent contre la panne d'un encodeur ou d'une source, pas du serveur.
- **Pas encore disponible :** NDI, SDI/ASI, et les DRM (Widevine, FairPlay ; les [liens de lecture signés](/fr/guide/protect-playback) sont disponibles).

Si votre équipement est marqué « devrait fonctionner » ou n'est pas listé, dites-nous ce que c'est : nous le testerons avec vous avant que vous passiez en direct.
