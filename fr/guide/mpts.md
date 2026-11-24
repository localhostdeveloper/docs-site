---
title: "Flux de transport multi-chaînes (MPTS)"
description: "Séparez un flux de transport multi-chaînes (MPTS) en chaînes distinctes, ou regroupez vos flux dans un bouquet avec les noms de chaîne DVB et un guide des programmes."
---

# Multi-chaînes (MPTS)

Unda travaille avec les **flux de transport multi-chaînes** (MPTS) dans les deux sens : il peut recevoir un bouquet et le séparer en chaînes distinctes, et il peut regrouper vos flux dans un bouquet à envoyer.

## Recevoir un bouquet {#taking-a-bundle-in}

Un récepteur satellite, une tête de réseau IPTV ou un partenaire envoie souvent plusieurs chaînes de télévision dans un seul flux. Unda peut le séparer : chaque chaîne que vous choisissez devient un flux ordinaire, avec le lecteur dans le navigateur, le HLS, l'enregistrement, la rediffusion et tout le reste.

```yaml
mpts_inputs:
  - name: sat-bundle
    source: udp://239.1.1.1:5000          # multicast ; udp://:5000 pour recevoir en unicast, rtp:// pour le RTP
    interface: eth0
    programs:
      - program: 101                      # le numéro de la chaîne dans le bouquet
        stream: sports-hd                 # le nom qu'elle prend dans Unda
        audio_language: eng               # facultatif : quelle piste audio
      - program: 102
        stream: news-24
```

### En SRT ou en RIST {#over-srt-or-rist}

Un bouquet qui traverse Internet passe mieux en SRT ou en RIST qu'en UDP simple : les deux renvoient ce que le réseau perd.

```yaml
    source: srt://ird.example.com:9000?streamid=sat&passphrase=...   # Unda se connecte à l'émetteur
    source: srt://:9000?passphrase=...                                # ou attend que l'émetteur se connecte
    source: rist://@:5000                                             # RIST : Unda reçoit sur le port 5000 (?path2=@:5002 pour un second chemin)
    source: rist://@:5001?secret=...                                  # RIST Main Profile, chiffré avec la phrase secrète de l'émetteur
```

