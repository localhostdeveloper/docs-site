---
title: "Installer Unda Media Server (Linux ou Docker)"
description: "Installer Unda Media Server en une commande sur Ubuntu ou Debian, ou avec Docker : HTTPS, compte propriétaire, licence, équipe, pare-feu, sauvegardes et mises à jour."
---

# Installer Unda

Ce guide vous mène d'un serveur Linux neuf à votre premier direct, avec votre équipe connectée. Il s'adresse à la personne qui gère le serveur. Le [guide complet, en anglais](/guide/install), détaille toutes les options.

Le tableau de bord d'Unda est en anglais : les menus et les boutons sont écrits ici tels qu'ils y apparaissent, par exemple **Server → License**.

## Ce qu'il vous faut

- **Un serveur Linux.** 4 vCPU, 8 Go de RAM et 100 Mbit/s en envoi suffisent pour une dizaine de flux 720p et quelques centaines de spectateurs, sans transcodage.
- **Un nom de domaine** qui pointe vers ce serveur (un enregistrement `A`), par exemple `tv.example.com`. Il est nécessaire pour HTTPS.
- **Votre fichier de licence** (`quelquechose.license.json`). Sans licence, Unda fonctionne en mode évaluation pendant 30 jours : tout marche, jusqu'à 2 directs à la fois et 2 comptes en plus du propriétaire.

## 1. Installer

### En une commande (Ubuntu ou Debian)

Faites d'abord pointer votre domaine vers le serveur : Let's Encrypt, qui fournit le certificat HTTPS, vérifie le domaine en se connectant au serveur sur les ports 443 et 80. Puis, en remplaçant le domaine et l'adresse e-mail par les vôtres :

```bash
curl -fsSL https://get.undamedia.com/install.sh | sudo bash -s -- --domain tv.example.com --email vous@example.com
```

Le script télécharge, vérifie et installe tout, avec HTTPS. Il s'arrête avant de modifier quoi que ce soit si un port est déjà pris ou si un téléchargement ne correspond pas à ce qui était attendu. Chaque version est signée : le script vérifie la signature avant d'installer quoi que ce soit. À la fin, il affiche le lien qui crée le compte propriétaire (étape 2).

Ajoutez `--with-ffmpeg` pour installer aussi FFmpeg. Il est nécessaire au débit adaptatif, aux chaînes 24h/24, aux sorties TV et aux vignettes du tableau de bord. `--help` affiche toutes les options.

### AlmaLinux, Rocky Linux et Red Hat

La même commande fonctionne (testée sur AlmaLinux 10, SELinux actif), après deux étapes à faire vous-même : le script n'ouvre les ports que dans le pare-feu d'Ubuntu (ufw) et n'installe FFmpeg qu'avec `apt`, l'outil de Debian.

1. Si firewalld est actif (`systemctl is-active firewalld` répond `active`), ouvrez-y les ports d'Unda :

   ```bash
   sudo firewall-cmd --permanent --add-port=80/tcp --add-port=443/tcp --add-port=1935/tcp --add-port=1936/tcp --add-port=6000/udp --add-port=8189/udp
   sudo firewall-cmd --reload
   ```

2. Installez FFmpeg depuis EPEL et RPM Fusion. Sur AlmaLinux et Rocky Linux 10 :

   ```bash
   sudo dnf install -y epel-release
   sudo dnf config-manager --set-enabled crb
   sudo dnf install -y https://mirrors.rpmfusion.org/free/el/rpmfusion-free-release-10.noarch.rpm
   sudo dnf install -y ffmpeg
   ```

   En version 9, prenez `rpmfusion-free-release-9`. Sur Red Hat Enterprise Linux, activez EPEL comme l'explique la documentation de Red Hat, puis les deux dernières lignes.

Lancez ensuite la commande en une ligne ci-dessus, sans `--with-ffmpeg`.

### Alpine Linux

