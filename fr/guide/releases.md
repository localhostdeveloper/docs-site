---
title: "Versions, mises à jour et assistance"
description: "À quel rythme Unda Media Server sort de nouvelles versions, ce que signifiera la version 1.0, quelles versions reçoivent des corrections, comment fonctionnent les mises à jour et les licences, et comment joindre l'assistance."
---

# Versions et assistance

Comment Unda sort ses versions, ce que signifiera la version 1.0, comment fonctionnent les mises à jour, et comment joindre l'assistance.

## À quel rythme {#how-often}

- **Une version de fonctionnalités chaque mois.** Les nouveautés sont rassemblées et sortent ensemble, avec leurs [notes de version](/release-notes) (en anglais).
- **Des versions correctives entre-temps, si besoin.** Elles corrigent seulement des défauts, sans rien ajouter : vous pouvez donc les installer tout de suite.
- **Les correctifs de sécurité dès qu'ils sont prêts**, quelle que soit la date. Pour signaler un problème de sécurité, voir la page [Security](/security) (en anglais).

Chaque serveur vérifie s'il existe de nouvelles versions et l'indique à ses administrateurs et propriétaires dans **Overview → Other notices**.

## Version 1.0 {#version-10}

Unda en est à la version 0.x. Il passera en 1.0 quand ces trois conditions seront réunies :

1. Une chaîne 24h/24 a tourné 72 heures sans interruption, avec une mémoire stable.
2. Unda a tourné 30 jours en production chez un client sans défaut critique.
3. Ensuite, deux semaines de corrections seulement : aucune nouvelle fonctionnalité.

Nous prévoyons la 1.0 en décembre 2026. Les fonctionnalités ajoutées d'ici là sortent d'abord dans des versions 0.x.

## Quelles versions reçoivent des corrections {#which-versions-get-fixes}

Jusqu'à la 1.0, les corrections vont dans la version suivante : passez à la version la plus récente pour les obtenir. Une version qui a un défaut sérieux peut être retirée du téléchargement ; ses notes de version l'indiquent alors, avec la version à installer à la place.

Après la 1.0, une branche stable recevra seulement des corrections, pendant une durée annoncée avec la 1.0 : vous pourrez y rester pendant que les nouveautés arrivent dans les versions suivantes.

## Assistance {#support}

Par e-mail à [support@undamedia.com](mailto:support@undamedia.com), du lundi au vendredi, de 9 h à 19 h GMT. Avec les offres Broadcast et sur mesure, un problème grave qui demande une intervention immédiate, comme une chaîne hors antenne, est pris en charge jusqu'à 22 h GMT ces jours-là. Voir les [Offres](/fr/packages).

## Mettre à jour {#upgrading}

- **Installé avec le script d'installation :** relancez la commande d'installation. Elle sauvegarde d'abord la base de données et garde votre configuration et vos données.
- **Docker :** changez l'étiquette de l'image pour la nouvelle version et téléchargez-la.
- **Chaque mise à jour commence par une copie de la base de données,** faite par le serveur lui-même avant tout changement ; le retour en arrière est décrit dans [Sauvegardes et mises à jour](/fr/guide/install#8-backups-and-upgrades).
- Une version plus ancienne refuse une base de données qu'une version plus récente a modifiée : pour revenir en arrière, restaurez la copie faite avant la mise à jour.

## Licences {#licences}

Une licence continue de fonctionner quand vous mettez à jour. Les licences émises ou renouvelées à partir du 26 octobre 2026 demandent Unda v0.1.46 ou plus récent. Voir [Licence](/fr/guide/license).