- **SRT :** avec un hôte, Unda se connecte à l'émetteur (un IRD ou un encodeur réglé en *écoute* SRT) et se reconnecte de lui-même si la liaison tombe. Avec seulement un port (`srt://:9000`), Unda attend que l'émetteur se connecte, un émetteur à la fois. `passphrase` active le chiffrement (l'émetteur doit utiliser la même) ; `latency` (millisecondes, 200 par défaut) doit être nettement supérieur à l'aller-retour.
- **RIST** (Simple Profile) : utilisez un port pair ; le port suivant porte le trafic de contrôle du RIST : ouvrez donc les deux dans le pare-feu. `buffer` (millisecondes, 1000 par défaut) est le temps pendant lequel les paquets perdus peuvent être récupérés, et doit correspondre à celui de l'émetteur. Testé avec le RIST de VLC (librist).
- **RIST Main Profile**, chiffré : ajoutez la phrase secrète de l'émetteur, `rist://@:5001?secret=...` (ou `profile=main` pour du Main Profile sans chiffrement). Tout arrive sur le seul port que vous donnez (n'importe lequel) : n'ouvrez que celui-là. Unda prend l'AES-128 ou l'AES-256 de l'émetteur ; voir [RIST chiffré](#encrypted-rist-main-profile).
- Une entrée RIST ajoutée dans le tableau de bord demande la phrase secrète de l'émetteur ou une liste d'émetteurs autorisés, comme une entrée UDP : le RIST, c'est de l'UDP, et sans l'une ou l'autre, quiconque peut joindre le port pourrait l'alimenter.

La ligne de l'entrée sur la page Broadcast indique si la liaison SRT est établie (et sinon pourquoi), et pour le RIST combien de paquets le réseau a perdus et ont été renvoyés. Quand arrivent des paquets qu'Unda ne peut pas lire (une autre phrase secrète, un émetteur en clair, un émetteur qui n'utilise pas le Main Profile), l'entrée affiche **can't read the sender** avec la raison, et l'alerte « ne reçoit rien » la nomme aussi. Les paquets illisibles qui ne viennent pas d'un émetteur ayant une autre phrase secrète (inventés, ou abîmés en route) apparaissent plutôt comme **unreadable packets**, en gris tant que le flux lui-même arrive : s'ils continuent d'arriver, listez votre émetteur sous **Allowed senders**.

**Dans le tableau de bord :** Broadcast → **MPTS inputs** → **New input**. Donnez-lui un nom et l'adresse sur laquelle il arrive. Dès que des paquets arrivent, chaque chaîne du bouquet est listée avec son nom, ses pistes et son débit : cliquez sur **Publish** sur celles que vous voulez, choisissez le nom du flux et la piste audio, et elles passent en direct. **Stop** retire une chaîne de l'antenne et garde vos choix. Les entrées créées là sont conservées quand le serveur redémarre. Quand le fournisseur ajoute une chaîne plus tard, elle est listée (ou, avec le bon réglage, ajoutée ou publiée d'elle-même).

**Edit**, sur une entrée, change d'où elle reçoit, son interface, ses émetteurs autorisés et ce qui arrive aux nouvelles chaînes ; les chaînes qu'elle publie restent telles quelles. Laissez l'adresse vide pour garder celle qui est en place (y compris une phrase secrète qu'elle contient). L'enregistrement fait recevoir l'entrée à nouveau : ses chaînes repartent donc avec les paquets suivants (quelques secondes hors antenne ; Unda demande d'abord pendant qu'elle reçoit). Si la nouvelle adresse ne peut pas s'ouvrir (le port est pris), l'entrée continue avec l'ancienne et dit pourquoi. Les entrées du fichier de configuration se modifient là.

**Vous ne savez pas ce que porte le bouquet ?** Réglez d'abord `discover_only: true` : Unda liste chaque chaîne avec son nom, son fournisseur et ses pistes (codec et langue) sans rien mettre en ligne. Les opérateurs peuvent voir la liste par l'API (`GET /api/v1/mpts/inputs/sat-bundle/programs`).

Ce qui est publié dépend des formats de la chaîne :

| La chaîne porte | Ce que fait Unda | Coût |
|---|---|---|
| Vidéo H.264, audio AAC | La sépare telle quelle | Presque rien |
| Vidéo H.264, audio MP2 ou AC-3 | Convertit l'audio en AAC | Très peu |
| Vidéo MPEG-2 ou HEVC | Listée, non publiée, tant que vous ne réglez pas `transcode_video: true` pour elle | Environ un cœur de processeur par chaîne HD |
| Vidéo VVC (H.266) ou MPEG-5 EVC | Nommée comme telle et listée, non publiée ; les réencoder demande un FFmpeg qui les décode (VVC à partir de FFmpeg 7 ; EVC seulement dans les versions avec libxevd) | Environ un cœur de processeur par chaîne HD |
| Une couche d'amélioration MPEG-5 LCEVC | Nommée, et laissée de côté : la chaîne publie sa vidéo de base. Un relais la transmet telle quelle | Rien |

Chaque chaîne garde une piste vidéo et une piste audio, ainsi que les sous-titres codés contenus dans la vidéo (les autres sous-titres et le télétexte ne sont pas transmis). Si une chaîne du bouquet s'arrête ou a des erreurs, les autres continuent.

## Envoyer un bouquet {#sending-a-bundle-out}

Regroupez plusieurs de vos flux dans **un seul flux de transport avec plusieurs chaînes de télévision**, pour un réseau IPTV, un multiplexeur ou un modulateur DVB, ou un partenaire qui prend un bouquet. Chaque flux devient une chaîne avec son propre nom et son propre numéro, et tout le bouquet part à débit constant.

### Le mettre en place {#set-it-up}

Dans le tableau de bord : **Broadcast → MPTS outputs → New bundle** (opérateurs). Donnez-lui un nom, une destination et un débit total, puis ajoutez les chaînes : pour chacune, sa source (une chaîne, une [chaîne 24h/24](/fr/guide/playout) à l'antenne ou non, ou tout autre flux en direct), son numéro et son nom de chaîne, et si elle part telle quelle ou convertie en définition standard. **Add channel** en ajoute une à un bouquet en marche. Les bouquets créés dans le tableau de bord sont conservés quand le serveur redémarre.

**Edit** modifie un bouquet en marche sans le recréer :

- **Sur la ligne d'une chaîne :** son flux, son nom, sa part, la façon dont elle est transportée (telle quelle, ou convertie), ses PID et ses repères publicitaires. Seule cette chaîne redémarre (quelques secondes hors antenne) ; les autres continuent, et ses paquets poursuivent les compteurs que suivent les récepteurs : la modification n'apparaît donc pas comme des erreurs de transport. Si les nouveaux réglages ne tiennent pas (plus que le total du bouquet, un PID déjà utilisé), elle continue avec les anciens et dit pourquoi. Le numéro de chaîne reste le même.
- **Sur le bouquet :** sa destination, le nom du fournisseur, le débit (constant ou variable, et le total) et ce que montre une chaîne hors ligne. Laissez la destination vide pour la garder, phrase secrète comprise. Le bouquet est reconstruit avec ses chaînes, ses PID, son guide et ses tables de réseau : chaque chaîne est donc hors antenne quelques secondes ; si les nouveaux réglages ne peuvent pas démarrer, il continue avec les anciens. Le guide et les tables de réseau ont leurs propres commandes et changent sans redémarrage.

Les bouquets du fichier de configuration se modifient là.

[![Broadcast → MPTS outputs : un bouquet de trois chaînes en cours d'envoi, avec ses PID et un contrôle TR 101 290 propre](/screens/mpts.webp)](/screens/mpts.webp)

Ou dans le fichier de configuration :

```yaml
mpts_outputs:
  - name: iptv-bundle-1
    destination: udp://239.2.2.1:6000     # ou rtp://... (?fec=2d ajoute le FEC SMPTE 2022-1), srt://hôte:port?streamid=..., srt://:9000?passphrase=... (le récepteur se connecte), rist://hôte:5000
    interface: eth0                       # pour le multicast : la carte réseau d'envoi
    ttl: 4
    provider: "Unda Community TV"
    total_bitrate: 25Mbps                 # tout le bouquet, complété jusqu'à ce débit
    offline: slate                        # ce que montre une chaîne hors ligne : black (par défaut), slate ou none
    slate_image: /etc/unda/slate.png      # votre image « nous revenons tout de suite »
    # epg: now_next                       # le guide des programmes : schedule (par défaut : en cours/suivant + 8 jours), now_next ou off
    programs:
      - stream: channel-1
        program: 1
        name: "Channel 1"
        bitrate: 6Mbps                    # envoyée telle quelle : la part de cette chaîne
        # epg: false                      # laisser cette chaîne hors du guide du bouquet
      - stream: sports-hd
        program: 2
        name: "Sports HD"
        encode: { format: 1080i25, audio_codec: ac3 }  # convertie en HD 1080i H.264 avec de l'AC-3
      - stream: community
        program: 3
        name: "Community TV"
        bitrate: 1300kbps                 # convertie en SD H.264 + AAC 128 : la vidéo remplit la part
        encode: { format: 576p25 }
```

Chaque chaîne est soit **envoyée telle quelle** (donnez-lui un `bitrate` un peu au-dessus de ce qu'utilise le flux à son plus chargé), soit **convertie** pour le matériel TV avec `encode` : SD 576p25 / 576i25 ou HD 720p25 / 720p50 / 1080i25 / 1080p25 / 1080p50, vidéo H.264, HEVC ou MPEG-2, audio AAC, MP2 ou AC-3 (avec ou sans images B : `no_b_frames`), avec les mêmes réglages qu'une [sortie TV](/fr/guide/restreaming#broadcast-tv-terrestrial-and-satellite). Le `bitrate` d'une chaîne convertie est toute sa part du bouquet, et sa vidéo s'y ajuste : une chaîne SD H.264 avec une part de 1300 kb/s reçoit 1040 kb/s de vidéo et de l'AAC à 128 kb/s. Sur un serveur dont le FFmpeg est en version 4 (celui d'Ubuntu 22.04), elle reçoit 1000 kb/s, parce que ce FFmpeg laisse moins de temps entre l'arrivée d'une image et son heure de décodage ; FFmpeg 6.1 et plus récent (Ubuntu 24.04 et l'image Docker) en laisse davantage. Sans part, le H.264 SD prend 1300 kb/s (un débit courant pour les chaînes SD) ; réglez `video_kbps` dans `encode` pour choisir vous-même le débit vidéo. Le tableau du bouquet montre les débits vidéo et audio de chaque chaîne. Les numéros de chaîne, les PID et les noms peuvent être réglés pour correspondre au plan convenu avec le côté réception ; tout ce qui n'est pas réglé est choisi pour vous, sans conflit.

**Les PID.** Laissés vides, chaque chaîne reçoit les suivants libres : la PMT à partir de 4096, puis l'image et le son à partir de 256 (chaîne 1 : 256 et 257, chaîne 2 : 258 et 259, et ainsi de suite), affichés sur la ligne de chaque chaîne. Ne les réglez que quand du matériel plus loin est configuré par numéro de PID (un multiplexeur, un embrouilleur, un IRD avec des filtres de PID) : dans le tableau de bord, ouvrez **PIDs** sous la ligne de la chaîne (en décimal, ou en hexadécimal comme `0x101`) ; dans le fichier de configuration, `pmt_pid:` et `pids: { video: 0x101, audio: [0x102] }`. Une chaîne garde les PID qu'elle a reçus, automatiques compris, quand des chaînes sont ajoutées ou retirées et quand le serveur redémarre.

### Débit constant ou variable {#constant-or-variable-bitrate}

Par défaut, un bouquet est à **débit constant** : complété jusqu'à son total par des paquets nuls, ce qu'exigent les multiplexeurs et modulateurs DVB et beaucoup d'IRD. Pour un réseau IP qui n'a pas besoin d'un débit constant, réglez `total_bitrate: vbr` (ou choisissez *Variable* dans le tableau de bord) : le bouquet n'envoie alors que ce que portent ses chaînes, sans bourrage, et n'a pas de total à dépasser. La page Broadcast montre ce qu'il envoie en ce moment.

### Repères publicitaires (SCTE 35) {#ad-cues-scte-35}

Une chaîne peut annoncer les coupures publicitaires de son flux à un insérateur publicitaire en aval : cochez sa case dans la colonne **Cues** du bouquet, ou **Send ad cues** sous ses PID quand vous l'ajoutez. Voir [Coupures publicitaires](/fr/guide/restreaming#ad-breaks-scte-35).

### Guide des programmes (EPG) {#programme-guide-epg}

Une chaîne dont le flux est une [chaîne 24h/24](/fr/guide/playout) porte son guide des programmes, tiré de la playlist de la chaîne : le titre de chaque élément (ou son nom de fichier quand il n'en a pas) et, si vous en avez écrit une, sa description. Les télévisions et les décodeurs montrent deux choses :

- **Le programme en cours et le suivant :** le programme à l'antenne, son heure de début et sa durée, et ce qui vient ensuite. Une prise d'antenne en direct apparaît comme « Live » ; pendant que la chaîne passe son remplissage, « en cours » est vide.
- **Le guide sur 8 jours :** chaque programme à partir de minuit (UTC) aujourd'hui, sur 8 jours, dans la grille du guide de la télévision. Une prise d'antenne en direct n'y figure pas : elle ne peut pas être connue à l'avance.

Les deux suivent la playlist d'eux-mêmes : enregistrez-la et le guide change en quelques secondes. Ils sont envoyés en EIT DVB sur le PID 0x12 (en cours et suivant chaque seconde, les 8 jours toutes les 10 secondes), et la SDT indique que ces services en ont.

Une **chaîne en direct** (alimentée par un encodeur) porte de la même façon le guide saisi dans son onglet **EPG** ([comment](/fr/guide/playout#live-channels-a-typed-in-guide)), y compris son titre « entre les programmes ». Les autres chaînes ne portent pas de guide.

**Choisissez pour chaque bouquet** ce qu'il envoie : *en cours et suivant + 8 jours* (par défaut), *en cours et suivant seulement*, ou *rien*. Dans le tableau de bord, c'est le menu **Guide** de chaque bouquet (Broadcast → MPTS outputs), modifiable pendant que le bouquet est à l'antenne ; dans le fichier de configuration, `epg: schedule | now_next | off`. Désactivez-le quand du matériel plus loin dans la chaîne insère sa propre EIT, pour que les deux n'entrent pas en conflit. Une chaîne peut aussi être laissée de côté seule (sa case **guide**, ou `epg: false` sur la chaîne).

**Le guide sur 8 jours prend de la bande passante :** environ 7 kb/s par chaîne avec les titres seuls, jusqu'à environ 80 kb/s avec de longues descriptions. Il n'est envoyé que dans le bourrage du bouquet, jamais avant la vidéo des chaînes : il ne peut donc pas les perturber ; le bouquet indique ce qu'il prend (« guide N kb/s »). Si un bouquet à débit constant a trop peu de bourrage, une mention « guide short of room » le signale : augmentez le total, ou choisissez en cours et suivant seulement.

**Une seule chaîne vers un modulateur ?** Créez un bouquet avec cette seule chaîne : c'est la même sortie, avec le guide.

Les guides des programmes pour les applications IPTV (XMLTV) sont décrits dans la page [Chaînes 24h/24](/fr/guide/playout#programme-guide).

### Tables de réseau et d'heure {#network-and-time-tables}

Chaque bouquet envoie aussi les deux tables DVB dont les récepteurs se servent pour lister les chaînes et régler leur horloge :

- **NIT** (informations de réseau) : le nom du réseau et les chaînes du bouquet avec leur type. Les télévisions et les décodeurs y lisent la liste des chaînes quand ils font une recherche.
- **TDT et TOT** (heure) : l'heure UTC toutes les 5 secondes et, quand vous réglez un fuseau horaire et un pays, l'heure locale avec son prochain changement d'heure d'été, pour que les récepteurs affichent la bonne heure.

Elles sont actives par défaut. Réglez-les sous **Network and time tables** quand vous créez un bouquet, ou avec **DVB tables** sur un bouquet qui envoie déjà (les modifications s'appliquent aussitôt) :

| Réglage | Ce qu'il fait |
|---|---|
| Network name | Le nom que les récepteurs affichent pour le réseau ; vide, c'est celui du fournisseur |
| Local time | Un fuseau horaire, pour l'heure locale et ses changements d'heure d'été ; « UTC only » laisse l'heure locale de côté |
| Country | Le code du pays à trois lettres (par exemple FRA) ; nécessaire avec un fuseau horaire |
| Send network and time tables | Décochez-le quand du matériel plus loin dans la chaîne insère les siennes |

Dans le fichier de configuration :

```yaml
mpts_outputs:
  - name: iptv-bundle-1
    # ...
    network_name: "Example Network"
    time_zone: Europe/Paris
    country: FRA
    # network_tables: false     # laisser la NIT et la TDT/TOT à un autre matériel
```

Chaque chaîne est annoncée avec le type qu'appelle son image : H.264 SD ou HD, HEVC ou MPEG-2 pour les chaînes converties, et H.264 SD ou HD pour les chaînes envoyées telles quelles (lu dans le flux lui-même). Les récepteurs s'en servent pour étiqueter la chaîne et choisir leur décodeur.

### Envoyer en RIST {#sending-over-rist}

`rist://hôte:port` envoie le bouquet en RIST Simple Profile : le récepteur demande ce que le réseau a perdu et Unda le renvoie, à partir de la dernière seconde (`?buffer=` en millisecondes pour le changer ; utilisez la valeur du récepteur). Utilisez un port pair ; le suivant porte le trafic de contrôle. Cela fonctionne aussi pour les flux seuls (destinations de rediffusion) et les sorties TV. Comme pour l'UDP, seuls les opérateurs peuvent ajouter des destinations RIST.

### RIST chiffré (Main Profile) {#encrypted-rist-main-profile}

Ajoutez une phrase secrète pour envoyer en RIST Main Profile, chiffré :

```
rist://receiver.example.net:5000?secret=une-longue-phrase-secrete&aes-type=256
```

- `secret` est la phrase secrète, de 8 à 128 caractères ; le récepteur a besoin de la même. Prenez-en une longue (16 caractères ou plus) : quelqu'un qui enregistre le flux pourrait essayer des phrases secrètes dessus à loisir.
- `aes-type` vaut `128` (par défaut) ou `256`, et doit correspondre au réglage du récepteur.
- `profile=main` sans secret envoie du Main Profile en clair.
- Le Main Profile utilise un seul port dans chaque sens (n'importe lequel, impair aussi) et porte le trafic de contrôle à l'intérieur : un pare-feu n'a besoin que de ce port ouvert.
- `buffer`, `path2` (deux chemins) et `cname` (le nom que voit le récepteur) fonctionnent comme en Simple Profile.

La phrase secrète n'apparaît jamais dans le tableau de bord, les réponses de l'API ou les journaux (`secret=***`). Elle garde le flux privé en route ; comme celle du SRT, elle ne prouve pas qui a envoyé un paquet : gardez donc la liste **Allow** des entrées qui reçoivent limitée à vos émetteurs. Unda prend en charge la forme du chiffrement par phrase secrète ; la connexion par nom d'utilisateur et mot de passe du RIST (SRP) et la suppression des paquets nuls ne sont pas prises en charge : désactivez-les à l'autre bout.

Testé avec `ristsender` et `ristreceiver` de librist 0.2.20 (`--profile 1`, AES-128 et AES-256), dans les deux sens, à travers 5 % de pertes.

### Laisser le récepteur se connecter (écoute SRT) {#letting-the-receiver-connect-srt-listener}

Certains téléports et certaines chaînes vont chercher la chaîne : leur récepteur est un *appelant* SRT et se connecte à vous. Donnez alors à la destination du bouquet une adresse sans hôte, et Unda attend sur ce port :

```
srt://:9000?passphrase=une-longue-phrase-secrete
```

- Donnez au côté réception l'adresse de ce serveur, le port et la phrase secrète. Ouvrez le port UDP dans le pare-feu du serveur.
- Une écoute demande une **phrase secrète** (10 à 79 caractères) ou les **adresses** des récepteurs : `allow=203.0.113.7,198.51.100.0/24` n'accepte que celles-ci. Utilisez les deux quand vous le pouvez. Sans aucune des deux, quiconque trouverait le port pourrait prendre la chaîne : Unda refuse donc l'adresse.
- `streamid=…` n'accepte que les récepteurs qui demandent cet identifiant de flux ; `latency=` (millisecondes) est comme pour l'envoi.
- Jusqu'à 8 récepteurs en même temps (un récepteur principal et un de secours, par exemple), chacun recevant tout le flux. Un récepteur qui ne suit pas est lâché ; son matériel se reconnecte.
- L'encodeur continue de tourner quand personne n'est connecté : un récepteur reçoit le flux dès qu'il se connecte. La ligne indique qui est connecté, ou qu'elle attend, et montre un récepteur refusé avec la raison (mauvaise phrase secrète, adresse non autorisée).
- Choisissez un port qu'aucune autre partie du serveur n'utilise : ni le port SRT du serveur lui-même, ni celui d'une entrée ou d'une autre sortie.

Testé avec TSDuck 3.45 (libsrt 1.5.7) comme récepteur : le bouquet est arrivé à son débit constant, sans erreur de continuité.

Des chaînes peuvent être ajoutées et retirées pendant qu'un bouquet tourne (dans le tableau de bord ou par l'API, `/api/v1/mpts`) ; les récepteurs prennent en compte le changement d'eux-mêmes. Réglez le débit total avec de la marge si vous prévoyez d'ajouter des chaînes plus tard : il est fixe, et une chaîne qui ne tient pas est refusée (un bouquet à débit variable n'a pas cette limite).

### Comment il se comporte {#how-it-behaves}

- Si un flux passe hors ligne, les autres continuent et sa chaîne reste listée, en affichant du noir avec du silence, ou votre image de mire avec `offline: slate`. Les récepteurs gardent la chaîne au lieu de signaler « pas de signal ». Quand le flux revient, il reprend de lui-même la main en une ou deux secondes. Avec `offline: none`, la chaîne est listée mais ne porte rien.
- Les noms de chaîne et le fournisseur apparaissent dans les listes de chaînes des récepteurs, et les chaînes de diffusion montrent le programme en cours et le suivant.
- Si les chaînes ont besoin de plus que le débit total, le serveur refuse la configuration ou, si un flux dépasse sa part en cours de route, écrit une erreur dans le journal plutôt que d'abandonner des données en silence.
- Une chaîne envoyée telle quelle doit rester dans sa part. Quand son flux envoie davantage (le débit d'un encodeur relevé, ou des images chargées au-dessus du débit réglé), les images commencent à arriver aux télévisions après le moment où il les fallait : les spectateurs voient des arrêts sur image ou une image cassée, quelques secondes avant que des données ne soient abandonnées. Le serveur vérifie le moment de chaque image à son départ et lève aussitôt une alerte critique, avec ce qu'envoie le flux par rapport à sa part. Un avertissement vient plus tôt, quand les images arrivent avec moins de 100 ms d'avance (normalement environ 700 ms). Augmentez la part de la chaîne, ou convertissez-la avec `encode`.
- Une chaîne envoyée telle quelle passe à l'antenne telle que l'a faite l'encodeur du client. Le serveur prévient quand le flux n'a pas la forme de la télévision DVB : une fréquence d'images autre que 25 ou 50, un son qui n'est pas à 48 kHz, une image en portrait ou plus grande que la HD, ou un profil ou un niveau H.264 que les décodeurs TV ne décodent pas (au-dessus du niveau 4.0). Convertir la chaîne, ou changer les réglages de l'encodeur, le corrige.
- Chaque chaîne fait tourner son propre processus d'encodage ; envoyer telle quelle coûte très peu de processeur, convertir coûte environ un tiers de cœur par chaîne.

La page **Broadcast** liste chaque bouquet avec ses chaînes : quel flux alimente chacune (et, pour les chaînes envoyées telles quelles, ce qu'envoie le flux), si elle est à l'antenne (ou affiche du noir ou la mire), avec quelle avance arrivent ses images, et toute image en retard ou tout paquet abandonné. Chaque paquet envoyé est aussi contrôlé comme le fait le matériel de test broadcast : voir [Contrôles des flux de transport](#transport-stream-checks-tr-101-290) plus bas. Une chaîne dont le flux passe hors ligne lève un avertissement (et une entrée dans le journal des événements) ; les images en retard, les paquets abandonnés et un bouquet qui ne peut pas être envoyé lèvent des alertes critiques, et les erreurs de flux de transport, les images avec peu d'avance et les flux qui n'ont pas la forme du DVB lèvent un avertissement.

### Contrôles des flux de transport (TR 101 290) {#transport-stream-checks-tr-101-290}

Unda contrôle chaque paquet de chaque bouquet qu'il envoie et de chaque bouquet qu'il reçoit, comme le fait le matériel de test broadcast (ETSI TR 101 290) :

- **Priorité 1**, nécessaire pour décoder le flux tout court : la synchronisation, la PAT et les PMT, la continuité (paquets perdus ou répétés) et les flux manquants.
- **Priorité 2**, nécessaire pour une image et un son stables : les paquets que l'émetteur a marqués comme abîmés, les CRC des tables, l'horloge PCR (intervalle, sauts, précision), les horodatages (PTS) et la table d'accès conditionnel.
- **Priorité 3**, les informations de service DVB que lisent les télévisions : la table de réseau (NIT), les noms de chaîne (SDT), le programme en cours et le suivant (EIT), l'heure (TDT), la fréquence de répétition de chaque table, et les paquets sur des PID qu'aucune table ne nomme.

Chaque bouquet affiche **TR 101 290 clean**, ou les erreurs comptées dans la dernière minute ; un bouquet qu'Unda reçoit montre ce qu'elles signifient pour les spectateurs (voir [plus bas](#plays-fine-or-viewers-may-see-glitches)). Cliquez dessus pour le rapport, mis à jour toutes les 3 secondes tant qu'il est ouvert. Il commence par une phrase sur ce que les erreurs signifient pour les spectateurs, puis ce qu'il faut faire ; les remarques pour l'ingénieur de l'émetteur et le rapport complet sont repliés en dessous (le rapport complet reste ouvert une fois que vous l'avez ouvert) :

- **La cause probable et que faire :** Unda déduit la cause la plus probable des erreurs de ce qu'il sait du flux (des paquets perdus en route et combien, sa propre file qui déborde, l'encodeur d'une sortie TV qui prend du retard, un processeur chargé, la façon dont le flux arrive) et dit ce qu'il faut faire. Par exemple, des erreurs de continuité sur un flux UDP désignent des paquets perdus sur le réseau, et des erreurs d'intervalle de PCR qu'aucune perte n'explique désignent le réglage du PCR de l'encodeur. L'alerte des erreurs nomme aussi la cause probable ;
- chaque contrôle, avec son nombre sur la dernière minute et depuis le démarrage du bouquet (le « i » à côté de chacun dit ce qu'il signifie et quoi regarder) ;
- les dernières erreurs, avec l'heure, le PID, la chaîne et ce qui n'allait pas exactement (par exemple « counter 7 after 5 » ou « 52 ms apart ») ;
- chaque PID : ce qu'il porte, son débit, ses erreurs de continuité, son intervalle de PCR (le plus court, moyen, le plus long) et le plus long écart entre ses horodatages ;
- chaque table : combien d'exemplaires sont arrivés et le plus court et le plus long intervalle entre eux ;
- ce que disent les tables : le nom du réseau et ses chaînes, le nom, le fournisseur et le type de chaque chaîne, et l'heure que porte le flux comparée à l'horloge du serveur.

Un bouquet qu'envoie Unda doit porter chaque table dès le départ (la NIT et la TDT seulement quand ses tables de réseau et d'heure sont actives), et chaque erreur sur lui lève un avertissement : les télévisions et les récepteurs le prennent tel qu'il est. Un bouquet qu'Unda reçoit n'est tenu à une table qu'une fois qu'il l'a portée, parce que beaucoup de flux satellite et IPTV ne portent ni table de réseau ni table d'heure. Les nombres sont aussi dans `/metrics` (`unda_mpts_tr101290_errors_total`, `unda_mpts_input_tr101290_errors_total` et les mêmes par chaîne).

#### Plays fine, ou viewers may see glitches {#plays-fine-or-viewers-may-see-glitches}

Unda ne transmet pas un flux qu'il reçoit tel qu'il arrive. Il en extrait les images et le son, et construit une nouvelle horloge, de nouveaux horodatages et de nouvelles tables pour tout ce qu'il envoie (HLS, RTMP, ses propres sorties MPEG-TS, sorties TV et bouquets). Sur un flux qu'Unda reçoit, seules certaines erreurs peuvent donc atteindre vos spectateurs :

| Peut atteindre les spectateurs | Ne peut pas atteindre les spectateurs |
| --- | --- |
| Paquets perdus (continuité), paquets abîmés (erreur de transport), perte de synchronisation, un flux d'image ou de son manquant (PID manquant), un blocage (PTS), des paquets embrouillés (CAT) | L'horloge de l'émetteur (intervalle, saut et précision du PCR), ses tables (moment de la PAT/PMT, CRC, répétition des SI, NIT, SDT, EIT, TDT) et les PID non référencés |

Un flux dont toutes les erreurs sont dans la seconde colonne affiche **Plays fine** et ne lève aucune alerte : le rapport les liste comme des remarques pour l'ingénieur de l'émetteur, puisqu'elles comptent pour le matériel qui prend directement le même flux. Les erreurs de la première colonne affichent **Viewers may see glitches**, lèvent un avertissement et passent en premier dans le rapport, avec ce qu'il faut faire. Une PAT ou une PMT en retard signifie seulement qu'une chaîne met un peu plus de temps à démarrer après une coupure.

Le même contrôle tourne sur les entrées UDP et RTP d'une seule chaîne et sur les flux publiés en SRT (comme entrées : seules les erreurs que les spectateurs peuvent remarquer lèvent une alerte), et sur les sorties TV et les destinations UDP, RTP, RIST et SRT (comme sorties) : voir [UDP / MPEG-TS](/fr/guide/udp), [SRT](/fr/guide/srt) et [Rediffusion](/fr/guide/restreaming). Pour contrôler pendant un moment n'importe quel autre flux, sans le recevoir comme entrée, utilisez l'[analyseur de flux](/fr/guide/analyser).

### Le vérifier vous-même {#checking-it-yourself}

Pour vérifier un bouquet indépendamment du serveur, capturez-le avec [TSDuck](https://tsduck.io) là où il arrive et analysez le fichier. Un bouquet de test (une chaîne en direct, une chaîne hors ligne affichant du noir, et une chaîne de diffusion avec le programme en cours et le suivant) a passé ces contrôles sans aucune erreur pendant 12 minutes.

```bash
tsp -I ip 5000 -P until --seconds 600 -O file cap.ts      # en multicast : -I ip 239.2.2.1:5000
tsp -I file cap.ts -P continuity -P pcrverify --bitrate 8000000 --absolute --jitter-max 13 -O drop
tsanalyze cap.ts                                           # chaînes, PID, débits, discontinuités
tstables cap.ts --pid 0x12 --diversified-payload           # en cours et suivant, une entrée par changement
```

`--bitrate` est le débit total du bouquet en b/s (bouquets à débit constant seulement). Attendez-vous à aucune ligne `continuity:` et à « 0 with jitter » de la part de `pcrverify`.

Les bouquets multi-chaînes sont testés avec des récepteurs logiciels (VLC, ffmpeg) et TSDuck.
