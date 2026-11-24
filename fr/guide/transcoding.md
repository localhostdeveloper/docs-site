---
title: "Diffusion à débit adaptatif (transcodage)"
description: "Activez le débit adaptatif dans Unda : plusieurs qualités de chaque flux, de la 4K jusqu'au 144p, sur le processeur ou une carte NVIDIA, prévues pour vous ou choisies par vous."
---

# Débit adaptatif

Sans débit adaptatif, chaque spectateur reçoit exactement ce qu'envoie l'encodeur. Un flux 1080p à 5 Mb/s charge alors sans cesse chez toute personne dont la connexion est plus lente qu'environ 6 Mb/s. Avec le débit adaptatif, Unda fabrique plusieurs qualités du flux, et le lecteur de chaque spectateur choisit la meilleure que sa connexion peut porter, et change quand la connexion change.

Il est **désactivé par défaut**, parce qu'il coûte réellement du processeur, et il ne s'applique qu'aux spectateurs dans un navigateur et en HLS. Les spectateurs RTMP et SRT, les enregistrements et les destinations de rediffusion reçoivent toujours l'original.

## L'activer {#turning-it-on}

1. Le serveur a besoin de **FFmpeg** (`install.sh --with-ffmpeg`, ou `sudo apt install ffmpeg` ; l'image Docker l'inclut). Pour une carte NVIDIA, installez le pilote NVIDIA de façon que `nvidia-smi` fonctionne.
2. Dans le tableau de bord, **Server → Transcoding** : activez-le et choisissez l'encodeur. Unda liste ce que possède ce serveur (le processeur, chaque carte NVIDIA, Intel Quick Sync, les périphériques VAAPI, Apple VideoToolbox) et teste chacun ; un encodeur qui échoue à son test dit pourquoi et ne peut pas être choisi. **Save** teste à nouveau votre choix avant de l'appliquer.
3. Dans l'onglet **Output** d'un flux, sous **Adaptive bitrate**, activez-le pour ce flux. Il démarre aussitôt et reste actif quand l'encodeur se reconnecte et quand le serveur redémarre. Les clients peuvent aussi l'activer pour leurs propres chaînes ; l'interrupteur fonctionne pendant que le flux est hors ligne, et démarre alors avec sa prochaine diffusion.

[![L'onglet Output d'un flux, Adaptive bitrate : actif, la source, et trois qualités choisies avec leurs débits](/screens/transcoding.webp)](/screens/transcoding.webp)

Il n'y a pas de limite au nombre de flux transcodés en même temps. Quand le processeur reste au-dessus de 85 % pendant une minute, le tableau de bord lève une alerte **CPU**, et l'onglet Output prévient avant que vous n'ajoutiez un autre flux. Vous pouvez quand même fixer une limite (**Streams at once**) si vous préférez.

## Ce que reçoivent les spectateurs {#what-viewers-get}

La page de lecture passe d'elle-même à la version adaptative et affiche un menu **Quality**. Pour votre propre lecteur, utilisez `https://tv.example.com/hls/<nom>/master.m3u8`.

Les qualités par défaut, qui sont des **plafonds** :

| Qualité | Vidéo | Audio |
|---|---|---|
| 2160p (4K) | 15000 kbps | 128 kbps |
| 1080p | 5000 kbps | 128 kbps |
| 720p | 2500 kbps | 128 kbps |
| 480p | 1000 kbps | 96 kbps |
| 360p | 600 kbps | 64 kbps |
| 240p | 300 kbps | 48 kbps |
| 144p | 64 kbps | 24 kbps |

Unda mesure chaque flux pendant quelques secondes et prévoit ses qualités :

- jamais plus grandes que la source, et dans la forme de la source : un téléphone qui diffuse en portrait reçoit des qualités en portrait, sans bandes noires ;
- jamais plus de débit que ce que justifie la source : un flux 1080p à 1,5 Mb/s se voit proposer du 1080p à environ 1,5 Mb/s, pas 5. Un flux qui commence calmement (une image fixe, un encodeur qui démarre) est prévu à nouveau une fois qu'il porte nettement plus, ce qui redémarre ses qualités une fois ;
- la fréquence d'images de la source, jusqu'à 30 (50 et 60 sont divisées par deux) ;
- une image clé toutes les 2 secondes quoi qu'envoie l'encodeur, ce qui garde aussi un délai faible quand un encodeur est mal réglé.

La qualité 144p se lit sur des connexions aussi lentes qu'environ 250 kbit/s.

Les sources plus grandes que la 4K, au-delà de 120 images/s, au-delà de 60 Mb/s ou sans vidéo restent telles quelles ; l'onglet Output du flux dit pourquoi.

## Choisir les qualités vous-même {#choosing-the-qualities-yourself}

Sous **Qualities**, dans l'onglet Output, **Auto** correspond à la planification ci-dessus. **Choose** vous permet de choisir les qualités d'un flux à la place :

- cochez jusqu'à 8 tailles parmi 2160p, 1440p, 1080p, 720p, 576p, 480p, 360p, 240p et 144p ;
- saisissez le débit vidéo de chacune ; la valeur suggérée est affichée à côté ;
- chaque taille plus petite doit avoir moins de débit que celle du dessus ;
- le son suit la taille (de 128 kbps à 24 kbps), comme en Auto.

