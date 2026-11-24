---
title: Combien de spectateurs un serveur peut-il porter ?
description: "Le nombre de spectateurs est une affaire d'arithmétique sur l'envoi de votre serveur, pas de puissance de processeur. Comment le calculer, ce que changent la rediffusion et le débit adaptatif, ce qu'il faut vérifier."
date: "2026-10-06"
---

# Combien de spectateurs un serveur peut-il porter ?

*6 octobre 2026 · UndaMedia*

C'est la première question de presque toutes nos conversations : « Combien de personnes peuvent regarder ? » La réponse dépend moins du serveur qu'on ne le croit, et davantage d'un chiffre de l'offre d'hébergement : **la vitesse d'envoi**.

## Chaque spectateur reçoit sa propre copie {#every-viewer-gets-their-own-copy}

Sur Internet, un serveur envoie à chaque spectateur sa propre copie du flux. Un flux à 3 Mb/s regardé par 100 personnes signifie 300 Mb/s qui sortent du serveur. Le calcul est donc simple :

> spectateurs ≈ vitesse d'envoi × 0,8 ÷ débit du flux

Le 0,8 garde 20 % de marge, parce que les connexions ne sont jamais parfaitement stables.

| Envoi du serveur | Spectateurs à 3 Mb/s | Spectateurs à 5 Mb/s |
|---|---|---|
| 100 Mbit/s | environ 25 | environ 15 |
| 1 Gbit/s | environ 250 | environ 150 |
| 10 Gbit/s | environ 2 500 | environ 1 500 |

## Le processeur est rarement la limite {#the-processor-is-rarely-the-limit}

Transmettre un flux, c'est copier, pas convertir. Sur une machine de test, Unda a servi 200 spectateurs simulés d'un flux 1080p à 5 Mb/s, environ 1 Gb/s au total, en utilisant à peu près un quart d'un cœur de processeur, sans aucun arrêt sur image.

Un serveur plus puissant sur la même connexion ne sert pas plus de spectateurs. La puissance du processeur compte pour le travail qui convertit la vidéo : fabriquer plusieurs qualités, les chaînes 24h/24 et les encodeurs de secours. C'est un calcul à part ; voir [jusqu'où va un serveur](/fr/guide/compatibility#how-far-one-server-goes).

## Ce qui change le calcul {#what-changes-the-sum}

- **La rediffusion utilise le même envoi.** Chaque destination, comme YouTube ou Facebook, coûte autant qu'un spectateur à son débit. Une fois le flux arrivé, ces plateformes servent leurs propres spectateurs.
- **Le débit adaptatif permet d'en faire tenir davantage.** Les spectateurs sur des connexions lentes prennent une qualité plus petite : le débit moyen par spectateur baisse. Cela permet aussi à ces spectateurs de continuer à regarder au lieu de charger sans cesse.
- **Le débit lui-même.** Du 720p à 2,5 Mb/s rend bien sur la plupart des téléphones et des ordinateurs portables, et sert deux fois plus de spectateurs que du 1080p à 5 Mb/s.

## Vérifiez aussi le volume mensuel {#check-the-monthly-allowance-too}

Beaucoup d'offres d'hébergement annoncent un port rapide mais comprennent un volume de transfert mensuel. Le streaming l'épuise vite : un spectateur qui regarde un flux à 3 Mb/s pendant deux heures reçoit environ 2,7 Go. Un culte de deux heures regardé par 100 personnes représente environ 270 Go. Chaque semaine, cela fait plus d'un téraoctet par mois. Vérifiez le volume de l'offre et ce qu'elle facture au-delà.

## Quand la liaison montante est pleine {#when-the-uplink-is-full}

Quand il vient plus de monde que l'envoi ne peut en porter, l'image de tout le monde se dégrade en même temps. Unda vous permet plutôt de fixer un plafond à la bande passante sortante : une fois atteint, les nouveaux spectateurs sont invités à réessayer plus tard, tandis que tous ceux qui regardent déjà gardent une image fluide. Avec un plafond fixé, le tableau de bord montre la place qui reste sous la forme « room for about N more viewers », calculée d'après le trafic réel.

## Au-delà d'un serveur {#bigger-than-one-server}

Pour des publics qui dépassent ce qu'une connexion peut porter, les réponses habituelles sont un réseau de diffusion de contenu (CDN) devant le serveur, ou la rediffusion de la grande partie publique du public vers YouTube ou Facebook pendant que vos propres lecteurs servent les membres ou les spectateurs payants.

Si vous préparez un événement et voulez un second avis sur les chiffres, [envoyez-nous les détails](/fr/contact).

---

[← Tous les articles](/fr/blog/) · Voir aussi : [Débit adaptatif](/fr/features/adaptive-bitrate) · [Rediffusion](/fr/features/restreaming)
