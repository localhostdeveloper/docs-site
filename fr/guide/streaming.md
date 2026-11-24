---
title: "Diffuser depuis OBS, vMix ou ffmpeg vers votre serveur"
description: "Les réglages d'OBS Studio, de vMix, de ffmpeg et des encodeurs matériels : l'adresse du serveur, la clé de diffusion, l'intervalle d'images clés et le débit dont Unda a besoin."
---

# Diffuser depuis OBS, vMix ou ffmpeg

Chaque flux arrive sur une **chaîne**. Créez-en une dans **Channels** du tableau de bord ; la page de la chaîne affiche l'adresse exacte du serveur et la clé de diffusion secrète (`sk_…`) à coller dans votre encodeur. Dans les exemples ci-dessous, `tv.example.com` est votre serveur et `sk_…` la clé de la chaîne.

## OBS Studio {#obs-studio}

**Paramètres → Stream**

- Service : **Personnalisé…**
- Serveur : `rtmps://tv.example.com:1936/live` (ou `rtmp://tv.example.com:1935/live`)
- Clé de stream : `sk_…`

**Utilisez `rtmps://` sur Internet.** Le RTMP simple envoie la clé de diffusion et les images telles quelles : n'importe qui sur le chemin peut copier la clé et prendre la chaîne. RTMPS est la même chose, chiffrée, sur le port 1936, avec le certificat HTTPS du serveur ; il est actif dès que le serveur a HTTPS. Les réglages d'encodeur de la chaîne, dans le tableau de bord, affichent les deux adresses.

**Paramètres → Sortie** (Mode de sortie : *Avancé*) **→ Streaming**

| Réglage | 720p | 1080p |
|---|---|---|
| Contrôle du débit | CBR | CBR |
| Débit | 2500–3500 kbps | 4500–6000 kbps |
| **Intervalle d'images clés** | **2 s** | **2 s** |
| Profil | high | high |
| Préréglage d'utilisation du CPU (x264) | veryfast | veryfast |
| Débit audio | 128 kbps | 128 kbps |

**Paramètres → Vidéo** : choisissez la résolution de sortie, et 30 images/s sauf si vous avez besoin de 60 (60 images/s demandent environ 50 % de débit en plus).

::: warning Réglez l'intervalle d'images clés sur 2
La valeur par défaut d'OBS, **0 (auto)**, n'envoie une image clé qu'environ toutes les 8 secondes. Les spectateurs dans un navigateur rejoignent alors le direct avec environ 30 secondes de retard au lieu d'environ 7, attendent jusqu'à 8 secondes avant que l'image démarre, et peuvent voir l'image se figer peu après le début. Le tableau de bord le signale par *« a keyframe only every 8.3 s »*.
:::

**Votre envoi doit tenir de façon stable environ 1,5 fois le débit vidéo.** Vérifiez-le avec un test de débit sur l'ordinateur de diffusion avant une émission : du 1080p à 5000 kbps demande 7 à 8 Mbit/s d'envoi qui ne faiblit pas. Pendant la diffusion, surveillez le bas de la fenêtre d'OBS : si les *images perdues* augmentent ou si le carré devient jaune ou rouge, baissez le débit. Préférez un câble au Wi-Fi quand c'est possible.

Si OBS perd sa connexion, il se reconnecte de lui-même, et les lecteurs des spectateurs reprennent d'eux-mêmes une fois le flux revenu.

### OBS en SRT {#obs-over-srt}

SRT supporte bien mieux qu'RTMP une connexion Internet médiocre. Il doit être activé sur le serveur (voir [SRT](/fr/guide/srt)).

- Service : **Personnalisé…**
- Serveur : `srt://tv.example.com:6000?streamid=publish:sk_…`
- Clé de stream : laissez vide

## vMix {#vmix}

Ouvrez les réglages de diffusion (la roue dentée à côté de **Stream**) :

- Destination : **Custom RTMP Server**
- URL : `rtmps://tv.example.com:1936/live` (ou `rtmp://tv.example.com:1935/live`)
- Stream Name or Key : `sk_…`
- Quality : un profil avec **de la vidéo H.264 et de l'audio AAC**, avec l'intervalle d'images clés réglé sur 2 secondes.

## ffmpeg {#ffmpeg}

```bash
# une mire : pas besoin de caméra
ffmpeg -re -f lavfi -i testsrc2=size=1280x720:rate=30 -f lavfi -i sine=frequency=1000 \
       -c:v libx264 -preset veryfast -g 60 -b:v 3M -c:a aac -b:a 128k \
       -f flv "rtmp://tv.example.com:1935/live/sk_…"

# un fichier, en boucle
ffmpeg -re -stream_loop -1 -i show.mp4 -c:v libx264 -preset veryfast -g 60 -b:v 3M \
       -c:a aac -b:a 128k -f flv "rtmp://tv.example.com:1935/live/sk_…"
```

`-g 60` donne une image clé toutes les 60 images : 2 secondes à 30 images/s.

## Encodeurs matériels et caméras IP {#hardware-encoders-and-ip-cameras}

Tout ce qui sait pousser du **RTMP**, du **SRT** ou du **MPEG-TS en UDP** fonctionne, à condition d'envoyer **de la vidéo H.264 et de l'audio AAC**. Pour les entrées UDP, voir [UDP / MPEG-TS](/fr/guide/udp).

## Ce que le serveur accepte {#what-the-server-accepts}

| | |
|---|---|
| Vidéo | H.264 (tout profil), toute taille jusqu'à la 4K pour le débit adaptatif |
| Audio | AAC |
| Non pris en charge | H.265/HEVC, AV1, Opus en RTMP (caméras RTSP et liens HLS : voir les [entrées récupérées](/fr/guide/pull-inputs)) |

Un second encodeur qui utilise la même clé pendant que la chaîne est en direct est refusé : deux personnes ne peuvent pas se disputer une chaîne par accident.

## Arrêter quelqu'un {#stopping-someone}

**Stop**, sur la page du flux, déconnecte l'encodeur, mais OBS se reconnecte de lui-même ; utilisez **Stop and block key** pour le tenir à l'écart, puis donnez à la chaîne une nouvelle clé (**Channels → ⋯ → New stream key**) quand vous voulez qu'il revienne.