Ce que vous saisissez est utilisé dans la limite de ce que justifie la source, comme en Auto : une qualité ne peut pas être plus belle que le flux dont elle est faite, et un débit plus élevé ne coûterait qu'aux spectateurs et au serveur. L'onglet Output du flux affiche les débits utilisés et, sous le **i** à côté de **Quality**, ceux qui ont été limités. Les clients peuvent donner à chaque taille jusqu'à deux fois son débit suggéré (1080p jusqu'à 10000 kbps) ; les opérateurs jusqu'à 50000 kbps.

Les tailles plus grandes que la source sont laissées de côté, et chaque taille garde la forme de la source, comme en Auto. Quand vous ouvrez **Choose**, il part des qualités qu'Auto fabrique en ce moment pour le flux : **Save qualities** tout de suite les garde donc telles quelles.

L'enregistrement modifie aussitôt un flux en direct : son débit adaptatif redémarre avec les nouvelles qualités, et les spectateurs qui le regardent repartent une fois. Les spectateurs RTMP et SRT, les enregistrements et les rediffusions ne sont pas concernés. Plusieurs modifications en 30 secondes le font redémarrer une seule fois, avec la dernière. Les clients choisissent les qualités de leurs propres chaînes ; les opérateurs, celles de n'importe quel flux. **Auto** revient à la planification ci-dessus.

## Coût pour le serveur {#server-cost}

Par flux 1080p, avec les réglages par défaut :

| Encodeur | Processeur | Mémoire |
|---|---|---|
| Logiciel (`hardware: none`) | environ 1,2 cœur | environ 0,9 Go |
| Apple VideoToolbox | environ 0,35 cœur | environ 0,2 Go |

