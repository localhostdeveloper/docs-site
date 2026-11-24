---
layout: page
title: Sécurité et signalement d'une faille
description: Comment nous signaler un problème de sécurité dans Unda Media Server, ce que nous faisons de votre signalement, et comment le logiciel et ses versions sont protégés.
---

<div class="m-page">
<section class="m-hero-small">
<div class="m-wrap">
<h1>Sécurité</h1>
<p class="m-lead">Comment nous signaler un problème de sécurité, ce que nous faisons de votre signalement, et comment Unda Media Server et ses téléchargements sont protégés.</p>
</div>
</section>
<section class="m-section">
<div class="m-wrap m-prose m-legal">
<p class="m-legal-date">Mis à jour le 23 novembre 2026. Cette page traduit la <a href="/security" data-lang="en">version anglaise</a>, qui fait foi en cas de différence.</p>
<h2>Signaler un problème</h2>
<p>Écrivez à <a href="mailto:support@undamedia.com?subject=Security">support@undamedia.com</a> avec « Security » dans l'objet. Prévenez-nous avant de le dire à qui que ce soit.</p>
<ul>
<li><b>Ce qu'il faut envoyer.</b> La version d'Unda (<code>unda -version</code>), la façon dont il a été installé (l'installateur ou Docker), les étapes qui montrent le problème, et ce que quelqu'un pourrait en faire. N'envoyez pas les données d'autres personnes ; si vous en avez vu, dites-le-nous et supprimez-les.</li>
<li><b>Quand nous répondons.</b> Sous deux jours ouvrés (du lundi au vendredi) pour confirmer la réception de votre signalement, puis au fur et à mesure : ce que nous avons trouvé, et quand la correction sera publiée.</li>
<li><b>La correction.</b> Les corrections de sécurité sont publiées dès qu'elles sont prêtes, quelle que soit la date (voir <a href="/fr/guide/releases">Versions et assistance</a>). Les <a href="/release-notes">notes de version</a> disent ce qui a été corrigé, et vous citent si vous le souhaitez.</li>
<li><b>Rendre public.</b> Gardez les détails pour vous jusqu'à la sortie de la correction. Nous convenons d'une date avec vous, en principe dans les 90 jours suivant votre signalement.</li>
</ul>
<h2>Quoi tester, et comment</h2>
<ul>
<li><b>Testez votre propre copie.</b> Unda fonctionne 30 jours sans licence : vous pouvez l'<a href="/fr/guide/install">installer</a> sur un serveur à vous et tester celui-là.</li>
<li><b>Dans le périmètre.</b> Unda Media Server, ses installateurs et ses téléchargements (get.undamedia.com et nos versions sur GitHub), et ce site.</li>
<li><b>Hors du périmètre.</b> Les serveurs de nos clients : ils leur appartiennent, ne les testez donc pas, mais signalez-nous un problème que vous y voyez et nous le transmettrons. Sont aussi hors du périmètre : les attaques par saturation ou les tests de charge contre ce site ou le site de téléchargement, la manipulation de personnes, et ce que le tableau de bord permet volontairement à un propriétaire ou un administrateur, comme envoyer un flux vers une adresse de son propre réseau.</li>
<li><b>Bonne foi.</b> Si vous testez votre propre copie, respectez ces règles et nous prévenez d'abord, nous n'engagerons pas de poursuites contre vous pour ces recherches.</li>
</ul>
</div>
</section>
<section class="m-section m-tint">
<div class="m-wrap">
<div class="m-head">
<h2>Comment Unda est protégé</h2>
</div>
<div class="m-grid m-grid-3">
<div class="m-card"><h3>Des versions signées</h3><p>Chaque version est signée avec notre clé, conservée hors ligne. L'installateur et <code>unda upgrade</code> vérifient la signature et chaque fichier avant d'installer quoi que ce soit, et n'installent pas une version plus ancienne par-dessus une plus récente. Les installations Docker récupèrent l'image par l'empreinte que donne la liste signée.</p><a class="m-more" href="/fr/guide/install#1-installer">Vérifier une version vous-même</a></div>
<div class="m-card"><h3>Connexion</h3><p>Les mots de passe sont stockés avec argon2id. La connexion en deux étapes avec une application d'authentification peut être exigée pour n'importe quel rôle. Les mauvais mots de passe bloquent cette adresse pour ce compte pendant un moment. Les mots de passe et les clés ne sont acceptés qu'en HTTPS ou sur le serveur lui-même.</p></div>
<div class="m-card"><h3>Rôles</h3><p>Propriétaires, administrateurs, opérateurs et clients ne voient et ne modifient que ce que leur rôle permet, et un test automatique vérifie chaque partie de l'API pour chaque rôle. Un client ne voit jamais les chaînes d'un autre client. Chaque modification figure dans le journal d'audit.</p><a class="m-more" href="/fr/guide/accounts">Comptes et rôles</a></div>
<div class="m-card"><h3>Des clés qui restent secrètes</h3><p>Les clés de diffusion et les clés des plateformes vers lesquelles vous envoyez ne sont jamais écrites dans les journaux ni réaffichées en entier. La lecture peut être limitée à des liens signés qui expirent.</p><a class="m-more" href="/fr/features/signed-links">Liens de lecture signés</a></div>
<div class="m-card"><h3>Confiné sur le serveur</h3><p>Le service tourne sous son propre utilisateur dans un bac à sable systemd verrouillé : aucun nouveau privilège, les fichiers système en lecture seule, et aucun droit particulier en dehors de l'ouverture des ports inférieurs à 1024. L'image Docker tourne sans root. Les fichiers envoyés ne sont ouverts que comme des fichiers vidéo.</p></div>
<div class="m-card"><h3>Vérifié à chaque changement</h3><p>Les tests tournent à chaque changement, et chaque partie qui lit des données venant du réseau reçoit des entrées aléatoires pour trouver les défauts. Chaque version est vérifiée contre les failles connues de Go et de chaque bibliothèque, et des revues de sécurité régulières tentent d'atteindre les données d'un client depuis le compte d'un autre.</p><a class="m-more" href="/fr/guide/test-results#how-the-software-is-checked">Comment le logiciel est vérifié</a></div>
</div>
</div>
</section>
<section class="m-section">
<div class="m-wrap m-prose m-legal">
<h2>Vos données restent sur votre serveur</h2>
<p>Vos flux, vos enregistrements, vos spectateurs et vos comptes restent sur votre serveur et ne passent jamais par nous. La licence est un fichier signé, vérifié sur place, sans appel d'activation. Deux fois par jour, le serveur demande à notre site de téléchargement s'il existe une version plus récente (vous pouvez le désactiver), et il n'affiche qu'une version que nous avons signée.</p>
<p>Nous ne pouvons nous connecter à votre serveur que lorsque son propriétaire nous donne un accès d'assistance, pour la durée qu'il choisit, et tout ce que nous y faisons figure dans votre journal d'audit. Voir la <a href="/fr/privacy">politique de confidentialité</a> pour les détails.</p>
</div>
</section>
</div>
