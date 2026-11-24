---
title: "Diffusion à faible délai en WebRTC (WHIP et WHEP)"
description: "Environ une seconde de délai avec WebRTC : publiez vers Unda en WHIP depuis OBS, FFmpeg ou un navigateur, regardez en WHEP, et utilisez un relais TURN là où l'UDP est bloqué."
---

# WebRTC (faible délai)

WebRTC ramène le délai entre la caméra et le spectateur à environ une seconde, là où HLS en prend 6 à 10. Unda parle les deux protocoles WebRTC standard :

- **WHIP** pour publier : OBS 30 et plus récent, FFmpeg, les navigateurs.
- **WHEP** pour lire : l'interrupteur **Low latency** de la page de lecture, ou n'importe quel lecteur WHEP.

Un flux publié en WebRTC est un flux Unda ordinaire : HLS, RTMP, SRT, enregistrement, rediffusion et sorties TV fonctionnent tous dessus. Un flux publié en RTMP ou en SRT peut être regardé en WebRTC.

WebRTC demande l'outil WebRTC dans la licence (Professional et Broadcast) et HTTPS : les clés de diffusion et les liens de lecture sont refusés en HTTP simple.

## L'activer {#turning-it-on}

Il est actif dès que la licence le comprend. Tout son audio et sa vidéo passent par un seul port UDP, 8189 sauf si vous le changez :

```yaml
webrtc:
  udp_port: 8189
```

Ouvrez ce port dans le pare-feu :

```bash
sudo ufw allow 8189/udp
```

**Docker, ou un serveur avec une adresse privée (NAT 1:1) :** Unda indique aux lecteurs à quelle adresse envoyer leurs médias, et derrière un NAT il ne voit pas son adresse publique. Donnez-la-lui :

```yaml
webrtc:
  public_ips: [203.0.113.7]   # l'adresse IPv4 publique de ce serveur
```

et publiez le port : `- "8189:8189/udp"` sous `ports:`.

## Publier depuis OBS (WHIP) {#publishing-from-obs-whip}

Dans OBS 30 ou plus récent, **Paramètres → Stream** :

- **Service :** WHIP
- **Serveur :** `https://tv.example.com/whip/main-show` (le nom de votre chaîne)
- **Bearer Token :** la clé de diffusion `sk_…` de la chaîne

Le tableau de bord les affiche pour chaque chaîne : **Channels → Encoder settings → WHIP**. Dans **Sortie**, réglez l'intervalle d'images clés sur 1 ou 2 secondes et désactivez les images B (les spectateurs WebRTC ne peuvent pas les afficher dans l'ordre).

OBS envoie l'audio en Opus par WHIP ; Unda le convertit en AAC pour tout le reste, en le gardant calé sur l'image (mesuré à moins de 2 ms sur plusieurs minutes).

Avec FFmpeg :

```bash
ffmpeg -re -i input.mp4 -c:v libx264 -tune zerolatency -bf 0 -g 50 \
       -c:a libopus -b:a 96k -ar 48000 -ac 2 \
       -f whip -authorization sk_VOTRECLE https://tv.example.com/whip/main-show
```

Les clés de diffusion fonctionnent exactement comme en RTMP : une mauvaise clé est refusée, une chaîne avec des sources de secours accepte sa clé de secours à la même adresse, et un flux déjà en direct est refusé, sauf si `rtmp.publish_policy` vaut `replace`.

## Regarder (WHEP) {#watching-whep}

- **La page de lecture :** `https://tv.example.com/watch/main-show` a un interrupteur **Low latency** ; le choix est mémorisé. Un lien qui se termine par `?ll=1` s'ouvre en faible délai. Si le réseau du spectateur ne parvient pas à se connecter, la page revient d'elle-même au lecteur standard.
- **Autres lecteurs :** l'adresse WHEP est `https://tv.example.com/webrtc/main-show`. Pour un [flux protégé](./protect-playback), le lecteur envoie le jeton du lien comme jeton Bearer (`Authorization: Bearer JETON`).

L'onglet **Output** du flux liste les deux adresses.

Les spectateurs entendent le son quand le FFmpeg du serveur a l'encodeur Opus (libopus ; le paquet FFmpeg d'Ubuntu l'a). **Server → Encoders** indique quand il manque. Un seul convertisseur par flux sert tous ses spectateurs.

## Réseaux qui bloquent l'UDP : un relais TURN {#networks-that-block-udp-a-turn-relay}

La plupart des spectateurs se connectent directement au serveur. Sur les réseaux qui bloquent l'UDP (certains bureaux, hôtels, opérateurs mobiles), WebRTC a besoin d'un relais TURN. Unda fonctionne avec [coturn](https://github.com/coturn/coturn) ; donnez à coturn un secret partagé et indiquez le même à Unda, et chaque lecteur reçoit ses propres identifiants, valables une journée :

```yaml
webrtc:
  ice_servers:
    - urls: ["turn:turn.example.com:3478?transport=udp", "turns:turn.example.com:443?transport=tcp"]
  turn_secret_env: UNDA_TURN_SECRET   # ou turn_secret_file: /run/secrets/turn
```

```ini
# /etc/turnserver.conf
use-auth-secret
static-auth-secret=LE-MEME-SECRET
realm=turn.example.com

# Relayer vers le serveur Unda seulement. Toute personne autorisée à regarder
# reçoit des identifiants TURN (n'importe qui, sur un flux public) : sans ces
# lignes, le relais porterait son trafic vers n'importe quelle adresse.
no-multicast-peers
denied-peer-ip=0.0.0.0-255.255.255.255
denied-peer-ip=::-ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff
allowed-peer-ip=203.0.113.10   # l'adresse qu'Unda donne aux lecteurs : ses public_ips, ou la sienne
```

coturn traite une adresse à la fois autorisée et refusée comme autorisée : il relaie donc vers cette seule adresse et nulle part ailleurs.

Un compte TURN fixe fonctionne aussi : `username` et `credential` (ou `credential_env` / `credential_file`) dans l'entrée du serveur. Les identifiants ne sont donnés qu'aux lecteurs autorisés à lire.

## Bon à savoir {#good-to-know}

- **Images B :** les lecteurs WebRTC affichent les images dans l'ordre où elles arrivent ; avec des images B, certaines images s'affichent donc avant d'autres qui viennent plus tôt (vu dans Chrome avec les images B par défaut de x264 ; dans l'ordre sans images B). L'onglet Output du flux le signale quand un flux en contient, tout comme son onglet Overview pendant que l'aperçu tourne en Low latency ; réglez les images B sur 0 dans l'encodeur (options x264 d'OBS `bframes=0`, ou « Max B-frames » à 0 avec NVENC). Les chaînes qu'Unda encode lui-même (chaînes 24h/24, et sources de secours en mode Seamless) n'en ont pas quand WebRTC est actif.
- **Arrivée :** un nouveau spectateur commence aussitôt à l'image en direct, pas à la dernière image clé.
- **Limites :** `webrtc.max_viewers` (500), `max_publishers` (64) et `max_audio_streams` (16 flux dont le son est converti en même temps). Pour les grands publics, HLS coûte moins : chaque spectateur WebRTC reçoit sa propre copie chiffrée. `limits.max_conns_per_ip` limite aussi les sessions WebRTC qu'une même adresse peut ouvrir (la suivante reçoit 429).
- **Les spectateurs** sont comptés dans le tableau de bord et listés dans **Sessions** comme WebRTC.
- **Non pris en charge :** la vidéo VP8, VP9 et AV1 ; le simulcast ; les redémarrages ICE ; WebRTC en TCP sans relais TURN.
