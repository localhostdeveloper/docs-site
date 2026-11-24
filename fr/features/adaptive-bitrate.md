---
layout: page
title: Débit adaptatif (transcodage)
description: "Un flux en entrée, jusqu'à huit qualités en sortie, prévues pour chaque source. Les spectateurs sur des données mobiles lentes continuent de regarder, les connexions rapides ont la pleine HD."
---

<div class="m-page">
<section class="m-hero-small">
<div class="m-wrap">
<p class="m-crumb"><a href="/fr/media-server">Serveur média</a> › <a href="/fr/features/">Fonctionnalités</a> › Débit adaptatif</p>
<h1>Débit adaptatif</h1>
<p class="m-lead">Votre encodeur envoie un seul flux. Unda le transforme en plusieurs qualités, de la pleine HD jusqu'au 144p, et le lecteur de chaque spectateur choisit celle que sa connexion peut porter. Les personnes sur des données mobiles lentes continuent de regarder au lieu d'attendre que la vidéo charge.</p>
<div class="m-actions">
<a class="m-btn m-btn-primary" href="/fr/contact">Demander un prix</a>
<a class="m-btn m-btn-ghost" href="/fr/guide/transcoding">Lire le guide</a>
</div>
<div class="m-included">Inclus dans <a href="/fr/packages">Professional</a><a href="/fr/packages">Broadcast</a></div>
</div>
</section>
<section class="m-section">
<div class="m-wrap">
<div class="m-split">
<div>
<h2>Prévu pour chaque source</h2>
<p>Les encodeurs sont imprévisibles : un téléphone en portrait, une vieille caméra en 4:3, un flux 1080p à faible débit. Unda mesure chaque flux à son démarrage et prévoit ses qualités à partir de ce qu'il trouve, au lieu d'appliquer un même modèle à tout.</p>
<ul class="m-checks">
<li>Jusqu'à 8 qualités ; par défaut 2160p (4K), 1080p, 720p, 480p, 360p, 240p et 144p</li>
<li>Jamais agrandi : une source 720p reçoit le 720p et en dessous</li>
<li>Portrait, 4:3 et 16:9 gardent leur forme, sans bandes noires</li>
<li>Aucune qualité n'utilise plus de débit que la source ne le justifie</li>
<li>Images clés alignées entre les qualités, pour des changements fluides</li>
</ul>
</div>
<div><a class="m-shot" href="/fr/guide/transcoding"><img src="/screens/transcoding.webp" width="1280" height="800" alt="L'onglet Output d'un flux, débit adaptatif : activé, la source, et trois qualités choisies avec leur débit" loading="lazy"></a></div>
</div>
</div>
</section>
<section class="m-section m-tint">
<div class="m-wrap">
<div class="m-head">
<h2>Pour les spectateurs</h2>
<p>Lors de nos tests sur une connexion bridée, le lecteur est descendu à une qualité inférieure et a continué de lire, puis il est remonté dès que la connexion s'est rétablie.</p>
</div>
<div class="m-grid m-grid-3">
<div class="m-card"><h3>Automatique ou au choix</h3><p>Le lecteur intégré choisit la meilleure qualité pour la connexion, et propose un menu Qualité aux spectateurs qui veulent choisir.</p></div>
<div class="m-card"><h3>HLS et DASH</h3><p>Les mêmes qualités pour les sites, les applications et les télévisions connectées en HLS, et pour les lecteurs DASH.</p></div>
<div class="m-card"><h3>L'original aussi</h3><p>Les spectateurs en RTMP et en SRT, les enregistrements et les destinations de rediffusion reçoivent toujours le flux exactement tel qu'il a été envoyé.</p></div>
</div>
</div>
</section>
<section class="m-section">
<div class="m-wrap">
<div class="m-specs">
<div class="m-spec"><h3>Activé là où il le faut</h3><ul><li>Désactivé par défaut : les flux sont servis tels qu'ils arrivent</li><li>Activé flux par flux depuis son onglet Output, ou pour tous les flux</li><li>Désactivé à tout moment sans arrêter le flux</li></ul></div>
<div class="m-spec"><h3>Besoins du serveur</h3><ul><li>Environ 1 à 2 cœurs de processeur et 1 Go de mémoire par flux 1080p</li><li>Un avertissement avant l'activation quand le serveur est déjà chargé</li><li>Un graphique du processeur et une alerte, pour savoir quand ajouter de la capacité</li></ul></div>
<div class="m-spec"><h3>Cartes graphiques</h3><ul><li>Encodeurs NVIDIA, Intel et AMD via FFmpeg</li><li>Le tableau de bord détecte ce que votre serveur possède et fait un essai d'encodage</li><li>Demandez-nous quelle carte convient à vos chaînes</li></ul></div>
<div class="m-spec"><h3>Toujours en marche</h3><ul><li>Un convertisseur qui plante redémarre en une seconde environ</li><li>Les spectateurs continuent pendant un redémarrage</li><li>Le flux lui-même n'est jamais touché</li></ul></div>
</div>
</div>
</section>
<section class="m-section m-tight">
<div class="m-wrap">
<p class="m-note-line">Voir aussi : <a href="/fr/features/24-7-channels">Chaînes 24h/24</a> · <a href="/fr/features/signed-links">Liens de lecture signés</a> · <a href="/fr/blog/how-many-viewers-can-one-server-carry">Combien de spectateurs un serveur peut-il porter ?</a>.</p>
</div>
</section>
<section class="m-section m-tight">
<div class="m-wrap">
<div class="m-cta">
<h2>Des questions sur le débit adaptatif ?</h2>
<p>Dites-nous où sont vos spectateurs et comment ils regardent : nous vous aiderons à dimensionner le serveur.</p>
<div class="m-actions">
<a class="m-btn m-btn-primary" href="/fr/contact">Parlons-en</a>
<a class="m-btn m-btn-ghost" href="/fr/packages">Voir les offres</a>
</div>
</div>
</div>
</section>
</div>
