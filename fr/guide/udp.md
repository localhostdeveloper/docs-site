---
title: "Entrée et sortie MPEG-TS en UDP et en RTP"
description: "Recevez du MPEG-TS en UDP ou en RTP, unicast ou multicast, depuis des encodeurs, des têtes de réseau et des récepteurs, et envoyez-le vers des décodeurs et des systèmes IPTV."
---

# UDP / MPEG-TS

Le MPEG-TS simple en UDP est ce que parlent les encodeurs matériels, les têtes de réseau IPTV, les récepteurs satellite et les décodeurs. Unda le reçoit et l'envoie, en unicast ou en multicast.

::: warning Réseaux locaux seulement
L'UDP n'a ni retransmission, ni connexion, ni chiffrement : un paquet perdu est un défaut visible, et toute personne qui peut joindre le port peut y envoyer quelque chose. Sur Internet, utilisez [SRT](/fr/guide/srt).
:::

## Entrée {#input}

Ajoutez une entrée dans la page **Broadcast** du tableau de bord (_UDP inputs_) ou dans le fichier de configuration. Chaque entrée est publiée comme un flux sous le nom que vous lui donnez, et elle est aussitôt disponible sur toutes les sorties. Une entrée UDP accepte de la vidéo H.264 avec de l'audio AAC ; pour les autres formats, et pour les réglages dont un encodeur broadcast a besoin, voir [Encodeurs broadcast (sortie IP)](/fr/guide/broadcast-encoders).

```yaml
udp:
  inputs:
    - name: sat-feed
      listen: ":5001" # unicast : écouter sur ce port
      allow: [192.168.1.20] # facultatif : seulement ces émetteurs
    - name: headend
      multicast: "239.1.1.1:5000" # rejoindre ce groupe multicast
      interface: eth1
```

Plusieurs entrées multicast peuvent utiliser le même port (`239.1.1.1:5000`, `239.1.1.2:5000`, …), comme les envoient souvent les têtes de réseau : chaque entrée ne reçoit que son propre groupe.

Une entrée qui écoute sur **toutes les adresses** (`:5000`) ou qui rejoint un groupe multicast sans liste `allow` accepterait un flux de n'importe qui pouvant joindre le port : le tableau de bord et l'API refusent donc de la créer. Donnez-lui une liste `allow` avec l'adresse de l'émetteur, liez-la à une seule adresse, ou — pour accepter tout le monde volontairement (un réseau de laboratoire fermé) — réglez `allow: ["0.0.0.0/0"]`. Une entrée déjà présente dans votre fichier de configuration continue de fonctionner et écrit seulement un avertissement dans le journal.

Pour du RTP portant du MPEG-TS (RFC 2250), réglez `rtp: true` sur l'entrée. Le type de charge RTP doit être 33 et contenir des paquets TS complets de 188 octets :

```yaml
udp:
  inputs:
    - name: rtp-feed
      listen: ":5004"
      rtp: true
      allow: [192.168.1.20]
```

### Deux chemins (SMPTE 2022-7) {#two-paths-smpte-2022-7}

Un flux RTP peut arriver par deux chemins à la fois, sur deux réseaux ou deux liaisons : un paquet perdu sur l'un est pris sur l'autre, et le flux continue si une liaison tombe. Donnez à l'entrée une seconde adresse avec `path2` (un port, une adresse ou un groupe multicast ; `interface2` rejoint ce groupe sur une autre interface) :

```yaml
udp:
  inputs:
    - name: contribution
      multicast: "239.1.1.1:5000"
      interface: eth1
      rtp: true
      path2: "239.2.1.1:5000"
      interface2: eth2
```

Dans le tableau de bord, cochez **The sender wraps MPEG-TS in RTP** et remplissez **Second path**. La ligne de l'entrée affiche les pertes propres à chaque chemin (ce que ce chemin seul aurait perdu) et le nombre de paquets arrivés par les deux ; **1 of 2 paths** s'affiche quand l'un s'est tu, et Events note quand un chemin s'arrête ou revient. Les spectateurs ne voient rien de tout cela tant que l'autre chemin apporte tout. Les deux chemins doivent porter le même flux RTP (un seul émetteur, ou deux sorties d'un même encodeur envoyant les mêmes paquets) ; les copies sont appariées par numéro de paquet dans le délai de l'entrée (200 ms). L'UDP simple ne peut pas être fusionné (il n'a pas de numéros de paquet). Les entrées MPTS prennent `rtp://@239.1.1.1:5000?path2=@239.2.1.1:5000&iface2=eth2`.

