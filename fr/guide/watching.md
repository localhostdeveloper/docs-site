---
title: "Regarder et intégrer les directs (HLS, DASH, RTMP)"
description: "Toutes les façons de regarder un flux d'Unda : le lecteur intégré, HLS, DASH, le MPEG-TS en HTTP pour l'IPTV, RTMP et SRT, ainsi que le retour en arrière et l'intégration à un site."
---

# Regarder et intégrer

Une chaîne en direct appelée `main-show` sur `tv.example.com` peut être regardée de ces façons. La clé de diffusion ne fait jamais partie d'une adresse de lecture : toute personne qui connaît le nom peut regarder, seule la clé permet de publier. Pour limiter qui peut regarder, protégez le flux avec des [liens signés](/fr/guide/protect-playback).

| Où | Adresse |
| --- | --- |
| Navigateur, lecteur intégré | `https://tv.example.com/watch/main-show` |
| HLS, pour votre propre site ou application | `https://tv.example.com/hls/main-show/index.m3u8` |
| HLS avec plusieurs qualités (quand le [débit adaptatif](/fr/guide/transcoding) est actif) | `https://tv.example.com/hls/main-show/master.m3u8` |
| MPEG-DASH (H.264, AAC en option ; plusieurs qualités quand le débit adaptatif est actif) | `https://tv.example.com/dash/main-show/manifest.mpd` |
| Décodeurs, applications et panneaux IPTV : [MPEG-TS en HTTP](#mpeg-ts-over-http-iptv) | `https://tv.example.com/ts/main-show.ts` |
| VLC, OBS ou vMix en RTMP | `rtmp://tv.example.com:1935/live/main-show` |
| VLC, OBS ou vMix en SRT | `srt://tv.example.com:6000?streamid=read:main-show` |

L'onglet **Output** du flux, dans le tableau de bord, liste toutes les adresses, DASH compris, avec des boutons pour les copier.

## MPEG-TS en HTTP (IPTV) {#mpeg-ts-over-http-iptv}

`https://tv.example.com/ts/main-show.ts` envoie le flux en direct sous la forme d'un seul MPEG-TS continu, tel qu'il arrive (vidéo H.264 et audio AAC). C'est le genre de lien que prennent les décodeurs IPTV, les applications et les panneaux IPTV, et qu'un autre serveur peut récupérer (une [entrée récupérée](/fr/guide/pull-inputs) d'Unda le prend tel quel).

- Un spectateur commence sur l'image clé la plus récente, au direct. Il n'y a pas de segments à attendre : le délai est celui de la mémoire tampon du lecteur.
- Quand le flux se termine, la connexion se termine, et les lecteurs se reconnectent d'eux-mêmes. Un lecteur qui cesse de lire est lâché au bout d'environ 10 secondes.
- Les horodatages suivent l'horloge propre du flux : un serveur qui récupère le lien (Flussonic, Wowza, un autre Unda) et se reconnecte reprend là où il en était au lieu de recommencer. Chaque image est envoyée 0,7 s avant son heure de décodage, la marge qu'attendent les décodeurs et les autres récepteurs.
- Un flux protégé demande son [lien signé](/fr/guide/protect-playback) : ajoutez `?token=…` comme sur les autres adresses. Un lien pour un nombre d'appareils compte chaque connexion comme un appareil.
- Chaque spectateur coûte le débit du flux en envoi, comme un spectateur RTMP ou SRT, et compte dans `limits.max_egress_mbps`. Un CDN ne peut pas le mettre en cache : pour un large public, utilisez HLS.
- `/ts/main-show` sans `.ts` lit le même flux.

```bash
ffplay https://tv.example.com/ts/main-show.ts
```

## MPEG-DASH {#mpeg-dash}

L'adresse DASH sert le flux en MP4 fragmenté (vidéo H.264, audio AAC quand le flux en a ; FFmpeg doit être installé sur le serveur) :

- **Sans débit adaptatif**, le flux est servi tel qu'il arrive, en une seule qualité. La mise en paquets commence avec le premier spectateur, ce qui prend quelques secondes, et s'arrête une minute après le dernier. Deux flux au plus sont mis en paquets pour DASH en même temps ; les suivants sont refusés avec « réessayez ».
- **Avec le [débit adaptatif](/fr/guide/transcoding) actif**, le manifeste liste chaque qualité de l'échelle, et les lecteurs passent de l'une à l'autre quand la connexion du spectateur change, comme le `master.m3u8` du HLS.
- Les lecteurs restent environ trois segments (6 secondes environ) derrière le direct.
- Quand le flux se termine, le manifeste devient un enregistrement terminé de ses derniers segments pendant 30 secondes, puis disparaît.

La page de lecture intégrée lit le HLS. Pour le DASH, utilisez un lecteur DASH : testé avec [dash.js](https://github.com/Dash-Industry-Forum/dash.js) et [Shaka Player](https://github.com/shaka-project/shaka-player) dans Chrome, et avec VLC.

```bash
vlc https://tv.example.com/dash/main-show/manifest.mpd
```

## La page de lecture {#the-player-page}

`/watch/<nom>` est la page propre à la chaîne, sur ordinateur comme sur téléphone :

- En haut, le logo, le titre et le slogan de la chaîne, et **Share**.
- Le lecteur. **Pause** et **volume** ; **LIVE** (allumé pendant le direct ; après un retour en arrière, il ramène le spectateur au direct) ; une barre pour revenir en arrière quand le flux garde une [fenêtre de retour en arrière](#rewind) ; **Low latency** ; **Quality** (Auto ou une taille, chacune avec ce qu'elle coûte, plus la vitesse de connexion et la mémoire tampon du spectateur) ; **les sous-titres** ; **l'image dans l'image** ; **le plein écran**. Touches : espace ou **k** lecture et pause, **m** son, **f** plein écran, **c** sous-titres, les flèches reculent et avancent de 10 secondes. Les commandes s'effacent pendant la lecture.
- **On now** : le programme, le temps restant, sa description, et ce qui vient **ensuite**.
- La **grille** du jour et des deux jours suivants, avec le programme à l'antenne mis en évidence.

La page commence à lire aussitôt, sans le son (les navigateurs l'autorisent), avec un bouton **Turn sound on**. Le plein écran montre le lecteur seul, avec le nom de la chaîne et LIVE par-dessus l'image. Sur un téléphone, la page tient sur une colonne ; à l'horizontale, le lecteur remplit l'écran.

Si l'encodeur décroche, la page affiche _« The channel is off air. Trying again… »_ et reprend d'elle-même quand le flux revient : les spectateurs n'ont jamais besoin de recharger.

### Préparer la page {#setting-up-the-page}

Dans l'onglet **Output** d'une chaîne, sous **Watch page** :

- **Title** et **tagline** (par défaut, le titre est le nom de la chaîne).
- **Colour** : le badge du direct, le programme en cours et les barres de progression.
- **Logo** : un PNG ou un JPEG ; sans logo, la première lettre du titre dans la couleur.
- **Show the schedule** : actif par défaut. Celle d'une chaîne 24h/24 vient de sa playlist, celle d'une chaîne en direct de son [onglet EPG](/fr/guide/playout#live-channels-a-typed-in-guide).
- **Show how many are watching** : désactivé par défaut.

Les clients règlent les pages de leurs propres chaînes. Les flux qui ne sont pas des chaînes (anciennes clés, entrées) affichent leur nom et le lecteur. Sur un [flux protégé](/fr/guide/protect-playback), la grille et l'image de la page demandent aussi le lien, comme la vidéo.

## Sous-titres codés {#closed-captions}

Les sous-titres transportés dans l'image (CEA-608 et CEA-708, la façon dont beaucoup de diffuseurs et de services de sous-titrage les envoient) restent avec le flux, quelle que soit la façon dont il arrive : un encodeur RTMP, SRT, UDP, RTP ou RIST, un bouquet ou une entrée récupérée. Les spectateurs les reçoivent en HLS (la page de lecture a un bouton de sous-titres), dans les enregistrements, dans les sorties TV et dans les qualités du [débit adaptatif](/fr/guide/transcoding). Le lecteur du tableau de bord a un bouton **CC** (ou la touche **c**) quand le flux porte des sous-titres.

Les sous-titres sont conservés tant que la fréquence d'images reste la même. Deux cas la changent :

- Le débit adaptatif fabrique ses qualités à 30 images par seconde au plus : une source à 50 ou 60 images par seconde perd donc ses sous-titres dans ces qualités (le flux tel qu'il arrive les garde). Pour les garder, montez `transcode.fps` à 60 dans `unda.yaml` ; les qualités coûtent alors davantage de processeur.
- Une sortie TV 720p50 ou 1080p50 faite à partir d'une source à 25 images par seconde double la fréquence d'images et les perd. Le SD, le 1080i et le 720p50 à partir d'une source à 50 images par seconde les gardent.

Les sous-titres ne sont pas gardés par les chaînes 24h/24 faites de fichiers, et le lecteur à faible délai (WebRTC) ne les affiche pas.

## Retour en arrière {#rewind}

Un flux peut garder ses dernières minutes, pour que les spectateurs puissent revenir en arrière pendant le direct, puis revenir au direct. Choisissez la durée dans l'onglet **Output** du flux, sous **Rewind** : Off, 15 minutes, 30 minutes ou 1 heure, jusqu'au maximum que permet le serveur. Les clients la choisissent pour leurs propres chaînes.

- La page de lecture et tout lecteur HLS reçoivent une barre de lecture sur cette fenêtre. Dans l'aperçu du tableau de bord, pointer la barre montre l'heure, et **Go live** ramène au direct.
- Avec le [débit adaptatif](/fr/guide/transcoding), chaque qualité garde la même fenêtre.
- Le retour en arrière est pour les lecteurs HLS. RTMP, SRT, Low latency (WebRTC) et le MPEG-TS en HTTP lisent toujours le direct.
- Modifier le réglage fait repartir les lecteurs une fois, en quelques secondes. Quand l'encodeur se reconnecte, la fenêtre recommence à vide.

**Espace disque.** Les minutes sont gardées sur le disque du serveur, pas en mémoire. Un flux occupe son débit multiplié par ses minutes : environ 1,1 Go pour 30 minutes d'un flux à 5 Mb/s, plus celles de ses qualités quand il est transcodé. Les administrateurs fixent la fenêtre la plus longue dans **Server → Playback → Rewind**, qui liste aussi chaque flux qui en garde une et l'espace qu'il utilise.

Les fenêtres sont gardées dans `paths.rewind_dir` (par défaut un dossier `.rewind` dans `hls_dir`). Si le serveur a un second disque plus grand, faites-le pointer là. Sur une installation faite par le script, un dossier hors de `/var/lib/unda` doit aussi être ouvert au service :

```bash
sudo systemctl edit unda
# ajoutez ces deux lignes, enregistrez, puis : sudo systemctl restart unda
[Service]
ReadWritePaths=/mnt/data/unda-rewind
```

Une nouvelle fenêtre demande 5 Go libres sur son disque. Sous 2 Go libres, les fenêtres s'arrêtent et les flux continuent sans ; un événement de la page **Events** le signale.

## Intégrer à votre site {#embedding-on-your-website}

Une église, une école ou un site d'information peut placer le lecteur de la chaîne sur ses propres pages. Dans l'onglet **Output** de la chaîne, sous **Embed on another website**, choisissez la couleur et les options du lecteur, puis **Copy code**, et collez le code dans le site :

```html
<div style="position:relative;aspect-ratio:16/9;max-width:100%">
  <iframe src="https://tv.example.com/watch/main-show?embed=1&color=0e9f9a" title="Main Show"
    allow="autoplay; fullscreen; picture-in-picture" allowfullscreen
    style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe>
</div>
```

Le lecteur intégré montre l'image de la chaîne, assombrie, avec **LIVE** et _Tap to watch live_, et démarre d'un geste, avec le son. Un site très fréquenté ne fait donc pas venir le flux pour chaque visiteur qui ne le lance jamais. Les options, dans l'adresse :

| Option | Effet |
|---|---|
| `color=rrggbb` | la couleur du lecteur (par défaut celle de la page de lecture) |
| `logo=0` | pas de logo dans le coin |
| `autoplay=1` | lit aussitôt, sans le son (`muted=0` demande le son, ce que la plupart des navigateurs refusent tant que le spectateur n'a pas touché l'écran) |
| `viewers=1` | affiche combien de personnes regardent, quand la page de lecture l'affiche |

Ou utilisez l'adresse HLS avec votre propre lecteur (hls.js, Video.js, JW Player, les lecteurs natifs d'iOS, d'Android et des télévisions connectées). Les requêtes d'une autre origine sont autorisées : cela fonctionne depuis n'importe quel domaine.

## Démarrer la lecture {#starting-to-play}

Unda met chaque flux en paquets HLS dès qu'il passe en direct : un spectateur qui ouvre une chaîne que personne d'autre ne regarde trouve des segments prêts au lieu d'attendre qu'il en soit fabriqué un. Mesuré dans Chrome sur le serveur lui-même : la première image 0,2 s après l'ouverture de la page, contre 3,3 s quand la mise en paquets attendait le premier spectateur. Sur une vraie connexion, ajoutez le temps de téléchargement du premier segment. Les lecteurs d'Apple (iPhone, iPad, Apple TV, Safari) ne démarrent qu'une fois que la playlist contient environ trois segments ; un flux mis en paquets dès le départ les a déjà.

Cela coûte environ 0,5 % d'un cœur de processeur et moins de 1 Mo de mémoire par flux en direct, et quelques Mo de disque par flux pour ses segments (écrits dans le dossier du retour en arrière, au débit du flux). Dans le fichier de configuration, `hls.on_demand: true` ne met un flux en paquets qu'une fois que quelqu'un le demande, et `hls.segments_in_memory: true` garde les segments en mémoire plutôt que sur disque. Quand ce disque a moins de 2 Go libres, les flux passent d'eux-mêmes leurs segments en mémoire (les lecteurs repartent alors une fois sur ce flux).

## Délai derrière le direct {#delay-behind-live}

| Comment | Délai |
| --- | --- |
| RTMP ou SRT (VLC, OBS, vMix) | bien moins d'une seconde côté serveur, plus la mémoire tampon du lecteur (VLC : 1 s par défaut) |
| MPEG-TS en HTTP (décodeurs et applications IPTV) | pas de segments : la mémoire tampon du lecteur |
| Navigateur / HLS, image clé de l'encodeur toutes les 2 s | environ 7 s |
| Navigateur / HLS, image clé de l'encodeur toutes les 8 s (« auto » d'OBS) | environ 30 s |

Les lecteurs dans les navigateurs restent environ trois segments derrière le direct, et un segment ne peut se terminer que sur une image clé : d'où le [réglage des images clés à 2 secondes](/fr/guide/streaming).

## Nombre de spectateurs {#viewer-counts}

Le tableau de bord compte les spectateurs par protocole (HLS, RTMP, SRT, MPEG-TS en HTTP). Un onglet de navigateur est un spectateur, quelle que soit la qualité vers laquelle il bascule ; plusieurs personnes derrière la même connexion Internet comptent séparément. Quelqu'un qui ferme l'onglet cesse d'être compté en 30 à 40 secondes. Ouvrir la page un instant sans lancer la lecture ne compte pas.

**Derrière un CDN**, les adresses de chaque spectateur HLS sont uniques (elles portent un identifiant de session), ce qui empêche le CDN de les mettre en cache. Réglez le CDN pour qu'il ignore la chaîne de requête dans son cache, ou réglez `hls.disable_session_ids: true`. La plupart des spectateurs sont alors servis par les copies du CDN et n'atteignent jamais ce serveur : le tableau de bord compte donc les ordinateurs du CDN plutôt que votre public ; utilisez les statistiques du CDN pour le nombre de spectateurs. Pour les flux protégés par des liens signés, lisez d'abord [Avec un CDN](/fr/guide/protect-playback#with-a-cdn) : un CDN qui met en cache les remettrait à n'importe qui.

## Trop de spectateurs pour votre connexion {#too-many-viewers-for-your-connection}

Réglez `limits.max_egress_mbps` un peu en dessous de l'envoi de votre serveur. Quand cette limite est atteinte, les **nouveaux** spectateurs sont poliment refusés (le lecteur réessaie), et tous ceux qui regardent déjà continuent. La page **Overview** montre la place qui reste, sous la forme « room for about N more viewers ».
