---
title: Rester à l'antenne quand l'encodeur tombe
description: "Les encodeurs plantent, les câbles se débranchent et l'Internet du lieu décroche. Comment préparer un direct qui ne s'éteint pas, de la connexion à l'encodeur de secours."
date: "2026-10-06"
---

# Rester à l'antenne quand l'encodeur tombe

*6 octobre 2026 · UndaMedia*

Chaque équipe de direct a son histoire : l'ordinateur portable qui s'est mis à jour en plein culte, le Wi-Fi du lieu qui s'est effondré à l'arrivée des invités, le câble dans lequel quelqu'un s'est pris les pieds. Sur une plateforme, le flux s'arrête simplement, les spectateurs voient une erreur, et quand vous vous reconnectez, certains ne reviennent jamais.

La bonne nouvelle, c'est que la plupart des pannes peuvent être anticipées. Voici comment nous y pensons, des mesures les moins chères aux plus complètes.

## 1. Donnez à l'encodeur une connexion solide {#1-give-the-encoder-a-solid-connection}

La plupart des problèmes de direct commencent avec l'Internet du lieu.

- **Utilisez un câble, pas le Wi-Fi**, partout où c'est possible.
- **Testez l'envoi sur l'ordinateur de diffusion avant l'événement**, à l'heure où vous diffuserez. Il doit tenir de façon stable environ une fois et demie votre débit vidéo : une vidéo à 5 Mb/s demande 7 à 8 Mb/s d'envoi qui ne faiblit pas.
- **Surveillez le compteur d'images perdues de l'encodeur** pendant la diffusion. S'il augmente, baissez le débit avant que les spectateurs ne le remarquent.

## 2. Utilisez SRT sur les connexions incertaines {#2-use-srt-on-uncertain-connections}

RTMP, la façon habituelle d'envoyer depuis OBS, cale quand des paquets sont perdus. SRT récupère les paquets perdus en les redemandant, à condition que son réglage de latence lui en laisse le temps : réglez la latence nettement au-dessus de l'aller-retour de la connexion. Dans nos tests, SRT a porté un flux à travers 5 % de pertes de paquets dans chaque sens sans une seule image manquante. Voir [SRT](/fr/guide/srt).

## 3. Ayez un second encodeur prêt {#3-have-a-second-encoder-ready}

La mesure qui couvre le plus de cas : un encodeur de secours qui envoie le même événement par une **autre connexion**, par exemple un second ordinateur ou un encodeur matériel sur un routeur 4G pendant que le principal utilise la ligne du lieu.

Avec les [sources de secours](/fr/features/backup-encoder) activées, Unda montre l'encodeur principal tant qu'il fonctionne et bascule sur le secours quand ce n'est plus le cas. Avec les réglages par défaut, voici ce que voient les spectateurs (nous avons mesuré les bascules avec deux encodeurs, un spectateur et une destination de rediffusion en marche) :

| Ce qui arrive | Ce que voient les spectateurs |
|---|---|
| L'encodeur principal se déconnecte | Le secours, au bout d'une seconde environ |
| Le principal se fige (connecté, sans image) | La dernière image pendant 2 secondes, puis le secours |
| Le principal revient | Le principal de nouveau, une fois stable pendant 10 secondes |
| Les deux ont disparu | Une mire (du noir, ou votre propre vidéo en boucle) |

Les spectateurs ne rechargent rien, et YouTube ou Facebook restent connectés tout du long, parce que pour eux le flux ne s'est jamais arrêté. Les délais de bascule sont des réglages, et un opérateur peut aussi mettre le secours à l'antenne à la main, par exemple quand le principal a un mauvais son que le serveur ne peut pas détecter.

## 4. Gardez une mire prête {#4-keep-a-slate-ready}

Quand rien n'est en direct, une mire avec votre logo et « Nous revenons tout de suite » fait patienter les spectateurs au lieu de les faire partir. Dans Unda, ce peut être n'importe quelle vidéo de votre médiathèque, en boucle.

## 5. Enregistrez sur le serveur {#5-record-on-the-server}

Enregistrez sur le serveur aussi bien que sur place. Si l'enregistrement sur place échoue, vous avez toujours ce que les spectateurs ont vu ; si l'Internet du lieu tombe, l'enregistrement sur place couvre le trou. Voir [Enregistrement](/fr/features/recording).

## 6. Répétez la panne {#6-rehearse-the-failure}

La seule façon de faire confiance à un secours est de le voir fonctionner. Pendant la répétition, débranchez le câble réseau de l'encodeur principal et vérifiez que les spectateurs voient le secours, puis rebranchez-le et vérifiez que le principal revient. Cela prend deux minutes et transforme un plan en habitude.

## Ce que cela ne couvre pas {#what-it-doesnt-cover}

Un encodeur de secours protège contre la panne de l'encodeur ou de sa connexion, pas contre la panne du serveur lui-même. Et comme le serveur réencode le flux pour rendre les bascules invisibles, chaque flux avec des secours utilise environ 60 % d'un cœur de processeur en 720p : dimensionnez le serveur en conséquence.

Vous préparez un événement qui ne doit pas s'éteindre ? [Parlez-nous-en](/fr/contact).

---

[← Tous les articles](/fr/blog/) · Voir aussi : [Encodeur de secours](/fr/features/backup-encoder) · [Surveillance et alertes](/fr/features/monitoring)