Envoyez un flux de test avec `ffmpeg -re -i input.ts -c copy -f rtp_mpegts "rtp://SERVEUR:5004"`. Le serveur remet les paquets dans l'ordre dans sa fenêtre de gigue et indique les paquets RTP, les pertes et les doublons dans l'API des entrées UDP. RTP n'a ni authentification ni chiffrement ; gardez-le sur un réseau de confiance et limitez les émetteurs avec `allow` et des règles de pare-feu. Utilisez SRT sur les réseaux qui ne sont pas de confiance.

- Si les paquets s'arrêtent pendant 5 secondes, le flux passe hors ligne ; il revient de lui-même quand ils reviennent.
- **Les pertes de paquets** sont mesurées et affichées pour chaque flux. Le point du flux passe au jaune à 0,1 % de pertes et au rouge à 1 % (sur la dernière minute).
- **Ce qui arrive est contrôlé comme le fait le matériel de test broadcast** ([TR 101 290](/fr/guide/mpts#transport-stream-checks-tr-101-290)). La ligne de l'entrée dans _UDP inputs_ et la page de son flux affichent **TR 101 290 clean**, **Plays fine** quand l'émetteur n'a que des défauts qui ne peuvent pas atteindre vos spectateurs, ou **Viewers may see glitches** avec ce qui s'est mal passé dans la dernière minute ([ce qui atteint les spectateurs](/fr/guide/mpts#plays-fine-or-viewers-may-see-glitches)). Cliquez dessus pour le rapport : ce que signifient les erreurs, que faire, et le contrôle complet (paquets perdus, intervalle de PCR, chaque PID et les tables que porte l'émetteur). Seules les erreurs que les spectateurs peuvent remarquer lèvent un avertissement.
- Un court délai (200 ms) lisse les rafales. Le MPEG-TS brut n'a pas de numéros de séquence et ne peut pas être remis dans l'ordre ; les entrées RTP utilisent les numéros de séquence RTP pour rétablir l'ordre.
- À débit élevé, augmentez la limite de la mémoire de réception de Linux : `sudo sysctl -w net.core.rmem_max=26214400 net.core.rmem_default=26214400` (et rendez-la permanente dans `/etc/sysctl.d/`).
- Les entrées ajoutées dans le tableau de bord sont conservées quand le serveur redémarre. Une entrée qui ne peut pas démarrer à ce moment-là (son port pris par un autre programme, son interface réseau pas encore active) est signalée dans Events et réessayée au démarrage suivant.
- **Edit**, sur la ligne d'une entrée, change son adresse, son interface, le RTP, le second chemin, les émetteurs autorisés et le délai d'attente ; le nom reste (c'est le nom du flux). L'enregistrement rouvre le socket : un flux en direct redémarre donc avec les paquets suivants (les spectateurs le perdent quelques secondes ; Unda le demande d'abord). Si les nouveaux réglages ne peuvent pas s'ouvrir (le port est pris), l'entrée continue avec les anciens et la raison s'affiche. Les entrées listées dans le fichier de configuration se modifient là.

## Sortie {#output}

N'importe quel flux peut être envoyé en MPEG-TS sur UDP, depuis l'onglet **Restream** du flux ou le fichier de configuration :

```
udp://192.168.1.50:6000                  unicast
udp://239.1.1.10:6000?ttl=4&iface=eth1   multicast
```

Lisez-le avec `vlc udp://@:6000` (unicast) ou `vlc udp://@239.1.1.10:6000` (multicast). Le multicast demande des commutateurs gérant l'IGMP et ne traverse ni Internet ni la plupart des réseaux cloud.

La sortie est cadencée : chaque image clé est étalée sur quelques centaines de millisecondes au lieu de partir d'un seul coup, ce qu'un décodeur ou un commutateur chargé perdrait en partie (l'image se casse pendant que le son continue). Cela ajoute jusqu'à une demi-seconde de délai environ. Ajoutez `pace=0` à l'adresse pour envoyer chaque image d'un coup.

Le flux répète ses tables (PAT et PMT) toutes les 100 ms et son horloge (PCR) au moins toutes les 35 ms, comme le demande le DVB : un récepteur s'y cale vite. Chaque paquet envoyé est contrôlé selon [TR 101 290](/fr/guide/mpts#transport-stream-checks-tr-101-290) : la ligne de la destination dans l'onglet Restream affiche **TR 101 290 clean** pendant l'envoi, et un clic dessus ouvre le rapport complet.
