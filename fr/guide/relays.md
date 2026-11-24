---
title: "Relais : transmettre un flux de transport tel quel"
description: "Prenez le flux UDP, RTP, SRT ou RIST d'un encodeur ou d'un IRD et transmettez-le exactement tel qu'il arrive, avec chaque chaîne, piste son et table, vers jusqu'à quatre destinations en SRT, UDP, RTP ou RIST."
---

# Relais

Un relais reçoit un flux de transport et le transmet **exactement tel qu'il arrive** : chaque chaîne, piste son, langue, sous-titre, page de télétexte, repère publicitaire et table, avec les identifiants de paquets (PID), les horodatages et le débit de l'émetteur. Rien n'est décodé ni reconstruit : un relais ne coûte presque rien en processeur.

Utilisez-le là où se trouverait une passerelle IP, par exemple :

- l'encodeur ou l'IRD d'une chaîne envoie de l'UDP sur le réseau local, et l'opérateur TV prend la chaîne en SRT par Internet ;
- un flux de contribution doit arriver à deux endroits à la fois (l'opérateur et un site de secours, ou un second opérateur) ;
- un flux arrive en SRT ou en RIST, et du matériel du réseau local en a besoin en multicast UDP.

Ce que le relais apporte par rapport à une simple passerelle : il contrôle ce qui arrive selon TR 101 290 et compte les paquets perdus, lève une alerte quand le flux s'arrête ou qu'une destination est injoignable, et maintient chaque destination indépendamment des autres.

Les relais demandent une licence avec les sorties TV (l'offre Broadcast) et sont réservés aux opérateurs et au-dessus. Chaque relais en marche compte pour un flux en direct dans la limite de la licence, quel que soit le nombre de chaînes que porte son flux ; à la limite, un nouveau relais est refusé avec la raison. Ils sont conservés quand le serveur redémarre.

## Créer un relais {#making-a-relay}

**Broadcast → Relays → New relay** :

- **Name :** lettres minuscules, chiffres, `-` ou `_`.
- **Receive from :** d'où vient le flux, tel que l'émetteur l'envoie.

  | Émetteur | Adresse |
  |---|---|
  | UDP multicast (la sortie d'un encodeur ou d'un IRD) | `udp://239.1.1.1:5000` (remplissez **Network interface** pour choisir celle sur laquelle le groupe est rejoint) |
  | UDP vers un port de ce serveur | `udp://:5000` |
  | RTP | `rtp://239.1.1.1:5004` ou `rtp://:5004` |
  | SRT, ce serveur se connecte à l'émetteur | `srt://encoder.example.com:9000?passphrase=…` |
  | SRT, l'émetteur se connecte à ce serveur | `srt://:9000?passphrase=…` |
  | RIST | `rist://@:5000` (ajoutez `?secret=…` pour un émetteur chiffré) |
  | MPEG-TS en HTTP | `http://…/channel.ts` |

- **Allowed senders :** les adresses d'où le flux peut venir (adresses ou plages comme `10.0.1.0/24`, séparées par des virgules). Remplissez-le dès que le port peut être joint depuis l'extérieur.
- **Send to :** une à quatre destinations.

  | Récepteur | Adresse |
  |---|---|
  | Un récepteur SRT auquel Unda se connecte | `srt://receiver.example.net:9000?passphrase=…` |
  | Un appelant SRT qui se connecte à Unda | `srt://:9000?passphrase=…` (voir [Laisser le récepteur se connecter](/fr/guide/restreaming#letting-the-receiver-connect-srt-listener) ; `allow=` n'accepte que cette adresse) |
  | UDP, unicast ou multicast | `udp://10.0.0.20:5000` ou `udp://239.2.2.1:5000` |
  | RTP | `rtp://…` (`?fec=2d` ajoute la correction d'erreurs SMPTE 2022-1, `?path2=` un second chemin réseau) |
  | RIST | `rist://receiver.example.net:5000` (`?secret=…` le chiffre) |

Dans l'API : `POST /api/v1/relays` avec `{"name":"station","source":"udp://239.1.1.1:5000","allow":["10.0.0.5"],"destinations":["srt://receiver.example.net:9000?passphrase=…"]}`.

## Modifier un relais {#changing-a-relay}

**Edit**, sur un relais, ouvre ses réglages en dessous. Une adresse laissée vide garde celle qui est en place, phrase secrète comprise (la page n'affiche jamais une phrase secrète enregistrée : il n'y a rien à retaper) ; saisissez une adresse pour la remplacer, et retirez une destination avec la corbeille. Seul ce que vous changez redémarre :

- Les destinations que vous gardez restent connectées : une chaîne qui en reçoit une ne voit aucune coupure pendant que vous ajoutez, remplacez ou retirez les autres.
- Une nouvelle source, interface réseau ou liste d'émetteurs autorisés rouvre le côté réception : chaque destination ne reçoit rien pendant un instant. Si la nouvelle source ne peut pas s'ouvrir (son port est pris), le relais continue avec ses anciens réglages et la raison s'affiche.

Pendant que le relais reçoit, Unda demande confirmation avant d'enregistrer une modification qui arrête ou interrompt quelque chose. Le nom ne peut pas changer : les alertes et les événements l'utilisent.

Dans l'API : `PATCH /api/v1/relays/{name}` avec les champs à modifier, les destinations sous forme de liste de `{"keep": 1}` (la première des destinations actuelles) ou de `{"url": "…"}`.

## Ce que vous voyez {#what-you-see}

Chaque relais indique si son flux arrive (et d'où, à quel débit, avec combien de paquets perdus à l'arrivée), une pastille de flux de transport qui ouvre le rapport TR 101 290 complet, et chaque destination avec son état :

- **sending :** le flux part (pour une destination qui attend son récepteur : qui est connecté) ;
- **waiting :** la destination attend que son récepteur se connecte ;
- **connecting**, **retrying :** avec la raison en termes simples, et combien de paquets n'ont pas été envoyés pendant la coupure.

Une destination en échec est réessayée après 1, 2, 4… jusqu'à 30 secondes ; les autres continuent. Pendant qu'elle est coupée, ce qui arrive pour elle est abandonné : elle repart donc au direct plutôt qu'avec du retard accumulé.

## Comment les contrôles sont jugés {#how-the-checks-are-judged}

Un relais ne reconstruit rien : les défauts du flux atteignent les destinations tels quels. Son rapport compte les erreurs de priorité 1 et 2 (paquets perdus ou abîmés, tables manquantes, référence d'horloge ou horodatages en retard) comme des erreurs que reçoivent les destinations. Les constats de priorité 3 (les tables DVB de réseau, de services, de guide et d'heure, et leur fréquence de répétition) sont des remarques : la tête de réseau qui reçoit fabrique ses propres tables. Ses alertes suivent la même ligne.

## Alertes {#alerts}

- **Le relais ne reçoit rien** (environ 20 secondes après le dernier paquet) : ses destinations ne reçoivent rien. Critique.
- **Le relais ne peut pas envoyer vers une destination** (au bout de 15 secondes), avec la raison. Critique.
- **Le relais ne tourne pas :** un relais enregistré qui n'a pas pu démarrer au démarrage du serveur (son port pris, pas de licence, ou tous les flux en direct de la licence utilisés). Il reste enregistré et est réessayé au démarrage suivant ; **Edit** puis **Save** pour réessayer tout de suite.
- **Erreurs dans le flux qu'il transmet :** des erreurs de priorité 1 et 2 dans la dernière minute. Un avertissement.

Une destination qui attend son récepteur ne lève aucune alerte : que le côté réception se connecte ou non dépend de lui.

## Ce qu'un relais ne fait pas {#what-a-relay-doesnt-do}

- Il ne modifie pas le flux : pas de réencodage, pas de nouveau débit, pas de nouvelles tables. Pour envoyer une chaîne au format d'une chaîne de télévision, utilisez une [sortie TV](/fr/guide/restreaming#broadcast-tv-terrestrial-and-satellite).
- Il ne lisse pas le cadencement d'un flux irrégulier : les paquets partent comme ils arrivent. Un émetteur qui envoie ses paquets par paquets groupés atteint les destinations de la même façon (le débit et les pertes du rapport le montrent).
- Il ne publie pas le flux sur ce serveur. Pour aussi regarder, enregistrer ou rediffuser une chaîne du même flux, recevez-la comme [entrée UDP](/fr/guide/udp) ou [entrée MPTS](/fr/guide/mpts) sur un autre port, ou faites-la envoyer deux fois par l'émetteur.

Testé avec un flux de type encodeur (H.264 avec une piste son MP2 en anglais et une piste AC-3 en français, 4 Mb/s constants) relayé vers un récepteur SRT se connectant à Unda (TSDuck 3.45, libsrt 1.5.7) et vers un récepteur UDP : les deux ont reçu les mêmes identifiants de paquets, pistes son, langues, nom de service et bourrage, à exactement 4 000 000 b/s, sans erreur de continuité.
