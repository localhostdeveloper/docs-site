---
title: "Votre licence Unda : limites et outils"
description: "Comment fonctionne la licence d'Unda : les limites de flux en direct et de comptes, les outils qu'elle active, son installation, les licences liées à un domaine, et l'évaluation de 30 jours."
---

# Licence

Votre licence est un petit fichier (`quelquechose.license.json`) fourni par votre fournisseur. Elle fixe combien de flux peuvent être en direct en même temps, combien de comptes vous pouvez avoir en plus du premier propriétaire (les propriétaires suivants comptent aussi), quels outils sont compris, et jusqu'à quand.

| Outil | Ce qu'il active |
|---|---|
| `restream` | La rediffusion vers les réseaux sociaux en RTMP et RTMPS (YouTube, Facebook, d'autres serveurs RTMP) |
| `record` | L'enregistrement |
| `srt` | L'entrée SRT et la lecture en SRT |
| `transcode` | Le débit adaptatif |
| `playout` | Les chaînes 24h/24, la médiathèque et les encodeurs de secours |
| `udp` | Les entrées et destinations UDP, RTP et RIST, les destinations SRT, les entrées multi-chaînes (MPTS) et les bouquets, les sorties TV (avec les coupures publicitaires et le lien que récupèrent les chaînes), les relais et l'analyseur de flux |
| `webrtc` | WebRTC : la publication en WHIP et la lecture à faible délai en WHEP |
| `pull` | Les entrées récupérées : liens HLS, MPEG-TS en HTTP, autres serveurs RTMP et caméras RTSP |

Sans `udp`, une destination UDP, RTP, RIST ou SRT, ou une sortie TV, ne peut être ni ajoutée ni activée. Une destination enregistrée auparavant (ou ajoutée sous une licence précédente) est conservée mais désactivée, avec la raison dans l'onglet Restream ; elle redémarre après un redémarrage du serveur, une fois que la licence comprend `udp`.

## L'installer ou la remplacer {#installing-or-replacing-it}

- **Tableau de bord** : **Server → License** (propriétaire seulement) → envoyez le fichier. Elle s'applique aussitôt.
- **Terminal du serveur** : `sudo -u unda unda license -config /etc/unda/unda.yaml install new.license.json`. Le serveur en marche la prend en compte dans l'heure, ou aussitôt après `sudo systemctl restart unda`.

Une nouvelle licence qui ajoute SRT, l'UDP, le débit adaptatif ou des destinations de rediffusion du fichier de configuration demande un redémarrage pour que ceux-ci démarrent.

Une licence émise ou renouvelée à partir du 26 octobre 2026 demande Unda v0.1.46 ou plus récent ; la licence que vous avez continue de fonctionner. Si son installation affiche *« the license was signed with a key this build does not know »*, mettez d'abord Unda à jour ([Sauvegardes et mises à jour](/guide/install#8-backups-and-upgrades), en anglais), puis installez à nouveau la licence.

[![Server → License : à qui est la licence, sa date de fin, ce qui en est utilisé, et ses outils](/screens/license.webp)](/screens/license.webp)

## Licences liées à un domaine {#licenses-for-a-domain}

Une licence peut être émise pour votre ou vos domaines, par exemple `tv.example.com`. Elle ne fonctionne alors que sur un serveur dont le certificat HTTPS est pour ces noms ; la page **Server → License** indique pour quels domaines elle est valable. Si Unda tourne derrière Caddy ou nginx (et n'a donc pas de certificat à lui), listez les noms dans le fichier de configuration :

```yaml
server:
  public_domains: [tv.example.com]
```

Passer à un nouveau domaine demande un nouveau fichier de licence de votre fournisseur.

## États {#states}

**Server → License**, et un bandeau pour les opérateurs et au-dessus, indiquent où vous en êtes :

| État | Ce que cela signifie |
|---|---|
| Valid | Tout fonctionne dans les limites de la licence |
| Expiring | Moins de 30 jours restants : il est temps de renouveler |
| Grace | Jusqu'à 14 jours après la date de fin : tout fonctionne encore |
| Expired | Les flux déjà en direct continuent ; **les nouveaux flux sont refusés** jusqu'à l'installation d'une nouvelle licence |
| Evaluation | Pas de licence installée : tout fonctionne pendant 30 jours, pour 2 flux en direct et 2 comptes en plus du propriétaire. La page indique combien de jours il reste |
| Evaluation ended | Les 30 jours sont passés : les flux déjà en direct continuent ; **les nouveaux flux sont refusés** jusqu'à l'installation d'une licence |
| Invalid | Le fichier est abîmé ou n'est pas prévu pour ce serveur : les limites d'évaluation s'appliquent. Demandez un nouveau fichier à votre fournisseur |

Les 30 jours comptent à partir de la première fois où le serveur a tourné sans licence.

Quand la limite de flux est atteinte, le flux suivant est refusé avec un message qui le dit, qu'il vienne d'un encodeur, d'une récupération, d'une entrée UDP, d'une chaîne d'une entrée multi-chaînes, d'une chaîne 24h/24, d'une chaîne qui bascule entre ses entrées ou d'un relais ; les flux déjà en direct ne sont jamais coupés. Les entrées d'une chaîne (son encodeur de secours, sa récupération et sa playlist) comptent comme une partie de cette chaîne, et un relais en marche compte pour un flux, quel que soit le nombre de chaînes que porte son flux.

## L'accès d'assistance pour votre fournisseur {#support-access-for-your-vendor}

Si vous voulez que votre fournisseur examine votre serveur, le propriétaire peut accorder un **accès d'assistance** dans **Server → License** : un compte administrateur limité dans le temps (72 heures par défaut, 14 jours au plus) que vous pouvez fermer à tout moment. Tout ce qu'il fait figure dans le journal d'audit. Le fournisseur n'a aucun autre moyen d'entrer.

1. Saisissez l'e-mail de votre fournisseur, choisissez la durée et cliquez sur **Create support access**.
2. Copiez le lien qui apparaît et envoyez-le vous-même à votre fournisseur, par e-mail ou par message : Unda n'envoie pas d'e-mail. Le lien fonctionne une fois ; votre fournisseur l'ouvre et choisit un mot de passe, et l'e-mail que vous avez saisi devient son identifiant.
3. La page affiche l'accès comme **waiting to be used** jusque-là, puis comme **active**, avec son heure de fin.

Le lien n'est affiché qu'au moment où il est créé. S'il a été perdu avant que votre fournisseur ne l'utilise, cliquez sur **New link** : l'ancien lien cesse de fonctionner et un nouveau apparaît. Un lien non utilisé expire au bout de 72 heures, ou à la fin prévue de l'accès si elle vient plus tôt. **End support access now** met fin à tout aussitôt.

Le lien porte l'adresse avec laquelle vous avez ouvert le tableau de bord. Sur un serveur sans domaine, à l'intérieur de votre propre réseau (par exemple `https://192.168.1.20:8443`), la page le signale sous le lien : votre fournisseur ne peut l'ouvrir que depuis ce réseau. Pour le laisser entrer depuis l'extérieur, installez un VPN comme ZeroTier ou Tailscale sur le serveur et faites-y entrer votre fournisseur. Il ouvre alors le lien avec l'adresse VPN du serveur à la place de la vôtre, en gardant tout à partir de `#invite/`. Ou laissez-le prendre la main à distance sur un ordinateur de votre réseau et ouvrir le lien depuis celui-ci.
