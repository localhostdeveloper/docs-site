---
title: "Installer Unda Media Server (Linux ou Docker)"
description: "Installer Unda Media Server en une commande sur Ubuntu ou Debian, ou avec Docker : HTTPS, compte propriétaire, licence, équipe, pare-feu, sauvegardes et mises à jour."
---

# Installer Unda {#installing-unda}

<DocVideo id="dywB8vyK5ms" title="Installer Unda sous Linux" length="0:24" poster="/screens/install-video.webp" />

Ce guide vous mène d'un serveur Linux neuf à votre premier direct, avec votre équipe connectée. Il s'adresse à la personne qui gère le serveur.

Le tableau de bord d'Unda est en anglais : les menus et les boutons sont écrits ici tels qu'ils y apparaissent, par exemple **Server → License**.

Il vous faut :

- un serveur Linux (4 vCPU, 8 Go de RAM et 100 Mbit/s ou plus en envoi suffisent pour une dizaine de flux 720p et quelques centaines de spectateurs, sans transcodage). Un PC Windows fonctionne aussi, par WSL ou Docker Desktop : voir [Unda sous Windows](/fr/guide/windows) ;
- un nom DNS qui pointe vers lui, par exemple `tv.example.com` (nécessaire pour HTTPS) ;
- l'**image Docker** d'Unda (`ghcr.io/localhostdeveloper/unda`) ou le **binaire** fourni par votre fournisseur, et votre **fichier de licence** (`quelquechose.license.json`). Sans licence, Unda fonctionne en mode évaluation pendant 30 jours : tout marche, jusqu'à 2 flux en direct et 2 comptes en plus du propriétaire.

Les étapes :

