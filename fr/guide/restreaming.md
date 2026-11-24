---
title: "Rediffuser vers YouTube, Facebook et Twitch"
description: "Rediffusez un direct vers YouTube, Facebook, Twitch et d'autres serveurs en même temps, en RTMP, RTMPS, SRT, UDP ou RTP, y compris des sorties TV."
---

# Rediffusion

Envoyez un flux en direct vers d'autres plateformes en même temps : YouTube, Facebook, Twitch, un autre serveur Unda, tout ce qui accepte le RTMP, le RTMPS, le SRT, l'UDP ou le RTP.

## Depuis le tableau de bord {#from-the-dashboard}

Ouvrez le flux, onglet **Restream**. Les destinations sont réparties en deux listes : **Platforms and servers** reçoivent le flux tel qu'il arrive, et les **TV outputs** sont réencodées pour la diffusion TV. Une ligne au-dessus compte ce qui envoie, ce qui échoue et ce qui est désactivé, et combien de récepteurs sont connectés.

Deux boutons en ajoutent une :

- **Platform or server** ouvre une boîte en haut de la liste des plateformes : un nom, puis le **lien du serveur** et la **clé de diffusion**, tels que les affiche votre service. **Add and start sending** l'ajoute.

  | Service | Lien du serveur | Clé de diffusion |
  |---|---|---|
  | YouTube | `rtmp://a.rtmp.youtube.com/live2` | depuis YouTube Studio |
  | Facebook | `rtmps://live-api-s.facebook.com:443/rtmp` | depuis Live Producer |
  | Twitch | `rtmp://live.twitch.tv/app` | depuis le tableau de bord du créateur |
  | Un autre serveur en SRT | `srt://hôte:port?passphrase=...` | son identifiant de flux, s'il en utilise un |
  | Un réseau local en UDP (opérateurs) | `udp://239.1.1.10:5000` | aucune |
  | MPEG-TS en RTP (opérateurs) | `rtp://192.168.1.50:5004` | aucune |

  Utilisez exactement ce que vous donne votre service : Unda ne remplit rien, donc n'importe quel service fonctionne. En RTMP, la clé se place après le lien ; en SRT, elle devient le `streamid` ; un lien qui contient déjà tout ne prend pas de clé. Les services connus (YouTube, Facebook, Instagram, Twitch, TikTok, X, Vimeo, Dailymotion, Telegram et Rumble) sont reconnus à leur serveur et affichent leur logo ; les autres serveurs affichent leur protocole.
