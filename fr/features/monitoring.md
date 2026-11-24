---
layout: page
title: Surveillance, alertes et sessions des spectateurs
description: "Voyez la santé de chaque flux, recevez des alertes claires, suivez chaque session de spectateur, et reliez Prometheus, Grafana, Slack ou Discord."
---

<div class="m-page">
<section class="m-hero-small">
<div class="m-wrap">
<p class="m-crumb"><a href="/fr/media-server">Serveur média</a> › <a href="/fr/features/">Fonctionnalités</a> › Surveillance et alertes</p>
<h1>Surveillance et alertes</h1>
<p class="m-lead">Unda surveille chaque flux, chaque spectateur et chaque destination, et vous dit ce qui demande votre attention : un encodeur aux images clés trop espacées, un débit divisé par deux, une destination qui refuse sa clé, un disque qui se remplit.</p>
<div class="m-actions">
<a class="m-btn m-btn-primary" href="/fr/contact">Demander un prix</a>
<a class="m-btn m-btn-ghost" href="/guide/monitoring">Lire le guide (en anglais)</a>
</div>
<div class="m-included">Inclus dans <a href="/fr/packages">Starter</a><a href="/fr/packages">Professional</a><a href="/fr/packages">Broadcast</a></div>
</div>
</section>
<section class="m-section">
<div class="m-wrap">
<div class="m-split">
<div>
<h2>Santé des flux</h2>
<p>Pour chaque direct, Unda mesure ce qui arrive vraiment, et non ce qu'annonce l'encodeur, et garde la dernière heure sur le serveur.</p>
<ul class="m-checks">
<li>Images par seconde, intervalle des images clés, débit et décalage son-image</li>
<li>Reconnexions de l'encodeur, et images manquées par chaque spectateur</li>
<li>Multiview : l'image de chaque direct sur une seule page</li>
<li>Bande passante, processeur et mémoire sur la dernière heure</li>
</ul>
</div>
<div><a class="m-shot" href="/guide/dashboard"><img src="/screens/overview.webp" width="1280" height="800" alt="La page Overview : directs, spectateurs, bande passante de la dernière heure et ce qui demande votre attention" loading="lazy"></a></div>
</div>
<div class="m-split m-flip">
<div>
<h2>Alertes et événements</h2>
<p>Les alertes s'ouvrent quand quelque chose ne va pas et se ferment quand c'est réglé. Le journal des événements garde l'histoire de la journée, avec les répétitions regroupées pour que les lignes importantes restent visibles.</p>
<ul class="m-checks">
<li>« A keyframe only every 8.3 s: new viewers wait that long to start… (set the encoder's keyframe interval to 2 s) », plutôt qu'un code d'erreur (le tableau de bord est en anglais)</li>
<li>Débit sous la moitié de son niveau habituel, absence de son, image figée ou noire, chaîne sans aucune entrée, liaison montante saturée</li>
<li>Destinations de rediffusion en échec, certificats sur le point d'expirer, disques qui se remplissent</li>
<li>Envoyées vers Slack, Discord ou votre propre système par webhook</li>
</ul>
</div>
<div><a class="m-shot" href="/guide/monitoring"><img src="/screens/events.webp" width="1280" height="800" alt="Events : ce qui s'est passé sur le serveur, du plus récent au plus ancien" loading="lazy"></a></div>
</div>
</div>
</section>
<section class="m-section m-tint">
<div class="m-wrap">
<div class="m-split">
<div>
<h2>Sessions des spectateurs</h2>
<p>Chaque lecteur qui regarde en ce moment, et l'historique des sessions passées : adresse, lecteur, heure de début, durée et trafic, par flux et par spectateur. Exportez-le en CSV pour le rapport d'un client ou une facture.</p>
<ul class="m-checks">
<li>Navigateurs, applications, télévisions connectées, VLC, OBS et autres lecteurs nommés</li>
<li>Totaux par flux et par spectateur</li>
<li>Conservé 30 jours par défaut</li>
</ul>
</div>
<div><a class="m-shot" href="/guide/monitoring#viewer-sessions"><img src="/screens/sessions.webp" width="1280" height="800" alt="Sessions : chaque lecteur qui regarde en ce moment, avec son adresse, son lecteur, son heure de début et son trafic" loading="lazy"></a></div>
</div>
</div>
</section>
<section class="m-section">
<div class="m-wrap">
<div class="m-specs">
<div class="m-spec"><h3>Pour vos propres outils</h3><ul><li>Métriques Prometheus pour les tableaux de bord Grafana</li><li>Une API REST pour tout ce qu'affiche le tableau de bord</li><li>Un contrôle de santé pour votre répartiteur de charge ou votre surveillance de disponibilité</li></ul></div>
<div class="m-spec"><h3>Pour toute l'équipe</h3><ul><li>Les diffuseurs ne voient que leurs propres chaînes</li><li>Les opérateurs voient tout ce qui demande leur attention</li><li>Une connexion en direct : la page se grise si elle perd le contact avec le serveur</li></ul></div>
</div>
</div>
</section>
<section class="m-section m-tight">
<div class="m-wrap">
<p class="m-note-line">Voir aussi : <a href="/fr/features/backup-encoder">Encodeur de secours</a> · <a href="/fr/features/restreaming">Rediffusion</a> · <a href="/blog/why-your-hls-stream-is-30-seconds-behind">Pourquoi votre direct a 30 secondes de retard</a> (en anglais).</p>
</div>
</section>
<section class="m-section m-tight">
<div class="m-wrap">
<div class="m-cta">
<h2>Des questions sur la surveillance ?</h2>
<p>Demandez-nous une démonstration du tableau de bord avec des directs.</p>
<div class="m-actions">
<a class="m-btn m-btn-primary" href="/fr/contact">Demander une démonstration</a>
<a class="m-btn m-btn-ghost" href="/guide/dashboard">Visiter le tableau de bord (en anglais)</a>
</div>
</div>
</div>
</section>
</div>
