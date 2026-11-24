---
title: "Entrées récupérées : HLS, HTTP, RTMP et RTSP"
description: "Faites récupérer par Unda un flux depuis un lien HLS, du MPEG-TS en HTTP, un autre serveur RTMP ou une caméra RTSP, et publiez-le comme n'importe quel autre flux."
---

# Entrées récupérées (HLS, HTTP, RTMP, RTSP)

La plupart des sources poussent leur flux vers Unda : un encodeur publie en RTMP, en SRT ou en WebRTC, un récepteur envoie de l'UDP. Une **entrée récupérée** fonctionne dans l'autre sens : Unda va chercher le flux ailleurs et le publie sous un nom que vous choisissez. Utilisez-la pour :

- **des chaînes de télévision qui n'existent que sous forme de lien HLS** ou de flux MPEG-TS en HTTP (un fournisseur IPTV, le CDN d'un partenaire, un autre serveur) ;
- **un autre serveur RTMP** dont vous voulez relayer le flux ;
- **des caméras IP** qui ne proposent que le RTSP.

Le flux est ensuite comme n'importe quel autre : regardez-le sur la page de lecture, rediffusez-le, enregistrez-le, mettez-le dans un [bouquet multi-chaînes](/fr/guide/mpts) ou une [sortie TV](/fr/guide/udp), ou utilisez-le comme entrée supplémentaire d'une chaîne ([Entrées de chaîne](/fr/guide/channel-inputs)).

Les entrées récupérées sont dans les offres **Professional** et **Broadcast** (outil de licence `pull`). Elles demandent **FFmpeg** sur le serveur (`install.sh --with-ffmpeg` ; l'image Docker l'a). Seuls les opérateurs, administrateurs et propriétaires peuvent les ajouter ici. Le propriétaire d'une chaîne peut aussi donner à sa propre chaîne un flux récupéré, depuis des liens HLS et HTTP publics seulement, comme l'une de ses [entrées](/fr/guide/channel-inputs).

## En ajouter une {#add-one}

Dans le tableau de bord, ouvrez **Broadcast → Pull inputs**, donnez un nom au flux et collez l'adresse de la source :

| Source | Adresse |
|---|---|
| HLS | `https://example.com/live/news/index.m3u8` |
| MPEG-TS ou FLV en HTTP | `http://iptv.example.com:8080/live/user/pass/123.ts` |
| RTMP | `rtmp://other-server.example.com/live/stream` (`rtmps://` aussi) |
| Caméra RTSP | `rtsp://user:password@192.168.1.64:554/Streaming/Channels/101` (`rtsps://` aussi) |

Le flux passe en direct dès que la source répond, en général en quelques secondes. Sa ligne affiche l'état, le débit, la taille de l'image et, si la source échoue, pourquoi, en termes simples (avec le message de FFmpeg lui-même sous **Technical detail**).

Ou dans le [fichier de configuration](/reference/config) (en anglais) :

```yaml
pull_inputs:
  - name: news
    url: https://example.com/live/news/index.m3u8
  - name: lobby-camera
    url_env: LOBBY_CAMERA_URL      # garde le mot de passe de la caméra hors du fichier
    rtsp_transport: tcp            # ou udp
```

Ou avec l'[API](/reference/api#pull-inputs) (en anglais) :

```bash
curl -X POST -H "Authorization: Bearer $KEY" \
  -d '{"name":"news","url":"https://example.com/live/news/index.m3u8"}' \
  https://votre-serveur/api/v1/pull/inputs
```

## Ce qu'Unda fait de la source {#what-unda-does-with-the-source}

- **HLS :** quand l'adresse est une playlist principale avec plusieurs qualités, Unda prend celle qui a le débit le plus élevé. Une source HLS a environ trois segments de retard sur le direct de la source (6 secondes avec des segments de 2 secondes, davantage avec des segments plus longs), en plus du délai propre à la source.
- **Vidéo :** le H.264 passe tel quel. Les autres vidéos (HEVC, MPEG-2) sont refusées, avec la raison, sauf si vous cochez **Re-encode video that isn't H.264**, ce qui coûte environ un cœur de processeur par chaîne HD.
- **Audio :** l'AAC passe tel quel ; tout le reste (MP2, AC-3, le G.711 d'une caméra) est converti en AAC automatiquement. La ligne indique « audio converted ».
- **Une piste vidéo et une piste audio** sont gardées : la première de chaque (pour le HLS, celles de la qualité choisie), avec les sous-titres codés contenus dans la vidéo. Les autres sous-titres ne sont pas transmis.
- **Rythme :** ce que la source livre d'un coup (les premiers segments HLS, l'analyse de FFmpeg) est restitué au rythme propre du flux : les spectateurs, les bouquets et les sorties TV reçoivent un flux régulier.