- **New TV output** (opérateurs) ouvre une page à part : voir [Télévision](#broadcast-tv-terrestrial-and-satellite) plus bas.

Chaque ligne a un interrupteur (désactivé, il arrête l'envoi mais garde la destination et sa clé). Le menu **⋯** d'une plateforme contient **Edit** et **Remove** : **Edit** ouvre la même boîte sous sa ligne, remplie, et **Remove** demande confirmation sous la ligne avant de supprimer quoi que ce soit. Pour une destination RTMP, le lien du serveur est affiché mais pas la clé : laissez la clé vide pour la garder, ou saisissez la nouvelle (une destination dont la clé a été refusée affiche **Change key** sous sa ligne, avec la raison). Pour les autres adresses, laissez le lien vide pour garder celui qui est enregistré. Enregistrer une destination qui envoie la reconnecte (le bouton dit **Save and reconnect**) : son côté réception perd alors le flux quelques secondes ; une destination désactivée reste désactivée. La ligne d'une sortie TV ouvre sa page : cliquez sur la ligne ou sur **Open**. Les destinations listées dans `unda.yaml` se modifient dans le fichier.

[![L'onglet Restream d'un flux : YouTube qui envoie, Facebook qui a refusé sa clé avec Change key à côté de la raison, un serveur SRT désactivé, et trois sorties TV, dont une récupérée par deux récepteurs](/screens/restream.webp)](/screens/restream.webp)

## Comment elle se comporte {#how-it-behaves}

- Elle démarre tout de suite et continue tant que le flux est en direct. Si le flux s'arrête, la destination attend et reprend d'elle-même quand le flux revient.
- Une destination n'affiche **live** qu'une fois que la plateforme a accepté le flux (en RTMP, sa réponse `NetStream.Publish.Start`), pas seulement quand la connexion s'ouvre : une clé erronée ou expirée apparaît comme un échec, jamais comme en direct.
- Une destination qui échoue est réessayée après 5 s, 10 s, 30 s, 1 min, 2 min, puis toutes les 5 minutes. Une destination en échec n'affecte jamais les autres ni vos spectateurs.
- **Une destination qui échoue sans arrêt pendant 30 minutes est désactivée** (un événement en direct terminé, une clé révoquée), affichée comme « switched off » avec la raison, et reste désactivée (même après un redémarrage) jusqu'à ce que vous la réactiviez.
- L'état de chaque destination et la raison de ses échecs sont affichés dans l'onglet Restream en termes simples (« The destination refused the stream key… »), avec l'erreur technique derrière « Technical detail ». Une destination en échec depuis plus de deux minutes lève une alerte par flux, quel que soit le nombre de destinations en échec et la fréquence de leurs nouvelles tentatives ; le journal des événements affiche une ligne par série d'échecs.
- **Un récepteur SRT n'accepte en général qu'un appelant à la fois.** Si une destination SRT dit sans cesse que le récepteur n'a pas répondu alors que quelque chose d'autre appelle la même adresse (une analyse de cette adresse dans **Broadcast → Analyse**, un autre serveur, une connexion précédente), arrêtez cela, puis désactivez et réactivez la destination pour réessayer tout de suite. Le bouton **Logs** de la chaîne télécharge chaque ligne qui concerne cette adresse ([Journaux](/fr/guide/monitoring#logs)).
- **Mettez en pause plutôt que de supprimer.** L'interrupteur à côté de chaque destination arrête l'envoi sans la supprimer : la même destination (et sa clé) peut être réactivée plus tard, pour l'événement suivant, sans retaper la clé. L'activer démarre l'envoi aussitôt si le flux est en direct. Une destination en pause reste en pause après un redémarrage et ne lève aucune mention « not connected ».
- **Les destinations MPEG-TS sont contrôlées à l'envoi.** Chaque paquet envoyé à une destination UDP, RTP, RIST ou SRT, ou à une sortie TV, est contrôlé selon [TR 101 290](/fr/guide/mpts#transport-stream-checks-tr-101-290) (les sorties TV sur les trois priorités, tables de réseau et d'heure comprises). Pendant l'envoi, la ligne de la destination affiche **TR 101 290 clean** ou les erreurs de la dernière minute ; cliquez dessus pour le rapport complet. Une erreur lève un avertissement.
- **Vos clés de plateforme restent secrètes :** une fois la destination ajoutée, le tableau de bord, l'API et les journaux ne l'affichent plus que sous la forme `rtmp://a.rtmp.youtube.com/live2/****`.
- **Les destinations sont conservées d'un redémarrage à l'autre.** Les destinations ajoutées dans le tableau de bord ou par l'API sont enregistrées dans la base de données du serveur (lisible seulement par le compte du serveur, comme les clés des chaînes) et reviennent d'elles-mêmes après un redémarrage ou une mise à jour, en recommençant à envoyer dès que le flux est en direct.
- Les destinations peuvent aussi être listées dans le fichier de configuration sous `restream.targets` (l'URL peut venir d'une variable d'environnement ou d'un fichier, pour garder la clé hors de la configuration). Elles sont marquées « from unda.yaml » dans l'onglet Restream : pour les modifier, modifiez le fichier.

Les diffuseurs peuvent rediffuser leurs propres chaînes ; les opérateurs et au-dessus, n'importe quel flux.

Les destinations UDP, RTP, RIST et SRT et les sorties TV sont des sorties TV : elles demandent l'outil `udp` dans votre [licence](/fr/guide/license), en plus de la rediffusion (le SRT est ce que reçoivent les chaînes de télévision). La rediffusion vers les réseaux sociaux en RTMP et en RTMPS ne demande que la rediffusion. L'*entrée* et la lecture SRT sont à part (l'outil `srt`). Les destinations d'un diffuseur doivent être en RTMP, RTMPS ou SRT, à une adresse publique d'Internet : une adresse privée, locale ou de bouclage, ou un nom qui pointe vers l'une d'elles, est refusée, tout comme l'UDP et le RTP. Les opérateurs et au-dessus peuvent utiliser n'importe quelle destination, y compris sur votre propre réseau. Le RTP porte du MPEG-TS en paquets RFC 2250, utilise le PCR pour son horodatage à 90 kHz, et n'a ni chiffrement ni authentification : utilisez-le seulement sur un réseau de confiance.

### Correction d'erreurs pour le RTP (SMPTE 2022-1) {#error-correction-for-rtp-smpte-2022-1}

Le matériel broadcast alimenté en IP (modulateurs, IRD, passerelles de téléport) attend souvent du **FEC SMPTE 2022-1** avec le RTP : des paquets supplémentaires à partir desquels le récepteur reconstruit les paquets perdus, sans demander de renvoi. Ajoutez-le à une adresse `rtp://` :

```
rtp://10.0.0.20:5000?fec=1d                     FEC par colonnes (sur le port 5002)
rtp://10.0.0.20:5000?fec=2d                     FEC par colonnes et par lignes (ports 5002 et 5004)
rtp://239.1.1.20:5000?fec=2d&fec_l=5&fec_d=20   la matrice de votre récepteur
```

Les paquets du média sont rangés dans une matrice de `fec_l` colonnes sur `fec_d` lignes (10 × 10 par défaut). Le paquet FEC de chaque colonne reconstruit un paquet perdu dans cette colonne : le FEC par colonnes répare donc une rafale de jusqu'à `fec_l` paquets perdus d'affilée ; `2d` ajoute un paquet FEC par ligne et répare des pertes plus dispersées. Le FEC par colonnes ajoute 1/`fec_d` au débit (10 % par défaut), le FEC par lignes encore 1/`fec_l`. Limites : `fec_l` de 1 à 20 (de 4 à 20 avec `2d`), `fec_d` de 4 à 20, et `fec_l` × `fec_d` au plus 100. Utilisez les valeurs de la documentation de votre récepteur ou de la fiche technique de l'opérateur ; les ports FEC (+2 et +4) doivent être ouverts sur le chemin. Un récepteur sans FEC les ignore et lit le flux normalement. Sur Internet, préférez SRT ou RIST, qui renvoient ce qui a été perdu (le RIST peut aussi être chiffré : [RIST chiffré](/fr/guide/mpts#encrypted-rist-main-profile)).

### Deux chemins (SMPTE 2022-7) {#two-paths-smpte-2022-7}

Pour envoyer sur deux réseaux à la fois, afin que le récepteur puisse prendre chaque paquet sur le chemin qui l'a apporté, ajoutez une seconde destination avec `path2` (et `iface2` pour son interface multicast) :

```
rtp://239.1.1.20:5000?path2=239.2.1.20:5000&iface2=eth2
rist://gateway-a.example.net:5000?path2=gateway-b.example.net:5000
```

Chaque paquet part par les deux chemins, octet pour octet (en RTP, son FEC aussi) : un récepteur qui fusionne deux chemins (SMPTE 2022-7, ou un récepteur RIST à deux entrées) ne perd rien tant que l'un des chemins fonctionne. La panne d'un chemin n'arrête pas la sortie : la ligne de la destination affiche **2 paths** et nomme un chemin dont les envois échouent ; en RIST, un chemin dont le récepteur cesse de faire ses comptes rendus. Les sorties SRT ne prennent pas de second chemin.

## Télévision (hertzienne et satellite) {#broadcast-tv-terrestrial-and-satellite}

Pour un multiplexeur DVB, un modulateur IP ou une liaison montante satellite (opérateurs seulement), choisissez **New TV output**. Sa page a quatre parties : **How it reaches the station** (**Unda sends it** vers une adresse, ou **The station fetches it** quand le récepteur de la chaîne vient à vous, en [SRT](#letting-the-receiver-connect-srt-listener) ou par [un lien HTTP](#letting-the-receiver-pull-a-link-http)), **Picture and sound**, **Channel details** (ce que listent les récepteurs) et **Extras** (tables de réseau et d'heure, repères publicitaires). À côté, **What the station gets** montre le format et la répartition du débit total entre la vidéo, le son et les tables, et suit chaque modification. **Add TV output**, en bas, l'ajoute.

Chaque sortie TV garde cette page. Elle commence par l'état de la sortie : ses récepteurs (pour une sortie que la chaîne récupère), le contrôle TR 101 290 du flux de transport et l'encodeur, et la raison quand elle ne peut pas envoyer. Ses réglages suivent, une ligne par partie ; **Change** ouvre une partie. Une barre en bas nomme ce que vous avez modifié, avec **Discard** et **Save** ; l'enregistrement redémarre l'encodeur, et la chaîne perd l'image quelques secondes. L'interrupteur en haut l'arrête et la démarre, et **Remove** est en bas de la page.

Le flux est réencodé dans ce qu'attend le matériel TV :

- **Image :** 16:9 dans l'un des sept formats. Une source 4:3 ou en portrait reçoit des bandes noires sur les côtés ; rien n'est rogné.

  | Format | Image | Usage |
  |---|---|---|
  | `576p25` (par défaut) | SD 720×576, 25 images/s | services SD, récepteurs plus anciens |
  | `576i25` | SD 720×576 entrelacée, trame haute en premier | services SD dont le matériel attend de la SD entrelacée, comme l'envoient couramment les encodeurs broadcast SD |
  | `720p25` | HD 1280×720, 25 images/s | fournisseurs et services IPTV qui prennent du 720p à 25, tel que l'envoient les encodeurs de diffusion en direct |
  | `720p50` | HD 1280×720, 50 images/s | services HD en 720p |
  | `1080i25` | HD 1920×1080 entrelacée, trame haute en premier | le format HD habituel dans les pays à 50 Hz |
  | `1080p25` | HD 1920×1080, 25 images/s | IPTV et services HD en 1080p, pour les programmes faits à 25 images/s |
  | `1080p50` | HD 1920×1080, 50 images/s | IPTV, liaisons de contribution et services HD DVB-T2 et satellite plus récents ; sport et mouvements rapides |

  Les formats entrelacés sont tissés à partir de 50 images par seconde : une source à 50 images/s bouge en 50 trames par seconde, et une source à 25 images/s part avec les deux trames d'une image tirées de la même image, si bien qu'elle reste telle qu'elle était.

- **Vidéo :** H.264 (DVB-T2 / DVB-S2 ; profil High pour la HD), HEVC (H.265 ; pour le 576p25, le 720p50, le 1080p25 et le 1080p50, puisque les services HEVC sont progressifs) ou MPEG-2 (récepteurs DVB-T / DVB-S plus anciens ; SD seulement). Le H.264 SD est dimensionné par le flux de transport entier : **1300 kb/s par défaut**, la vidéo remplissant ce que laissent l'audio et le surcoût du flux (1040 kb/s avec de l'AAC à 128). Saisissez un autre total et la vidéo s'y ajuste, ou réglez vous-même le débit vidéo. Le H.264 en 720p25, 720p50 et 1080p25 est dimensionné de la même façon : **2500, 4000 et 5000 kb/s** par défaut (2050, 3410 et 4320 kb/s de vidéo). Autres valeurs par défaut : H.264 à 8 Mb/s de vidéo pour le 1080i25 et le 1080p50 ; HEVC à 1,2 Mb/s en SD, 4 Mb/s en HD ; MPEG-2 à 4 Mb/s. Le 720p50 en H.264 tient aussi dans une place de taille SD : 690 kb/s de vidéo dans un total de 1000, 960 dans 1300, 1140 dans 1500 (les autres formats HD demandent au moins 1500 de vidéo). À ces débits, les mouvements rapides montrent des blocs plus tôt qu'en SD. **Better quality** (`better_quality: true`) encode avec le préréglage plus lent « medium » de x264 au lieu de « veryfast » (HEVC : « veryfast » au lieu de « superfast ») : mesuré en 720p25 à 840 kb/s de vidéo, 5 à 7 points VMAF de mieux, une différence visible, pour environ un quart à un tiers de cœur de processeur de plus par sortie. L'encodeur utilise des images B, que tout récepteur DVB décode et qui donnent une meilleure image pour le débit. Si le matériel vers lequel vous envoyez n'est pas un récepteur TV mais une passerelle IP, un transcodeur ou un rediffuseur, et que l'image s'y casse, activez **No B-frames** (`no_b_frames: true`) : chaque image part alors dans l'ordre d'affichage. Mesuré en SD à 750 kb/s de vidéo, cela coûte au plus environ 1,5 point VMAF sur les mouvements rapides et rien sur les images calmes.
- **Audio :** AAC (par défaut ; 128 kb/s), MPEG-1 Layer II (MP2 ; par défaut avec la vidéo MPEG-2) ou AC-3 (Dolby Digital, signalé à la manière du DVB), 48 kHz stéréo. L'AAC part en ADTS, que lisent la plupart des récepteurs ; pour les récepteurs qui suivent le DVB à la lettre, choisissez l'empaquetage **LATM** (`aac_packing: latm`, type de flux 0x11). **Sound language** (`language: eng`, n'importe quel code ISO 639 à trois lettres) nomme la piste : les récepteurs l'affichent dans leur menu audio, et choisissent selon elle quand une chaîne en a plusieurs. Aucune par défaut. Le son est envoyé en paquets d'environ 170 ms ; **One sound frame per packet** (`sound_frame_per_pes: true`) envoie chaque trame de 21 ms séparément, comme le font la plupart des encodeurs de diffusion en direct, pour les logiciels de réception conçus autour d'eux. Il demande 50 kb/s de place en plus : la vidéo est donc ajustée d'autant plus petite (SD dans un total de 1000 kb/s : 700 kb/s de vidéo).
- **Débit :** **Constant** (par défaut) est ce dont ont besoin les multiplexeurs, modulateurs et IRD DVB. **Variable** (`variable_rate: true`) envoie plutôt la sortie à la manière du streaming : chaque paquet dès qu'il est fabriqué, en moyenne sous le total que vous fixez (une seconde chargée peut le dépasser de quelques pour cent), sans bourrage, comme envoient les encodeurs de diffusion en direct. Sans bourrage auquel faire de la place, une plus grande part du total va à la vidéo : 840 kb/s de vidéo dans un total de 1100 kb/s en 720p25, contre 780 à débit constant. Choisissez-le quand le côté réception est un logiciel conçu autour de tels encodeurs (un fournisseur IP vers satellite, un rediffuseur) et qu'une sortie à débit constant s'y casse alors que celle d'un encodeur de diffusion en direct passe. Une sortie à débit variable ne porte ni tables de réseau et d'heure ni repères publicitaires (ils voyagent dans le bourrage du débit constant), et les chaînes d'un bouquet sont toujours à débit constant.
- **Flux de transport :** un débit constant (le total que vous fixez, complété par des paquets nuls ; ou variable, ci-dessus), avec le nom de votre chaîne et du fournisseur dans les informations de service (SDT), le type de service qu'attendent les récepteurs (H.264 SD ou HD, HEVC), et l'identifiant de service et les PID qu'attend votre multiplexeur.
- **Tables de réseau et d'heure :** la NIT (le nom du réseau et la chaîne) et la TDT/TOT (l'heure UTC et, avec un fuseau horaire et un pays, l'heure locale), comme les envoie un [bouquet](/fr/guide/mpts#network-and-time-tables). Elles sont actives par défaut et voyagent dans le bourrage : le débit ne change pas. Réglez-les sous **Network and time tables** dans le formulaire (`network_name`, `time_zone`, `country`, ou `network_tables: false` dans le bloc `broadcast:` du fichier de configuration).

Dans le fichier de configuration :

```yaml
restream:
  targets:
    - stream: news
      name: uplink
      url: udp://10.0.0.20:5000
      broadcast:
        format: 1080i25
        video_codec: h264
        video_kbps: 10000
        audio_codec: ac3
        audio_kbps: 192
        service_name: "News HD"
```

### Les réseaux DVB-T2 et DVB-S2 qui n'acceptent que le H.264 {#dvb-t2-and-dvb-s2-networks-that-take-h264-only}

Beaucoup de réseaux nationaux de télévision numérique ne portent que du H.264, et leurs décodeurs doivent décoder le HE-AAC ; le MP2 leur est facultatif. Pour une chaîne sur un tel réseau :

- **Vidéo :** H.264. Le MPEG-2 et le HEVC ne passeront pas sur ses récepteurs.
- **Audio :** AAC (par défaut). Essayez l'empaquetage LATM si les récepteurs d'une chaîne l'affichent sans le son.
- **Débit :** ce que la chaîne vous réserve. Beaucoup de chaînes prennent les chaînes SD à 1300 kb/s, ce qui est la valeur SD par défaut.
- La tête de réseau de la chaîne ajoute par-dessus ce dont le réseau a besoin : sa table de réseau (NIT), l'heure (TDT), les numéros de chaîne et l'accès conditionnel.

Envoyez-le avec `udp://` (unicast ou multicast), `rtp://` (avec le [FEC SMPTE 2022-1](#error-correction-for-rtp-smpte-2022-1) si le matériel l'attend) ou `srt://` (par Internet, chiffré ; `srt://:port` quand le récepteur de la chaîne se connecte à vous, voir [plus bas](#letting-the-receiver-connect-srt-listener)). Demandez à l'opérateur du multiplex le débit réservé à votre service, et saisissez-le comme débit total constant. Chaque destination TV fait tourner son propre encodeur : prévoyez environ un tiers de cœur de processeur pour du H.264 SD, environ un cœur pour du H.264 HD et environ deux pour du HEVC. Le 1080p50 en prend environ une fois et demie plus (mesuré : 1,6 fois le 1080i25 en H.264, et 1,6 fois le 720p50 en HEVC) ; le 1080p25 à peu près autant que le 1080i25.

### Laisser le récepteur se connecter (écoute SRT) {#letting-the-receiver-connect-srt-listener}

Certains téléports et certaines chaînes vont chercher la chaîne : leur récepteur est un *appelant* SRT et se connecte à vous. Sur la page d'une nouvelle sortie TV, choisissez **The station fetches it**, puis **Calls in over SRT**, avec le port, une phrase secrète et qui peut se connecter. Par l'API ou `unda.yaml`, c'est une adresse sans hôte, et Unda attend sur ce port :

```
srt://:9000?passphrase=une-longue-phrase-secrete
```

- Donnez au côté réception l'adresse de ce serveur, le port et la phrase secrète. Ouvrez le port UDP dans le pare-feu du serveur.
- Une écoute demande une **phrase secrète** (10 à 79 caractères) ou les **adresses** des récepteurs : `allow=203.0.113.7,198.51.100.0/24` n'accepte que celles-ci. Utilisez les deux quand vous le pouvez. Sans aucune des deux, quiconque trouverait le port pourrait prendre la chaîne : Unda refuse donc l'adresse.
- `streamid=…` n'accepte que les récepteurs qui demandent cet identifiant de flux ; `latency=` (millisecondes) est comme pour l'envoi.
- Jusqu'à 8 récepteurs en même temps (un récepteur principal et un de secours, par exemple), chacun recevant la chaîne entière. Un récepteur qui ne suit pas est lâché ; son matériel se reconnecte.
- L'encodeur continue de tourner quand personne n'est connecté : un récepteur reçoit la chaîne dès qu'il se connecte. La ligne indique qui est connecté, ou qu'elle attend, et montre un récepteur refusé avec la raison (mauvaise phrase secrète, adresse non autorisée).
- Choisissez un port qu'aucune autre partie du serveur n'utilise : ni le port SRT du serveur lui-même, ni celui d'une entrée ou d'une autre sortie.

Le récepteur reste connecté quand la source s'arrête et redémarre : il reçoit de nouveau la chaîne dès qu'il y a quelque chose à envoyer. Seules les sorties TV et les bouquets écoutent. Un flux transmis tel quel n'a pas besoin d'écoute : le récepteur le récupère sur le port SRT du serveur lui-même avec `streamid=read:<nom>` ([SRT](/fr/guide/srt)).

Testé avec TSDuck 3.45 (libsrt 1.5.7) comme récepteur : la chaîne SD est arrivée à exactement 1300 kb/s avec ses tables et sans erreur de continuité.

### Laisser le récepteur récupérer un lien (HTTP) {#letting-the-receiver-pull-a-link-http}

Les têtes de réseau câble, les IRD et beaucoup de passerelles peuvent aller chercher une chaîne en HTTP. Choisissez **The station fetches it**, puis **Pulls an HTTP link** : une fois la sortie ajoutée, sa page montre le lien à donner à la chaîne, sur la propre adresse de votre serveur :

```
https://tv.example.com/tv/3pX0b2Vq7mQkA1sLz9TfRw.ts
```

- Le lien est le secret : quiconque l'a peut récupérer la chaîne, sauf si vous listez les adresses autorisées (**Who may pull it**). Utilisez la liste quand vous savez d'où se connecte le récepteur de la chaîne.
- Il fonctionne en HTTPS. Activez **Plain HTTP too** pour les récepteurs qui ne savent pas utiliser HTTPS ; la chaîne répond alors aussi sur le port HTTP simple du serveur, et traverse le réseau sans chiffrement. Sur un serveur sans HTTPS, le lien est en HTTP simple.
- Sur la page de la sortie, **Show** ou **Copy** le redonne (la ligne de la liste a aussi **Copy link**) ; chaque consultation figure dans le journal d'audit. **Make a new link** demande confirmation, puis met fin aussitôt à l'ancien : les récepteurs qui l'utilisent sont coupés jusqu'à ce que la chaîne ait le nouveau, et l'encodeur continue.
- Jusqu'à 8 récepteurs en même temps, chacun recevant la chaîne entière. Un récepteur qui prend 10 secondes de retard est lâché ; son matériel se reconnecte. La page de la sortie liste qui récupère et combien chacun a reçu, ainsi qu'un récepteur refusé (une adresse absente de la liste, du HTTP simple quand le lien est en HTTPS seulement).
- L'encodeur tourne que quelqu'un récupère ou non : un récepteur reçoit la chaîne aussitôt. Les récepteurs restent connectés quand vous modifiez la sortie ou que sa source redémarre ; désactiver la sortie ou la supprimer les coupe, et le lien répond alors « switched off » (ou « not found » une fois supprimée).

Dans `unda.yaml` ou par l'API, la destination est `http-pull://?allow=203.0.113.7&plain=1`. Unda ajoute un `token` (le secret du lien) quand il en enregistre une. Une destination de `unda.yaml` sans `token=` reçoit un nouveau lien à chaque démarrage : donnez-lui-en un de 22 lettres, chiffres, `-` ou `_` pour garder le lien. Derrière un proxy inverse, transmettez `/tv/` comme le reste du serveur.

Testé avec FFmpeg comme récepteur : il a récupéré et décodé la chaîne SD (H.264 720×576 avec de l'AAC), et désactiver la sortie l'a coupé aussitôt.

### Coupures publicitaires (SCTE 35) {#ad-breaks-scte-35}

Si une tête de réseau câble ou IPTV, un téléport ou un opérateur TV insère ses propres publicités dans votre chaîne, son insérateur publicitaire a besoin de savoir quand votre programme leur fait de la place. Unda le lui dit avec des repères SCTE 35.

**Activez les repères** pour chaque sortie qui va vers un tel matériel :

- **Une sortie TV :** dans sa partie **Extras**, cochez **Send ad cues (SCTE 35)**. Les repères partent sur le PID 258, sauf si vous en indiquez un autre à cet endroit.
- **Une chaîne de bouquet :** cochez sa case dans la colonne **Cues** du bouquet (la chaîne redémarre, quelques secondes hors antenne), ou cochez **Send ad cues** sous les PID de la chaîne quand vous l'ajoutez. Le PID est choisi automatiquement.

Le PID des repères est listé dans les tables de la chaîne (PMT, avec l'enregistrement `CUEI` du SCTE 35) : le matériel le trouve de lui-même. Dans unda.yaml, c'est `ad_cues: true` (et `cue_pid:` s'il vous en faut un fixe) dans le bloc `broadcast:` d'une destination ou sur une chaîne de bouquet.

**Lancez une coupure** depuis la page du flux : la carte **Ad break** de l'onglet **Overview** apparaît pour les opérateurs dès que l'une des sorties du flux envoie des repères. Choisissez la durée de la coupure et appuyez sur **Start ad break** :

1. Le programme s'en va 4 secondes plus tard. Le repère part une fois par seconde jusque-là : un matériel qui en manque un reçoit quand même le suivant.
2. La carte fait un compte à rebours pendant la coupure. L'insérateur revient de lui-même quand elle se termine (le repère porte la durée de la coupure), et Unda envoie aussi un repère de retour.
3. **End now** fait revenir le programme 2 secondes plus tard. Utilisé avant le début de la coupure, il retire la coupure.

Chaque sortie place ses repères dans sa propre chronologie d'images : une sortie réencodée est aussi exacte qu'une sortie envoyée telle quelle. Entre les coupures, un court repère de maintien part chaque seconde, pour que le matériel de surveillance voie le flux de repères vivant. Les repères qui arrivent dans un flux ne sont jamais transmis : un flux de contribution ne peut pas faire remplacer votre programme par le matériel en aval.

Les coupures sont lancées par les opérateurs et au-dessus, au plus une modification toutes les 2 secondes par flux, et chacune est enregistrée dans le journal d'audit et dans le journal des événements. Les scripts peuvent utiliser `POST /api/v1/streams/NOM/ad-break` avec `{"seconds": 60}`, et `DELETE` pour End now ([API](/reference/api), en anglais). Vérifié avec le moniteur de repères de TSDuck sur une sortie TV et une chaîne de bouquet : chaque repère se relit avec son heure, sa durée et son retour automatique, le débit reste exact, et le flux n'a pas d'erreur.
