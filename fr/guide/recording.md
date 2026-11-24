---
title: "Enregistrer les flux en direct"
description: "Enregistrez vos directs dans Unda en un clic : des fichiers MPEG-TS qui survivent à une panne, un nouveau fichier toutes les heures, à lire, télécharger ou supprimer dans le navigateur."
---

# Enregistrement

Ouvrez un flux en direct dans le tableau de bord et appuyez sur **Record** ; **Stop recording** l'arrête. L'enregistrement n'a jamais d'effet sur le direct : un disque plein arrête l'enregistrement, pas la diffusion.

Les fichiers sont écrits dans le dossier des enregistrements du serveur (`/var/lib/unda/recordings` avec le script d'installation) :

```
recordings/main-show/2026-09-25_19-30-00.ts
```

- **Format : MPEG-TS (`.ts`).** Il se lit dans VLC et la plupart des logiciels de montage, même pendant qu'il est encore en cours d'écriture, et même après une coupure de courant ou une panne (vous perdez au plus les deux dernières secondes). Convertissez-le en MP4 sans le réencoder si besoin : `ffmpeg -i in.ts -c copy out.mp4`.
- **Découpage :** un nouveau fichier commence environ toutes les 60 minutes, sur une image clé, pour que chaque fichier se lise seul. Modifiez-le avec `record.split_duration_minutes`.
- **Nettoyage :** `record.retention_days: 30` supprime les enregistrements de plus de 30 jours. C'est désactivé par défaut : rien n'est supprimé sans que vous le demandiez.
- Le tableau de bord prévient quand le disque des enregistrements est plein à 85 % ou a moins de 5 Go libres, et à nouveau à 95 % ou sous 2 Go. Sous 2 Go libres, un enregistrement ne démarre pas, et sous 1 Go les enregistrements en cours s'arrêtent, leurs fichiers fermés proprement : un disque plein ne peut ni couper un fichier ni priver les spectateurs du direct.

L'enregistrement se pilote aussi depuis des scripts :

```bash
curl -X POST -H "Authorization: Bearer $KEY" -d '{"action":"start"}' https://tv.example.com/api/v1/streams/main-show/record
curl -X POST -H "Authorization: Bearer $KEY" -d '{"action":"stop"}'  https://tv.example.com/api/v1/streams/main-show/record
```

## Regarder, télécharger et supprimer les enregistrements {#watching-downloading-and-deleting-recordings}

La page **Recordings** liste chaque fichier enregistré, du plus récent au plus ancien : le flux, l'heure de début, la durée et la taille. Vous pouvez filtrer par flux.

- **Play** le lit dans la page, avec la possibilité de se déplacer dans le temps.
- **Download** enregistre le fichier (MPEG-TS, `.ts` : VLC et la plupart des logiciels de montage l'ouvrent).
- **Delete** le supprime. Le fichier en cours d'enregistrement ne peut pas être supprimé ; arrêtez d'abord l'enregistrement.

[![La page Recordings avec un enregistrement lu dans la page](/screens/recordings.webp)](/screens/recordings.webp)
