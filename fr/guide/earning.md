---
title: "Gagner de l'argent avec votre propre serveur de diffusion"
description: "Comment les clients gagnent de l'argent avec Unda Media Server : diffuser les événements de leurs clients, des événements payants et à la séance, leur propre chaîne de télévision, et l'hébergement pour d'autres."
---

# Gagner de l'argent avec Unda

Unda ne fait pas payer vos spectateurs lui-même : il n'a pas de page de paiement et n'insère pas de publicité. Vous gagnez de l'argent en vendant un service construit dessus. Voici comment les clients l'utilisent aujourd'hui, avec les parties d'Unda sur lesquelles chaque usage repose.

## Diffuser les événements de vos clients {#streaming-events-for-clients}

Églises, mariages, funérailles, remises de diplômes, conférences, concerts : beaucoup d'organisations veulent mettre leur événement en ligne et n'ont personne pour le faire. Une équipe de production ou un diffuseur indépendant facture à l'événement, ou au mois pour un culte hebdomadaire.

Ce qu'Unda vous donne à vendre :

- **La page de lecture du client** (`/watch/<nom>`), à partager ou à intégrer à son site, et pas seulement un lien Facebook ou YouTube ([Regarder et intégrer](/fr/guide/watching)).
- **Toutes les plateformes à la fois** : le même flux vers YouTube, Facebook et d'autres ([Rediffusion](/fr/guide/restreaming)).
- **L'enregistrement**, prêt à remettre après l'événement ([Enregistrement](/fr/guide/recording)).
- **Un encodeur de secours**, pour que le flux reste à l'antenne si le principal tombe ([Encodeur de secours](/fr/guide/backup-encoder)), ou, derrière lui, la récupération du propre lien du client et une playlist de ses vidéos ([Entrées de chaîne](/fr/guide/channel-inputs)).
- **Des chiffres d'audience** à remettre : combien ont regardé, d'où et combien de temps ([Sessions des spectateurs](/fr/guide/monitoring#viewer-sessions)).

Un seul serveur sert de nombreux clients : donnez à chacun une chaîne avec sa propre clé ([Comptes et chaînes](/fr/guide/accounts#channels)).

## Événements payants et à la séance {#ticketed-and-pay-per-view-events}

Vendez des billets pour un concert, un match, une conférence ou un cours payant, et ne laissez regarder que les acheteurs.

Unda fournit le verrou : avec les [liens de lecture signés](/fr/guide/protect-playback), un flux ne se lit qu'avec un lien que vous créez. Chaque lien a une date limite pour commencer à regarder et un nombre maximal d'appareils qui peuvent l'utiliser en même temps : un lien qui circule cesse d'être utile.

Votre site fournit la caisse : il encaisse le paiement (Paystack, Flutterwave, Stripe ou tout autre), puis crée un lien pour cet acheteur et l'affiche ou l'envoie par e-mail. [Créer les liens sur votre propre site](/fr/guide/protect-playback#make-links-on-your-own-website) donne le code, quelques lignes en PHP, en Node.js ou en Python, pour votre développeur web.

## Votre propre chaîne de télévision sur Internet {#your-own-internet-tv-channel}

Faites tourner une chaîne à l'antenne toute la journée : vos programmes passent selon une grille, les émissions en direct prennent la main quand elles commencent, et la grille reprend quand elles se terminent ([Chaînes 24h/24](/fr/guide/playout)). Les spectateurs sur données mobiles reçoivent une qualité que leur connexion peut porter ([Débit adaptatif](/fr/guide/transcoding)).

Les revenus viennent des sponsors et des annonceurs (avec leurs spots montés dans vos programmes), d'abonnements payants grâce aux liens signés comme ci-dessus, ou de la reprise de la chaîne sur d'autres plateformes par la rediffusion. Unda n'insère pas de coupures publicitaires par lui-même.

## Héberger les flux d'autres organisations {#hosting-streams-for-other-organisations}

Faites tourner un serveur Unda et louez de la diffusion à des organisations plus petites (églises, écoles, radios, associations) contre un abonnement mensuel. Elles diffusent depuis leur propre OBS ou vMix ; vous faites tourner le serveur.

- **Un compte pour chaque client** avec le rôle de diffuseur : il voit ses propres chaînes et rien d'autre, dans le tableau de bord comme dans l'API ([Rôles](/fr/guide/accounts#roles)).
- **Une limite de chaînes par client**, fixée quand vous l'invitez.
- **La consommation de chaque client pour la facturation** : la page **Sessions** additionne le temps de visionnage, les spectateurs et le trafic par flux sur le dernier jour, la dernière semaine ou le dernier mois, et son onglet **History** télécharge chaque session dans un fichier CSV ([Sessions des spectateurs](/fr/guide/monitoring#viewer-sessions)).

::: warning Vérifiez d'abord votre licence
Héberger les flux d'autres organisations n'est pas la même chose que faire tourner Unda pour vous-même. Avant de vendre ce service, demandez à votre fournisseur si votre licence le permet et combien de flux en direct elle couvre.
:::

## Ce qu'Unda ne fait pas {#what-unda-does-not-do}

Pour que vous puissiez vous organiser :

- **Pas de paiements.** Billets, abonnements et factures sont gérés par votre propre site ou votre système de facturation.
- **Pas d'insertion publicitaire à lui.** Les publicités font partie du programme que vous diffusez. Pour un insérateur publicitaire chez une tête de réseau ou un opérateur TV, Unda peut annoncer vos coupures avec des repères SCTE 35 ([Coupures publicitaires](/fr/guide/restreaming#ad-breaks-scte-35)).
- **Pas de bibliothèque publique de rattrapage.** Les enregistrements sont pour votre équipe, dans le tableau de bord ; pour les publier, téléchargez-les et mettez-les en ligne là où vos spectateurs regardent.
