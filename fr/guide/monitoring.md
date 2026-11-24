---
title: "Surveillance, alertes et métriques Prometheus"
description: "La santé des flux, les alertes et les sessions des spectateurs dans le tableau de bord d'Unda, une alarme d'absence de son, des webhooks vers Slack ou Discord, et des métriques Prometheus pour Grafana."
---

# Surveillance et alertes

## Dans le tableau de bord {#in-the-dashboard}

- **Overview** : les flux en direct, les spectateurs, le trafic entrant et sortant avec les graphiques de la dernière heure, la place qui reste avant le plafond de bande passante, et **Needs attention** : chaque problème ouvert, le plus grave en premier.
- **Streams** : chaque flux avec sa résolution mesurée, sa fréquence d'images, l'évolution de son débit, ses spectateurs et un point de santé. Les flux qui ont un problème sont toujours listés en premier. Dépliez une ligne pour voir qui le lit et si quelqu'un prend du retard.
- **La page d'un flux** : une carte **Health** avec la fréquence d'images mesurée, l'intervalle d'images clés, le décalage audio/vidéo, le débit par rapport à son niveau normal, et les reconnexions.
- **Sessions** : chaque lecteur qui regarde un flux, maintenant et par le passé. Voir [Sessions des spectateurs](#viewer-sessions) plus bas.
- **Events** : ce qui s'est passé, le plus récent en premier : les flux qui démarrent, s'arrêtent et se reconnectent, les spectateurs qui arrivent et repartent, les bascules vers un encodeur de secours, les changements de rediffusion, d'enregistrement et de débit adaptatif, les alertes. Gardés 30 jours, d'un redémarrage à l'autre ; une ligne qui se répète est affichée une fois avec un compteur.

[![La page Overview : les flux en direct, les spectateurs, les graphiques de bande passante de la dernière heure, et Needs attention](/screens/overview.webp)](/screens/overview.webp)

## Sessions des spectateurs {#viewer-sessions}

**Sessions**, dans la barre latérale (opérateurs et au-dessus), liste chaque lecteur qui regarde un flux en HLS, DASH, RTMP ou SRT : le flux, le protocole, l'adresse du spectateur, le lecteur (par exemple « Chrome 129 · Windows », « VLC 3.0.23 », « Apple player (iOS) »), l'heure de début, la durée, ce qui lui a été envoyé et son débit moyen.

[![Sessions : chaque lecteur qui regarde en ce moment, avec son adresse, son lecteur, son heure de début et son trafic](/screens/sessions.webp)](/screens/sessions.webp)

- **Watching now** : les sessions en cours.
- **History** : les sessions terminées, les plus récentes, les plus longues ou les plus volumineuses en premier. **Download CSV** enregistre chaque session correspondante dans un tableur.
- **By stream** et **By viewer** : les totaux par flux ou par adresse de spectateur sur la dernière heure, le dernier jour, la dernière semaine ou le dernier mois : sessions, combien regardent en ce moment, combien d'adresses (ou de flux) différentes, temps de visionnage et trafic.

Filtrez n'importe quelle vue par flux, protocole, adresse (son début : `10.1.` montre tout un sous-réseau), lecteur et durée minimale. Cliquez sur une adresse ou un nom de flux pour voir toutes ses sessions.

Un onglet de navigateur est une session, même quand le lecteur change de qualité. Elle compte dès que le lecteur commence à télécharger de la vidéo, pas quand une page est seulement ouverte, et se termine 30 secondes après la dernière requête du lecteur. Si Unda tourne derrière un proxy inverse, listez ce proxy dans `server.trusted_proxies` pour que les sessions montrent les propres adresses des spectateurs plutôt que celle du proxy, et faites-lui envoyer son secret (`server.trusted_proxy_secret`, voir la partie HTTPS du guide d'installation) pour que rien d'autre sur sa machine ne puisse se faire passer pour un spectateur.

Les sessions sont gardées 30 jours (`sessions.retention_days`, jusqu'à 365) dans la base de données du serveur, et survivent aux redémarrages. Dans beaucoup de pays, les adresses des spectateurs sont des données personnelles : réglez `sessions.disabled: true` pour ne garder aucun historique (la vue **Watching now** fonctionne toujours).

## Les chiffres d'audience de chaque chaîne {#viewer-figures-for-each-channel}

La page de chaque flux, et la page de chaque chaîne 24h/24, a un onglet **Viewers** : combien de personnes ont regardé la chaîne aujourd'hui, hier, sur les 7 ou 30 derniers jours, ce mois-ci, le mois dernier ou les 12 derniers mois. Un client ne le voit que pour ses propres chaînes : vous pouvez donc donner une connexion au propriétaire d'une chaîne et le laisser suivre son audience lui-même.

[![L'onglet Viewers d'une chaîne sur les 30 derniers jours : le maximum simultané, les spectateurs, les vues, le temps de visionnage, la durée moyenne et les données envoyées, et le maximum de spectateurs simultanés chaque jour](/screens/viewers.webp)](/screens/viewers.webp)

- **Watching now** (aujourd'hui seulement), réparti selon la façon de regarder.
- **Most at once** (le maximum simultané), et à quel moment.
- **Viewers** : les différents appareils qui ont regardé. Un appareil est reconnu par son adresse Internet et son lecteur : des téléphones qui partagent une même adresse de réseau mobile avec le même navigateur comptent donc une fois, et le vrai nombre peut être un peu plus élevé. Au-delà de huit jours, il est estimé, à environ 3 % près.
- **Views** (le nombre de fois où quelqu'un a commencé à regarder), **Watch time**, **Average watch** et **Data sent**.
- Un graphique du maximum de spectateurs simultanés : toutes les 15 minutes pour un jour, toutes les heures jusqu'à huit jours, chaque jour au-delà.
- **How they watched** (HLS, faible délai, RTMP, SRT…) et **Devices** (téléphones et tablettes, ordinateurs, télévisions, applications de lecture), en parts du temps de visionnage.
- **Day by day** pour les périodes plus longues, et **Download CSV**.

Les chiffres sont des totaux seulement : aucune adresse ni aucun lecteur de spectateur n'est montré. Les jours vont de minuit à minuit selon l'horloge du serveur. Unda garde un résumé de chaque jour pendant 13 mois, bien après la suppression des sessions elles-mêmes, et après une mise à jour il remplit les jours dont les sessions sont encore gardées (30 jours par défaut). Un serveur réglé sur `sessions.disabled: true` ne garde aucun chiffre au-delà des spectateurs en cours.

### Les chiffres dans un site ou une application {#the-figures-in-a-website-or-app}

**Figures for your website or app**, dans la carte **Use these figures elsewhere** de l'onglet, crée un lien privé vers les chiffres de la chaîne sous forme de fichier JSON. Donnez-le à qui les affiche : un site, la page d'administration d'une application, un rapport. Aucune connexion ni clé n'est nécessaire, n'importe quel site peut le lire, et personne ne peut deviner le lien d'une autre chaîne.

```json
{
  "channel": "news",
  "live": true,
  "watching_now": 132,
  "time_zone": "GMT",
  "utc_offset": "+00:00",
  "today":        { "views": 1840, "viewers": 1210, "most_at_once": 410, "most_at_once_at": "2026-10-29T20:15:03Z",
                    "watch_hours": 612.5, "average_watch_minutes": 20, "data_gb": 210.4 },
  "yesterday":    { … },
  "last_7_days":  { … },
  "last_30_days": { … },
  "this_month":   { … },
  "last_month":   { … },
  "figures_from": "2026-09-29",
  "updated_at": "2026-10-29T20:31:07Z"
}
```

Ajoutez `?from=2026-10-01&to=2026-10-31` au lien pour le `total` de cette période et une liste `days` (une entrée par jour, `no_figures` les jours d'avant le début des chiffres). Au-delà de huit jours, `viewers_estimated` vaut true (à environ 3 % près). Les chiffres sont calculés au plus une fois par minute.

Toute personne qui a le lien peut lire les chiffres (rien ne peut être modifié avec). S'il arrive aux mauvaises personnes, **Make a new link** : l'ancien cesse aussitôt de fonctionner. **Remove** y met fin. Supprimer la chaîne, ou la donner à un autre propriétaire, y met fin aussi, et il cesse de répondre tant que le compte de son propriétaire est désactivé. Un lien peut demander jusqu'à 30 périodes personnalisées (`?from=&to=`) par minute ; les périodes habituelles sont calculées au plus une fois par minute et ne sont pas limitées. Les liens et les compteurs publics ne concernent que les chaînes créées sur les pages Channels ou 24/7.

**All channels' viewer figures**, sur la page **Channels** (administrateurs seulement), crée un seul lien privé avec les chiffres de toutes les chaînes dans un fichier (`channels` : une entrée chacune, comme ci-dessus). Avec `?from=&to=`, chaque chaîne donne son total pour la période ; son propre lien donne les jours. Il montre les chiffres de chaque client : gardez-le pour vous.

**Live viewer count on your website**, dans la même carte, permet à n'importe qui de lire combien de personnes regardent la chaîne en ce moment, à l'adresse `/api/v1/public/<chaîne>/viewers`, pour afficher « 132 en ce moment » sur une page publique. Il se met à jour toutes les 5 secondes et ne montre rien d'autre :

```json
{"stream":"news","live":true,"viewers":132,"peak_today":410,"at":"2026-10-29T19:20:05Z"}
```

Désactivé, ou pour une chaîne qui n'existe pas, il répond `404`.

## Alertes dans le tableau de bord {#alerts-on-the-dashboard}

Unda les lève de lui-même ; chacune disparaît d'elle-même une fois la cause partie.

| Alerte | Levée quand |
|---|---|
| Dropped frames (images perdues) | un spectateur, un enregistrement ou une destination de rediffusion n'a pas pu suivre |
| No data (pas de données) | rien n'a été reçu de l'encodeur pendant 5 secondes |
| Bitrate low (débit faible) | le flux est tombé sous la moitié de son débit habituel pendant 10 secondes |
| Keyframe interval (intervalle d'images clés) | des images clés espacées de plus de 4 s (critique au-delà de 10 s) |
| Adaptive bitrate (débit adaptatif) | un flux réglé en débit adaptatif n'en a pas : il a échoué, ou il ne peut pas être fait (par exemple, un flux sans image). Les spectateurs reçoivent toujours le flux tel qu'il est envoyé |
| Reconnects (reconnexions) | l'encodeur s'est reconnecté 3 fois ou plus en une heure |
| Near the bandwidth cap (proche du plafond de bande passante) | un trafic sortant au-dessus de 80 % de `limits.max_egress_mbps` |
| Disk (disque) | un disque sur lequel écrit Unda (base de données, enregistrements, segments HLS, médias) est plein à 85 % ou a moins de 5 Go libres ; critique à 95 % ou sous 2 Go |
| Certificate (certificat) | le certificat HTTPS approche de son expiration et n'est pas renouvelé |
| CPU high (processeur élevé) | le processeur au-dessus de 85 % pendant une minute (critique au-dessus de 95 %) : les flux peuvent saccader |
| Memory low (mémoire faible) | la machine a moins de 10 % de sa mémoire libre, ou moins de 500 Mo (critique sous 5 % ou 250 Mo) : le système pourrait bientôt arrêter un programme pour en libérer (Linux) |
| Possible leak (fuite possible) | la mémoire du serveur ne cesse de grandir à charge égale |
| No sound (pas de son) | une chaîne est silencieuse depuis 10 secondes (critique au bout d'une minute), ou ne porte aucune piste son ; voir [Pas de son](#no-sound) |
| Sound sides cancel (les côtés du son s'annulent) | les côtés gauche et droit d'une chaîne s'annulent depuis 30 secondes : les téléphones et les télévisions mono n'entendent presque rien ; voir [Un son qui s'annule sur les téléphones](#sound-that-cancels-on-phones) |
| One side of the sound silent (un côté du son muet) | un côté du son d'une chaîne est silencieux depuis 30 secondes alors que l'autre a du son ; voir [Un côté du son muet](#one-side-of-the-sound-silent) |
| Picture frozen (image figée) | l'image d'une chaîne n'a pas bougé depuis 20 secondes (critique une minute plus tard) ; voir [Image figée ou noire](#frozen-or-black-picture) |
| Picture black (image noire) | l'image d'une chaîne est noire depuis 10 secondes (critique une minute plus tard) |
| Internal error (erreur interne) | une panne à l'intérieur d'Unda a été interceptée : seule cette tâche (une chaîne, une rediffusion) s'est arrêtée et a redémarré. Affichée pendant une heure ; merci d'envoyer le journal du serveur à l'assistance |

### Effacer une alerte {#clearing-an-alert}

Quand vous avez vu une alerte et qu'il n'y a plus rien à faire pour l'instant (un invité sur une connexion faible, une chaîne dont vous savez qu'elle est silencieuse un moment), effacez-la : le bouton ✓ sur sa vignette de la mosaïque, **Clear** dans la liste ou les détails de la mosaïque, ou **Clear** sous elle dans **Needs attention** sur la page Overview.

Elle est effacée pour tout le monde. La vignette reprend ses couleurs normales avec une petite marque grise **1 cleared**, l'alerte sort du compteur à côté d'Overview dans le menu, et Needs attention l'affiche estompée, avec qui l'a effacée et quand. Pointez la marque pour lire l'alerte, ou choisissez **Show again** dedans.

Une alerte effacée revient d'elle-même quand elle s'aggrave (un avertissement qui devient critique) ou quand elle se termine et se reproduit. Un redémarrage du serveur repart avec des alertes neuves : tout ce qui ne va toujours pas est de nouveau levé. Les opérateurs et au-dessus peuvent effacer des alertes ; un client voit que l'équipe du serveur a effacé l'alerte de sa chaîne. Effacer ne change pas les messages envoyés à Slack, à Discord ou à votre propre système.

## Pas de son {#no-sound}

Unda écoute en permanence chaque chaîne en direct : le son que reçoivent les spectateurs, pas les entrées séparées d'une chaîne. Une chaîne est silencieuse quand ses moments les plus forts restent sous -60 dBFS à gauche comme à droite (le vrai silence se lit vers -91 ; une voix calme ou le bruit d'une pièce sont bien au-dessus de -60). Après 10 secondes de silence, il lève **No sound**, qui devient critique au bout d'une minute et disparaît dès qu'il y a de nouveau du son. La mosaïque montre le niveau de chaque chaîne en temps réel.

[![La mosaïque avec les vumètres : la caméra de terrain est silencieuse depuis plus de cinq minutes et marquée No sound](/screens/multiview.webp)](/screens/multiview.webp)

```yaml
monitoring:
  silence_alarm_seconds: 10      # de 3 à 3600
  # disable_audio_levels: true   # ni vumètres ni alarme
```

Il faut FFmpeg sur le serveur (comme pour les images de la mosaïque). Chaque chaîne coûte un petit décodeur de son : environ 0,5 % d'un cœur de processeur et 15 Mo de mémoire.

## Un son qui s'annule sur les téléphones {#sound-that-cancels-on-phones}

Il arrive que le son d'une chaîne passe bien au casque mais soit presque muet, ou maigre et lointain, sur les téléphones, beaucoup de télévisions et de décodeurs. La cause habituelle est un côté du son stéréo qui arrive inversé (en opposition de phase), souvent un câble branché à l'envers à la source. La lecture en stéréo semble encore presque normale, mais un appareil qui lit en mono additionne les deux côtés, et ils s'annulent.

Unda compare les deux côtés du son de chaque chaîne en direct sur les 10 dernières secondes et montre le résultat dans l'onglet **Sound & picture** de la chaîne, carte **Sound fix** : +1 signifie que les deux côtés sont identiques, autour de 0 c'est une stéréo normale, et −1 signifie qu'un côté est l'autre à l'envers. Quand les côtés s'annulent pendant 30 secondes, Unda lève **Sound sides cancel**.

La vraie correction se fait à la source : le bouton de phase (Ø) sur un côté de l'entrée de la console, ou le câble. En attendant, choisissez dans la même carte :

- **Flip one side** : Unda remet le côté droit à l'endroit pour tout ce qui sort du serveur (HLS, RTMP, SRT, enregistrements, rediffusions, sorties TV). Choisissez **Off** une fois la source corrigée : l'alarme le signale si le son s'annule de nouveau avec l'inversion active.
- **Automatic** : Unda n'inverse que pendant que les deux côtés s'annulent, environ 5 secondes après les avoir entendus s'annuler, et s'arrête de lui-même environ 8 secondes après la correction de la source. Utilisez-le quand vous ne savez pas quand la source sera corrigée. Chaque changement est écrit dans Events.

L'image n'est pas touchée, et la chaîne arrive aux spectateurs environ un dixième de seconde plus tard pendant que le son est inversé. Le propriétaire d'une chaîne peut le modifier pour ses propres chaînes. Il faut FFmpeg sur le serveur ; chaque chaîne inversée fait tourner un encodeur de son (environ un dixième de cœur et 20 Mo de mémoire), et les chaînes non inversées ne coûtent rien.

## Un côté du son muet {#one-side-of-the-sound-silent}

Quand un côté du son stéréo arrive vide (un câble, ou un réglage à la source), les auditeurs en stéréo n'entendent qu'un haut-parleur et les appareils mono entendent le son plus faible. La carte **One side silent** de l'onglet **Sound & picture** montre chaque côté, et Unda lève **One side of the sound silent** au bout de 30 secondes. Choisissez :

- **Use left on both** ou **Use right on both** : ce côté sort des deux côtés.
- **Automatic** : Unda met le côté qui a du son des deux côtés environ 5 secondes après que l'autre devient silencieux, et s'arrête de lui-même environ 8 secondes après que la source a de nouveau ses deux côtés. Chaque changement est écrit dans Events.

Il utilise le même encodeur de son que la correction de phase (un par chaîne, même avec les deux activés). Quand un côté est copié, l'inversion n'est pas utilisée : une copie inversée s'annulerait.

## Synchronisation labiale {#lip-sync}

Quand le son d'une chaîne arrive en avance ou en retard sur son image (le son d'une console radio à côté de caméras de studio, un processeur de son ou une ligne à retard sur le chemin du son), réglez **Sound delay** dans la carte **Lip sync** de l'onglet **Sound & picture**, en millisecondes : positif envoie le son plus tard (utilisez-le quand vous entendez les mots avant que les lèvres ne bougent), négatif plus tôt (les lèvres bougent avant que vous n'entendiez les mots), jusqu'à 10 secondes dans un sens ou dans l'autre.

Rien n'est réencodé : seul le moment du son change, pour toutes les sorties. Avec un retard négatif, c'est l'image qui attend : la chaîne est donc d'autant plus tardive. La modifier fait repartir un instant la lecture des spectateurs HLS. Pour mesurer le décalage d'un flux, filmez un clap, ou envoyez un signal de test avec un flash et un bip.

## Image figée ou noire {#frozen-or-black-picture}

Unda surveille aussi l'image de chaque chaîne en direct. Toutes les quelques secondes, il compare l'image clé la plus récente à la précédente. Quand l'image ne bouge plus (une caméra ou une carte d'acquisition qui s'est figée, un lecteur bloqué pendant que le son continue), il lève **Picture frozen** au bout de 20 secondes ; une image noire lève **Picture black** au bout de 10 secondes. Les deux deviennent critiques une minute plus tard, s'affichent en rouge dans la mosaïque, et disparaissent dès que l'image bouge de nouveau.

Une chaîne dont l'image est immobile volontairement, comme une radio qui affiche son logo ou une chaîne de diapositives, peut désactiver l'alarme d'image figée : dans l'onglet **Sound & picture** de la chaîne, activez **A still picture is normal**. Le noir lève toujours son alarme. Une chaîne qui affiche sa mire (sources de secours) ou son remplissage entre les programmes (chaînes 24h/24) ne lève ni l'une ni l'autre : les alertes de secours et de diffusion le disent déjà. L'onglet **Overview** de la page du flux indique l'image comme Moving, Not moving ou Black.

```yaml
monitoring:
  frozen_alarm_seconds: 20       # de 5 à 3600
  black_alarm_seconds: 10        # de 3 à 3600
  # disable_picture_check: true  # pas d'alarmes d'image
```

Il faut FFmpeg sur le serveur. Chaque chaîne coûte un petit décodeur qui lit une image clé toutes les quelques secondes.

## Historique et rapports par chaîne {#history-and-channel-reports}

Server → **History** trace les chiffres du serveur sur les dernières 24 heures, 7 jours, 30 jours ou 13 mois : spectateurs, ce qu'il envoie et reçoit, flux à l'antenne, processeur et mémoire. Chaque point est la moyenne d'une période, et le pic affiché est le moment le plus haut. Unda garde un chiffre par minute pendant 2 jours, toutes les 15 minutes pendant un mois et toutes les heures pendant 13 mois, dans sa base de données (les sauvegardes quotidiennes les emportent donc). Une année de chiffres pour un serveur de 30 chaînes occupe environ 45 Mo.

Sous les graphiques, le **Channel report** donne le bilan de chaque chaîne pour les 7 ou 30 derniers jours, ce mois-ci ou le mois dernier : combien de temps elle a été à l'antenne, ses **interruptions** (la connexion de l'encodeur a décroché puis est revenue en moins de 5 minutes, avec le temps perdu et la plus longue), ses **arrêts** (absente plus longtemps, ou arrêtée volontairement), son débit moyen et son maximum de spectateurs simultanés. **Download CSV** donne la même chose sous forme de fichier. Un redémarrage propre du serveur n'est compté contre aucune chaîne. Les clients voient le temps d'antenne et les interruptions de leurs propres chaînes dans l'onglet **Viewers** de chaque chaîne.

## Journaux {#logs}

Quand quelque chose ne fonctionne pas et que le message du tableau de bord ne suffit pas, les lignes du journal du serveur disent ce qui s'est passé, seconde par seconde. Vous pouvez les télécharger depuis le tableau de bord, sans vous connecter au serveur :

- **Une chaîne :** le bouton **Logs** sur la page de la chaîne.
- **Tout le serveur, ou n'importe quelle chaîne :** Server → Status → **Logs**.

Choisissez la période (de la dernière minute aux dernières 24 heures) et, si vous voulez, un texte que les lignes doivent contenir, comme un port ou une adresse. Vous obtenez un fichier texte avec une ligne par événement, son heure selon l'horloge du serveur en premier.

Le fichier d'une chaîne contient les lignes qui concernent la chaîne elle-même, ses entrées (encodeurs principal et de secours, récupération, playlist), les bouquets MPTS qui la portent, et tout ce qui concerne une adresse vers laquelle elle envoie, comme l'analyse de l'une de ses destinations. Les lignes sur les autres chaînes sont laissées de côté, même quand elles envoient vers la même plateforme.

Le serveur garde en mémoire les lignes des dernières 24 heures. Après un redémarrage, le fichier commence au redémarrage ; les lignes plus anciennes sont toujours dans le journal du système lui-même (`journalctl -u unda`, ou `docker compose logs unda` avec Docker). Les opérateurs, administrateurs et propriétaires peuvent télécharger les journaux ; chaque téléchargement est noté dans le journal d'audit.

## Messages vers Slack, Discord ou votre propre système {#messages-to-slack-discord-or-your-own-system}

Unda peut publier vers des webhooks quand un flux tombe, revient, ou quand son débit passe sous un seuil :

```yaml
alerts:
  min_input_kbps: 1500          # alerter sous ce débit ; 0 = pas d'alertes de débit
  bitrate_grace_seconds: 20     # il doit rester bas aussi longtemps
  cooldown_seconds: 60          # la même alerte pour le même flux au plus une fois par minute
  webhooks:
    - name: ops
      url_env: UNDA_ALERT_OPS_URL   # l'URL du webhook, gardée hors de ce fichier
```

Mettez `UNDA_ALERT_OPS_URL=https://hooks.slack.com/…` dans `/etc/unda/unda.env`. Chaque alerte est un `POST` JSON avec `event` (`stream_down`, `stream_up`, `bitrate_low`, `bitrate_recovered`), `stream`, `time` et un `text` lisible.

`stream_down` signifie que la connexion de l'encodeur s'est terminée ; Unda ne peut pas distinguer une panne réseau de quelqu'un qui appuie sur Arrêter. Arrêter un flux depuis le tableau de bord et redémarrer le serveur ne déclenchent jamais d'alerte.

## Prometheus et Grafana {#prometheus-and-grafana}

`/metrics` sert des métriques Prometheus à une clé d'API **operator** :

```yaml
# prometheus.yml
scrape_configs:
  - job_name: unda
    scheme: https
    authorization:
      credentials_file: /etc/prometheus/unda_token   # une clé d'API d'opérateur (gsk_…)
    static_configs:
      - targets: ['tv.example.com']
```

Principales métriques : `unda_streams_active`, `unda_stream_viewers{stream,protocol}`, `unda_stream_input_bitrate_bps{stream}`, `unda_egress_bitrate_bps`, `unda_dropped_frames_total`, `unda_restream_target_up{stream,target}`, `unda_ffmpeg_restarts_total`, plus la mémoire et le processeur (`process_*`, `go_*`). Les erreurs TR 101 290 par contrôle : `unda_udp_input_tr101290_errors_total{input,check}`, `unda_srt_publisher_tr101290_errors_total{stream,check}`, `unda_restream_tr101290_errors_total{stream,target,check}` (destinations MPEG-TS et sorties TV) et les séries `unda_mpts_*tr101290*` des bouquets.

## Contrôle de santé {#health-check}

`GET /api/v1/health` répond `{"status":"ok"}` sans connexion, pour les outils de surveillance de disponibilité et les répartiteurs de charge.
