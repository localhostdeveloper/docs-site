---
title: "Chaînes 24h/24 et programmation de la diffusion"
description: "Faites tourner des chaînes de télévision 24h/24 à partir de vos fichiers vidéo : playlists et heures fixes, émissions en direct qui prennent la main, un logo, un guide des programmes sur 8 jours et un journal de diffusion."
---

# Chaînes 24h/24 (diffusion)

Une chaîne de diffusion transforme des fichiers vidéo en une chaîne qui ne s'arrête jamais : elle les passe aux heures que donne une grille, comble tout trou avec une mire, du noir ou une vidéo en boucle, et laisse la main à un direct (depuis vMix, OBS ou n'importe quel encodeur) dès qu'il commence, puis revient à la grille quand il se termine.

La chaîne est un flux ordinaire. Les spectateurs la regardent sur `/watch/tv1`, elle peut être rediffusée sur YouTube, enregistrée, recevoir le débit adaptatif ou entrer dans un bouquet multi-chaînes, exactement comme le flux d'un encodeur.

## Créer une chaîne {#setting-up-a-channel}

Tout se fait dans le tableau de bord, par les opérateurs et au-dessus, ou par un client qui fait tourner sa propre chaîne (voir [Des chaînes pour vos clients](#channels-for-your-clients)) :

1. Envoyez sur la page **Media** les fichiers que partagent toutes les chaînes (habillages, publicités). Le MP4, le MOV, le MKV, le MPEG-TS, le MXF et les formats de ce genre fonctionnent tous. Vous pouvez aussi copier des fichiers dans le dossier des médias du serveur (`/var/lib/unda/media` avec le script d'installation ; `paths.media_dir` pour le changer) avec `scp`, `rsync` ou SFTP ; ils apparaissent d'eux-mêmes.
2. Sur la page **Playout**, cliquez sur **New channel**. Donnez-lui un nom (le flux qu'elle publie, comme `tv1`), une taille d'image, ce qui passe entre les éléments (du noir, ou une vidéo de Media en boucle) et, si vous voulez, une entrée en direct. Le fuseau horaire de la grille part du vôtre. La chaîne passe aussitôt à l'antenne, en diffusant son remplissage.
3. Sur la page de la chaîne, cliquez sur **Add videos** dans la **Playlist** pour envoyer les vidéos propres à la chaîne, construisez la playlist (plus bas) et cliquez sur **Save playlist**. La chaîne la passe en quelques secondes.

Le menu **⋯** en haut de la page de la chaîne contient **Settings**, qui change son image, son débit, son remplissage ou son entrée en direct (la chaîne redémarre, et les spectateurs se reconnectent une fois ; la playlist est conservée), et **Delete channel**, qui supprime la chaîne et ses propres fichiers médias (son journal de diffusion est conservé).

### Des chaînes pour vos clients {#channels-for-your-clients}

Si vous hébergez les flux d'autres organisations, chaque client peut faire tourner ses propres chaînes 24h/24 :

- Un client (un compte avec le rôle **streamer**) voit **Playout** et **Media** dans son menu, y crée des chaînes, envoie ses propres vidéos et modifie ses propres playlists. Il ne voit que ses propres chaînes et ses propres fichiers.
- Ses chaînes 24h/24 comptent dans la même **limite de chaînes** que ses chaînes de diffusion (fixée quand vous l'invitez, ou dans **Users**), et chacune est un flux en direct pour la licence.
- La taille d'image, la fréquence d'images et le débit de la chaîne d'un client sont fixés par les opérateurs (le standard du serveur, 1280×720 à 30 images/s, jusqu'à ce que vous le changiez dans les **Settings** de la chaîne) : ils décident de la part du serveur qu'utilise la chaîne.
- L'entrée en direct d'un client ne peut être que l'un de ses propres flux.

### Les fichiers propres à chaque chaîne, et les fichiers partagés {#each-channels-own-files-and-shared-files}

Chaque chaîne a son propre dossier de fichiers, et il existe un ensemble de **fichiers partagés** que toutes les chaînes peuvent utiliser (habillages de la station, jingles, publicités) :

- **Add videos** sur la playlist d'une chaîne envoie directement dans le dossier de cette chaîne : il n'y a pas de dossier à choisir, et les fichiers figurent dans les listes de la playlist dès qu'ils ont été vérifiés.
- Sur la page **Media**, **Upload to** choisit où va un fichier : l'une des chaînes, ou (opérateurs seulement) les fichiers partagés. Les fichiers propres à une chaîne sont nommés `channels/<chaîne>/<fichier>` ; tout le reste est partagé.
- La playlist et le remplissage d'une chaîne peuvent utiliser ses propres fichiers et les fichiers partagés, jamais ceux d'une autre chaîne. L'éditeur ne propose que ceux-là, et le serveur refuse tout le reste.
- Les clients peuvent utiliser les fichiers partagés mais pas les modifier ni les supprimer.
- **Supprimer une chaîne supprime ses propres fichiers** : une chaîne créée plus tard sous le même nom part donc vide.
- Les fichiers copiés à la main suivent la même règle : mettez les fichiers propres à une chaîne dans `channels/<chaîne>/` à l'intérieur du dossier des médias.
- Une chaîne de diffusion (de la page **Channels**) a aussi un dossier, pour la vidéo ou la [playlist](/fr/guide/channel-inputs#playlist-or-looped-video) qu'elle montre quand ses autres entrées n'ont pas d'images. Envoyez-y des fichiers avec **Add videos** dans l'onglet Input de la chaîne, ou choisissez-la sous **Upload to** sur la page Media, où elle est listée comme « (backup picture) ».

### La page de la chaîne {#channel-page}

En haut se trouve ce qui est à l'antenne : la dernière image de la chaîne (toutes les 5 secondes ; **Watch live** la lit sur la page du flux), son titre, où il en est, et **Previous** et **Next**. En dessous, les trois programmes suivants, puis quatre onglets :

- **Playlist :** l'éditeur de playlist (plus bas).
- **Logo :** le logo de la chaîne (voir [Le logo de la chaîne](#the-channels-logo)).
- **As-run log :** ce qui est passé à l'antenne, le plus récent en premier, un jour à la fois (choisissez le jour), 50 entrées par page avec **Older** et **Newer**, et **Download CSV** pour la journée.
- **Output :** l'image, le débit, l'encodeur, les manques d'images et l'entrée en direct, et l'état du fichier de playlist, avec tout élément qui ne peut pas passer.

Changer d'onglet garde les modifications de la playlist que vous n'avez pas enregistrées.

[![La page d'une chaîne 24h/24 : l'élément à l'antenne avec sa progression, Previous et Next, et ce qui passe ensuite](/screens/playout.webp)](/screens/playout.webp)

### L'éditeur de playlist {#the-playlist-editor}

Une playlist passe dès que vous l'enregistrez et tourne en boucle : la chaîne n'est donc jamais vide. Envoyez quelques vidéos, ajoutez-les, enregistrez. L'éditeur la montre en deux parties :

- **The loop (la boucle) :** des éléments qui passent l'un après l'autre, en boucle. **Add to the loop** ouvre la liste des vidéos de la chaîne (puis des vidéos partagées) : cochez-en autant que vous voulez et ajoutez-les d'un coup. Elles rejoignent la boucle dans l'ordre où vous les avez cochées, et la liste les numérote au fur et à mesure. Pour ajouter toute une série, tapez une partie de son nom dans la recherche, puis **Select all** : l'épisode 2 vient avant l'épisode 10.
- **Fixed times (heures fixes) :** des éléments qui s'imposent à une heure donnée, **every day** (chaque jour), **on chosen days** (certains jours, à choisir) ou **on a date** (à une date), quoi qu'il passe. Chacun peut avoir des éléments qui passent juste après lui comme un seul bloc, comme la météo juste après le journal de 19 h : ouvrez l'heure fixe et choisissez **Then another item**, qui ouvre la même liste. **Add a fixed time** en ajoute une. Elles sont listées par heure.

Quand un bloc à heure fixe se termine, la boucle reprend là où elle s'était arrêtée : un film coupé par le journal continue après lui. Une heure fixe coupe aussi un bloc encore en cours.

[![L'éditeur de playlist : quand elle commence, son fuseau horaire, la frise du jour, les éléments de la boucle et les heures fixes (dont une avec un élément juste après), chacun avec son prochain passage](/screens/schedule.webp)](/screens/schedule.webp)

Chaque programme est une ligne : son titre et son fichier, sa durée, son prochain passage (celui à l'antenne est mis en évidence), **Play now** dans la boucle, et un menu **⋯** pour le monter ou le descendre, le dupliquer ou le supprimer.

- **Plusieurs à la fois :** cochez des lignes (ou la case en haut du tableau pour toutes les cocher), puis **Move to top**, **Move to bottom** ou **Remove**. Supprimer une heure fixe supprime aussi les éléments qui la suivent.
- **Faites glisser une ligne par sa poignée** pour la déplacer dans la boucle, ou parmi les éléments qui suivent une heure fixe. Au clavier : mettez le focus sur la poignée et utilisez les flèches haut et bas. Les heures fixes restent dans l'ordre chronologique.
- **Cliquez sur une ligne** pour ouvrir ses champs en dessous : la vidéo, un titre, quand elle passe (ce qui la fait passer de la boucle aux heures fixes et inversement), où dans le fichier elle commence et s'arrête (**In** et **Out**, comme `00:01:30`), et une description de jusqu'à 1 000 caractères : les télévisions l'affichent dans leur guide des programmes, et les applications IPTV la reçoivent par XMLTV (voir [Guide des programmes](#programme-guide)).
- **Starts :** *Now, when saved* (maintenant, à l'enregistrement), ou *At a date and time* (à une date et une heure) : jusque-là, la chaîne passe son remplissage, puis la boucle commence par son premier élément.
- **Today** dessine la journée dans le fuseau horaire de la playlist : la boucle, les heures fixes, le remplissage, et une ligne pour l'heure actuelle.
- **Le prochain passage de chaque élément** (jusqu'à 8 jours à l'avance) est calculé par le serveur pendant que vous modifiez, avant d'enregistrer, d'après la durée des vidéos. Des avertissements signalent une vidéo absente de Media, une heure pas encore choisie, ou un élément fixe écourté par l'heure fixe suivante.
- Enregistrer ne fait jamais repartir la playlist. Le programme à l'antenne continue, où qu'il se trouve maintenant dans la liste, et la boucle continue à partir de lui dans le nouvel ordre. Si vous supprimez le programme à l'antenne, celui qui le suivait démarre aussitôt. Pour repartir du début, utilisez **Play now** sur le premier élément.
- Une chaîne créée avec une version précédente, dont la grille place des éléments à des heures de la journée ou à des dates, s'ouvre comme la playlist qui passe la même chose : chaque élément horodaté devient une heure fixe et les éléments qui le suivent passent juste après lui. Rien ne change à l'antenne ; l'enregistrement l'écrit de la nouvelle façon.
- Rien ne change à l'antenne tant que vous n'enregistrez pas. Tant qu'il y a des modifications, une barre en bas de la fenêtre dit lesquelles (programmes ajoutés, supprimés ou modifiés, l'ordre) avec **Save playlist** et **Discard** ; elle disparaît si vous les défaites à la main. La page demande confirmation avant que vous la quittiez avec des modifications non enregistrées.
- Si quelqu'un d'autre a enregistré la playlist après que vous l'avez ouverte, l'enregistrement est refusé et la page propose de charger sa version : le travail de personne n'est écrasé sans le savoir.

### Suivant, précédent et lecture immédiate {#next-previous-and-play-now}

Sur la page de la chaîne, **Next** met tout de suite à l'antenne l'élément suivant de la boucle, et **Previous** fait repartir l'élément à l'antenne (dans ses toutes premières secondes : l'élément d'avant). **Play now**, sur un élément de la boucle dans la playlist, met cet élément à l'antenne. Les spectateurs restent connectés : l'image se fige un instant pendant que la vidéo suivante s'ouvre. La boucle continue à partir de là, les heures fixes restent où elles sont, le guide des programmes suit, et le journal de diffusion marque l'élément coupé comme `skipped`. Pendant qu'un élément à heure fixe est à l'antenne, les boutons sont grisés : il passe à son heure, sans qu'on y touche. Toute personne qui peut modifier la chaîne peut les utiliser.

### Mettre une chaîne en pause {#pausing-a-channel}

**Pause**, en haut de la page de la chaîne (ou **Pause channel** dans son menu **⋯** de la page Playout), la retire de l'antenne sans rien supprimer : son encodeur s'arrête, les spectateurs la voient hors ligne, son guide des programmes (TV et XMLTV) est vide pendant la pause, et elle n'utilise aucun processeur. Sa playlist, ses réglages et ses médias sont conservés, et la playlist peut toujours être modifiée.

**Resume** la remet à l'antenne. Une playlist en boucle reprend avec l'élément où elle s'était arrêtée, au même endroit, quelle que soit la durée de la pause ; les heures fixes passent à leur heure comme toujours, et une grille à heures de la journée suit l'horloge. Une chaîne en pause n'est pas un flux en direct : elle ne compte donc pas dans votre licence ; si la licence est pleine quand vous la reprenez, la page l'indique et la chaîne reste en pause. Next, Previous et Play now attendent qu'elle reprenne.

Elle reste en pause après un redémarrage du serveur (une chaîne définie dans `unda.yaml` reste en pause jusqu'au redémarrage suivant). Toute personne qui peut modifier la chaîne peut la mettre en pause : les opérateurs et au-dessus n'importe quelle chaîne, les clients les leurs. Les pauses et reprises figurent dans le journal d'audit et dans la page Events, et le journal de diffusion marque ce qui était à l'antenne comme `paused`.

### Le logo de la chaîne {#the-channels-logo}

La carte **Logo** de la page de la chaîne place votre logo sur l'image de la chaîne, dans un coin. Choisissez un PNG (de préférence avec un fond transparent) ou un JPEG de 5 Mo au plus, choisissez le coin, la taille et l'opacité, et cliquez sur **Save logo**. À côté des réglages, vous voyez l'image actuelle de la chaîne, avec le logo là où il ira ; il bouge à mesure que vous changez les réglages.

[![La carte Logo : l'image de la chaîne avec le logo dans son coin, et l'image, le coin, la taille et l'opacité](/screens/logo.webp)](/screens/logo.webp)

- **Il est à l'antenne dès l'image suivante** après l'enregistrement : la chaîne ne redémarre pas et les spectateurs ne voient aucune pause. Une nouvelle image, un nouveau coin, une nouvelle taille ou une nouvelle opacité, et **Remove**, fonctionnent tous de la même façon.
- **La taille** est la hauteur du logo en proportion de la hauteur de l'image, de 3 à 30 % (10 % au départ). Les bords transparents du fichier sont d'abord retirés : la taille est donc celle du logo lui-même. Un logo très large est limité à 40 % de la largeur de l'image.
- **Le coin :** le logo garde 4 % de la hauteur de l'image depuis les bords. **L'opacité :** de 10 à 100 % (85 % au départ).
- Le serveur dessine le logo dans l'image : chaque sortie le porte donc, la page de lecture, le HLS et le DASH, la lecture RTMP et SRT, les rediffusions, les enregistrements et les bouquets. Il reste pendant qu'un direct prend la main sur la chaîne. Les spectateurs ne peuvent pas le masquer.
- Il ne coûte presque rien : moins de 1 % d'un cœur de processeur pour une chaîne en 1080p à 50 images/s.
- L'image est gardée avec la chaîne dans la base de données du serveur (les sauvegardes l'incluent), pas dans Media. Elle peut être réglée pendant que la chaîne est en pause. Supprimer la chaîne supprime son logo.
- Toute personne qui peut modifier la chaîne peut le régler : les opérateurs et au-dessus n'importe quelle chaîne, les clients les leurs. Les modifications figurent dans le journal d'audit.

Le logo est pour les chaînes 24h/24, que le serveur encode de toute façon. La chaîne d'un encodeur en direct part telle que l'envoie l'encodeur : ajoutez donc le logo dans OBS ou vMix.

Depuis un script, la même chose en une requête :

```bash
curl -X PUT -H "Authorization: Bearer $UNDA_KEY" \
  -F image=@logo.png -F corner=top-right -F size=10 -F opacity=85 \
  https://tv.example.com/api/v1/playout/channels/tv1/logo
```

### Les chaînes dans unda.yaml {#channels-in-undayaml}

Une chaîne peut aussi être définie dans `unda.yaml` (la façon de faire d'avant que le tableau de bord sache créer des chaînes) ; elle est marquée **from unda.yaml** sur la page Playout, et ses réglages se modifient là. Sa playlist peut être modifiée dans le tableau de bord quand le serveur a le droit d'écrire le fichier de grille. Un serveur installé avec le script d'installation ne peut pas écrire dans `/etc/unda` : pour une telle chaîne, le tableau de bord montre donc la playlist en lecture seule ; créez plutôt la chaîne dans le tableau de bord.

```yaml
playout:
  channels:
    - name: tv1                          # le nom du flux de la chaîne
      schedule: /etc/unda/schedules/tv1.yaml
      live: studio                       # facultatif : ce flux prend la main pendant son direct
      filler: image                      # black (par défaut), image, ou video (en boucle)
      filler_file: /etc/unda/slate.png
```

Réglages facultatifs : `width` et `height` (1280×720 par défaut, jusqu'à 1920×1080), `fps` (25, 30, 50 ou 60 ; 30 par défaut), `video_kbps` (3000 par défaut), `audio_kbps` (128 par défaut), `preset` (libx264, `veryfast` par défaut). `filler: image` avec `filler_file` (une image fixe) ne se règle qu'ici.

## La page Media {#the-media-page}

**Media** liste les fichiers vidéo avec leur dossier, leur durée, la taille de leur image, leur fréquence d'images, leur son et les chaînes qui les utilisent. Les opérateurs voient tous les fichiers ; un client voit les fichiers partagés et ceux de ses propres chaînes. Les fichiers copiés à la main apparaissent d'eux-mêmes.

- **Envoi :** déposez des fichiers sur la page ou cliquez pour les choisir. Un fichier part en morceaux de 8 Mo. Si la connexion tombe, si le serveur redémarre ou si la page est rechargée, choisissez de nouveau le même fichier et il reprend là où il s'était arrêté. Un envoi inachevé est supprimé au bout de 24 heures sans progression.
- **Vérifications :** chaque envoi terminé est vérifié avant de rejoindre la médiathèque ; un fichier qui n'est pas une vidéo lisible est refusé avec la raison. Les noms sont faits de lettres, de chiffres, de `.`, `_` et `-` (la page transforme les espaces et les autres caractères en `-`). Un nom existant n'est jamais écrasé : supprimez d'abord l'ancien fichier.
- **Espace :** un fichier peut faire jusqu'à 5 Go, un envoi doit laisser 5 Go libres sur le disque, et `playout.media_max_gb` plafonne tout le dossier si vous le réglez.
- **Suppression :** un fichier à l'antenne, ou sur le point de l'être, ne peut pas être supprimé. Un fichier encore nommé dans une grille peut l'être ; la chaîne le saute alors et affiche un avertissement.
- **Derrière un proxy inverse :** autorisez des corps de requête de 16 Mo (nginx : `client_max_body_size 16m;`). Caddy n'a besoin d'aucun changement.

## La page Playout {#the-playout-page}

**Playout** liste chaque chaîne dans un tableau : sa dernière image, son nom avec la taille de son image et son débit (ou ce qui demande de l'attention), si elle est à l'antenne, ce qui est à l'antenne et où il en est, et ce qui passe ensuite. Cliquez sur le nom d'une chaîne ou sur **Open** pour [sa page](#channel-page) ; une chaîne en pause a **Resume** sur sa ligne, et le menu **⋯** contient sa page de flux, **Settings**, **Pause channel** et **Delete channel**.

Au-dessus du tableau, filtrez par nom, n'affichez que les chaînes à l'antenne, en pause ou qui demandent de l'attention, et triez par nom, ce qui demande de l'attention d'abord, ou ce qui se termine le plus tôt (le programme à l'antenne le plus proche de sa fin).

## Le fichier de grille {#the-schedule-file}

L'éditeur de playlist écrit ce fichier pour vous ; vous n'en avez besoin que pour une chaîne définie dans `unda.yaml`, ou pour générer des grilles avec vos propres outils. Le fichier d'une chaîne du tableau de bord est `<dossier des données>/playout/<nom>.yaml` (les modifications faites à la main y sont prises en compte en 5 secondes, comme pour tout fichier de grille).

YAML ou JSON. Une playlist (`repeat: loop`) passe ses éléments en boucle ; un élément avec `at` s'impose plutôt à cette heure, et les éléments en dessous avec `after: true` passent juste après lui comme un seul bloc. La boucle reprend ensuite là où elle s'était arrêtée.

```yaml
timezone: Europe/Paris       # par défaut : le fuseau horaire du serveur
repeat: loop
items:
  - media: film.mp4          # dans la boucle
    title: The River
    description: A family's journey down the river.   # facultatif : le texte du guide des programmes
    in: "00:00:30"           # sauter les 30 premières secondes
    out: "01:35:00"          # s'arrêter ici
  - media: series-ep1.mp4    # dans la boucle
  - media: news.mp4
    at: "19:00"              # chaque jour à 19 h
  - media: weather.mp4
    after: true              # juste après le journal
  - media: service.mp4
    at: "10:00"
    days: [sun]              # seulement le dimanche (mon, tue, wed, thu, fri, sat, sun)
  - media: final.mp4
    at: "2026-10-25 15:00"   # une fois, à cette date
```

`start_at: "2026-10-26 06:00"` fait démarrer la playlist à ce moment (remplissage avant). Le serveur écrit `since` et `offset` quand vous enregistrez ou sautez un élément : où en était la boucle à ce moment, pour qu'un redémarrage la rejoigne au même endroit. Sans eux, la boucle est ancrée à un instant fixe.

Les grilles écrites pour des versions précédentes passent toujours comme avant : sans `repeat`, un élément avec un `start` (`"2026-10-01 06:00"`) commence exactement à ce moment et les éléments sans `start` le suivent ; avec `repeat: daily`, les débuts sont des heures de la journée (`"06:00"`) et la journée se répète.

Le serveur relit le fichier quelques secondes après qu'il a changé : modifiez-le et enregistrez, sans redémarrage. Un fichier qui contient une erreur est refusé avec la raison (dans le tableau de bord, dans les événements et dans le journal) et la grille précédente continue de passer. Un fichier nommé dans la grille qui n'est pas dans le dossier des médias est signalé et sauté. `items: []` est une grille vide : le remplissage passe en permanence.

## Guide des programmes {#programme-guide}

[![La page Guide : ce que montre chaque chaîne en ce moment, et les programmes du jour sur une frise](/screens/guide.webp)](/screens/guide.webp)

La playlist de chaque chaîne est aussi son guide des programmes : chaque élément avec son titre (ou son nom de fichier) et sa description, réparti sur les jours à venir. Une prise d'antenne en direct n'y figure pas, puisque personne ne sait à l'avance quand elle arrivera. Les éléments courts (moins d'une minute, comme les habillages et les jingles) comptent comme une partie du programme qui les précède.

- **La page Guide** (Content → Guide) montre les programmes de chaque chaîne pour aujourd'hui et les 7 jours suivants, y compris les guides saisis des chaînes en direct (voir [plus bas](#live-channels-a-typed-in-guide)). Cliquez sur un programme pour voir sa description. Les clients voient leurs propres chaînes.
- **Les télévisions et les décodeurs** reçoivent le guide quand la chaîne est dans un [bouquet multi-chaînes](/fr/guide/mpts#programme-guide-epg) : le programme en cours et le suivant, et les 8 jours à venir.
- **Les applications et intergiciels IPTV** le lisent en **XMLTV**, depuis le lien affiché sur la page Guide. La plupart des applications ne savent pas se connecter : le lien lui-même est donc la clé ; gardez-le privé. Dans votre playlist M3U, réglez le `tvg-id` de chaque chaîne sur le nom de la chaîne tel qu'Unda l'affiche. Le lien d'un client ne liste que ses chaînes ; celui d'un opérateur les liste toutes. Les heures sont en UTC (`+0000`), que les applications convertissent. La page affiche le lien masqué (**Show** le révèle ; **Copy** fonctionne dans les deux cas). Donnez aux applications l'adresse en `https://` : en `http://` simple, le lien traverse le réseau sans chiffrement. Un lien cesse de fonctionner quand son compte est désactivé ou sa clé d'API révoquée, et se restreint aussitôt quand son compte perd un rôle.
- **Server → Guide** (administrateurs) désactive et réactive les liens XMLTV, et **Replace all links** en crée de nouveaux quand un lien a fuité : chaque lien donné auparavant cesse de fonctionner, et les applications ont besoin du nouveau.

### Chaînes en direct : un guide saisi {#live-channels-a-typed-in-guide}

Une chaîne alimentée par un encodeur (OBS, vMix, un encodeur matériel) n'a pas de playlist d'où tirer son guide : vous le saisissez donc. Ouvrez la page de la chaîne (Streams → la chaîne) et son onglet **EPG**. Le propriétaire de la chaîne et les opérateurs peuvent le modifier.

[![L'onglet EPG d'une chaîne en direct : ce que montre le guide entre les programmes, le fuseau horaire, la frise du jour, et les programmes par heure, dont un ouvert pour le modifier](/screens/live-guide.webp)](/screens/live-guide.webp)

- **Chaque programme** a une heure, un titre, une durée et, si vous voulez, une description. L'heure est **every day** (chaque jour), **on chosen days** (certains jours ; du lundi au vendredi, par exemple) ou **on a date** (à une date ; un événement unique, comme un match).
- **Chaque programme dure sa durée, ou jusqu'au début du suivant.** Un programme à une date ou certains jours passe avant un programme de tous les jours : un programme de tous les jours qu'il chevauche est découpé autour de lui, si bien qu'un match du samedi à 20 h remplace le journal quotidien de 20 h ce samedi-là seulement.
- **Entre les programmes, le guide affiche** un titre de votre choix, comme « News 24 Live » (facultatif). Sans lui, le temps entre les programmes est laissé vide dans le guide.
- **Le fuseau horaire** est celui des heures ; un nouveau guide part de celui de votre navigateur.

Les programmes sont listés par heure, un par ligne ; cliquez sur l'un d'eux pour le modifier, et son menu **⋯** le duplique ou le supprime. L'onglet montre la journée sous forme de frise et, pour chaque programme, son prochain passage (ou qu'il est en cours), à mesure que vous tapez ; l'enregistrement le place sur la page Guide, dans le lien XMLTV et dans chaque [bouquet](/fr/guide/mpts#programme-guide-epg) qui porte la chaîne, 8 jours à l'avance. Le guide dit ce qui est prévu : il ne suit pas ce qu'envoie réellement l'encodeur, et une émission qui commence en retard reste donc listée à son heure. Enregistrer un guide sans programme et sans rien entre les programmes retire la chaîne du guide. Supprimer la chaîne supprime son guide.

## Ce que voient les spectateurs {#what-viewers-see}

- Entre les éléments, avant le premier et après le dernier : le remplissage.
- **Prise d'antenne en direct :** quand le flux `live` démarre, la chaîne passe dessus en quelques secondes (environ 3 s mesurées) ; quand il s'arrête, la chaîne revient à ce que prévoit la grille à ce moment-là, en rejoignant l'élément là où il en serait.
- Chaque élément est mis à l'échelle de l'image de la chaîne (avec des bandes, jamais étiré), à la fréquence d'images de la chaîne, avec son son en stéréo 48 kHz. Les lecteurs des spectateurs ne redémarrent jamais entre les éléments.
- Un fichier qui ne peut pas être lu montre le remplissage jusqu'à l'élément suivant.

## Le journal de diffusion {#the-as-run-log}

Tout ce qui passe à l'antenne est enregistré : chaque élément, chaque remplissage et chaque prise d'antenne en direct, avec son heure prévue, quand il a réellement commencé et fini, où dans le fichier il a commencé, et pourquoi il s'est terminé (`completed` terminé, `cut` coupé par l'heure fixe suivante, `live`, `error`, `stopped` arrêté, `skipped` sauté par Next, Previous ou Play now, `schedule` quand la playlist a changé). Il est gardé 90 jours (`playout.asrun_retention_days`).

```bash
curl -H "Authorization: Bearer $KEY" "https://tv.example.com/api/v1/playout/channels/tv1/asrun?format=csv" > asrun.csv
```

## Alertes {#alerts}

Le tableau de bord prévient quand une chaîne est hors antenne, quand son fichier de grille n'a pas été chargé, quand des fichiers prévus ne peuvent pas passer, quand une grille ponctuelle arrive à sa fin dans la journée, et quand le serveur ne suit pas (images répétées).

## Capacité du serveur {#server-capacity}

Chaque chaîne réencode tout ce qu'elle passe, en permanence : environ la moitié à deux tiers d'un cœur de processeur en 720p30, et davantage en 1080p. Un serveur à 4 cœurs fait tourner deux ou trois chaînes 720p à côté de ses autres tâches.

Une chaîne compte comme un flux en direct pour la licence, et demande l'outil `playout` dans celle-ci.
