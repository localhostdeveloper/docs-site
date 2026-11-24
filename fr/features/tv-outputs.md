---
layout: page
title: Sorties TV et IPTV (UDP, RTP, RIST, MPTS)
description: "Recevez des chaînes en UDP, RTP, SRT ou RIST, séparez les flux multi-chaînes, et envoyez des flux de transport SD et HD à débit constant avec noms DVB et guide des programmes."
---

<div class="m-page">
<section class="m-hero-small">
<div class="m-wrap">
<p class="m-crumb"><a href="/fr/media-server">Serveur média</a> › <a href="/fr/features/">Fonctionnalités</a> › Sorties TV et IPTV</p>
<h1>Sorties TV et IPTV</h1>
<p class="m-lead">Unda parle les flux de transport qu'utilise le matériel broadcast et IPTV. Recevez des chaînes depuis des encodeurs et des récepteurs satellite, prenez les chaînes voulues dans des flux multi-chaînes, et envoyez des chaînes SD et HD standard aux multiplexeurs, aux modulateurs, aux décodeurs et aux partenaires.</p>
<div class="m-actions">
<a class="m-btn m-btn-primary" href="/fr/contact">Demander un prix</a>
<a class="m-btn m-btn-ghost" href="/guide/mpts">Lire le guide (en anglais)</a>
</div>
<div class="m-included">Inclus dans <a href="/fr/packages">Broadcast</a></div>
</div>
</section>
<section class="m-section">
<div class="m-wrap">
<div class="m-split">
<div>
<h2>Regrouper des chaînes dans un seul flux de transport</h2>
<p>Créez un bouquet dans le tableau de bord : donnez-lui une destination et un débit total, ajoutez des chaînes, et Unda les envoie dans un seul flux de transport multi-programmes, avec les noms, les identifiants et les tables en place.</p>
<ul class="m-checks">
<li>Jusqu'à 8 bouquets, chacun avec jusqu'à 32 chaînes</li>
<li>Noms DVB des chaînes et du fournisseur, identifiants fixes qui résistent à un redémarrage</li>
<li>Programme en cours et à suivre dans le guide pour les chaînes 24h/24</li>
<li>Débit constant pour les modulateurs, ou variable pour les liaisons IP</li>
<li>Du noir ou une image fixe quand la source d'une chaîne est coupée : le bouquet ne casse jamais</li>
<li>Chaînes ajoutées et retirées pendant que le bouquet est à l'antenne</li>
</ul>
</div>
<div><a class="m-shot" href="/guide/mpts#sending-a-bundle-out"><img src="/screens/mpts.webp" width="1280" height="800" alt="Broadcast → MPTS outputs : un bouquet de trois chaînes en cours d'envoi, avec ses PID et un contrôle TR 101 290 sans erreur" loading="lazy"></a></div>
</div>
</div>
</section>
<section class="m-section m-tint">
<div class="m-wrap">
<div class="m-head">
<h2>Ce qu'Unda reçoit et envoie</h2>
</div>
<div class="m-grid m-grid-3">
<div class="m-card"><h3>Recevoir</h3><ul><li>MPEG-TS en UDP ou RTP, unicast ou multicast</li><li>SRT et RIST, avec récupération des paquets perdus sur Internet</li><li>Flux multi-chaînes : choisissez les chaînes voulues</li><li>Vidéo MPEG-2 et son MP2 ou AC-3 convertis pour le web</li><li>Pertes de paquets affichées pour chaque entrée</li></ul></div>
<div class="m-card"><h3>Envoyer des chaînes seules</h3><ul><li>576p, 576i, 720p25, 720p50, 1080i25, 1080p25 ou 1080p50</li><li>Vidéo H.264, HEVC ou MPEG-2</li><li>Son MP2, AC-3 ou AAC</li><li>Débit constant, avec le bon type de service DVB</li><li>En UDP, RTP, SRT ou RIST</li></ul></div>
<div class="m-card"><h3>Envoyer de façon fiable</h3><ul><li>Correction d'erreurs SMPTE 2022-1 sur RTP</li><li>RIST avec retransmission des paquets perdus</li><li>Multicast avec le TTL et l'interface réseau de votre choix</li><li>Un envoi régulier, pour que les récepteurs ne perdent pas les rafales</li></ul></div>
</div>
</div>
</section>
<section class="m-section">
<div class="m-wrap">
<div class="m-split">
<div>
<h2>TR 101 290 sur chaque flux, en entrée et en sortie</h2>
<p>Unda analyse chaque paquet de ses bouquets, de ses sorties TV et de ses destinations MPEG-TS, ainsi que des flux UDP, RTP et SRT qu'il reçoit, selon les contrôles TR 101 290 qu'utilisent les ingénieurs broadcast : synchronisation, continuité, tables et timing, et les informations de service DVB. Les erreurs de la dernière minute apparaissent dans le tableau de bord et déclenchent une alerte, et chaque flux a un rapport complet qui commence par la cause probable et ce qu'il faut faire.</p>
<p>L'<a href="/guide/analyser">analyseur de flux</a> (en anglais) contrôle n'importe quel autre flux pendant une minute ou une journée entière, sans le recevoir comme chaîne : la sortie IP d'un récepteur satellite, le flux d'un partenaire, votre propre sortie telle qu'un récepteur la voit. Il mesure aussi le débit, ainsi que la gigue et les pertes du réseau (MDI).</p>
<p>Nous avons aussi analysé les bouquets d'Unda avec TSDuck, un analyseur de flux de transport indépendant, pendant 12 minutes : aucune erreur, et chaque référence de temps à un tick près de là où elle doit être.</p>
</div>
<div>
<div class="m-table-wrap">
<table class="m-table">
<thead><tr><th>Testé jusqu'ici</th><th></th></tr></thead>
<tbody>
<tr><td>Analyse du flux de transport</td><td>Le contrôle TR 101 290 d'Unda et TSDuck : aucune erreur</td></tr>
<tr><td>Logiciels de réception</td><td>VLC, ffmpeg, vMix (UDP, utilisé par un client)</td></tr>
<tr><td>RIST</td><td>VLC (librist), dans les deux sens, à travers 5 % de pertes de paquets</td></tr>
<tr><td>Vos récepteurs</td><td>Parlez-nous des vôtres : nous pouvons tester avec eux avant votre mise à l'antenne</td></tr>
</tbody>
</table>
</div>
</div>
</div>
</div>
</section>
<section class="m-section m-tight">
<div class="m-wrap">
<p class="m-note-line">Voir aussi : <a href="/fr/features/24-7-channels">Chaînes 24h/24</a> · <a href="/fr/features/monitoring">Surveillance et alertes</a> · <a href="/fr/solutions/iptv-operators">Pour les opérateurs IPTV</a>.</p>
</div>
</section>
<section class="m-section m-tight">
<div class="m-wrap">
<div class="m-cta">
<h2>Parlez-nous de votre tête de réseau</h2>
<p>Quelles sources, quels récepteurs, combien de chaînes : nous vous dirons franchement ce qui convient et ce que nous devons encore tester avec vous.</p>
<div class="m-actions">
<a class="m-btn m-btn-primary" href="/fr/contact">Parlons-en</a>
<a class="m-btn m-btn-ghost" href="/guide/compatibility">Ce qui fonctionne avec Unda (en anglais)</a>
</div>
</div>
</div>
</section>
</div>
