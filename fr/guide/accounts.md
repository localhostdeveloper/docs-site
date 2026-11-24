---
title: "Comptes, rôles et chaînes"
description: "Les rôles, les invitations, la connexion en deux étapes, les chaînes et les clés de diffusion, les clés d'API et le journal d'audit d'Unda Media Server, et que faire si vous êtes bloqué."
---

# Comptes et chaînes

## Rôles {#roles}

Unda fonctionne sur invitation uniquement. Le premier compte, le **propriétaire**, est créé avec le lien de configuration à usage unique affiché au premier démarrage du serveur. Toutes les autres personnes sont invitées depuis **Users**.

| Rôle | Peut |
|---|---|
| **Owner** (propriétaire) | Tout, y compris la licence et l'accès d'assistance du fournisseur |
| **Admin** (administrateur) | Les utilisateurs (sauf les propriétaires), les réglages de sécurité, les clés d'API, le journal d'audit, et tout ce que peut un opérateur |
| **Operator** (opérateur) | Tous les flux : arrêter, enregistrer, rediffuser, débit adaptatif, entrées UDP, la page Server et les métriques |
| **Streamer** (diffuseur) | Seulement ses propres chaînes, y compris ses propres [chaînes 24h/24](/fr/guide/playout#channels-for-your-clients) et ses fichiers, et le [débit adaptatif](/fr/guide/transcoding#choosing-the-qualities-yourself) pour celles-ci. Les autres flux n'existent pas pour lui, ni dans le tableau de bord ni dans l'API |

## Inviter des personnes {#inviting-people}

**Users → Invite someone** : choisissez le rôle (et, pour un diffuseur, combien de chaînes il peut créer). Unda affiche un lien d'invitation, valable 72 heures et utilisable une fois. Envoyez-le comme vous voulez ; Unda n'envoie aucun e-mail. La personne invitée choisit son propre mot de passe en l'ouvrant.

[![Users : inviter quelqu'un, et pour chaque personne son rôle, sa connexion en deux étapes et sa dernière connexion](/screens/users.webp)](/screens/users.webp)

## Se connecter {#signing-in}

- Les mots de passe font au moins 10 caractères. Cinq essais erronés depuis une même adresse bloquent cette adresse pour ce compte pendant 15 minutes (plus longtemps à chaque nouvelle fois, jusqu'à une journée). Le compte fonctionne toujours depuis partout ailleurs : personne ne peut vous bloquer en connaissant simplement votre e-mail. Chaque blocage apparaît dans le journal des événements et, avec le nom du compte, dans le journal d'audit. Dans **Users**, un tel compte indique combien d'adresses sont bloquées, et **Unlock** lève les blocages aussitôt.
- Une session dure 12 heures sans utilisation, et 7 jours au plus.
- Les mots de passe ne sont acceptés qu'en HTTPS (ou sur le serveur lui-même).

## Connexion en deux étapes {#two-factor-sign-in}

Chaque personne peut activer la connexion en deux étapes dans **Account** (l'équipe : **Server → Account**) avec n'importe quelle application d'authentification (Google Authenticator, Microsoft Authenticator, 1Password, Authy…) : scannez le QR code affiché avec l'application, ou saisissez la clé affichée en dessous, puis entrez le code à 6 chiffres que donne l'application. Elle reçoit aussi 10 codes de secours à usage unique : gardez-les en lieu sûr.

[![Activer la connexion en deux étapes : un QR code à scanner, la clé à saisir à la place, et le code à entrer](/screens/totp.webp)](/screens/totp.webp)

Un administrateur peut **exiger** la connexion en deux étapes pour certains rôles dans **Users → Security** ; seul le propriétaire peut l'exiger pour les propriétaires. Une personne qui perd son téléphone et ses codes peut être réinitialisée par un administrateur (**Users → Reset 2FA**), ou depuis le terminal du serveur (plus bas).

## Chaînes {#channels}

Une chaîne est un **nom** public et une **clé de diffusion** secrète.

- Le **nom** (lettres minuscules, chiffres et tirets, par exemple `main-show`) figure dans toutes les adresses de lecture : `/watch/main-show`.
- La **clé** (`sk_…`) est ce que l'encodeur utilise pour passer en direct. Traitez-la comme un mot de passe. **Encoder settings** l'affiche avec l'adresse du serveur ; **Copy** la copie sans l'afficher.
- **New stream key** (le menu **⋯** de la chaîne) remplace la clé aussitôt ; un flux qui utilise l'ancienne est déconnecté. Utilisez-le dès qu'une clé a pu fuiter.
- **Change owner** (administrateurs, dans le même menu) donne une chaîne à un autre client, ou à la maison. Ses clés restent les mêmes : un encodeur en direct continue ; le nouveau propriétaire voit la chaîne aussitôt et l'ancien ne la voit plus.
- **Supprimer** une chaîne déconnecte son direct et supprime ses entrées, son guide des programmes et ses propres fichiers médias.

Les diffuseurs créent leurs propres chaînes, jusqu'à leur limite ; les opérateurs et au-dessus peuvent créer des chaînes pour n'importe qui. Les [chaînes 24h/24](/fr/guide/playout#channels-for-your-clients) d'un diffuseur comptent dans la même limite.

[![Channels : chaque chaîne, si elle est en direct, son propriétaire, ses spectateurs et son temps d'antenne, et ses boutons Inputs et Encoder settings](/screens/channels.webp)](/screens/channels.webp)

## Clés d'API {#api-keys}

Pour les scripts et la surveillance, **Server → API keys** crée une clé (`gsk_…`) avec un rôle. Envoyez-la sous la forme `Authorization: Bearer gsk_…`. Elle n'est affichée qu'une fois ; révoquez-la quand elle ne sert plus. Voir l'[API REST](/reference/api) (en anglais).

Un client qui veut les chiffres d'audience de sa chaîne sur son propre site ou dans son application n'a pas besoin de clé : créez pour la chaîne un lien de chiffres dans son onglet **Viewers** et donnez-le-lui. Voir [Les chiffres d'audience de chaque chaîne](/fr/guide/monitoring#the-figures-in-a-website-or-app).

Comme les mots de passe, les clés ne sont acceptées qu'en HTTPS (ou depuis le serveur lui-même) : en HTTP simple depuis une autre machine, le serveur répond 403 `https_required` sans vérifier la clé. Un réseau de studio fermé sans HTTPS peut régler `auth.allow_insecure_login: true`.

## Journal d'audit {#audit-log}

Les actions sur les comptes, les clés, les chaînes, la licence et l'accès d'assistance sont enregistrées dans **Audit log** (administrateurs) et conservées un an.

## Bloqué : le terminal du serveur {#locked-out-the-servers-shell}

Toute personne qui peut se connecter au serveur peut récupérer les comptes. Lancez ces commandes en tant qu'utilisateur `unda` ; les mots de passe sont demandés, jamais tapés sur la ligne de commande.

```bash
sudo -u unda unda admin -config /etc/unda/unda.yaml list-users
sudo -u unda unda admin -config /etc/unda/unda.yaml create-user vous@example.com owner "Votre Nom"
sudo -u unda unda admin -config /etc/unda/unda.yaml reset-password vous@example.com
sudo -u unda unda admin -config /etc/unda/unda.yaml unlock vous@example.com
sudo -u unda unda admin -config /etc/unda/unda.yaml disable-2fa vous@example.com
```

Avec Docker, utilisez `docker compose exec unda unda admin -config /etc/unda/unda.yaml …`.
