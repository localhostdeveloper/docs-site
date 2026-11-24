---
layout: page
title: Encodeur de secours et entrées de chaîne
description: "Gardez une chaîne à l'antenne quand l'encodeur ou Internet tombe : classez un encodeur en direct, un encodeur de secours, un flux récupéré et une playlist ; le meilleur passe à l'antenne."
---

<div class="m-page">
<section class="m-hero-small">
<div class="m-wrap">
<p class="m-crumb"><a href="/fr/media-server">Serveur média</a> › <a href="/fr/features/">Fonctionnalités</a> › Encodeur de secours</p>
<h1>Encodeur de secours et entrées de chaîne</h1>
<p class="m-lead">OBS plante, un câble est débranché, la liaison d'une station se tait. Chaque chaîne classe ses entrées : l'encodeur en direct et un encodeur de secours, un flux récupéré depuis un lien, et une playlist de vos vidéos. Unda met à l'antenne la première qui a des images, et revient au premier choix dès qu'il revient.</p>
<div class="m-actions">
<a class="m-btn m-btn-primary" href="/fr/contact">Demander un prix</a>
<a class="m-btn m-btn-ghost" href="/guide/channel-inputs">Lire le guide (en anglais)</a>
</div>
<div class="m-included">Inclus dans <a href="/fr/packages">Professional</a><a href="/fr/packages">Broadcast</a></div>
</div>
</section>
<section class="m-section">
<div class="m-wrap">
<div class="m-figures">
<div class="m-figure"><b>Environ 1 s</b><span>pour passer au secours quand l'encodeur principal se déconnecte</span></div>
<div class="m-figure"><b>2 s</b><span>d'image figée avant de basculer, quand le principal est connecté mais n'envoie rien (réglable)</span></div>
<div class="m-figure"><b>0 rechargement</b><span>pour les spectateurs lors d'un passage entre des entrées encodées de la même façon, ou lors de n'importe quel passage en bascule sans coupure</span></div>
</div>
<p class="m-note-line">Mesuré sur notre installation de test, avec deux encodeurs, un flux récupéré, des spectateurs et une destination de rediffusion actifs tout du long.</p>
</div>
</section>
<section class="m-section m-tint">
<div class="m-wrap">
<div class="m-split">
<div>
<h2>Comment ça marche</h2>
<p>Activez les entrées de la chaîne dans l'onglet Input du flux, et classez-les en premier, deuxième, troisième. La chaîne reçoit une seconde clé pour un encodeur de secours. Unda montre toujours la meilleure entrée qui a des images.</p>
<ul class="m-checks">
<li>Flux en direct : votre encodeur, et un encodeur de secours avec sa propre clé</li>
<li>Flux récupéré : le lien HLS d'une station (les opérateurs peuvent aussi récupérer des serveurs RTMP et des caméras RTSP)</li>
<li>Playlist ou vidéo en boucle, qui suit sa propre horloge</li>
<li>Retour au premier choix dès qu'il est stable depuis 10 secondes (réglable)</li>
<li>Les clients règlent l'ordre, leur lien récupéré et leur playlist sur leurs propres chaînes</li>
<li>Chaque bascule dans le journal des événements ; une alerte seulement quand aucune entrée n'a d'images</li>
</ul>
</div>
<div><a class="m-shot" href="/guide/channel-inputs"><img src="/screens/inputs.webp" width="1280" height="800" alt="L'onglet Input d'un flux : l'encodeur en direct à l'antenne, le flux récupéré prêt en deuxième choix" loading="lazy"></a></div>
</div>
</div>
</section>
<section class="m-section">
<div class="m-wrap">
<div class="m-head">
<h2>Coûts et limites</h2>
</div>
<div class="m-grid m-grid-3">
<div class="m-card"><h3>Direct ou sans coupure</h3><p>Par défaut, Unda relaie l'entrée à l'antenne telle quelle, sans processeur supplémentaire : des entrées encodées de la même façon basculent sans que les spectateurs le remarquent, les autres relancent le flux un instant. En bascule sans coupure, Unda encode lui-même la chaîne et aucune bascule ne se voit jamais.</p></div>
<div class="m-card"><h3>Coût pour le serveur</h3><p>La bascule directe ne coûte rien de plus. La bascule sans coupure : environ 60 % d'un cœur de processeur pour une chaîne 720p, plus environ 13 % pour chaque entrée tenue prête.</p></div>
<div class="m-card"><h3>Un seul flux de licence</h3><p>Une chaîne avec ses entrées compte comme un seul flux en direct dans votre offre : ses encodeurs, son flux récupéré et sa playlist ne comptent pas à part.</p></div>
</div>
<p class="m-note-line">Les entrées de chaîne protègent contre la panne d'un encodeur, d'une liaison ou d'une station, pas contre la panne du serveur lui-même.</p>
</div>
</section>
<section class="m-section m-tight">
<div class="m-wrap">
<p class="m-note-line">Voir aussi : <a href="/fr/features/restreaming">Rediffusion</a> · <a href="/fr/features/monitoring">Surveillance et alertes</a> · <a href="/blog/staying-on-air-when-the-encoder-fails">Rester à l'antenne quand l'encodeur tombe</a> (en anglais).</p>
</div>
</section>
<section class="m-section m-tight">
<div class="m-wrap">
<div class="m-cta">
<h2>Vous préparez un secours pour vos événements ?</h2>
<p>Parlez-nous de vos événements et de vos encodeurs : nous vous aiderons à mettre en place un secours.</p>
<div class="m-actions">
<a class="m-btn m-btn-primary" href="/fr/contact">Parlons-en</a>
<a class="m-btn m-btn-ghost" href="/fr/packages">Voir les offres</a>
</div>
</div>
</div>
</section>
</div>