Sur Alpine (testé sur Alpine 3.24), Unda fonctionne dans Docker. L'installation en service demande systemd, qu'Alpine n'utilise pas : la commande habituelle s'arrête donc avec « systemd is required », sans rien modifier. En root, installez Docker avec les paquets d'Alpine et faites-le démarrer avec le serveur (`iproute2` fournit `ss`, avec lequel le script vérifie les ports), puis lancez le script avec `--docker` :

```sh
apk add bash curl docker docker-cli-compose iproute2
rc-update add docker default
rc-service docker start
curl -fsSL https://get.undamedia.com/install.sh | bash -s -- --docker --domain tv.example.com --email vous@example.com
```

Alpine n'active aucun pare-feu par défaut ; Docker ouvre lui-même les ports publiés par Unda.

### Avec Docker

Ajoutez `--docker` à la même commande. Le script installe Docker s'il manque, écrit `/opt/unda/docker-compose.yml` et `/opt/unda/unda.yaml`, télécharge l'image, la démarre et affiche le lien de création du compte propriétaire. L'image contient déjà FFmpeg.

- **Avec `--domain`** (un serveur joignable depuis Internet) : HTTPS vient de Let's Encrypt, comme ci-dessus.
- **Sans `--domain`** (un PC sur votre réseau local) : Unda utilise directement le réseau de la machine, donc les entrées et sorties multicast fonctionnent sans autre réglage. Le tableau de bord est sur `https://<adresse de la machine>:8443`, avec un certificat fait pour la machine. Les navigateurs le signalent une fois : choisissez « Paramètres avancés », puis continuez.

```bash
curl -fsSL https://get.undamedia.com/install.sh | sudo bash -s -- --docker
```

Une carte graphique Intel est confiée au conteneur pour le transcodage. Les cartes AMD et NVIDIA ne le sont pas : pour en utiliser une, installez sans `--docker`.

Relancer la commande avec `--docker` met à jour vers la nouvelle image et garde vos réglages et vos données.

### Si le serveur sert déjà autre chose

- **Un autre serveur web occupe les ports 80 et 443** (nginx, Caddy, Apache, AzuraCast, Owncast) : ajoutez `--behind-proxy 8090`. Ce serveur web garde les ports 80 et 443 et les certificats, et transmet votre domaine à Unda sur `127.0.0.1:8090`, que seule cette machine peut joindre. Avec nginx, le script ajoute lui-même le site de votre domaine, puis demande le certificat à certbot s'il est installé.
- **Le port RTMP 1935 est pris** (un autre serveur média) : ajoutez `--rtmp-port 1936`. Les encodeurs utilisent alors `rtmp://tv.example.com:1936/live`.
- **Vous avez déjà un certificat** pour le domaine : donnez-le avec `--cert-file` (et `--key-file` pour la clé privée).

