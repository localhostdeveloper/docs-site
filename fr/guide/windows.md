---
title: "Faire tourner Unda Media Server sous Windows (WSL ou Docker Desktop)"
description: "Faites tourner Unda sur un PC Windows : dans Ubuntu sous WSL avec le réseau en miroir, ou dans Docker Desktop. Lequel choisir, les étapes, les ports, le démarrage sans connexion, et les limites de chacun."
---

# Unda sous Windows

Unda est un programme Linux. Sur un PC Windows, il tourne de l'une de ces deux façons :

- **WSL** : l'Ubuntu intégré à Windows (Windows Subsystem for Linux), avec Unda installé par le script d'installation Linux habituel.
- **Docker Desktop** : l'application Windows de Docker, qui fait tourner l'image d'Unda.

Les deux font tourner Linux dans une petite machine virtuelle à l'intérieur de Windows. Ils diffèrent par la façon dont cette machine est reliée à votre réseau et par la façon dont elle démarre.

## Lequel choisir {#which-to-choose}

| | Serveur Linux ou VPS | WSL sous Windows 11 | Docker Desktop |
|---|---|---|---|
| Démarre après un redémarrage sans que personne ne se connecte | Oui | Oui, avec une tâche de démarrage ([étape 6](#6-keep-it-running-after-a-reboot)) | Non : Docker Desktop démarre quand un utilisateur se connecte |
| Les autres machines joignent Unda à l'adresse du PC | Oui | Oui (réseau en miroir) | Oui, sur les ports que vous publiez |
| Multicast en entrée et en sortie (UDP/RTP depuis des encodeurs, des IRD, des décodeurs) | Oui | En sortie : oui, en service (une sortie TV vers la passerelle SRT d'une chaîne). En entrée : devrait fonctionner, par le même réseau en miroir | En sortie avec l'[assistant unda-mcast](#multicast-out-the-unda-mcast-helper) ; pas en entrée |
| Le tableau de bord voit la vraie adresse de chaque spectateur | Oui | Oui | Non : chaque spectateur apparaît avec l'adresse de Docker lui-même, donc les limites par adresse et la page Sessions ne distinguent pas les spectateurs |
| Encode sur une carte graphique | Oui (NVIDIA ; Intel devrait fonctionner) | Non : le processeur | Non : le processeur |
| Coût | Gratuit | Gratuit (fait partie de Windows) | L'offre payante de Docker pour les plus grandes entreprises |

**Notre conseil :**

1. **Une machine Linux ou un VPS est le mieux** pour des chaînes à l'antenne jour et nuit : rien d'autre ne partage son processeur, elle redémarre d'elle-même après une coupure de courant, et elle peut encoder sur une carte graphique. Utilisez-en une à partir de trois chaînes.
2. **Une chaîne de télévision avec une ou deux chaînes qui veut rester sous Windows : utilisez WSL sous Windows 11** ([en une commande](#in-one-command)). Il démarre avec Windows, porte le multicast et garde les vraies adresses des spectateurs, sans frais. Deux chaînes, chacune avec une sortie TV H.264, utilisent environ 2 à 4 cœurs du processeur : un PC récent à 6 cœurs ou plus a donc de la place sans carte graphique. Pour une chaîne de télévision :
   - **Donnez à Unda un PC à lui**, pas celui qui fait tourner vMix ou votre diffusion. Les sorties TV réencodent en temps réel et ont besoin de leur part du processeur à chaque instant ; sur un PC partagé, un moment chargé du programme peut casser l'image de la chaîne. La rediffusion vers les plateformes convient à un PC partagé.
   - **Réglez le PC pour qu'il ne se mette jamais en veille** (Paramètres → Système → Alimentation).
   - **Réglez les heures d'activité de Windows Update sur vos heures de programme** (Paramètres → Windows Update → Options avancées). Windows ne redémarre alors pour les mises à jour qu'en dehors de ces heures, et Unda revient de lui-même une minute ou deux après le redémarrage.
3. **Utilisez Docker Desktop pour essayer Unda, ou sous Windows 10**, où WSL ne peut pas partager le réseau du PC (son réseau en miroir demande Windows 11).

## WSL sous Windows 11 {#wsl-on-windows-11}

### En une commande {#in-one-command}

Une commande PowerShell fait pour vous toutes les étapes ci-dessous. D'abord, ce qu'il lui faut et ce qu'elle ne sait pas faire :

- **Windows 11, version 22H2 ou plus récente.** Un Windows plus ancien ne peut pas mettre WSL sur le réseau du PC ; sous Windows 10, utilisez [Docker Desktop](#docker-desktop).
- **La virtualisation activée** dans le micrologiciel du PC : Gestionnaire des tâches → Performance → Processeur affiche « Virtualisation : Activé ». S'il affiche Désactivé, la commande s'arrête et vous dit comment l'activer. Un VPS Windows demande que son hébergeur autorise la virtualisation imbriquée ; là où ce n'est pas possible, utilisez une machine Linux ou un VPS Linux.
- **PowerShell en administrateur, connecté avec l'utilisateur Windows qui utilisera Ubuntu.** Ubuntu et sa tâche de démarrage appartiennent à cet utilisateur.
- **La première fois, deux choses à faire à la main :** si WSL est nouveau sur le PC, il vous demande de redémarrer Windows et de relancer la commande ; et Ubuntu s'ouvre dans une fenêtre à part, où vous choisissez un nom d'utilisateur et un mot de passe Linux. Quand cette fenêtre affiche l'invite d'Ubuntu, fermez-la : la commande continue.
- **Docker Desktop est installé ?** Désinstallez-le d'abord, ou désactivez son intégration WSL pour Ubuntu (**Settings → Resources → WSL integration**). Sinon Ubuntu utilise le `docker` de Docker Desktop, et le script d'installation s'arrête pour le signaler.
- **Encodage sur le processeur seulement :** Unda dans WSL n'utilise pas de carte graphique. Il partage le processeur avec tout ce qui tourne d'autre sur le PC (vMix, OBS). Pour une chaîne à l'antenne jour et nuit, une machine Linux est préférable.
- **Un certificat qu'Unda fabrique lui-même :** les navigateurs le signalent une fois (choisissez Paramètres avancés, puis continuez).
- **Les ports habituels d'Unda :** le tableau de bord sur 8443, RTMP sur 1935 (RTMPS 1936), SRT sur 6000. Pour d'autres ports, suivez à la main les étapes ci-dessous.
- **Démarrage avec Windows :** sur un compte avec mot de passe, la tâche démarre Unda une minute après le démarrage de Windows, avant que quiconque ne se connecte (elle demande le mot de passe une fois). Sur un compte sans mot de passe, Windows doit se connecter de lui-même, ce qu'il fait quand c'est le seul compte.
- **L'ouvrir depuis un Mac :** si le navigateur dit que l'adresse est injoignable (`ERR_ADDRESS_UNREACHABLE`) alors que d'autres appareils l'ouvrent, autorisez le navigateur dans **Réglages Système → Confidentialité et sécurité → Réseau local**, puis quittez-le et rouvrez-le.

Ensuite, dans PowerShell en administrateur :

```powershell
irm https://get.undamedia.com/windows.ps1 | iex
```

Elle installe WSL et Ubuntu 24.04 s'ils manquent, met WSL sur le propre réseau du PC, ouvre les ports d'Unda dans le pare-feu de WSL, lance le script d'installation d'Unda dans Ubuntu (qui vérifie la signature de la version avant d'installer quoi que ce soit), crée la tâche de démarrage, vérifie qu'Unda répond à l'adresse du PC, et affiche le lien qui crée le compte propriétaire. La relancer est sans risque : elle saute ce qui est fait et, sur une installation qui fonctionne, met Unda à jour.

Pour la lire avant de la lancer : `irm https://get.undamedia.com/windows.ps1 -OutFile windows.ps1`, ouvrez le fichier, puis `Get-Content .\windows.ps1 -Raw | iex`.

### Étape par étape {#step-by-step}

Les mêmes étapes à la main. Lancez les commandes PowerShell dans une fenêtre PowerShell ouverte **en administrateur**, et les commandes Ubuntu dans la fenêtre d'Ubuntu.

### 1. Installer Ubuntu {#1-install-ubuntu}

```powershell
wsl --install -d Ubuntu-24.04
```

Redémarrez Windows quand il le demande, puis ouvrez **Ubuntu** depuis le menu Démarrer et choisissez un nom d'utilisateur et un mot de passe Linux.

::: tip Sur un VPS Windows ou une machine virtuelle
WSL fait tourner sa propre petite machine virtuelle : à l'intérieur d'un VPS, il demande donc que l'hébergeur autorise une machine virtuelle dans la sienne (virtualisation imbriquée). Si `wsl --install` dit « Failed to detect nested virtualization support » même après un redémarrage, demandez à l'hébergeur d'activer la virtualisation imbriquée. Docker Desktop en a besoin aussi. Là où un hébergeur ne le peut pas, utilisez un VPS Linux : Unda s'y installe en [une commande](/fr/guide/install).
:::

### 2. Mettre WSL sur le propre réseau du PC {#2-put-wsl-on-the-pcs-own-network}

Faites-le avant d'installer Unda (étape 5) : le script d'installation fabrique le certificat HTTPS d'Unda pour les adresses qu'a Ubuntu à ce moment-là.

```powershell
notepad $env:USERPROFILE\.wslconfig
```

Mettez ceci dans le fichier et enregistrez-le :

```ini
[wsl2]
networkingMode=mirrored
[experimental]
hostAddressLoopback=true
```

Puis redémarrez WSL :

```powershell
wsl --shutdown
```

Avec le réseau en miroir, Ubuntu utilise les propres adresses du PC : les encodeurs et les spectateurs de votre réseau joignent Unda à l'adresse du PC. La ligne `hostAddressLoopback` permet aussi aux programmes du PC lui-même (vMix sur le même PC, un navigateur) de le joindre à cette adresse ; ils peuvent toujours utiliser `localhost`. Dans Ubuntu, `ip -4 -o addr show` liste maintenant l'adresse réseau du PC (192.168.… ou 10.…), et non une adresse qui commence par 172.

### 3. Ouvrir les ports d'Unda {#3-open-undas-ports}

WSL en miroir a son propre pare-feu (le pare-feu Hyper-V). Laissez passer les ports d'Unda :

```powershell
$wsl = '{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}'
New-NetFirewallHyperVRule -Name Unda-TCP -DisplayName "Unda TCP" -Direction Inbound -VMCreatorId $wsl -Protocol TCP -LocalPorts 1935,1936,8080,8443
New-NetFirewallHyperVRule -Name Unda-UDP -DisplayName "Unda UDP" -Direction Inbound -VMCreatorId $wsl -Protocol UDP -LocalPorts 6000,8189
```

| Port | Pour |
|---|---|
| 8443/tcp | Le tableau de bord et les pages de lecture (HTTPS) |
| 8080/tcp | Renvoie les navigateurs vers 8443 |
| 1935/tcp, 1936/tcp | RTMP et RTMPS depuis les encodeurs |
| 6000/udp | SRT |
| 8189/udp | WebRTC (spectateurs à faible délai, encodeurs WHIP) |

Les entrées UDP ou RTP venant d'encodeurs et de récepteurs demandent que leurs ports soient ouverts de la même façon (par exemple `-Protocol UDP -LocalPorts 5000` dans une règle à part).

### 4. Vérifier qu'Ubuntu fait tourner systemd {#4-check-that-ubuntu-runs-systemd}

Dans Ubuntu :

```bash
systemctl is-system-running
```

`running` ou `degraded` est correct. S'il affiche `offline`, mettez ces deux lignes dans `/etc/wsl.conf` (`sudo nano /etc/wsl.conf`), lancez `wsl --shutdown` dans PowerShell et rouvrez Ubuntu :

```ini
[boot]
systemd=true
```

### 5. Installer Unda {#5-install-unda}

Dans Ubuntu :

```bash
curl -fsSL https://get.undamedia.com/install.sh | sudo bash -s -- --docker
```

Le script d'installation ajoute à Ubuntu le moteur propre à Docker (pas besoin de Docker Desktop), fabrique un certificat HTTPS pour le nom et les adresses du PC, démarre Unda et affiche le lien qui crée le compte propriétaire : `https://<adresse du PC>:8443/dashboard#setup/…`. Votre navigateur signale une fois le certificat, parce qu'Unda l'a fabriqué lui-même ; acceptez-le pour cette adresse.

Si Docker Desktop est aussi installé et partage son moteur avec Ubuntu, le script d'installation s'arrête avec « this Docker is Docker Desktop ». Désactivez cela dans Docker Desktop (**Settings → Resources → WSL integration**, désactivez Ubuntu-24.04), ou supprimez Docker Desktop, puis relancez la commande.

Pour mettre à jour plus tard, relancez la même commande : vos réglages et vos données restent.

::: details Installé avant l'étape 2 ?
Le certificat ne nomme alors que l'adresse interne de WSL (172.…), et les navigateurs de votre réseau reçoivent un avertissement de nom. Après l'étape 2, refaites-le dans Ubuntu (Unda le prend en compte de lui-même ; le compte propriétaire et les réglages restent) :

```bash
cd /opt/unda && own=$(sudo stat -c '%u:%g' tls/privkey.pem) && h=$(hostname) && ip=$(ip -4 route get 1.1.1.1 | sed -n 's/.* src \([0-9.]*\).*/\1/p')
```

```bash
sudo openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -nodes -days 3650 -subj "/CN=Unda on $h" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,DNS:$h,DNS:$h.local,IP:$ip" -keyout tls/privkey.pem -out tls/fullchain.pem
```

```bash
sudo chown $own tls/privkey.pem tls/fullchain.pem && sudo chmod 600 tls/privkey.pem && sudo chmod 644 tls/fullchain.pem
```
:::

### 6. Le garder en marche après un redémarrage {#6-keep-it-running-after-a-reboot}

WSL s'arrête quand plus rien ne l'utilise, et ne démarre que quand quelqu'un l'ouvre. Une tâche du Planificateur de tâches de Windows démarre Ubuntu, et Unda avec lui, au démarrage de Windows. Créez-la dans PowerShell **en administrateur**, connecté avec l'utilisateur Windows qui a installé Ubuntu (Ubuntu appartient à cet utilisateur). Chaque commande ci-dessous tient sur une ligne : collez-la en entier.

**Un compte Windows avec mot de passe :** la tâche s'exécute une minute après le démarrage de Windows, avant que quiconque ne se connecte. Elle demande le mot de passe, dont elle a besoin pour cela :

```powershell
$t = New-ScheduledTaskTrigger -AtStartup; $t.Delay = "PT1M"; Register-ScheduledTask -TaskName "Unda (WSL)" -Action (New-ScheduledTaskAction -Execute "C:\Windows\System32\wsl.exe" -Argument "-d Ubuntu-24.04 --cd ~ --exec sleep infinity" -WorkingDirectory $env:USERPROFILE) -Trigger $t -Settings (New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries) -User "$env:USERDOMAIN\$env:USERNAME" -Password (Read-Host "Windows password for $env:USERNAME")
```

**Un compte Windows sans mot de passe :** Windows le connecte de lui-même au démarrage (si c'est le seul compte), et la tâche s'exécute 5 secondes après cette connexion, sans ouvrir de fenêtre :

```powershell
$t = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"; $t.Delay = "PT5S"; Register-ScheduledTask -TaskName "Unda (WSL)" -Action (New-ScheduledTaskAction -Execute "C:\Windows\System32\conhost.exe" -Argument "--headless C:\Windows\System32\wsl.exe -d Ubuntu-24.04 --cd ~ --exec sleep infinity" -WorkingDirectory $env:USERPROFILE) -Trigger $t -Principal (New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive) -Settings (New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries)
```

Puis redémarrez Windows. Sans ouvrir Ubuntu, vérifiez :

```powershell
wsl -l -v; Get-ScheduledTaskInfo -TaskName "Unda (WSL)" | Select-Object LastRunTime, LastTaskResult
```

Ubuntu doit être **Running** et `LastTaskResult` **267009** (la tâche tourne encore, comme il se doit). Les autres résultats :

| Résultat | Signification |
|---|---|
| 2147946720 | Vous l'avez relancée à la main pendant qu'elle tournait : rien d'anormal |
| 2147942403 | Windows n'a pas trouvé un programme ou un dossier : copiez à nouveau la commande, en entier |

Ouvrez ensuite le tableau de bord depuis une autre machine de votre réseau.

### Où se trouvent les choses {#where-things-are}

| Quoi | Où |
|---|---|
| Les réglages d'Unda | `/opt/unda/unda.yaml` dans Ubuntu |
| Ses données (chaînes, comptes, enregistrements) | Le volume Docker `unda-data` |
| Journaux | `cd /opt/unda && sudo docker compose logs -f` |
| Arrêter / démarrer | `cd /opt/unda && sudo docker compose stop` / `start` |

Tout le reste du [guide d'installation](/fr/guide/install) s'applique, à partir du compte propriétaire : les commandes pour Docker qui s'y trouvent fonctionnent dans Ubuntu avec `sudo` devant.

## Docker Desktop {#docker-desktop}

Installez Docker Desktop, puis mettez Unda en place avec les fichiers Docker du [guide d'installation](/guide/install) (en anglais ; section 1, **A. Docker**), tels qu'ils sont écrits. Sous Windows :

- **Docker Desktop doit être en marche.** Il démarre quand un utilisateur se connecte à Windows : un PC qui doit faire tourner Unda sans surveillance a donc besoin que Windows se connecte automatiquement.
- **Publiez chaque port que vous utilisez** dans `docker-compose.yml`, les ports UDP avec `/udp` (par exemple `"6000:6000/udp"` pour SRT), et autorisez-les dans le pare-feu Windows. Évitez le port UDP 500 pour les entrées : le service VPN de Windows lui-même l'utilise.
- **Le multicast ne traverse pas** la machine virtuelle de Docker Desktop, ni en entrée ni en sortie. En entrée, faites envoyer les émetteurs en unicast vers l'adresse du PC et un port publié, ou utilisez WSL. En sortie, l'assistant ci-dessous s'en charge.
- **Les spectateurs apparaissent tous avec l'adresse de Docker lui-même.** Les limites de connexion par adresse les compteraient comme un seul : laissez `limits.max_conns_per_ip` non défini.
- **Mises à jour à l'antenne :** chargez ou téléchargez la nouvelle image, puis `docker compose up -d` (sans `down` avant). L'image d'une chaîne de télévision est revenue une dizaine de secondes plus tard.

Testé dans Docker Desktop sous Windows : le RTMP depuis des encodeurs, le SRT en entrée et en sortie, l'UDP en entrée et en sortie en unicast, et une sortie TV alimentant le récepteur d'une chaîne de télévision.

### Multicast en sortie : l'assistant unda-mcast {#multicast-out-the-unda-mcast-helper}

Docker Desktop ne peut pas envoyer de multicast sur votre réseau : chaque version est donc livrée avec **`unda-mcast.exe`**, un petit programme Windows qui le fait pour Unda. Unda envoie chaque chaîne en UDP simple vers un port de ce PC (cela traverse Docker Desktop), et l'assistant renvoie chaque paquet, sans le modifier, vers une adresse multicast par la carte réseau de votre choix. Un IRD, une passerelle, un modulateur ou VLC sur ce réseau prend alors le multicast comme d'habitude.

1. **Téléchargez-le** depuis le dossier de votre version sur le site de téléchargement, par exemple `https://get.undamedia.com/v0.1.50/unda-mcast.exe` (la version est en bas du menu du tableau de bord). Vérifiez-le avec `SHA256SUMS` du même dossier : la ligne de `unda-mcast.exe` doit correspondre à `Get-FileHash .\unda-mcast.exe`.
2. **Dirigez Unda vers lui.** Pour chaque chaîne, une sortie TV (ou une rediffusion) avec **Unda sends it** vers `udp://<adresse de ce PC>:9000` ; la chaîne suivante vers le port 9001, et ainsi de suite.
3. **Essayez-le.** Dans PowerShell en administrateur, dans le dossier du fichier :

   ```powershell
   .\unda-mcast.exe -map 9000=239.10.10.5:5000
   ```

   Il liste les cartes réseau du PC et demande par laquelle envoyer, puis montre toutes les 5 secondes ce qui arrive d'Unda et ce qui repart. Lisez-le dans VLC : **Média → Ouvrir un flux réseau**, `udp://@239.10.10.5:5000` (le `@` compte).
4. **Démarrez-le avec Windows.** La même ligne avec `-install` ajouté (et la carte choisie avec `-iface`, voir plus bas) :

   ```powershell
   .\unda-mcast.exe -install -map 9000=239.10.10.5:5000 -iface "Ethernet 2"
   ```

   Il se copie dans `C:\Program Files\Unda`, ajoute une tâche de démarrage qui s'exécute avant toute connexion, en priorité haute pour que sa sortie tienne même sur un PC chargé, et laisse passer ses ports dans le pare-feu Windows. Relancer `-install` remplace les réglages. `-uninstall` retire tout. Ce qu'il fait (une carte débranchée ou revenue, une nouvelle adresse) est écrit dans `C:\Program Files\Unda\logs\unda-mcast.log`.

**Ses réglages :**

| Réglage | Ce qu'il fait |
|---|---|
| `-map 9000=239.10.10.5:5000,9001=239.10.10.6:5001` | Chaque port vers lequel Unda envoie, et l'adresse et le port multicast sous lesquels il repart. Un port par chaîne. |
| `-map 9000=239.10.10.5:5000,9000=239.20.20.5:6000` | Un port listé à nouveau part aussi vers cette adresse : une chaîne vers plusieurs adresses, sans second encodeur dans Unda. |
| `-listen 9000 -to 239.10.10.5:5000 -channels 3` | En comptant plutôt : les ports 9000 à 9002 partent vers 239.10.10.5, .6 et .7, tous sur le port 5000. |
| `-iface 2` ou `-iface "Ethernet 2"` | La carte réseau par laquelle envoyer : son numéro dans la liste qu'il affiche, ou son nom (`Get-NetAdapter` les liste). |
| `-iface "Ethernet 2,Ethernet 3"` | Plusieurs cartes : il envoie par chacune de celles qui ont un câble, et commence sur une carte quelques secondes après qu'on y branche un câble. Pour un récepteur qui peut aller sur n'importe quel port libre. |
| `-iface all` | Chaque carte qui a un câble, y compris votre réseau de bureau : ses appareils reçoivent alors aussi les chaînes. |
| `-allow 192.168.1.20` | Accepter aussi les chaînes d'une autre machine (adresses ou plages, séparées par des virgules). Par défaut, seul ce PC peut lui envoyer. |
| `-ttl 16` | Combien de routeurs le multicast peut traverser (16 par défaut). |

**Bon à savoir :**

- **Une chaîne avec d'autres réglages** (un autre format ou un autre débit) est une autre sortie TV dans Unda, sur son propre port, avec ce port ajouté à `-map`.
- **Choisissez des adresses en 239.x.x.x**, la plage réservée à l'usage interne d'une organisation, avec un dernier nombre différent pour chaque chaîne. Évitez 224.0.0.x (contrôle du réseau), 232.x.x.x (spécifique à la source : beaucoup de récepteurs ne peuvent pas le rejoindre) et 239.255.255.250 (utilisé par Windows lui-même).
- **Deux cartes sur le même réseau** reçoivent chaque paquet deux fois : envoyez par une seule.
- **Un récepteur relié directement au PC par un câble**, sans routeur entre eux, fonctionne aussi : Windows donne à ce port une adresse à lui (169.254.x.x) en une demi-minute environ, et l'assistant commence dessus quelques secondes plus tard.
- L'assistant démarre avant toute connexion, mais n'a rien à envoyer tant que Docker Desktop, et Unda dedans, ne sont pas en marche.

Testé sous Windows avec Docker Desktop : VLC sur un autre PC et la passerelle SRT d'une chaîne de télévision ont reçu le multicast, à 1300 kb/s stables pendant une émission en direct, avec vMix qui produisait sur le même PC.
