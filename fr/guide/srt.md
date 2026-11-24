---
title: "Diffuser en SRT : publier et regarder en SRT"
description: "Publiez et regardez en SRT avec Unda : le port, les réglages d'OBS et de VLC, la latence pour les réseaux avec pertes, et le chiffrement par phrase secrète."
---

# SRT

SRT (Secure Reliable Transport) transporte la vidéo en direct sur Internet bien mieux que RTMP : il renvoie les paquets perdus, et il peut être chiffré. Utilisez-le depuis des lieux éloignés, des connexions mobiles, et pour la contribution entre studios.

## L'activer {#enabling-it}

`install.sh` active SRT sur le port UDP 6000, sauf si vous passez `--no-srt`. Dans le fichier de configuration :

```yaml
srt:
  addr: ":6000"
  latency_ms: 500        # voir plus bas
  # passphrase: "..."    # facultatif : 10 à 79 caractères ; tout le monde doit alors l'utiliser
```

Ouvrez le port UDP 6000 dans le pare-feu.

## Publier {#publishing}

```
srt://tv.example.com:6000?streamid=publish:sk_…
```

Dans OBS : service **Personnalisé…**, cette adresse comme serveur, clé de stream vide. Avec ffmpeg (compilé avec SRT) :

```bash
ffmpeg -re -i show.mp4 -c:v libx264 -g 60 -b:v 3M -c:a aac -f mpegts \
       "srt://tv.example.com:6000?streamid=publish:sk_…"
```

La carte **Input** de la page du flux affiche une ligne **Transport stream** : ce qu'envoie l'encodeur, contrôlé selon [TR 101 290](/fr/guide/mpts#transport-stream-checks-tr-101-290) (priorités 1 et 2) pendant qu'il publie. Cliquez dessus pour le rapport complet : paquets perdus, intervalle de PCR, chaque PID et les tables que porte l'encodeur. Des erreurs dans la dernière minute lèvent un avertissement.

## Regarder en SRT {#watching-over-srt}

Unda envoie le MPEG-TS en SRT (aux spectateurs et aux destinations SRT) dans des messages de paquets TS entiers, sept au plus (1316 octets), la taille qu'attendent les décodeurs matériels et les passerelles.

```
srt://tv.example.com:6000?streamid=read:main-show
```

Dans VLC : `vlc --streamid "read:main-show" "srt://tv.example.com:6000"`. Dans OBS : une **Source média** avec *Fichier local* décoché et cette adresse comme entrée. Tout flux en direct peut être regardé en SRT, quelle que soit la façon dont il est entré.

## Latence et pertes de paquets {#latency-and-packet-loss}

`latency_ms` est le temps dont SRT dispose pour récupérer les paquets perdus. Il doit être nettement **supérieur à l'aller-retour** entre les deux bouts (vérifiez-le avec `ping`) : avec 500 ms, un flux qui perdait 5 % de ses paquets dans chaque sens sur un aller-retour de 80 ms est arrivé complet, alors que la même liaison à 60 ms cassait. Augmentez-le pour les connexions longues ou médiocres ; baissez-le sur un réseau local.

## Chiffrement {#encryption}

Quand `passphrase` est défini, chaque encodeur et chaque spectateur SRT doit utiliser la même phrase secrète (OBS : ajoutez `&passphrase=...` à l'adresse ; VLC : `--passphrase ...`). Une connexion sans elle est refusée.
