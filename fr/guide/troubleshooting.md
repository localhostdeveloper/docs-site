---
title: "Dépannage des flux et des spectateurs"
description: "Solutions pour les flux et les spectateurs : mise en mémoire tampon et démarrages lents, un direct affiché hors ligne, erreurs de connexion et reconnexions d'OBS, une image figée, et un lien d'assistance que votre fournisseur ne peut pas ouvrir."
---

# Dépannage

Les problèmes d'installation, de HTTPS, de ports et de connexion sont dans le [tableau de dépannage du guide d'installation](/fr/guide/install#11-troubleshooting). Cette page traite des flux, des spectateurs et de l'accès d'assistance.

## Les spectateurs chargent ou démarrent lentement {#viewers-buffer-or-start-slowly}

1. **Vérifiez l'intervalle d'images clés.** Sur la page du flux, la carte Health l'affiche ; le tableau de bord lève aussi une alerte. Il doit être de **2 s**. Dans OBS : *Paramètres → Sortie → Streaming → Intervalle d'images clés : 2*. Avec le réglage « auto » d'OBS (environ 8 s), les spectateurs attendent jusqu'à 8 s avant le démarrage, et l'image peut se figer juste après.
2. **Vérifiez l'envoi de l'encodeur.** Des alertes ou des événements qui disent *« no media received »*, *« bitrate low »* ou *« reconnected after N s offline »* signifient que la connexion de l'encodeur ne suit pas. Baissez le débit, utilisez un câble ou passez en [SRT](/fr/guide/srt).
3. **Vérifiez les connexions des spectateurs.** Sur la page de lecture, l'encadré en haut à droite montre la vitesse de connexion et la mémoire tampon de chaque spectateur. Si elle est inférieure au débit du flux, ce spectateur chargera : activez le [débit adaptatif](/fr/guide/transcoding) pour qu'il reçoive une qualité plus basse à la place.
4. **Vérifiez l'envoi du serveur.** Dans **Overview**, un trafic sortant proche de la vitesse de connexion du serveur signifie que le serveur est plein. Réglez `limits.max_egress_mbps` pour que les nouveaux spectateurs soient refusés au lieu que tout le monde ralentisse.

## Le flux est en direct mais la page dit « Stream is offline » {#the-stream-is-live-but-the-page-says-stream-is-offline}

- L'adresse doit utiliser le **nom** de la chaîne, pas sa clé : `/watch/main-show`, pas `/watch/sk_…`.
- Le lecteur réessaie de lui-même ; laissez-lui 10 secondes après le début du flux.

## OBS dit « Failed to connect » ou s'arrête aussitôt {#obs-says-failed-to-connect-or-stops-immediately}

- Le serveur doit être `rtmp://votre-serveur:1935/live` et la clé la clé `sk_…` de la chaîne, copiée à nouveau depuis **Channels → Encoder settings** (elle change quand quelqu'un utilise **New stream key**).
- Quelqu'un d'autre est déjà en direct sur cette chaîne : un seul encodeur à la fois.
- La limite de flux de la licence est atteinte (Events l'indique).
- Le port 1935 (TCP) doit être ouvert dans le pare-feu du serveur.

## OBS se reconnecte sans cesse {#obs-keeps-reconnecting}

Events affiche *« stopped publishing (connection closed) »* et *« reconnected »* encore et encore. La connexion Internet de l'encodeur décroche. Les lecteurs des spectateurs reprennent d'eux-mêmes, mais chaque coupure laisse un trou dans l'image. Baissez le débit ou utilisez SRT, qui encaisse les courtes pertes.

## L'image se fige mais le son continue (ou l'inverse) {#the-picture-freezes-but-the-sound-continues-or-the-other-way-round}

- Regardez l'**A/V drift** de la carte Health : une valeur élevée signifie que l'encodeur envoie le son et l'image décalés. Redémarrez la source audio de l'encodeur.
- Dépliez la ligne du flux dans **Streams** pour voir ses lecteurs. Les **Dropped frames** y sont des images qu'un lecteur n'a pas pu prendre à temps : sur un seul spectateur, sa connexion est trop lente ; sur le packager HLS ou sur tous les lecteurs à la fois, le serveur est surchargé.
- Si les arrêts sur image sont déjà dans ce qu'envoie OBS, OBS affiche *« images ignorées en raison du délai d'encodage »* dans ses statistiques : baissez la résolution ou choisissez un préréglage plus rapide.

## Votre fournisseur n'arrive pas à ouvrir le lien d'accès d'assistance {#your-vendor-cant-open-the-support-access-link}

- **Unda n'envoie aucun e-mail.** Copiez le lien depuis **Server → License → Support access** et envoyez-le vous-même à votre fournisseur.
- **Un lien qui commence par `https://192.168.…`, `https://10.…` ou un nom d'ordinateur** contient une adresse interne à votre réseau, que personne à l'extérieur ne peut ouvrir. Mettez le serveur sur un VPN comme ZeroTier ou Tailscale et faites-y entrer votre fournisseur : il ouvre le lien avec l'adresse VPN du serveur, en gardant tout à partir de `#invite/`. Ou laissez-le prendre la main à distance sur un ordinateur du bureau, sur le même réseau. Voir [L'accès d'assistance pour votre fournisseur](/fr/guide/license#support-access-for-your-vendor).

## Journaux {#logs}

```bash
journalctl -u unda -f            # systemd
docker compose logs -f unda      # Docker
```

Une ligne par événement, en JSON. Les mots de passe et les clés de diffusion ne sont jamais écrits dans le journal.