Les autres façons de faire (Caddy ou nginx à la main, installation sans le script) sont dans le [guide complet](/guide/install#2-https-options).

## 2. Créer le compte propriétaire

Le premier compte est le **propriétaire** (owner), qui peut tout faire. Ouvrez le lien affiché par le script, sur votre adresse HTTPS :

```
https://tv.example.com/dashboard#setup/<jeton>
```

Saisissez votre e-mail, votre nom et un mot de passe d'au moins 10 caractères. Le lien cesse de fonctionner une fois le propriétaire créé.

**Lien perdu, ou pas encore de HTTPS ?** Créez le propriétaire depuis le terminal du serveur. Le mot de passe est demandé ensuite :

```bash
sudo -u unda unda admin -config /etc/unda/unda.yaml create-user vous@example.com owner "Votre Nom"
```

Ensuite, dans **Server → Account**, activez la **connexion en deux étapes** (avec n'importe quelle application d'authentification) et rangez les codes de secours dans votre gestionnaire de mots de passe.

## 3. Installer la licence

En tant que propriétaire : **Server → License** → *Install a license* → choisissez votre fichier `.license.json` → **Install**.

Les limites de flux et de comptes s'appliquent aussitôt. Les outils qui démarrent avec le serveur (SRT, entrées UDP, transcodage) suivent une nouvelle licence **après un redémarrage** ; la page le signale.

| État | Ce qui se passe |
|---|---|
| valid | tout ce que comprend la licence |
| expiring | un bandeau s'affiche à partir de 30 jours avant la date de fin |
| grace | expirée depuis moins de 14 jours : tout fonctionne encore, le bandeau compte les jours |
| expired | les **nouveaux** flux sont refusés ; ceux déjà en direct continuent. Installez la licence renouvelée : elle s'applique aussitôt |
| evaluation | pas de fichier de licence : 2 directs, 2 comptes en plus du premier propriétaire, pendant 30 jours |
| evaluation_ended | les 30 jours sont passés : les nouveaux flux sont refusés jusqu'à l'installation d'une licence |
| invalid | le fichier est abîmé ou n'est pas pour ce serveur : limites d'évaluation jusqu'à l'installation d'une licence valide |

La licence est vérifiée sur le serveur, hors ligne. Rien n'est envoyé à votre fournisseur.

## 4. Inviter votre équipe

**Users** → *Invite someone* : e-mail, rôle et, pour un diffuseur, le nombre de chaînes qu'il peut créer. Vous obtenez un lien valable 72 heures, utilisable une fois. Envoyez-le vous-même (messagerie, e-mail) ; la personne l'ouvre et choisit son mot de passe.

| Rôle | Peut |
|---|---|
| **owner** (propriétaire) | tout : licence, accès d'assistance, autres propriétaires |
| **admin** (administrateur) | les utilisateurs (sauf les propriétaires), les réglages de sécurité, les clés d'API, le journal d'audit, et tout ce que peut un opérateur |
| **operator** (opérateur) | fait tourner la production : tous les flux, arrêter, enregistrer, rediffuser, transcodage, entrées UDP, page du serveur |
| **streamer** (diffuseur) | seulement ses propres chaînes : clé de diffusion, état, santé, spectateurs, ses destinations de rediffusion |

Dans **Users → Security**, vous pouvez exiger la connexion en deux étapes pour certains rôles (par exemple propriétaire, administrateur et opérateur).

## 5. Premier direct

Les flux arrivent sur des **chaînes**. Une chaîne a un **nom** public, utilisé dans le lien de lecture (`/watch/<nom>`), et une **clé de diffusion** secrète (`sk_…`), la seule chose qui permet de passer en direct sur cette chaîne.

1. **Channels** → *New channel* → par exemple `main-show`. Un administrateur peut la créer pour un diffuseur ; un diffuseur crée les siennes.
2. La page affiche les réglages de l'encodeur. Dans OBS : **Paramètres → Stream**, service **Personnalisé…**, puis :
   - Serveur : `rtmp://tv.example.com:1935/live`, ou sur Internet `rtmps://tv.example.com:1936/live` (RTMPS : la clé et les images circulent chiffrées ; OBS, vMix et FFmpeg le prennent en charge) ;
   - Clé de stream : la clé `sk_…`.
3. Lancez la diffusion. En quelques secondes, le flux apparaît dans **Streams** sous le nom `main-show`.
4. Les spectateurs regardent sur `https://tv.example.com/watch/main-show`. La clé n'apparaît jamais dans ce lien.

Si une clé fuite, utilisez **New key** sur la chaîne : l'ancienne clé cesse aussitôt de fonctionner, et un direct qui l'utilise est coupé.

Les encodeurs SRT utilisent `srt://tv.example.com:6000?streamid=publish:<clé sk_…>` (indiqué dans **Channels**).

OBS 30 et plus récent peut aussi diffuser en WebRTC (WHIP), avec environ une seconde de délai pour les spectateurs qui activent **Low latency** sur la page de lecture : service **WHIP**, serveur `https://tv.example.com/whip/main-show`, Bearer Token = la clé `sk_…`. WebRTC demande l'outil WebRTC dans la licence, HTTPS, et le port UDP 8189 ouvert (étape 6).

## 6. Pare-feu

N'ouvrez que ce qui sert :

```bash
sudo ufw allow 443/tcp     # HTTPS : tableau de bord, pages de lecture, HLS
sudo ufw allow 80/tcp      # vérifications de Let's Encrypt et redirection HTTP vers HTTPS
sudo ufw allow 1935/tcp    # encodeurs RTMP
sudo ufw allow 1936/tcp    # encodeurs RTMPS (RTMP chiffré)
sudo ufw allow 6000/udp    # encodeurs SRT (si vous l'utilisez)
sudo ufw allow 8189/udp    # WebRTC : encodeurs WHIP, spectateurs à faible délai (si vous l'utilisez)
```

Avec firewalld (AlmaLinux, Rocky Linux, Red Hat), ouvrez les mêmes ports avec `firewall-cmd --permanent --add-port=…` puis `firewall-cmd --reload` (étape 1).

Quand ufw est actif, le script ouvre les ports d'Unda à la première installation seulement. Une mise à jour laisse le pare-feu tel quel et liste les ports qu'Unda utilise.

RTMPS est actif par défaut dès qu'Unda a HTTPS. Le RTMP simple envoie la clé et les images en clair : sur Internet, préférez RTMPS, SRT avec une phrase secrète, ou WHIP.

**Les entrées UDP et RTP n'ont ni mot de passe ni chiffrement** : quiconque peut joindre le port peut y envoyer un flux. Gardez-les sur un réseau privé de confiance (un réseau de studio, une liaison louée, un VPN), donnez à chaque entrée la liste de ses émetteurs autorisés, et n'ouvrez le port qu'à eux :

```bash
sudo ufw allow from 192.0.2.20 to any port 5004 proto udp   # un émetteur, une entrée
```

## 7. Sauvegardes et mises à jour

**Les copies quotidiennes sont automatiques.** Unda copie sa base de données une fois par jour et garde les sept plus récentes, dans `/var/lib/unda/state/backups` (ou `/data/state/backups` dans le volume Docker). **Server → Status** affiche la plus récente ; une copie qui échoue y devient une alerte.

**Copiez-les hors du serveur.** Ces copies sont sur le disque du serveur : un disque ou un serveur perdu les emporte. Copiez régulièrement ce dossier et `license.json` sur une autre machine. Le propriétaire peut aussi télécharger, dans **Server → Status**, une sauvegarde verrouillée par une phrase secrète de son choix, sans laquelle le fichier n'ouvre rien.

**Mettre à jour :**

- **Installé avec le script, à partir de la v0.1.50 :** `sudo unda upgrade` (`unda upgrade -check` regarde seulement). Votre Unda vérifie la nouvelle version avec la clé du fournisseur qu'il contient avant de lancer quoi que ce soit, et ne revient jamais à une version plus ancienne.
- **Installé avec le script, autrement :** relancez la même commande d'installation.
- **Docker :** indiquez la nouvelle version dans `docker-compose.yml` (`image: …/unda:vX.Y.Z`), puis `docker compose pull` et `docker compose up -d`.

À chaque mise à jour, la nouvelle version copie la base de données avant de la modifier. Le redémarrage déconnecte les encodeurs quelques secondes ; OBS se reconnecte de lui-même. Quand une nouvelle version existe, les propriétaires et les administrateurs le voient dans le tableau de bord (**Overview**, et en bas du menu), avec un lien vers ses notes de version.

## Pour aller plus loin

Dans le guide complet, en anglais :

- [HTTPS : Caddy, nginx ou votre propre certificat](/guide/install#2-https-options)
- [Sauvegardes, restauration et mises à jour en détail](/guide/install#8-backups-and-upgrades)
- [Si quelqu'un est bloqué](/guide/install#9-if-someone-is-locked-out)
- [Dépannage](/guide/install#11-troubleshooting)
- [Désinstaller Unda](/guide/install#12-removing-unda)

Une question ? Écrivez-nous depuis la page [Contact](/contact).
