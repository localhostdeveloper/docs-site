---
title: "Encodeur de secours pour les flux en direct"
description: "Mettez en place un encodeur de secours pour qu'un direct reste à l'antenne quand l'encodeur principal ou l'Internet du lieu tombe, et revienne au principal quand il est de retour."
---

# Encodeur de secours

Quand l'encodeur d'un direct tombe (OBS plante, l'Internet du lieu coupe), le flux s'arrête normalement : les spectateurs le voient s'interrompre et les destinations de rediffusion comme YouTube se déconnectent. Avec un **encodeur de secours**, un second encodeur prend le relais quand le principal s'arrête, et le principal reprend la main quand il revient.

L'encodeur de secours fait partie de l'entrée **live stream** d'une chaîne. Une chaîne peut aussi se replier sur un flux récupéré (un lien qu'Unda va chercher) et sur une playlist de vos vidéos, dans l'ordre de votre choix : voir [Entrées de chaîne](/fr/guide/channel-inputs).

## L'activer {#switch-it-on}

1. Sur la page **Channels**, cliquez sur **Inputs** à côté de la chaîne (elle n'a pas besoin d'être en direct).
2. Activez **Use this channel's inputs in order**. Le direct est la première entrée, sauf si vous le déplacez.

Si le flux est en direct à ce moment-là, son encodeur est déconnecté une fois et se reconnecte de lui-même (OBS et vMix le font automatiquement).

La chaîne a maintenant deux clés :

| Clé | Pour |
| --- | --- |
| La clé de la chaîne (inchangée) | L'encodeur **principal** |
| La **clé de secours** (nouvelle) | Un encodeur **de secours** |

Le propriétaire de la chaîne trouve la clé de secours dans les **Encoder settings** de la chaîne (page **Channels**) et dans l'onglet **Input** (**Show**).

## Préparer l'encodeur de secours {#set-up-the-backup-encoder}

Utilisez un second OBS ou vMix, idéalement sur une autre machine avec une autre connexion Internet, avec la clé de secours :

- **Serveur :** `rtmp://tv.example.com:1935/live` (le même que le principal)
- **Clé de stream :** la clé de secours de la chaîne

Ou en SRT : `srt://tv.example.com:6000?streamid=publish:CLE-DE-SECOURS`.

Les deux encodeurs peuvent diffuser en même temps : le secours attend, prêt, et ne coûte rien aux spectateurs.

**Donnez aux deux encodeurs les mêmes réglages** (résolution, fréquence d'images, profil d'encodage, fréquence d'échantillonnage et canaux audio). Avec la bascule directe, le réglage par défaut, Unda passe alors de l'un à l'autre sans que les spectateurs le remarquent ; des encodeurs réglés différemment font redémarrer le flux un instant à chaque bascule. Avec la bascule sans coupure (un choix d'opérateur, qui réencode la chaîne), les deux peuvent différer. Voir [Bascule directe ou sans coupure](/fr/guide/channel-inputs#direct-or-seamless-switching).

## Ce que voient les spectateurs {#what-viewers-see}

| Moment | Les spectateurs voient |
| --- | --- |
| L'encodeur principal se déconnecte | Le secours, en une seconde environ |
| L'encodeur principal se fige (connecté, sans image) | La dernière image pendant 2 secondes (votre réglage), puis le secours |
| Le principal revient | Le principal de nouveau, une fois qu'il a envoyé des images régulières pendant 10 secondes (votre réglage) |
| Aucun des deux n'est en direct | L'entrée suivante de la chaîne (un flux récupéré ou une playlist), ou la fin du flux |

Voir [Entrées de chaîne](/fr/guide/channel-inputs) pour les réglages, qui peut modifier quoi, et la licence.

## Limites {#limits}

- Un encodeur de secours protège contre la panne d'un encodeur ou de sa connexion, pas contre la panne de ce serveur.
- Les encodeurs de secours sont pour les chaînes créées sur la page **Channels**. Les chaînes 24h/24 tirées d'une grille ont leur propre entrée en direct (voir [Chaînes 24h/24](/fr/guide/playout)).
- Regarder directement l'entrée principale ou de secours (`/watch/main-show.main`) demande un [lien signé](/fr/guide/protect-playback). Les spectateurs regardent la chaîne elle-même.