## Quand la source décroche {#when-the-source-drops}

- Une courte coupure ne se voit pas, sauf par une image figée : le flux reste en place pendant **10 secondes** (modifiable avec `timeout`) pendant qu'Unda se reconnecte.
- Si la source a toujours disparu après ce délai, le flux s'arrête : l'[entrée suivante](/fr/guide/channel-inputs) d'une chaîne ou le remplissage d'un bouquet prend le relais, et la coupure apparaît dans **Events**.
- Unda continue d'essayer : après 1, 2, 5 et 10 secondes, puis toutes les 30 secondes, tant que l'entrée existe. Quand la source revient, le flux aussi.
- Une entrée hors antenne lève une alerte au bout de 30 secondes (critique au bout de 5 minutes), dans Overview et dans la page Events.

**Pour retirer un flux récupéré de l'antenne, mettez son entrée en pause** (l'interrupteur sur sa ligne). **Stop**, sur la page du flux, ne l'arrête que jusqu'à la tentative suivante, une seconde plus tard, comme reviendrait un encodeur qui se reconnecte de lui-même.

## Sécurité {#security}

- L'adresse contient souvent un mot de passe ou un jeton. Unda la garde sur le serveur (la base de données, ou votre fichier de configuration) et **ne l'affiche plus jamais** : le tableau de bord, l'API, les journaux et les événements la montrent raccourcie, comme `rtsp://192.168.1.64:554/…/101`. Pour la changer, saisissez-en une nouvelle dans **Edit**.
- Unda transmet l'adresse à FFmpeg sur sa ligne de commande, où **les autres comptes du même serveur** peuvent la lire (`ps`). Sur un serveur qui ne fait tourner qu'Unda, personne d'autre.
- FFmpeg ne peut récupérer qu'en http, https, rtmp(s), rtsp(s) et leurs transports : une playlist ne peut pas lui faire lire les fichiers du serveur lui-même.
- Les entrées récupérées peuvent joindre n'importe quelle adresse que le serveur peut joindre, y compris votre réseau interne : c'est pourquoi seuls les opérateurs et au-dessus peuvent en ajouter. La récupération du propriétaire d'une chaîne passe par une protection intégrée à Unda qui ne se connecte qu'à des adresses publiques d'Internet, vérifiées à chaque connexion (y compris les redirections et les segments HLS hébergés ailleurs).
- Une playlist HLS terminée (`#EXT-X-ENDLIST`) n'est pas récupérée : FFmpeg la lirait comme un enregistrement, depuis son premier segment. L'entrée affiche **The playlist has ended** et réessaie plus tard.

## Limites {#limits}

- Jusqu'à 64 entrées récupérées. Chacune en direct compte comme un flux en direct dans votre licence, sauf la récupération propre à une chaîne (la chaîne compte une fois).
- Une adresse par entrée. Pour une seconde source, ajoutez une seconde entrée et utilisez-la comme entrée supplémentaire d'une chaîne ([Entrées de chaîne](/fr/guide/channel-inputs)).
- Une source est récupérée en permanence, que quelqu'un regarde ou non. La récupération propre à une chaîne s'arrête quand elle est désactivée dans l'ordre de la chaîne.
- FFmpeg 7.1 et plus récent refuse les adresses de segments HLS sans extension de fichier média (`.ts`, `.m4s`, `.aac`…). La plupart des fournisseurs en utilisent une.

## Ce qui a été testé {#what-has-been-tested}

Récupéré depuis le HLS de FFmpeg lui-même (plusieurs qualités, avec une piste audio séparée), des serveurs MPEG-TS en HTTP et RTMP, le HLS d'un autre Unda, un flux HLS public sur Internet, et en RTSP (TCP et UDP) avec de la vidéo H.264, de l'audio G.711 et un mot de passe. Si l'une de vos sources se comporte mal, [dites-nous](/fr/contact) laquelle.
