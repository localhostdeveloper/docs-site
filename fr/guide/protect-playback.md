---
title: "Liens de lecture signés pour les flux privés"
description: "Protégez les flux payants ou privés avec des liens signés qui expirent, limitez le nombre d'appareils par lien, et créez les liens sur votre propre site. Fonctionne avec tous les lecteurs."
---

# Protéger la lecture avec des liens signés

Par défaut, toute personne qui connaît le nom d'un flux peut le regarder. Pour les événements payants ou privés, vous pouvez protéger un flux : il ne se lit alors qu'à partir d'un **lien signé**, une adresse avec un `?token=` que vous (ou votre site) avez créée, et seulement jusqu'à l'heure que le lien permet.

La protection couvre toutes les façons de regarder : le lecteur intégré, HLS, DASH, RTMP, SRT, le MPEG-TS en HTTP et WebRTC. La publication n'est pas concernée (l'encodeur utilise toujours sa clé de diffusion).

## Protéger un flux {#protect-a-stream}

1. Ouvrez le flux dans le tableau de bord (il n'a pas besoin d'être en direct) et allez dans son onglet **Output**.
2. Activez **Require a signed link**.

Pour protéger tous les flux du serveur, un administrateur active **Require a signed link for every stream** dans **Server → Playback**.

Les diffuseurs peuvent protéger leurs propres chaînes et créer des liens pour elles ; les opérateurs et au-dessus peuvent le faire pour n'importe quel flux.

## Créer un lien dans le tableau de bord {#make-a-link-in-the-dashboard}

Dans l'onglet **Output**, sous **Who can watch**, choisissez pendant combien de temps de nouveaux spectateurs peuvent commencer à regarder (de 1 heure à 30 jours) et cliquez sur **Make a link**. Chaque adresse de **Watch links** porte alors le lien, par exemple :

```
https://tv.example.com/watch/main-show?token=1790560829.rr8snjtkKtg3EJgQaeHvJQ
```

Donnez cette adresse à vos spectateurs, ou utilisez sa forme HLS dans votre propre lecteur.