1. [Installer](#1-install) : Docker **ou** un binaire avec systemd
2. [Les options HTTPS](#2-https-options) : intégré (Let's Encrypt), Caddy, nginx ou votre propre certificat
3. [Créer le compte propriétaire](#3-create-the-owner-account)
4. [Installer la licence](#4-install-the-license)
5. [Inviter votre équipe](#5-invite-your-team)
6. [Premier direct](#6-first-stream)
7. [Pare-feu](#7-firewall)
8. [Sauvegardes et mises à jour](#8-backups-and-upgrades)
9. [Si quelqu'un est bloqué](#9-if-someone-is-locked-out)
10. [L'accès d'assistance pour votre fournisseur](#10-support-access-for-your-vendor)
11. [Dépannage](#11-troubleshooting)
12. [Désinstaller Unda](#12-removing-unda)

---

## 1. Installer {#1-install}

**Le plus rapide (Ubuntu/Debian) :** une seule commande télécharge, vérifie et installe tout, avec HTTPS :

```bash
curl -fsSL https://get.undamedia.com/install.sh | sudo bash -s -- --domain tv.example.com --email vous@example.com
```

Elle s'arrête avant de modifier quoi que ce soit si un port est déjà pris ou si un téléchargement ne correspond pas à sa somme de contrôle. `--help` liste les options (`--staging`, `--with-ffmpeg`, les options de ports, `--cert-file`). Les façons manuelles suivent.

**Chaque version est signée** (depuis la v0.1.49). Le script d'installation vérifie la signature de la liste des sommes de contrôle de la version avant d'installer quoi que ce soit : un téléchargement modifié en route, ou sur le site de téléchargement lui-même, est refusé ; avec `--docker`, il récupère l'image par l'empreinte exacte que donne cette liste. Le script porte la clé publique qui lui sert à vérifier ; pour être sûr qu'il s'agit de la nôtre, comparez-la avec celle-ci (aussi présente dans chaque version sous le nom `unda-release.pub`) :

```text
-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAB1ecJf7qS5QmW0tNgROglMxl5ozWIk4HnHj8b1/EOVs=
-----END PUBLIC KEY-----
```

Pour vérifier une version à la main, dans son dossier : `openssl base64 -d -A -in SHA256SUMS.sig -out sig.bin && openssl pkeyutl -verify -pubin -inkey unda-release.pub -rawin -in SHA256SUMS -sigfile sig.bin` doit afficher `Signature Verified Successfully`, puis `grep -v ' image:' SHA256SUMS | sha256sum -c --ignore-missing` vérifie les fichiers que vous avez téléchargés (la ligne laissée de côté est l'empreinte de l'image Docker).

**Vérifier le script d'installation lui-même avant qu'il ne tourne.** La commande en une ligne ci-dessus exécute `install.sh` pendant son téléchargement : elle fait donc confiance à notre site de téléchargement ; le script vérifie ensuite tout ce qu'il récupère d'autre. Pour ne faire confiance qu'à la clé et à la version affichées sur cette page, vérifiez d'abord le script, dans un dossier neuf et vide (créé à chaque fois, pour qu'aucun fichier laissé auparavant ne soit utilisé) :

```bash
cd "$(mktemp -d)" && pwd
V=v0.1.50
for f in install.sh SHA256SUMS SHA256SUMS.sig; do curl -fsSLO --proto '=https' "https://get.undamedia.com/$V/$f"; done
printf '%s\n' '-----BEGIN PUBLIC KEY-----' 'MCowBQYDK2VwAyEAB1ecJf7qS5QmW0tNgROglMxl5ozWIk4HnHj8b1/EOVs=' '-----END PUBLIC KEY-----' > unda-release.pub
openssl base64 -d -A -in SHA256SUMS.sig -out sig.bin
openssl pkeyutl -verify -pubin -inkey unda-release.pub -rawin -in SHA256SUMS -sigfile sig.bin
grep '  install.sh$' SHA256SUMS | sha256sum -c -
grep -q "^DEFAULT_BASE_URL=.*  # $V (" install.sh && echo "install.sh is $V"
```

Vous devez voir `Signature Verified Successfully`, `install.sh: OK` et `install.sh is` suivi de cette version. Si l'un d'eux manque, arrêtez-vous et prévenez-nous. `V` est la version la plus récente au moment où cette page a été publiée (elle n'est pas lue sur le site de téléchargement, qui pourrait sinon vous remettre une version plus ancienne) ; si les [notes de version](/release-notes) (en anglais) en listent une plus récente, utilisez-la. Lancez ensuite, depuis ce dossier, le script vérifié avec les options dont vous avez besoin, par exemple `sudo bash install.sh --domain tv.example.com --email vous@example.com` (ou `--docker`). Il télécharge et vérifie le reste de la version comme d'habitude. Les mises à jour se font de la même façon. Depuis la v0.1.50, le script refuse d'installer une version plus ancienne par-dessus une plus récente (voir [Sauvegardes et mises à jour](#8-backups-and-upgrades)).

**La même chose dans Docker :** ajoutez `--docker`. Le script installe Docker et son extension compose depuis les paquets de votre système s'ils manquent, écrit `/opt/unda/docker-compose.yml` et `/opt/unda/unda.yaml`, télécharge l'image, la démarre et affiche le lien de configuration. Le relancer avec `--docker` met à jour vers la nouvelle image et garde vos réglages et vos données.

- **Avec `--domain`** (un serveur joignable depuis Internet) : les ports sont publiés comme dans [A. Docker](#a-docker) plus bas, et HTTPS vient de Let's Encrypt (ou de `--cert-file`).
- **Sans `--domain`** (un PC sur votre propre réseau) : Unda utilise directement le réseau de la machine, donc les entrées et sorties multicast fonctionnent sans rien de plus à régler, et le tableau de bord est sur `https://<adresse de cette machine>:8443`, avec un certificat fait pour la machine. Les navigateurs le signalent une fois : choisissez Paramètres avancés, puis continuez.

```bash
curl -fsSL https://get.undamedia.com/install.sh | sudo bash -s -- --docker
```

Une carte graphique Intel est confiée au conteneur pour le transcodage (l'image porte le pilote d'Intel sur les machines Intel/AMD 64 bits). Les cartes AMD et NVIDIA ne le sont pas : installez sans `--docker` pour en utiliser une.

**AlmaLinux, Rocky Linux et Red Hat Enterprise Linux** (testé sur AlmaLinux 10 avec SELinux actif) : la même commande en une ligne fonctionne après deux étapes à faire vous-même, parce que le script n'ouvre les ports que dans le pare-feu d'Ubuntu (ufw) et n'installe FFmpeg qu'avec `apt`, l'outil de Debian.

1. Si firewalld est actif (`systemctl is-active firewalld` répond `active`), ouvrez-y les ports d'Unda :

   ```bash
   sudo firewall-cmd --permanent --add-port=80/tcp --add-port=443/tcp --add-port=1935/tcp --add-port=1936/tcp --add-port=6000/udp --add-port=8189/udp
   sudo firewall-cmd --reload
   ```

   Ce sont les ports par défaut ; ouvrez ceux que vous choisissez si vous les changez avec les options de ports.
2. Installez FFmpeg depuis EPEL et RPM Fusion. Sur AlmaLinux et Rocky Linux 10 :

   ```bash
   sudo dnf install -y epel-release
   sudo dnf config-manager --set-enabled crb
   sudo dnf install -y https://mirrors.rpmfusion.org/free/el/rpmfusion-free-release-10.noarch.rpm
   sudo dnf install -y ffmpeg
   ```

   En version 9, prenez `rpmfusion-free-release-9`. Sur Red Hat Enterprise Linux, activez EPEL comme l'explique la documentation de Red Hat, puis les deux dernières lignes.

Lancez ensuite la commande en une ligne ci-dessus, sans `--with-ffmpeg`.

**Alpine Linux** (testé sur Alpine 3.24) : Unda y tourne dans Docker. L'installation en service demande systemd, qu'Alpine n'utilise pas : la commande habituelle s'arrête donc avec « systemd is required » et ne modifie rien. En root, installez Docker depuis les paquets d'Alpine et faites-le démarrer avec le serveur (`iproute2` fournit au script `ss`, avec lequel il vérifie les ports), puis lancez le script avec `--docker` :

```sh
apk add bash curl docker docker-cli-compose iproute2
rc-update add docker default
rc-service docker start
curl -fsSL https://get.undamedia.com/install.sh | bash -s -- --docker --domain tv.example.com --email vous@example.com
```

Alpine ne fait tourner aucun pare-feu, sauf si vous en mettez un en place ; Docker ouvre lui-même les ports publiés par Unda.

**Un autre serveur web occupe déjà les ports 80 et 443** (nginx, Caddy ou Apache servant d'autres sites, AzuraCast, Owncast) ? Ajoutez `--behind-proxy PORT` : ce serveur web garde les ports 80 et 443 et les certificats, et transmet votre domaine à Unda sur `127.0.0.1:PORT`, que seule cette machine peut joindre.

```bash
curl -fsSL https://get.undamedia.com/install.sh | sudo bash -s -- --domain tv.example.com --behind-proxy 8090
```

- **Avec nginx,** le script ajoute lui-même le site de votre domaine. Si nginx en a déjà un pour ce domaine, il vérifie seulement qu'il transmet à Unda. Il demande ensuite le certificat à certbot, quand certbot est installé, comme pour vos autres sites (`--email` est transmis à certbot).
- **Avec un autre serveur web,** il affiche ce qu'il faut transmettre.
- **Le port RTMP 1935 est pris aussi** (un autre serveur média) ? Ajoutez `--rtmp-port 1936` ; les encodeurs utilisent alors `rtmp://tv.example.com:1936/live`.
- **RTMPS est désactivé :** le certificat est celui du serveur web.
- **Les cartes graphiques** fonctionnent comme dans toute installation en service. Contrairement à Docker, une carte NVIDIA peut être utilisée : installez FFmpeg avec `--with-ffmpeg`.

Seuls RTMP, SRT et WebRTC sont à ouvrir dans un pare-feu ; jamais le port qui suit `--behind-proxy`. Un autre programme sur les ports 80 et 443 qui n'est pas un serveur web capable de transmettre un nom ? Donnez plutôt à Unda d'autres ports et un fichier de certificat : voir « Partager un serveur » dans la [section 2](#2-https-options).

Choisissez l'une des deux : **Docker** (A) ou **binaire + systemd** (B). Les deux obtiennent automatiquement leurs certificats HTTPS auprès de Let's Encrypt, sans rien d'autre à installer. Remplacez `tv.example.com` par votre domaine, et faites pointer son DNS (un enregistrement `A`) vers le serveur **avant** le premier démarrage. Let's Encrypt vérifie le domaine en s'y connectant sur les ports 443 et 80.

(Vous préférez un proxy inverse ? `--behind-proxy` ci-dessus le fait en une commande ; la [section 2](#2-https-options) décrit Caddy et nginx à la main.)


### A. Docker {#a-docker}

Créez un dossier, par exemple `/opt/unda`, avec ces deux fichiers.

`docker-compose.yml` :

```yaml
services:
  unda:
    image: ghcr.io/localhostdeveloper/unda:v0.1.50   # version la plus récente : voir les notes de version
    restart: unless-stopped
    ports:
      - "443:8443"          # HTTPS : tableau de bord, pages de lecture, HLS
      - "80:8080"           # HTTP : redirige vers HTTPS, répond à Let's Encrypt
      - "1935:1935"         # RTMP (encodeurs)
      - "1936:1936"         # RTMPS (encodeurs, chiffré)
      - "6000:6000/udp"     # SRT (encodeurs, facultatif)
      - "8189:8189/udp"     # médias WebRTC : encodeurs WHIP, spectateurs à faible délai (facultatif)
    volumes:
      - unda-data:/data
      - ./unda.yaml:/etc/unda/unda.yaml:ro
    environment:
      TZ: UTC               # votre fuseau horaire (par ex. Europe/Paris) : noms des enregistrements et journaux
    read_only: true
    tmpfs: [/tmp]
    cap_drop: [ALL]
    security_opt: [no-new-privileges:true]
    ulimits:
      nofile: 65536
    logging:                # sinon Docker garde les journaux indéfiniment
      options: { max-size: "10m", max-file: "5" }

volumes:
  unda-data:
```

`unda.yaml` :

```yaml
server:
  rtmp_addr: ":1935"
  http_addr: ":8443"                   # publié comme 443
  http_redirect_addr: ":8080"          # publié comme 80
  public_https_port: 443               # là où cette redirection envoie les navigateurs
  tls:
    letsencrypt:
      domains: [tv.example.com]
      email: ops@example.com           # facultatif : avis d'expiration
log:
  level: info
paths:
  recordings_dir: /data/recordings
  hls_dir: /data/hls
  data_dir: /data/state                # comptes, chaînes, licence, certificats : à sauvegarder
  media_dir: /data/media               # fichiers envoyés pour les chaînes 24h/24
srt:
  addr: ":6000"
webrtc:
  # Le pont réseau de Docker cache à Unda l'adresse publique de ce serveur ;
  # WebRTC indique aux lecteurs où envoyer leurs médias : donnez-la ici.
  public_ips: [203.0.113.7]            # l'adresse IPv4 publique de ce serveur
```

Démarrez-le :

```bash
docker compose up -d
docker compose logs unda | grep -E 'certificate ready|could not get|setup_link'
```

`certificate ready` signifie que HTTPS fonctionne. Gardez la ligne `setup_link` ; vous en aurez besoin à l'étape 3.

Les commandes d'administration (utilisées plus bas) se lancent à l'intérieur du conteneur :

```bash
docker compose exec unda unda admin -config /etc/unda/unda.yaml list-users
```

**Les entrées UDP, RTP, RIST et multi-chaînes** écoutent sur des ports que vous choisissez en les ajoutant. Publiez aussi chacun d'eux sous `ports:`, par exemple `- "5000:5000/udp"` (le RIST utilise le port et le suivant : publiez les deux). Le multicast (`udp://239.…`) ne traverse pas la correspondance de ports de Docker : pour le recevoir ou l'envoyer, donnez au service `network_mode: host` et retirez sa liste `ports:` (le conteneur utilise alors directement les ports du serveur). Unda écoute alors lui-même sur `:8443` et `:8080`, et il tourne sans droits root, donc il ne peut pas prendre les ports 443 et 80 : Let's Encrypt ne peut pas le joindre. Donnez-lui alors votre propre certificat, ou utilisez `install.sh --docker` sans `--domain` pour une machine sur votre propre réseau.

### B. Binaire + systemd {#b-binary--systemd}

```bash
# le binaire de votre fournisseur
sudo install -m 755 unda /usr/local/bin/unda
sudo useradd --system --no-create-home --shell /usr/sbin/nologin unda
sudo install -d -o unda -g unda -m 750 /var/lib/unda
sudo install -d /etc/unda
sudo install -m 644 unda.service /etc/systemd/system/unda.service   # livré avec le binaire
sudo touch /etc/unda/unda.env && sudo chmod 640 /etc/unda/unda.env \
  && sudo chown root:unda /etc/unda/unda.env   # secrets facultatifs ; peut rester vide
```

`/etc/unda/unda.yaml` :

```yaml
server:
  rtmp_addr: ":1935"
  http_addr: ":443"
  http_redirect_addr: ":80"            # redirige vers HTTPS, répond à Let's Encrypt
  tls:
    letsencrypt:
      domains: [tv.example.com]
      email: ops@example.com           # facultatif : avis d'expiration
log:
  level: info
paths:
  recordings_dir: /var/lib/unda/recordings
  hls_dir: /var/lib/unda/hls
  data_dir: /var/lib/unda/state        # comptes, chaînes, licence, certificats : à sauvegarder
srt:
  addr: ":6000"
```

Le service peut ouvrir les ports 443 et 80 (`CAP_NET_BIND_SERVICE` dans `unda.service`), et rien de plus.

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now unda
sudo journalctl -u unda | grep -E 'certificate ready|could not get|setup_link'
```

`certificate ready` signifie que HTTPS fonctionne. Gardez la ligne `setup_link` ; vous en aurez besoin à l'étape 3.

Les commandes d'administration se lancent toujours **en tant qu'utilisateur `unda`**. En root, elles peuvent laisser dans le dossier des données des fichiers que le serveur ne peut plus ouvrir :

```bash
sudo -u unda unda admin -config /etc/unda/unda.yaml list-users
```

Le transcodage (une qualité adaptée à chaque spectateur) demande FFmpeg sur le serveur (`sudo apt install ffmpeg`, ou `install.sh --with-ffmpeg`) ; l'image Docker l'a déjà. Activez-le dans le tableau de bord sous **Server → Transcoding**, qui liste les encodeurs de ce serveur (le processeur, et les cartes graphiques NVIDIA, Intel ou autres), chacun testé. Sur un serveur NVIDIA, installez d'abord le pilote NVIDIA de façon que `nvidia-smi` fonctionne, et utilisez un FFmpeg compilé avec NVENC. Quand une carte de la machine n'est pas utilisable, la page dit pourquoi sous la liste. Les installations faites avant la v0.1.41 cachent les cartes graphiques à Unda (`PrivateDevices=true`) et bloquent les sockets locaux dont l'encodeur de NVIDIA a besoin (`AF_UNIX`) : relancez `install.sh` (il écrit la nouvelle unité), ou

```bash
sudo mkdir -p /etc/systemd/system/unda.service.d
printf '[Service]\nPrivateDevices=false\nRestrictAddressFamilies=\nRestrictAddressFamilies=AF_INET AF_INET6 AF_NETLINK AF_UNIX\n' | sudo tee /etc/systemd/system/unda.service.d/gpu.conf
sudo systemctl daemon-reload && sudo systemctl restart unda
```

puis appuyez sur **Detect again** sur cette page.

---

## 2. Les options HTTPS {#2-https-options}

On se connecte avec un e-mail et un mot de passe : Unda **refuse donc une connexion en HTTP simple depuis une autre machine**, car n'importe qui sur le réseau pourrait lire le mot de passe. La section 1 met déjà en place HTTPS de la façon intégrée. Les détails, et les autres possibilités :

**Let's Encrypt intégré (section 1) :**

- **Obtenir le certificat :**
  - au premier démarrage, Unda demande à Let's Encrypt un certificat pour chaque domaine de `server.tls.letsencrypt.domains` ;
  - Let's Encrypt vérifie que vous contrôlez le domaine en s'y connectant sur le port 443 ou 80 ;
  - le certificat est conservé dans `<data_dir>/acme`.
- **Le renouvellement** se fait de lui-même, bien avant l'expiration, sans redémarrage.
- **La page Server du tableau de bord** montre la date d'expiration de chaque certificat. Une alerte s'ouvre si le renouvellement échoue assez longtemps pour que ce soit important.
- **Vous voulez d'abord essayer une configuration ?** Ajoutez `directory_url: staging`. Vous recevez les certificats de test de Let's Encrypt, que les navigateurs signalent, sans consommer les vraies limites (5 certificats par ensemble de domaines et par semaine). Retirez la ligne et le dossier `<data_dir>/acme` quand tout fonctionne.
- **Derrière un routeur ou un pare-feu :** redirigez les ports publics 443 et 80 vers le serveur. Au moins l'un des deux doit l'atteindre : 443 vers `http_addr`, ou 80 vers `http_redirect_addr`.
- **Les certificats génériques** (`*.example.com`) ne sont pas pris en charge. Listez plutôt chaque nom.

**Caddy devant.** Des fichiers prêts à l'emploi sont dans [deploy/caddy/](/reference/caddy) (en anglais ; Docker). Caddy obtient le certificat ; Unda n'écoute que Caddy. Laissez de côté `server.tls` et listez Caddy dans `server.trusted_proxies` ; sinon Unda ignore ses en-têtes et traite chaque navigateur comme du HTTP simple.

Sur une installation systemd :

```bash
sudo apt install caddy
printf 'tv.example.com {\n    reverse_proxy 127.0.0.1:8080\n}\n' | sudo tee /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Puis dans `unda.yaml` :

```yaml
server:
  http_addr: "127.0.0.1:8080"
  trusted_proxies: ["127.0.0.1/32", "::1/128"]
```

**nginx au lieu de Caddy.** Gardez l'en-tête `Host`, désactivez la mise en mémoire tampon pour que les mises à jour en direct du tableau de bord passent, et autorisez des corps de requête de 16 Mo (les envois de médias arrivent en morceaux de 8 Mo) :

```nginx
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    include /etc/nginx/snippets/unda-proxy-key.conf;   # le secret, plus bas
    proxy_buffering off;
    proxy_request_buffering off;
    client_max_body_size 16m;
    proxy_read_timeout 1h;
}
```

**Le secret du serveur web.** Unda croit le serveur web sur l'identité d'un visiteur à cause de l'adresse depuis laquelle il se connecte. Tout autre programme capable de joindre Unda depuis cette adresse (un autre utilisateur de la même machine, un autre conteneur du même réseau Docker) pourrait alors se faire passer pour n'importe quel visiteur : essayer des mots de passe sans subir le blocage de connexion, bloquer une vraie personne, mettre n'importe quelle adresse dans le journal d'audit. Un secret que seul le serveur web envoie empêche cela. `install.sh --behind-proxy` le met en place quand il écrit le site nginx ; tant qu'un serveur n'en a pas, le tableau de bord affiche un avis de sécurité sur sa page Overview.

Avec nginx (faites d'abord nginx : Unda ignore l'en-tête tant qu'il n'a pas le secret) :

```bash
KEY=$(openssl rand -hex 24)
sudo install -d -m 755 /etc/nginx/snippets
sudo install -m 600 /dev/null /etc/nginx/snippets/unda-proxy-key.conf
printf 'proxy_set_header X-Unda-Proxy-Key "%s";\n' "$KEY" | sudo tee /etc/nginx/snippets/unda-proxy-key.conf >/dev/null
# ajoutez la ligne include ci-dessus au bloc location d'Unda, puis :
sudo nginx -t && sudo systemctl reload nginx
echo "UNDA_TRUSTED_PROXY_SECRET=$KEY" | sudo tee -a /etc/unda/unda.env >/dev/null
sudo systemctl restart unda
```

Avec Caddy sur une installation systemd, gardez la clé dans un fichier que seul root lit et donnez-la à Caddy comme variable d'environnement :

```bash
KEY=$(openssl rand -hex 24)
sudo install -m 600 /dev/null /etc/caddy/unda.env
echo "UNDA_PROXY_KEY=$KEY" | sudo tee /etc/caddy/unda.env >/dev/null
sudo mkdir -p /etc/systemd/system/caddy.service.d
printf '[Service]\nEnvironmentFile=/etc/caddy/unda.env\n' | sudo tee /etc/systemd/system/caddy.service.d/unda.conf >/dev/null
printf 'tv.example.com {\n    reverse_proxy 127.0.0.1:8080 {\n        header_up X-Unda-Proxy-Key {$UNDA_PROXY_KEY}\n    }\n}\n' | sudo tee /etc/caddy/Caddyfile
sudo systemctl daemon-reload && sudo systemctl restart caddy
echo "UNDA_TRUSTED_PROXY_SECRET=$KEY" | sudo tee -a /etc/unda/unda.env >/dev/null
sudo systemctl restart unda
```

Le secret peut aussi aller dans `unda.yaml` sous `server.trusted_proxy_secret` (de 16 à 256 lettres, chiffres, `-`, `_`, `.` ou `~`). Le dossier Caddy prêt à l'emploi pour Docker le lit dans un fichier `.env` placé à côté de son `docker-compose.yml` (voir le commentaire en haut de celui-ci).

**Vos propres fichiers de certificat.** Réglez `server.tls.cert_file` et `key_file` (par exemple `fullchain.pem` / `privkey.pem` de certbot, lisibles par l'utilisateur du service) au lieu de `letsencrypt`. Unda relit les fichiers quand ils sont renouvelés. `install.sh --cert-file F --key-file F` le fait pour vous : il vérifie la paire (la clé correspond, le certificat nomme votre domaine et n'a pas expiré), la copie dans `/etc/unda/tls` pour que l'utilisateur `unda` puisse la lire, et installe `unda-cert-sync.timer`, qui la recopie chaque jour quand la source change. Un seul PEM combiné peut être donné avec `--cert-file` seul.

**Partager un serveur avec un programme qui occupe les ports 80 et 443.** Unda tourne alors sur d'autres ports (par exemple HTTPS 8443, RTMP 1936) avec un fichier de certificat. D'où vient le certificat, c'est à vous de choisir, du plus indépendant au moins indépendant :

1. **Le sien, par le DNS** (recommandé) : certbot prouve le domaine avec un enregistrement DNS plutôt qu'avec un port, donc cela fonctionne quoi qu'il y ait sur les ports 80 et 443. Utilisez un nom qui lui soit propre, par exemple `unda.example.com` (un enregistrement `A` vers ce serveur). Avec un fournisseur DNS qui a une extension certbot, le renouvellement est automatique, par exemple Cloudflare (un jeton d'API avec *Zone: DNS: Edit*) :

   ```bash
   sudo apt install certbot python3-certbot-dns-cloudflare
   echo "dns_cloudflare_api_token = VOTRE_JETON" | sudo tee /root/cloudflare.ini
   sudo chmod 600 /root/cloudflare.ini
   sudo certbot certonly --dns-cloudflare --dns-cloudflare-credentials /root/cloudflare.ini -d unda.example.com
   ```

   Des extensions existent pour Route 53, DigitalOcean, Google, OVH, Linode et d'autres (`apt search python3-certbot-dns`). Sans extension, `certbot certonly --manual --preferred-challenges dns` fonctionne aussi, mais doit être refait tous les 90 jours. Puis :

   ```bash
   curl -fsSL https://get.undamedia.com/install.sh | sudo bash -s -- --domain unda.example.com \
     --cert-file /etc/letsencrypt/live/unda.example.com/fullchain.pem \
     --key-file  /etc/letsencrypt/live/unda.example.com/privkey.pem \
     --https-port 8443 --rtmp-port 1936
   ```

   RTMPS prend alors le port 1937 (le 1936 est ici celui du RTMP simple) : les encodeurs utilisent `rtmps://unda.example.com:1937/live`. Ajoutez `--rtmps-port N` pour un autre port, ou `--rtmps-port 0` pour aucun.

2. **Un certificat que vous avez acheté**, ou un certificat que l'autre programme renouvelle déjà pour le même nom : les mêmes options `--cert-file`/`--key-file`. Unda dépend alors de ce programme pour son renouvellement.
3. **Derrière ce programme comme proxy inverse** (Caddy/nginx plus haut), si c'est un serveur web capable de transmettre un nom à Unda. Avec Docker et un nginx déjà présent sur le serveur, suivez [Docker derrière nginx sur le même serveur](#docker-behind-nginx-on-the-same-server).

Ou donnez à Unda un serveur à lui : rien à partager, et l'installation en une ligne ne demande aucune option.

### Docker derrière nginx sur le même serveur {#docker-behind-nginx-on-the-same-server}

Pour un serveur où nginx occupe déjà les ports 80 et 443, souvent à côté d'un autre serveur média (Flussonic, Wowza) qui occupe le port 1935 du RTMP. nginx garde les ports 80 et 443 et le certificat, et transmet à Unda un nom qui lui est propre (`unda.example.com` ci-dessous). Le port web d'Unda n'est joignable que depuis le serveur lui-même. Le RTMP et le SRT vont directement à Unda : nginx ne les transmet pas.

**1. Vérifiez les ports.** Rien ne doit s'afficher :

```bash
sudo ss -tulpn | grep -E ':(1936|6000|8090)\b'
```

Si un port apparaît, choisissez-en un autre de libre et changez-le partout ci-dessous. Utilisez **le même numéro des deux côtés** de `ports:` et dans `unda.yaml` : le tableau de bord indique aux encodeurs les ports sur lesquels Unda écoute.

**2. DNS :** un enregistrement `A` pour `unda.example.com` qui pointe vers ce serveur.

**3. `/opt/unda/docker-compose.yml` :**

```yaml
services:
  unda:
    image: ghcr.io/localhostdeveloper/unda:v0.1.50   # version la plus récente : voir les notes de version
    restart: unless-stopped
    ports:
      - "127.0.0.1:8090:8090"   # tableau de bord, pages de lecture, HLS : seul nginx sur ce serveur l'atteint
      - "1936:1936"             # RTMP (l'autre serveur média garde le 1935)
      - "6000:6000/udp"         # SRT (encodeurs, facultatif)
      - "8189:8189/udp"         # médias WebRTC (facultatif ; ajoutez webrtc.public_ips dans unda.yaml)
    volumes:
      - unda-data:/data
      - ./unda.yaml:/etc/unda/unda.yaml:ro
    environment:
      TZ: UTC                   # votre fuseau horaire (par ex. Europe/Paris) : noms des enregistrements et journaux
      UNDA_TRUSTED_PROXY_SECRET: ${UNDA_PROXY_KEY:-}   # depuis /opt/unda/.env (étape 5)
    read_only: true
    tmpfs: [/tmp]
    cap_drop: [ALL]
    security_opt: [no-new-privileges:true]
    ulimits:
      nofile: 65536
    logging:                    # sinon Docker garde les journaux indéfiniment
      options: { max-size: "10m", max-file: "5" }
    networks: [unda]

networks:
  unda:
    ipam:
      config:
        - subnet: 172.30.0.0/24   # fixe, pour que unda.yaml puisse faire confiance à nginx par son adresse

volumes:
  unda-data:
```

**4. `/opt/unda/unda.yaml` :**

```yaml
server:
  rtmp_addr: ":1936"
  http_addr: ":8090"
  # Les requêtes de nginx atteignent le conteneur depuis le réseau Docker
  # ci-dessus, pas depuis 127.0.0.1. Lui faire confiance permet à Unda de voir
  # que le navigateur a utilisé HTTPS (la connexion fonctionne alors) et
  # d'enregistrer la vraie adresse des visiteurs. Les autres programmes de ce
  # serveur viennent aussi de là : nginx envoie donc aussi un secret (étape 5).
  trusted_proxies: ["172.30.0.0/24"]
log:
  level: info
paths:
  recordings_dir: /data/recordings
  hls_dir: /data/hls
  data_dir: /data/state                # comptes, chaînes, licence : à sauvegarder
  media_dir: /data/media               # fichiers envoyés pour les chaînes 24h/24
srt:
  addr: ":6000"
```

Pas de section `tls:` : c'est nginx qui a le certificat. Si votre licence nomme des domaines, ajoutez `public_domains: [unda.example.com]` sous `server:` (section 4).

**5. nginx :** `/etc/nginx/sites-available/unda` :

```nginx
server {
    listen 80;
    server_name unda.example.com;

    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        include /etc/nginx/snippets/unda-proxy-key.conf;   # le secret, créé plus bas
        proxy_buffering off;              # les mises à jour en direct du tableau de bord
        proxy_request_buffering off;
        client_max_body_size 16m;         # les envois de médias arrivent en morceaux de 8 Mo
        proxy_read_timeout 1h;
    }
}
```

Créez le secret que nginx envoie à Unda (seul root peut le lire), activez le site et obtenez le certificat (certbot ajoute à ce fichier la partie HTTPS et la redirection, et le renouvelle) :

```bash
KEY=$(openssl rand -hex 24)
sudo install -d -m 755 /etc/nginx/snippets
sudo install -m 600 /dev/null /etc/nginx/snippets/unda-proxy-key.conf
printf 'proxy_set_header X-Unda-Proxy-Key "%s";\n' "$KEY" | sudo tee /etc/nginx/snippets/unda-proxy-key.conf >/dev/null
sudo install -m 600 /dev/null /opt/unda/.env
echo "UNDA_PROXY_KEY=$KEY" | sudo tee /opt/unda/.env >/dev/null
sudo ln -s /etc/nginx/sites-available/unda /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d unda.example.com
```

Une installation faite avant que cette étape existe : ajoutez la ligne `include` et créez les deux fichiers de la même façon, rechargez nginx, puis lancez `docker compose up -d` dans `/opt/unda`.

**6. Démarrez Unda :**

```bash
cd /opt/unda
docker compose up -d
docker compose logs unda | grep setup_link
```

Ouvrez `https://unda.example.com/dashboard#setup/<token>` et continuez avec la [section 3](#3-create-the-owner-account). Les encodeurs utilisent `rtmp://unda.example.com:1936/live` et `srt://unda.example.com:6000?streamid=publish:<key>` ; ouvrez 1936/tcp et 6000/udp dans le pare-feu (section 7), jamais le 8090.

**En cas de problème :**

- *La connexion indique que HTTPS est requis :* nginx n'envoie pas `X-Forwarded-Proto` ou le secret (la ligne `include`, et la même clé dans le fichier de nginx et dans `/opt/unda/.env`), ou `trusted_proxies` ne correspond pas au `subnet` du réseau.
- *`docker compose up` signale un chevauchement de plage d'adresses (« address pool overlaps ») :* un autre réseau Docker utilise déjà 172.30.0.0/24. Choisissez une autre plage privée (par ex. 172.31.0.0/24) et changez-la dans les deux fichiers.
- *nginx répond 502 :* Unda ne tourne pas, ou pas sur le 8090 (`docker compose ps`, `docker compose logs unda`).
- *Le journal répète `open /etc/unda/unda.yaml: no such file or directory` :* voir la première ligne de la [section 11](#after-the-install).

**Un réseau de studio fermé, sans HTTPS,** peut régler `auth.allow_insecure_login: true`. Le serveur écrit alors un avertissement à chaque démarrage, car les mots de passe traversent le réseau sans chiffrement. Sans ce réglage, le HTTP simple depuis une autre machine refuse tout identifiant (mot de passe, clé d'API, `api.token`, cookie de session) avec une erreur 403 `https_required` : les scripts et Prometheus doivent donc aussi utiliser `https://`. Sur un serveur public, fermez aussi le port HTTP simple dans le pare-feu si rien n'en a besoin.

---

## 3. Créer le compte propriétaire {#3-create-the-owner-account}

Le premier compte est le **propriétaire** (owner), qui peut tout faire. À son premier démarrage, le serveur écrit dans son journal un lien à usage unique (`setup_link`) et enregistre le jeton dans `<data_dir>/setup-token`.

Ouvrez-le sur votre adresse HTTPS :

```
https://tv.example.com/dashboard#setup/<token>
```

Saisissez votre e-mail, votre nom et un mot de passe d'au moins 10 caractères. Le lien cesse de fonctionner dès que le propriétaire existe.

**Pas encore de HTTPS, ou le lien est perdu ?** Créez plutôt le propriétaire depuis le terminal du serveur. Le mot de passe est lu sur l'entrée standard :

```bash
# systemd
sudo -u unda unda admin -config /etc/unda/unda.yaml create-user vous@example.com owner "Votre Nom"
# Docker (-T : le mot de passe arrive par un tube)
read -rs PW && printf '%s\n' "$PW" | docker compose exec -T unda \
  unda admin -config /etc/unda/unda.yaml create-user vous@example.com owner "Votre Nom"
```

Ensuite, sous **Server → Account**, activez la **connexion en deux étapes** (n'importe quelle application d'authentification) et rangez les codes de secours dans votre gestionnaire de mots de passe.

---

## 4. Installer la licence {#4-install-the-license}

En tant que propriétaire : **Server → License** → *Install a license* → choisissez votre fichier `.license.json` → **Install**. Ou depuis le terminal :

```bash
sudo -u unda unda license -config /etc/unda/unda.yaml install acme.license.json
sudo -u unda unda license -config /etc/unda/unda.yaml show
```

Installées depuis le tableau de bord, les limites de flux et de comptes s'appliquent aussitôt ; depuis le terminal, le serveur en marche prend le fichier en compte dans l'heure (redémarrez-le pour l'appliquer aussitôt). Les fonctions qui démarrent avec le serveur (SRT, entrées UDP, transcodage) suivent une nouvelle licence **après un redémarrage**.

Ce que veulent dire les états :

| État | Ce qui se passe |
|---|---|
| valid | tout ce que comprend la licence |
| expiring | une bannière s'affiche dès 30 jours avant la date de fin |
| grace | expirée depuis moins de 14 jours ; tout fonctionne encore et la bannière fait le décompte |
| expired | les **nouveaux** flux sont refusés ; ceux déjà en direct continuent. Installez une licence renouvelée : elle prend effet aussitôt |
| evaluation | pas de fichier de licence : 2 flux en direct, 2 comptes en plus du premier propriétaire, pendant 30 jours |
| evaluation_ended | les 30 jours sont passés : les nouveaux flux sont refusés jusqu'à l'installation d'une licence |
| invalid | le fichier est endommagé ou n'est pas pour ce serveur : limites de l'évaluation jusqu'à l'installation d'une licence valide |

Une licence peut être émise pour votre ou vos domaines. Elle ne fonctionne alors que sur un serveur dont le certificat HTTPS est établi pour ces noms. Derrière Caddy ou nginx, où Unda n'a pas de certificat à lui, listez le ou les noms dans `/etc/unda/unda.yaml` :

```yaml
server:
  public_domains: [tv.example.com]
```

**Server → License** montre les domaines pour lesquels une licence est émise, et le signale quand le domaine de ce serveur n'en fait pas partie.

La licence est vérifiée sur le serveur, hors ligne. Rien n'est envoyé à votre fournisseur.

---

## 5. Inviter votre équipe {#5-invite-your-team}

**Users** → *Invite someone* : e-mail, rôle et, pour les diffuseurs, le nombre de chaînes qu'ils peuvent créer. Vous obtenez un lien valable 72 heures, utilisable une seule fois. Envoyez-le vous-même (messagerie, e-mail) ; la personne l'ouvre et choisit un mot de passe.

| Rôle | Peut |
|---|---|
| **owner** (propriétaire) | tout : licence, accès pour le support, autres propriétaires |
| **admin** | les utilisateurs (sauf les propriétaires), les réglages de sécurité, les clés d'API, le journal d'audit, et tout ce que peut un opérateur |
| **operator** (opérateur) | fait tourner la production : tous les flux, arrêt, enregistrement, rediffusion, transcodage, entrées UDP, page Server |
| **streamer** (diffuseur) | seulement ses propres chaînes : clé de flux, état, santé, spectateurs, ses destinations de rediffusion |

Réglages utiles :

- **Users → Security** : exiger la connexion en deux étapes pour certains rôles (par exemple owner, admin et operator). Les personnes de ces rôles doivent la mettre en place à leur prochaine connexion avant de pouvoir faire quoi que ce soit d'autre.
- **Server → API keys** (admin) : pour les scripts et Prometheus. Chaque clé a un rôle, n'est montrée qu'une fois et peut être révoquée. Prometheus : `authorization.credentials_file` contenant une clé d'opérateur, en lisant `https://tv.example.com/metrics`.
- **Audit log** (admin) : qui a fait quoi — connexions, connexions échouées, changements de rôle, clés de flux révélées ou remplacées, licences, accès pour le support. Conservé un an.

Les sessions durent 12 heures sans activité et 7 jours au plus. Cinq mauvais mots de passe depuis une même adresse bloquent cette adresse pour ce compte pendant 15 minutes, durée qui double à chaque fois jusqu'à un jour ; le compte reste utilisable depuis d'autres adresses. `unda admin unlock` lève tous les blocages. Derrière un proxy inverse, listez-le dans `server.trusted_proxies`, sinon tous les visiteurs partagent l'adresse du proxy et une seule personne qui devine des mots de passe bloque tout le monde.

---

## 6. Premier direct {#6-first-stream}

Les flux sont publiés vers des **chaînes**. Une chaîne a un **nom** public, utilisé dans le lien de lecture (`/watch/<name>`), et une **clé de flux** secrète (`sk_…`), seule chose qui permette de passer en direct sur elle.

1. **Channels** → *New channel* → par ex. `main-show`. Un admin peut la créer pour un diffuseur ; un diffuseur crée les siennes.
2. La page affiche les réglages de l'encodeur. Dans OBS : **Paramètres → Stream**, service **Personnalisé…**, puis :
   - Serveur : `rtmp://tv.example.com:1935/live`, ou par internet `rtmps://tv.example.com:1936/live` (RTMPS : la clé et les images voyagent chiffrées ; OBS, vMix et FFmpeg le prennent en charge)
   - Clé de stream : la clé `sk_…`
3. Lancez le direct. En quelques secondes, il apparaît sous **Streams** comme `main-show`.
4. Les spectateurs regardent sur `https://tv.example.com/watch/main-show`. La clé n'est jamais dans ce lien.

Si une clé fuite, utilisez **New key** sur la chaîne. L'ancienne clé cesse aussitôt de fonctionner et un direct qui l'utilise est déconnecté.

Les encodeurs SRT utilisent `srt://tv.example.com:6000?streamid=publish:<clé sk_…>` (depuis **Channels**).

OBS 30 et plus récent peut aussi publier en WebRTC (WHIP), avec environ une seconde de délai pour les spectateurs qui utilisent l'interrupteur **Low latency** de la page de lecture : Service **WHIP**, Serveur `https://tv.example.com/whip/main-show`, Bearer Token la clé `sk_…`. WebRTC demande la fonction WebRTC de la licence, HTTPS et le port UDP 8189 ouvert (section 7).

---

## 7. Pare-feu {#7-firewall}

N'ouvrez que ce qui sert :

```bash
sudo ufw allow 443/tcp     # HTTPS : tableau de bord, pages de lecture, HLS
sudo ufw allow 80/tcp      # vérifications de Let's Encrypt et redirection HTTP → HTTPS
sudo ufw allow 1935/tcp    # encodeurs RTMP
sudo ufw allow 1936/tcp    # encodeurs RTMPS (RTMP sur TLS, chiffré)
sudo ufw allow 6000/udp    # encodeurs SRT (si utilisés)
sudo ufw allow 8189/udp    # médias WebRTC : encodeurs WHIP, spectateurs à faible délai (si utilisés)
```

Avec firewalld (AlmaLinux, Rocky Linux, Red Hat), ouvrez les mêmes ports avec `firewall-cmd --permanent --add-port=…` et `firewall-cmd --reload` (section 1).

Quand ufw est actif, l'installateur ouvre les ports d'Unda lors de la première installation seulement. Une mise à jour laisse le pare-feu tel quel (une règle que vous avez restreinte le reste) et liste les ports qu'Unda utilise, au cas où une nouvelle version en utiliserait un de plus.

RTMPS est actif par défaut dès qu'Unda a HTTPS : même certificat, port 1936 (1937 si le RTMP simple a été déplacé sur le 1936). Le RTMP simple envoie la clé de flux et les images telles quelles, donc n'importe qui sur le chemin peut copier la clé : par internet, préférez RTMPS, SRT avec une phrase secrète, ou WHIP. `server.rtmps_addr` choisit un autre port, ou `off` désactive RTMPS. Si son port est pris par un autre programme, Unda démarre sans RTMPS et le dit dans son journal.

La signalisation de WebRTC passe par HTTPS (443) ; son audio et sa vidéo utilisent le seul port UDP `webrtc.udp_port` (8189). Derrière un NAT 1:1 (le pont de Docker, un serveur cloud avec une adresse privée), réglez `webrtc.public_ips` sur l'adresse publique. Les spectateurs sur des réseaux qui bloquent l'UDP ont besoin d'un relais TURN : voir le [guide WebRTC](/fr/guide/webrtc).

Avec un proxy devant (section 2), n'ouvrez **pas** le port HTTP propre d'Unda (8080) : seul le proxy doit l'atteindre.

**Les entrées UDP et RTP n'ont ni mot de passe ni chiffrement :** quiconque peut joindre le port peut y envoyer un flux, et quiconque sur le chemin peut le regarder. Gardez-les sur un réseau privé de confiance (un réseau local de studio, une ligne louée, un VPN), donnez à chaque entrée une liste `allow` de ses émetteurs, et n'ouvrez le port qu'à ces émetteurs :

```bash
sudo ufw allow from 192.0.2.20 to any port 5004 proto udp   # un émetteur, une entrée
```

Il en va de même pour les sorties UDP et RTP : ce qu'elles envoient peut être lu en route, donc ne les envoyez que sur un réseau de confiance. Par internet, utilisez plutôt SRT (avec une phrase secrète) ou RIST.

---

## 8. Sauvegardes et mises à jour {#8-backups-and-upgrades}

Tout ce qui ne peut pas être recréé se trouve dans le dossier des données (`/var/lib/unda/state` ou le volume Docker `/data/state`) : `unda.db` contient les comptes, les chaînes et leurs clés, les clés d'API, les réglages et le journal d'audit. `license.json` est la licence. `acme/` contient les certificats HTTPS (on peut les obtenir à nouveau, mais les garder évite les limites de Let's Encrypt). Les enregistrements sont à part (`recordings_dir`).

**Les copies quotidiennes sont automatiques.** Tant qu'il tourne, Unda copie la base de données une fois par jour dans `state/backups/daily-<date>.db` du dossier des données (`/var/lib/unda/state/backups`, ou `/data/state/backups` dans le volume Docker) et garde les sept plus récentes. Server → Status dans le tableau de bord montre la copie la plus récente ; une copie qui échoue (une copie laisse toujours 1 Go de libre sur le disque) y est une alerte. Pour en garder plus, ou aucune (une autre sauvegarde couvre la base de données) :

```yaml
backups:
  keep_days: 30       # 0 = 7, au plus 365
  # disabled: true
```

**Copiez-les hors du serveur.** Ces copies sont sur le disque du serveur lui-même : un disque ou un serveur perdu les emporte avec lui. Copiez régulièrement le dossier et `license.json` sur une autre machine, par exemple chaque nuit depuis la crontab du serveur :

```bash
# installation systemd (en root)
tar czf - -C /var/lib/unda/state backups license.json | \
  ssh backup@backup.example.com "cat > unda-$(date +%F).tgz"
# Docker
docker compose exec -T unda tar czf - -C /data/state backups license.json | \
  ssh backup@backup.example.com "cat > unda-$(date +%F).tgz"
```

**Ou téléchargez une sauvegarde verrouillée sur votre ordinateur.** Sur Server → Status, un propriétaire peut télécharger une copie de la base de données verrouillée par une phrase secrète de son choix, après avoir saisi à nouveau son mot de passe (et son code de connexion en deux étapes). Sans la phrase secrète, le fichier n'ouvre rien : il ne craint rien sur un portable ou dans un stockage en ligne ; gardez la phrase secrète ailleurs (un gestionnaire de mots de passe). Elle contient les comptes, les chaînes et leurs clés, tous les réglages et les journaux ; elle laisse de côté le fichier de licence, les personnes connectées, les blocages de connexion, les invitations en attente et l'historique des spectateurs. Six au plus peuvent être téléchargées par heure, et chacune figure dans le journal d'audit.

Pour faire vous-même une copie à tout moment (avant un gros changement), la commande de sauvegarde peut tourner pendant que le serveur fonctionne :

```bash
# systemd
sudo -u unda unda admin -config /etc/unda/unda.yaml \
  backup /var/lib/unda/backup-$(date +%F).db
# Docker
docker compose exec unda unda admin -config /etc/unda/unda.yaml \
  backup /data/backup-$(date +%F).db
```

Le fichier de sauvegarde ne doit pas exister déjà (il n'est jamais écrasé), d'où la date dans son nom. La base de données contient les clés de flux : gardez les sauvegardes aussi privées que le serveur.

**Restaurer :** arrêtez Unda, puis `unda admin restore` remet une sauvegarde en place : une sauvegarde verrouillée téléchargée depuis le tableau de bord (il demande la phrase secrète) ou une copie simple (une copie quotidienne, une copie d'avant mise à jour, `unda admin backup`). La base de données qu'elle remplace est conservée dans `state/backups/pre-restore-<time>/`, et une phrase secrète erronée ou un fichier endommagé ne change rien. Tout le monde se reconnecte ensuite. Sur un nouveau serveur, installez aussi `license.json` : il ne fait pas partie des sauvegardes.

```bash
# systemd : copiez d'abord le fichier sur le serveur (scp unda-backup-….unda-backup vous@serveur:/tmp/)
sudo systemctl stop unda
sudo -u unda unda admin -config /etc/unda/unda.yaml restore /tmp/unda-backup-2026-10-20.unda-backup
sudo systemctl start unda
# Docker : copiez le fichier dans le volume, puis restaurez avec le service arrêté
docker compose stop unda
docker compose cp unda-backup-2026-10-20.unda-backup unda:/data/
docker compose run --rm --entrypoint unda unda admin -config /etc/unda/unda.yaml \
  restore /data/unda-backup-2026-10-20.unda-backup
docker compose start unda
```

La phrase secrète reste visible pendant la saisie ; pour l'éviter, faites-la passer par un tube (`printf '%s\n' "$PASSPHRASE" | … restore FILE`, en ajoutant `-T` après `docker compose run`). La commande refuse de s'exécuter pendant qu'Unda tourne, et en root quand le dossier des données appartient à l'utilisateur du service (lancez-la avec `sudo -u unda`, comme ci-dessus, pour que le fichier restauré reste à Unda).

Sans la commande (une copie simple seulement) :

```bash
sudo systemctl stop unda
sudo -u unda rm -f /var/lib/unda/state/unda.db-wal /var/lib/unda/state/unda.db-shm
sudo -u unda cp backup-2026-09-24.db /var/lib/unda/state/unda.db
sudo systemctl start unda
```

**Mettre à jour :**

Quelle que soit la façon de mettre à jour, le premier démarrage de la nouvelle version copie la base de données avant de changer quoi que ce soit : `state/backups/pre-upgrade-<old>-to-<new>-<time>.db` dans le dossier des données (`/var/lib/unda/state/backups`, ou `/data/state/backups` dans le volume Docker ; les cinq plus récentes sont gardées). Si cette copie échoue (un disque plein), Unda ne démarre pas et le dit ; libérez de la place et démarrez-le à nouveau. `UNDA_SKIP_UPGRADE_BACKUP=1` dans son environnement le fait démarrer sans la copie, pour quand vous en avez une autre.

- **Installé avec `install.sh`, depuis la v0.1.50 :**

  ```bash
  sudo unda upgrade          # unda upgrade -check se contente de regarder
  ```

  Votre Unda vérifie la nouvelle version avec la clé du fournisseur intégrée en lui avant que quoi que ce soit ne s'exécute : la signature de la version, chaque fichier, qu'il s'agit bien de la version annoncée, et qu'elle est plus récente que la vôtre (il ne revient jamais en arrière : un site de téléchargement ramené à une version plus ancienne ne peut pas faire reculer votre serveur). Il lance ensuite l'installateur vérifié de cette version, qui met à jour comme ci-dessous. `-version vX.Y.Z` choisit une autre version que la plus récente (jamais une plus ancienne).
- **Installé avec `install.sh`, autrement :** relancez la même commande d'installation (la ligne `curl … | sudo bash -s -- --domain …`, ou `./install.sh` depuis le dossier de la nouvelle version ; depuis la v0.1.50, `--upgrade` peut remplacer `--domain …`). Elle sauvegarde aussi d'abord la base de données avec l'ancienne version, dans `/var/lib/unda/backups/pre-upgrade-<date_time>.db` (les cinq plus récentes sont gardées), puis remplace le binaire et redémarre Unda. Votre configuration, vos comptes, vos chaînes, votre licence et vos certificats sont conservés. Si cette sauvegarde échoue, rien n'est mis à jour.
- **Docker :** indiquez la nouvelle version dans `docker-compose.yml` (`image: …/unda:v0.2.0`), puis :

  ```bash
  docker compose pull
  docker compose up -d
  ```

  Pour revenir en arrière, remettez l'ancienne version et restaurez la copie `pre-upgrade-…` de cette mise à jour (plus haut) : une version plus ancienne refuse une base de données qu'une plus récente a modifiée.
- **À la main :** remplacez le binaire et lancez `systemctl restart unda`.

**Savoir quand il y en a une :** deux fois par jour, Unda lit la description de la dernière version sur la page des versions de votre fournisseur. Quand une version plus récente existe, les propriétaires et les admins le voient dans le tableau de bord (Overview → *Other notices*, et en bas de la barre latérale) avec un lien vers ses notes de version. Il ne fait que lire : rien n'est téléchargé ni installé tant que vous ne lancez pas la mise à jour. La requête ne transmet rien sur votre serveur en dehors de sa version. Pour le désactiver :

```yaml
updates:
  disabled: true
```

`unda -version` affiche la version installée.

La base de données est mise à jour automatiquement au démarrage. Un redémarrage du serveur déconnecte les encodeurs en direct pendant quelques secondes ; OBS se reconnecte de lui-même.

Revenir à une version plus ancienne après une mise à jour est refusé (« newer than this build knows »). Restaurez la sauvegarde faite avant la mise à jour, ou utilisez la version plus récente. L'installateur (depuis la v0.1.50) refuse aussi de mettre une version plus ancienne par-dessus une plus récente : une ancienne version servie à la place de la plus récente ne peut pas faire reculer un serveur. Pour revenir en arrière volontairement, restaurez d'abord la sauvegarde, puis lancez l'installateur de l'ancienne version avec `--allow-downgrade` (les installateurs d'avant la v0.1.50 n'en ont pas besoin).

**Les mises à jour de sécurité d'Ubuntu :** Ubuntu les installe de lui-même chaque matin, et son outil `needrestart` redémarre ensuite les services qui utilisent encore une bibliothèque qu'une mise à jour a remplacée. Les processus FFmpeg d'Unda utilisent de telles bibliothèques : il redémarrait donc Unda à ce moment-là, mettant chaque chaîne hors antenne pendant quelques secondes. L'installateur l'en empêche (`/etc/needrestart/conf.d/unda.conf`) : les mises à jour s'installent toujours, et chaque FFmpeg qu'Unda lance ensuite les utilise aussitôt, mais ceux qui tournent déjà gardent l'ancienne copie jusqu'au redémarrage d'Unda. Redémarrez-le à un moment calme quand une mise à jour attend :

```bash
sudo needrestart -r l          # liste les services qui attendent un redémarrage
sudo systemctl restart unda    # les encodeurs se reconnectent d'eux-mêmes
```

Une mise à jour d'Unda ou un redémarrage du serveur fait de même.

---

## 9. Si quelqu'un est bloqué {#9-if-someone-is-locked-out}

**N'importe qui sauf le propriétaire :** un admin règle cela dans **Users** :

- *Disable* / *Enable* (désactiver / réactiver) ;
- *Sign out* (met fin à toutes les sessions de cette personne) ;
- *Reset 2FA* (un téléphone perdu).

**Le propriétaire, ou personne ne peut se connecter :** utilisez le terminal du serveur. Avoir accès au terminal du serveur tient ici lieu d'identifiant :

```bash
G="sudo -u unda unda admin -config /etc/unda/unda.yaml"
# Docker : G="docker compose exec -T unda unda admin -config /etc/unda/unda.yaml"
$G list-users
$G unlock vous@example.com                                  # après trop de mauvais mots de passe
read -rs PW && printf '%s\n' "$PW" | $G reset-password vous@example.com
$G disable-2fa vous@example.com                             # téléphone et codes de secours perdus
read -rs PW && printf '%s\n' "$PW" | $G create-user nouveau@example.com owner "Nouveau Propriétaire"
```

Chacune de ces actions est inscrite au journal d'audit comme faite par `shell`.

---

## 10. L'accès d'assistance pour votre fournisseur {#10-support-access-for-your-vendor}

Votre fournisseur n'a **aucun compte et aucun moyen d'entrer** tant que vous ne lui en donnez pas un.

- **Donner l'accès :** en tant que propriétaire, allez dans **License → Support access**, saisissez l'e-mail du fournisseur et une durée (de 1 à 14 jours). Envoyez-lui le lien affiché.
- **Ce qu'il obtient :** un compte admin. Tout ce qu'il fait apparaît dans le journal d'audit marqué « (support) ».
- **Quand cela se termine :** automatiquement à la date de fin. *End support access now* le ferme aussitôt et le déconnecte.

---

## 11. Dépannage {#11-troubleshooting}

### Quand l'installation s'arrête {#when-the-install-stops}

L'installateur s'arrête avant d'écrire quoi que ce soit d'Unda quand quelque chose sur la machine gêne, et dit quoi faire. Corrigez, puis relancez la même commande.

| L'installateur dit | Cause et solution |
|---|---|
| `Switching off the snap version of Docker` (pas une erreur) | Le Docker en snap d'Ubuntu ne peut pas faire tourner Unda : il ne peut pas lire `/opt/unda` et tient les conteneurs à l'écart du réseau de la machine. L'installateur le désactive (ses images et conteneurs sont gardés ; `sudo snap start --enable docker` le remet en marche) et installe le Docker propre à Ubuntu. |
| `the snap version of Docker runs N container(s) here` | Autre chose sur cette machine tourne dans le Docker en snap : l'installateur n'y touche donc pas. Arrêtez ces conteneurs (ou déplacez-les vers Docker Engine), puis `sudo snap stop --disable docker` et relancez l'installation. |
| `Docker did not start. Its log says: …` | Docker Engine est installé mais ne démarre pas ; les lignes après « Its log says » sont la raison donnée par Docker lui-même. Une erreur dans `/etc/docker/daemon.json` : `sudo dockerd --validate`. Des erreurs `iptables` ou `NAT chain` : `sudo apt-get install -y iptables`, puis `sudo systemctl restart docker`. containerd : `sudo systemctl restart containerd docker`. Le journal complet de Docker : `sudo journalctl -u docker -n 50 --no-pager`. |
| `this Docker is Docker Desktop` | Docker Desktop fait tourner les conteneurs dans une machine virtuelle à lui, hors de portée des dossiers, des ports et du multicast de cette machine. Installez plutôt Docker Engine (le `docker.io` d'Ubuntu ou le `docker-ce` de Docker). |
| `port N (…) is used by another program` | Le message nomme le programme et l'option pour choisir un autre port (`--rtmp-port`, `--https-port`, `--http-port`, `--srt-port`, `--webrtc-port`, `--rtmps-port`). Ou arrêtez l'autre programme. |
| `give your domain: --domain tv.example.com` | L'installation sans Docker demande un domaine. Sur une machine qui n'en a pas, ajoutez plutôt `--docker` (section 1). |

### Après l'installation {#after-the-install}

| Symptôme | Cause et solution |
|---|---|
| Docker : le journal répète `open /etc/unda/unda.yaml: no such file or directory` (ou `is a directory`) | Le conteneur a été démarré avant que `unda.yaml` n'existe à côté de `docker-compose.yml` (ou sous un autre nom) : Docker a alors créé un dossier vide à sa place. Dans ce dossier, `ls -la` : `unda.yaml` doit être un fichier (`-rw-`), pas un dossier (`d`). Si c'est un dossier, `rm -r unda.yaml` et écrivez le fichier à nouveau ; puis `chmod 644 unda.yaml` et `docker compose up -d --force-recreate unda` (cela ne remplace que le conteneur d'Unda ; les autres applications Docker continuent de tourner) |
| `could not get a certificate` dans le journal, ou le navigateur avertit au sujet du certificat | Le DNS du domaine doit pointer vers ce serveur, et les ports 443 et/ou 80 doivent être ouverts et redirigés vers lui. La ligne du journal donne la raison de Let's Encrypt. Des échecs répétés peuvent atteindre la limite de Let's Encrypt (5 vérifications échouées par heure) : testez avec `directory_url: staging` |
| Unda ne démarre pas : `listen tcp :1935: bind: address already in use` (ou :443, :80, :6000) | Un autre programme utilise ce port. Donnez-en un autre à Unda dans `/etc/unda/unda.yaml` (`rtmp_addr: ":1936"` : les encodeurs utilisent alors `rtmp://DOMAIN:1936/live` ; `srt.addr` ; `http_addr: ":8443"` : les spectateurs utilisent alors `https://DOMAIN:8443`), ou passez `--rtmp-port`, `--https-port`, `--http-port`, `--srt-port` à `install.sh` lors d'une nouvelle installation. Let's Encrypt a toujours besoin du port **80 ou 443** pour Unda : si un serveur web occupe les deux (nginx, Caddy, Apache), installez Unda derrière lui avec `--behind-proxy PORT` (section 1) ; si c'est un autre genre de programme, utilisez un fichier de certificat (`--cert-file` ; « Partager un serveur » dans la section 2) |
| « signing in over plain HTTP is only allowed from this machine » | Utilisez l'adresse HTTPS. Derrière un proxy, vérifiez que `server.trusted_proxies` le liste et qu'il envoie `X-Forwarded-Proto` |
| « cross-site request refused » | Le proxy change l'en-tête `Host` ; gardez-le (`proxy_set_header Host $host`) |
| Le tableau de bord reste sur « Reconnecting… » derrière nginx | Ajoutez `proxy_buffering off` (les mises à jour en direct sont une réponse de longue durée) |
| Une destination SRT échoue sans cesse : « no answer », « server didn't respond » | Rien n'écoute sur cette adresse et ce port, un pare-feu bloque l'UDP en route, ou le récepteur est occupé : la plupart des récepteurs SRT n'acceptent qu'un appelant à la fois, et un autre appelant le tient (une analyse de la même adresse sous **Broadcast → Analyse**, un autre serveur, une connexion qui n'a pas encore expiré). Arrêtez l'autre appelant, puis désactivez et réactivez la destination : elle réessaie aussitôt. Le bouton **Logs** de la chaîne télécharge toutes les lignes qui concernent cette adresse |
| **Server → Transcoding** : `nvidia-smi failed: No devices were found` | Le pilote NVIDIA est chargé mais ne peut pas démarrer la carte (`sudo dmesg \| grep NVRM` affiche `RmInitAdapter failed`). Si `nvidia-smi -L` échoue aussi chez vous, la cause est la machine, pas Unda. Essayez un autre pilote propriétaire que propose `ubuntu-drivers list` (`sudo apt install nvidia-driver-580`, redémarrez ; réinstaller le précédent revient en arrière) ; les pilotes `-open` ne font tourner que les cartes de 2018 et après. Ensuite le BIOS (« Above 4G Decoding », une mise à jour) ou un autre emplacement ; sur un serveur cloud, cela relève du fournisseur : envoyez-lui la ligne `RmInitAdapter failed` et demandez-lui de réinitialiser la carte sur son hôte. Détails : [Quand votre carte graphique n'apparaît pas](/fr/guide/transcoding#when-your-graphics-card-isnt-listed) dans le guide du transcodage |
| Une carte NVIDIA ou AMD n'est pas utilisée dans Docker | L'image Docker d'Unda n'a pas d'encodeur NVIDIA ni de pilote AMD (Intel fonctionne avec `devices: [/dev/dri]`). Installez sans Docker ; à côté d'un autre serveur web, avec `--behind-proxy` |
| Un encodeur est refusé avec « license limit » | La limite de flux simultanés de la licence est atteinte (ou les 2 de l'évaluation). Voir **Server → License** |
| L'encodeur est refusé alors que la clé semble bonne | La clé de la chaîne a été remplacée (**New key**), ou la chaîne a été supprimée. Copiez à nouveau la clé depuis **Channels** |
| « … is at schema version N, newer than this build knows » | Une version plus ancienne a été lancée sur la base de données d'une plus récente : restaurez la sauvegarde d'avant la mise à jour ou utilisez la version plus récente |
| La bannière indique « invalid » | Le fichier de licence est endommagé ou signé pour une autre compilation : demandez un nouveau fichier à votre fournisseur |
| Personne ne peut se connecter | [Section 9](#9-if-someone-is-locked-out) |

Journaux : `journalctl -u unda` ou `docker compose logs unda` (une ligne JSON par événement ; les mots de passe et les clés de flux n'y figurent jamais).

---

## 12. Désinstaller Unda {#12-removing-unda}

**Gardez d'abord ce dont vous pourriez avoir besoin.** Désinstaller Unda supprime ses comptes, ses chaînes, ses enregistrements, ses médias envoyés et sa licence. Copiez ce que vous voulez garder : une sauvegarde de la base de données (section 8), votre fichier `.license.json` (pour déplacer la licence vers un autre serveur), et les dossiers des enregistrements et des médias.

### Docker {#docker}

Dans le dossier qui contient le `docker-compose.yml` d'Unda (par ex. `/opt/unda`) :

```bash
cd /opt/unda
docker compose down --volumes --rmi all   # irréversible : conteneur, réseau, volume de données et image d'Unda
cd / && sudo rm -r /opt/unda
```

Cela ne touche que ce que ce `docker-compose.yml` définit : les autres applications Docker du serveur (AzuraCast, bases de données, autres projets) continuent de tourner et gardent leurs données. N'utilisez jamais `docker system prune` pour cela ; cette commande supprime bien plus qu'Unda. Avec le dossier Caddy, la même commande supprime aussi Caddy et ses certificats.

**Derrière nginx** ([cette configuration](#docker-behind-nginx-on-the-same-server)), supprimez aussi son site et son certificat :

```bash
sudo rm /etc/nginx/sites-enabled/unda /etc/nginx/sites-available/unda
sudo nginx -t && sudo systemctl reload nginx
sudo certbot delete --cert-name unda.example.com
```

### Binaire + systemd (et l'installation en une commande) {#binary--systemd-and-the-one-command-install}

Vérifiez d'abord `paths:` dans `/etc/unda/unda.yaml` : les dossiers ci-dessous sont ceux de l'installateur ; déplacez ou supprimez ceux que vous avez placés ailleurs vous-même.

```bash
sudo systemctl disable --now unda
sudo systemctl disable --now unda-cert-sync.timer 2>/dev/null   # seulement avec --cert-file
sudo rm -f /etc/systemd/system/unda.service \
  /etc/systemd/system/unda-cert-sync.service /etc/systemd/system/unda-cert-sync.timer \
  /usr/local/sbin/unda-cert-sync /usr/local/bin/unda /etc/needrestart/conf.d/unda.conf
sudo systemctl daemon-reload
sudo rm -r /etc/unda        # configuration, fichier de secrets, copies des certificats
sudo rm -r /var/lib/unda    # irréversible : comptes, enregistrements, médias, sauvegardes, certificats
sudo userdel unda
```

FFmpeg (`--with-ffmpeg`) reste installé, car d'autres programmes peuvent l'utiliser : `sudo apt remove ffmpeg` si rien ne s'en sert.

### Pare-feu {#firewall}

Fermez les ports que vous avez ouverts pour Unda (section 7), mais **seulement ceux qu'aucun autre programme n'utilise** : sur un serveur partagé, les ports 443 et 80 servent en général encore l'autre programme.

```bash
sudo ufw status numbered
sudo ufw delete allow 1935/tcp   # par ex. le RTMP ; à refaire pour chacun des ports propres à Unda
```
