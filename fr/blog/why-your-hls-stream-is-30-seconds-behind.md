---
title: Pourquoi votre direct a 30 secondes de retard (et comment le ramener à 7)
description: "L'intervalle d'images clés de votre encodeur décide du retard des spectateurs dans un navigateur, de leur attente avant l'image et des arrêts sur image. Un seul réglage le corrige."
date: "2026-10-06"
---

# Pourquoi votre direct a 30 secondes de retard (et comment le ramener à 7) {#why-your-stream-is-30-seconds-behind-and-how-to-get-it-to-7}

*6 octobre 2026 · UndaMedia*

« Le direct a une demi-minute de retard. » « Il met une éternité à démarrer. » « Il se fige juste après le début. » Quand des personnes diffusent vers un site, ce sont les plaintes que nous entendons le plus. Très souvent, les trois ont la même cause, et c'est un seul réglage de l'encodeur : l'**intervalle d'images clés**.

## Ce qu'est une image clé {#what-a-keyframe-is}

La vidéo est compressée en envoyant de temps en temps une image complète, une **image clé**, et entre deux seulement ce qui a changé. Un lecteur ne peut démarrer qu'à partir d'une image clé : avant qu'il en arrive une, il n'a rien à dessiner.

Les lecteurs web (HLS, le format qu'utilisent le lecteur dans le navigateur et la plupart des applications) reçoivent la vidéo en petits fichiers appelés segments, et **un segment ne peut commencer que sur une image clé**. Aussi courts que le serveur veuille ses segments, ils ne peuvent donc pas être plus courts que l'écart entre deux images clés. Les lecteurs gardent environ trois segments avant de commencer la lecture, pour encaisser les petits à-coups de la connexion.

Mettez tout cela ensemble et l'intervalle d'images clés fixe le retard : trois segments de 8 secondes, c'est bien plus loin derrière le direct que trois segments de 2 secondes.

## Ce que nous avons mesuré {#what-we-measured}

Nous avons inscrit l'heure dans l'image d'un flux de test, puis l'avons relue dans ce qu'affichait un navigateur, avec Unda entre les deux :

| Intervalle d'images clés | Retard sur le direct (navigateur, HLS) |
|---|---|
| 2 secondes | environ 7 secondes |
| 8 secondes | environ 29 secondes |

Le même test en RTMP, tel que le liraient VLC ou OBS, donnait environ un dixième de seconde à travers le serveur. Le HLS échange du délai contre le fait de fonctionner partout ; avec le bon intervalle d'images clés, l'échange est faible.

Les longs intervalles d'images clés causent aussi les deux autres plaintes. Un spectateur qui ouvre la page doit attendre la prochaine image clé avant que quoi que ce soit n'apparaisse, jusqu'à l'intervalle entier. Et les lecteurs dans les navigateurs qui démarrent tout au bord d'un long segment se retrouvent souvent à sec quelques secondes plus tard, et se figent.

## Le coupable habituel : « auto » {#the-usual-culprit-auto}

L'intervalle d'images clés d'OBS Studio vaut par défaut **0, c'est-à-dire automatique**. Dans nos tests, cela donnait une image clé toutes les 8,3 secondes (250 images à 30 images par seconde). Beaucoup de diffuseurs ne le changent jamais, parce que les plateformes qui réencodent elles-mêmes cachent le problème.

## La correction {#the-fix}

Réglez l'encodeur sur une image clé toutes les **2 secondes** :

- **OBS Studio :** Paramètres → Sortie → Mode de sortie *Avancé* → Streaming → **Intervalle d'images clés : 2**. Profitez-en pour mettre le contrôle du débit sur **CBR**.
- **ffmpeg :** `-g` avec le double de la fréquence d'images, comme `-g 60` à 30 images/s.
- **Encodeurs matériels :** cherchez « keyframe interval », « GOP » ou « I-frame interval », et réglez 2 secondes (ou 60 images à 30 images/s, 50 à 25 images/s).

Il y a peu à perdre. Les images clés prennent un peu plus de débit, mais aux débits habituels du streaming la différence se voit à peine, et 2 secondes est aussi ce que demandent YouTube et Facebook : les mêmes réglages fonctionnent donc pour la rediffusion.

Les réglages recommandés complets sont dans [Diffuser depuis OBS, vMix ou ffmpeg](/fr/guide/streaming).

## Comment Unda aide {#how-unda-helps}

Unda mesure l'intervalle d'images clés de chaque flux à son arrivée : vous n'avez donc pas à croire ce que l'encodeur dit envoyer :

- une alerte s'ouvre quand les images clés sont espacées de plus de 4 secondes, en disant *« a keyframe only every 8.3 s »* et ce qu'il faut changer ;
- la page Channels montre les réglages d'encodeur à copier à côté de chaque chaîne, et prévient pour une chaîne dont l'encodeur fera charger les spectateurs.

Si vos spectateurs se plaignent du retard, vérifiez cela en premier. Plus de détails sur ce que mesure le tableau de bord : [Surveillance et alertes](/fr/features/monitoring).

---

[← Tous les articles](/fr/blog/) · Des questions ? [Parlez-nous](/fr/contact)