Un flux 4K reçoit aussi la qualité 2160p, qui coûte beaucoup plus : dans notre test, un flux 4K prenait environ 3,4 cœurs et 2,8 Go, contre environ 2 cœurs et 1,2 Go sans le 2160p. Pour la 4K, utilisez une carte graphique, ou laissez le 2160p de côté en listant vos propres qualités sous `transcode: renditions:` dans `unda.yaml` (le fichier d'exemple montre le format).

Un serveur à 4 cœurs et 8 Go fait tourner environ deux flux adaptatifs sur le processeur, en plus de tout le reste. Une carte graphique enlève la plus grande partie de cette charge au processeur.

Unda fait un encodage de test avec votre carte NVIDIA, Intel ou AMD (VAAPI) avant de l'utiliser, et montre pourquoi s'il échoue.

### Cartes graphiques {#graphics-cards}

Avec une carte NVIDIA choisie dans **Server → Transcoding**, Unda partage la carte entre les flux adaptatifs et les chaînes 24h/24. Les flux adaptatifs décodent et redimensionnent aussi leurs images sur la carte. Chaque tâche va à la carte qui a le plus de place, et quand toutes les cartes sont occupées, la tâche tourne sur le processeur à la place.

Les sorties TV et les chaînes de bouquet encodent toujours sur le processeur. Le matériel TV a besoin d'un débit qui ne dépasse jamais celui qui est réglé, et dans nos tests l'encodeur de NVIDIA le dépassait dans les scènes chargées : les images arrivaient alors trop tard à la télévision pour être affichées. L'encodeur du processeur tient le débit exactement.

Unda garde l'encodeur de la carte sous environ 85 % et laisse le reste du travail au processeur. Il apprend ce que votre carte coûte réellement pendant que ses tâches tournent et le garde : après un redémarrage, les mêmes tâches vont donc sur la carte.

Les tâches ne sont pas obligées de rester là où elles ont démarré. Unda les déplace de lui-même, sans redémarrage :

- **La carte est pleine** (encodeur au-dessus de 95 % pendant 30 secondes) : une tâche à la fois passe sur le processeur, tant que le processeur a de la place (sous 70 %).
- **Le processeur est surchargé** (85 % ou plus pendant 30 secondes) : les tâches du processeur retournent aussitôt sur la carte, jusqu'à quatre à la fois, tant qu'elle a de la place.
- **Sinon**, le travail sur le processeur retourne quand même vers une carte qui a de la place, une tâche à la fois.

Ce que coûte un déplacement dépend de la tâche : elles ne se déplacent donc pas toutes de la même façon :

| Tâche | Quand elle se déplace | Ce que remarquent les spectateurs |
|---|---|---|
| Flux adaptatif | En premier, chaque fois que c'est nécessaire | Presque rien : les lecteurs continuent |
| Chaîne 24h/24 | Pendant que la carte ou le processeur est surchargé, la moins regardée en premier ; sinon seulement quand personne ne la regarde, ou au début d'un programme | Le flux redémarre : les lecteurs rechargent (environ 10 secondes sur la page de lecture), les rediffusions et les enregistrements se reconnectent |

Une tâche déplacée reste en place 10 minutes : rien ne fait d'allers-retours. Quand la carte et le processeur sont tous deux pleins, rien ne bouge, et l'alerte CPU indique que le serveur n'a plus de place pour encoder.

**Server → Transcoding** montre la charge de chaque carte, où tourne chaque tâche et les derniers déplacements, et chaque déplacement figure dans **Events**. L'onglet Output d'un flux, l'onglet Output d'une chaîne 24h/24 et les lignes de Restream indiquent aussi où tourne chaque tâche. Sur un serveur avec une RTX A5000, déplacer sur la carte deux flux adaptatifs 1080p et quatorze chaînes 24h/24 en 720p a divisé par deux le processeur qu'ils utilisaient.

### Quand votre carte graphique n'apparaît pas {#when-your-graphics-card-isnt-listed}

**Server → Transcoding** dit pourquoi sous la liste des encodeurs, et ce qu'il faut faire :

- **Le pilote ne tourne pas.** Installez le pilote NVIDIA (sur Ubuntu : `sudo ubuntu-drivers install`) et redémarrez la machine. Avec Secure Boot actif, le pilote doit être signé pour se charger.
- **Unda ne voit pas les fichiers de périphérique de la carte, ou le test de NVIDIA dit `cuInit(0) failed -> CUDA_ERROR_OPERATING_SYSTEM`.** Les installations faites avant la v0.1.41 cachent les cartes graphiques à Unda (`PrivateDevices=true`) et bloquent les sockets locaux dont l'encodeur de NVIDIA a besoin (`AF_UNIX`). Relancez le script d'installation, ou :

  ```bash
  sudo mkdir -p /etc/systemd/system/unda.service.d
  printf '[Service]\nPrivateDevices=false\nRestrictAddressFamilies=\nRestrictAddressFamilies=AF_INET AF_INET6 AF_NETLINK AF_UNIX\n' | sudo tee /etc/systemd/system/unda.service.d/gpu.conf
  sudo systemctl daemon-reload && sudo systemctl restart unda
  ```

- **Unda tourne dans Docker.** Seule une carte Intel peut être confiée au conteneur (`devices: [/dev/dri]` dans `docker-compose.yml`) : l'image d'Unda n'a ni pilote AMD ni encodeur NVIDIA. Pour une carte AMD ou NVIDIA, installez Unda sans Docker. Sur un serveur dont le serveur web occupe déjà les ports 80 et 443 (nginx, Caddy, Apache), utilisez l'option `--behind-proxy` du script d'installation ([Installer](/fr/guide/install)).
- **Le test de NVIDIA dit « No devices were found ».** Le pilote est chargé, mais il n'arrive pas à démarrer la carte. Lancez d'abord vous-même `nvidia-smi -L` : s'il dit la même chose, la cause est la machine, pas Unda, et rien sur la machine ne peut utiliser la carte. `sudo dmesg | grep NVRM` affiche alors `RmInitAdapter failed`. Ce qu'il faut essayer, dans cet ordre :
  1. **Une autre version du pilote.** `ubuntu-drivers list` montre les versions qu'Ubuntu propose pour la carte. Installez-en une autre fermée, par exemple `sudo apt install nvidia-driver-580`, puis redémarrez la machine. Les cartes plus anciennes (GeForce 10 et Quadro série P, 2016-2017) peuvent échouer avec une version et démarrer avec une autre. Installer la version précédente permet de revenir en arrière.
  2. **Le pilote fermé, pas `-open`.** Les pilotes ouverts de NVIDIA (`nvidia-driver-XXX-open`) ne font tourner que les cartes à partir de 2018 (Turing).
  3. **La machine.** Si aucun pilote ne démarre la carte : activez « Above 4G Decoding » dans le BIOS, mettez à jour le BIOS de la carte mère, ou essayez la carte dans un autre emplacement. Une carte qui ne démarre nulle part est peut-être défectueuse.
  4. **Sur un serveur cloud, demandez à l'hébergeur.** Le BIOS et la carte sont à lui. Si `systemd-detect-virt` affiche `kvm`, `vmware` ou équivalent, il s'agit d'une machine virtuelle à laquelle la carte est confiée : la cause habituelle est alors sur son hôte, souvent une carte qui ne s'est pas réinitialisée au redémarrage de la machine. Envoyez-lui la ligne `RmInitAdapter failed` et demandez-lui de réinitialiser la carte sur l'hôte et de vérifier qu'elle y fonctionne.
- **Unda n'arrive pas à ouvrir la carte.** Ajoutez l'utilisateur `unda` au groupe `render` (`sudo usermod -aG render unda`) et redémarrez Unda. Le script d'installation le fait lui-même depuis la v0.1.41.
- **Ce FFmpeg n'a pas d'encodeur pour la carte.** La carte est listée mais ne peut pas être choisie. `ffmpeg -hide_banner -encoders | grep -E "nvenc|vaapi"` montre ce qu'a votre FFmpeg ; celui d'Ubuntu et celui de Debian (`sudo apt install ffmpeg`) ont les deux.

Après une modification, appuyez sur **Detect again**.

Si FFmpeg plante, il redémarre en quelques secondes ; après 10 échecs d'affilée, le flux continue sans débit adaptatif.