[![L'onglet Output d'un flux : les liens de lecture, et Who can watch avec les liens signés exigés, le nombre d'appareils par lien et la création de liens](/screens/playback.webp)](/screens/playback.webp)

## Ce que signifie la limite de temps {#what-the-time-limit-means}

L'heure d'un lien est **l'heure limite pour commencer à regarder**. Quelqu'un qui a commencé avant continue jusqu'à la fin de l'événement ; un spectateur qui ouvre le lien après est refusé (« This link is not valid or has expired »). Un lien créé « jusqu'à 20 h » peut donc être envoyé avant une émission qui dure jusqu'à 22 h.

En détail : en HLS et en DASH, un spectateur reste autorisé tant que son lecteur continue de télécharger (une interruption de plus de 30 secondes, ou une adresse réseau différente, y met fin). RTMP, SRT et le MPEG-TS en HTTP vérifient le lien une fois, quand le lecteur se connecte.

## Appareils par lien {#devices-per-link}

Toute personne qui a un lien peut l'utiliser : un acheteur pourrait donc publier un lien payant dans une discussion de groupe. Pour l'empêcher, limitez le nombre d'appareils qui peuvent regarder avec un même lien en même temps :

- **Sur le flux :** le réglage **Devices per link** de l'onglet Output (1, 2, 3, 5 ou illimité) s'applique à tous les liens de ce flux.
- **Sur un seul lien :** en créant un lien, choisissez son propre nombre (un billet simple pour 1 appareil, un pass famille pour 3). Un site met ce nombre dans le jeton (plus bas).

Quand un lien est ouvert sur plus d'appareils qu'il n'en permet, **le plus récent lit et le plus ancien s'arrête**. Sur la page de lecture, l'appareil arrêté affiche « This link is now playing on another device » avec un bouton **Watch here** qui reprend le lien. Un spectateur payant peut passer du téléphone à la télévision à tout moment ; des personnes qui partagent un lien n'arrêtent pas de s'interrompre, et le partage perd tout intérêt.

- Un lecteur arrêté ne reprend jamais le lien de lui-même : ses propres requêtes sont refusées, et pendant une minute tout redémarrage automatique depuis son adresse réseau l'est aussi (VLC et d'autres lecteurs se reconnectent d'eux-mêmes). Seul **Watch here**, ou un nouveau départ après cette minute, le reprend. Une fois que l'appareil plus récent est parti, celui qui avait été arrêté continue simplement.
- Recharger la même page dans le même navigateur ne compte pas comme un autre appareil.
- Un appareil compte en HLS par sa session de lecture (chaque onglet du navigateur), en DASH par son adresse et son lecteur, et en RTMP, SRT et MPEG-TS en HTTP par sa connexion (un lecteur arrêté est déconnecté).
- L'onglet Output indique combien d'appareils ont été arrêtés dans les dernières 24 heures, et le journal des événements reçoit une ligne par heure et par flux tant que cela arrive : le signe que des liens sont partagés.

## Créer les liens sur votre propre site {#make-links-on-your-own-website}

Un site qui vend des billets ou qui a sa propre connexion peut créer un lien pour chaque spectateur sans appeler le serveur. Un administrateur copie le **secret de signature** depuis **Server → Playback** et le garde sur le serveur web (jamais dans le code d'une page).

Un jeton s'écrit `<expiration>.<signature>` :

- `expiration` : l'heure limite pour commencer, en secondes Unix ;
- `signature` : le HMAC-SHA256, avec le secret (la chaîne hexadécimale, décodée en 32 octets), de `unda1:<nom du flux>:<expiration>`, dont on garde les 16 premiers octets, encodés en base64url sans remplissage.

Le nom du flux fait partie de la signature : un lien pour un flux n'en ouvre jamais un autre.

Pour un lien que **N** appareils au plus (de 1 à 99) peuvent regarder en même temps, signez à la place `unda2:<nom du flux>:<expiration>:<N>`, de la même façon, et écrivez le jeton sous la forme `<expiration>.<N>.<signature>`. Un jeton sans N suit le réglage propre au flux.

::: code-group

```js [Node.js]
const crypto = require("crypto");
const secret = Buffer.from(process.env.UNDA_PLAYBACK_SECRET, "hex");

function watchLink(name, seconds) {
  const exp = Math.floor(Date.now() / 1000) + seconds;
  const sig = crypto
    .createHmac("sha256", secret)
    .update(`unda1:${name}:${exp}`)
    .digest()
    .subarray(0, 16)
    .toString("base64url");
  return `https://tv.example.com/watch/${name}?token=${exp}.${sig}`;
}

// La même chose pour `devices` appareils au plus en même temps.
function watchLinkForDevices(name, seconds, devices) {
  const exp = Math.floor(Date.now() / 1000) + seconds;
  const sig = crypto
    .createHmac("sha256", secret)
    .update(`unda2:${name}:${exp}:${devices}`)
    .digest()
    .subarray(0, 16)
    .toString("base64url");
  return `https://tv.example.com/watch/${name}?token=${exp}.${devices}.${sig}`;
}
```

```php [PHP]
function watch_link(string $name, int $seconds): string {
    $secret = hex2bin(getenv('UNDA_PLAYBACK_SECRET'));
    $exp = time() + $seconds;
    $mac = substr(hash_hmac('sha256', "unda1:$name:$exp", $secret, true), 0, 16);
    $sig = rtrim(strtr(base64_encode($mac), '+/', '-_'), '=');
    return "https://tv.example.com/watch/$name?token=$exp.$sig";
}
```

```python [Python]
import base64, hashlib, hmac, os, time

SECRET = bytes.fromhex(os.environ["UNDA_PLAYBACK_SECRET"])

def watch_link(name: str, seconds: int) -> str:
    exp = int(time.time()) + seconds
    mac = hmac.new(SECRET, f"unda1:{name}:{exp}".encode(), hashlib.sha256).digest()[:16]
    sig = base64.urlsafe_b64encode(mac).rstrip(b"=").decode()
    return f"https://tv.example.com/watch/{name}?token={exp}.{sig}"
```

:::

Ou demandez-en un au serveur avec une [clé d'API](/reference/api#playback-protection) (en anglais) :

```bash
curl -X POST -H "Authorization: Bearer $KEY" -d '{"ttl_seconds":7200}' \
     https://tv.example.com/api/v1/streams/main-show/playback-link
```

## Le jeton dans chaque adresse {#the-token-in-each-address}

| Où | Adresse |
| --- | --- |
| Lecteur intégré | `https://tv.example.com/watch/main-show?token=JETON` |
| HLS | `https://tv.example.com/hls/main-show/index.m3u8?token=JETON` (ou `master.m3u8`) |
| DASH | `https://tv.example.com/dash/main-show/manifest.mpd?token=JETON` |
| RTMP | `rtmp://tv.example.com:1935/live/main-show?token=JETON` |
| SRT | `srt://tv.example.com:6000?streamid=read:main-show?token=JETON` |
| MPEG-TS en HTTP | `https://tv.example.com/ts/main-show.ts?token=JETON` |

Les lecteurs transmettent eux-mêmes le jeton à chaque playlist et à chaque segment. Pour SRT dans VLC, mettez `read:main-show?token=JETON` dans le champ de l'identifiant de flux (stream ID).

## Lecture WebRTC (WHEP) {#webrtc-playback-whep}

Les lecteurs [WebRTC](./webrtc) d'un flux protégé transmettent le jeton du lien comme jeton Bearer plutôt que dans l'adresse : ils envoient leur offre SDP par POST à `https://tv.example.com/webrtc/main-show` avec l'en-tête `Authorization: Bearer JETON`. La page de lecture le fait d'elle-même quand son interrupteur **Low latency** est activé. Un jeton absent, faux ou expiré reçoit 403 avant toute autre chose, la limite d'appareils du lien s'applique comme en HLS (409 quand le lien est utilisé ailleurs), et un jeton envoyé en HTTP simple est refusé (403). Un flux non protégé n'a pas besoin d'en-tête.

## Changer le secret {#changing-the-secret}

**Make a new secret…**, dans **Server → Playback**, invalide tous les liens créés jusque-là, y compris ceux que fait votre site, jusqu'à ce que le site ait le nouveau secret. Les spectateurs HLS et DASH qui regardent avec un ancien lien sont arrêtés ; ceux en RTMP, SRT et MPEG-TS en HTTP continuent jusqu'à leur reconnexion. Utilisez-le si le secret a fuité.

## Avec un CDN {#with-a-cdn}

Un CDN garde des copies des playlists et des morceaux de vidéo et les remet à chaque spectateur qui les demande, sans redemander à ce serveur. Donc **derrière un CDN qui met en cache, un lien signé n'est vérifié que quand le CDN va chercher sur ce serveur** : toute personne qui connaît l'adresse d'un flux protégé reçoit les copies que le CDN a déjà, avec ou sans lien. La limite d'appareils par lien ne fonctionne pas non plus à travers un CDN : ce serveur voit les ordinateurs du CDN, pas les spectateurs.

Pour garder un flux protégé avec un CDN devant, faites l'une de ces deux choses :

- **Laissez le CDN vérifier les liens.** Utilisez les URL signées ou l'authentification par jeton du CDN lui-même (la plupart des CDN en ont une) et faites créer ces liens-là par votre site. Désactivez ici **Require a signed link** pour le flux, puisque les requêtes du CDN ne portent aucun lien de ce serveur, et assurez-vous que les spectateurs ne peuvent pas contourner le CDN : ne laissez que le CDN joindre les adresses `/hls/` de ce serveur, par exemple avec une règle de pare-feu pour les plages d'adresses publiées par le CDN.
- **Ne mettez pas le flux protégé en cache.** Gardez la chaîne de requête dans la clé de cache du CDN pour ce flux, ou contournez le cache pour son chemin. Chaque requête arrive alors à ce serveur et son lien est vérifié, mais le CDN ne vous fait rien économiser sur ce flux.

Les flux non protégés peuvent être mis en cache librement : voir [Nombre de spectateurs](/fr/guide/watching#viewer-counts) pour le seul réglage dont un CDN a besoin.
