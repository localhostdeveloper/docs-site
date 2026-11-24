---
layout: page
title: Blog
description: "Les articles d'UndaMedia sur la vidéo en direct que l'on fait tourner soi-même : réglages des encodeurs, dimensionnement des serveurs, fiabilité, et les nouveautés d'Unda Media Server."
---

<script setup>
import { data as posts } from "./posts.data.ts";
const when = (d) => new Date(d + "T12:00:00Z").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
</script>

<div class="m-page">
<section class="m-hero-small">
<div class="m-wrap">
<h1>Faire tourner la vidéo en direct soi-même</h1>
<p class="m-lead">Des articles pratiques de l'équipe d'Unda Media Server : réglages des encodeurs, dimensionnement des serveurs, rester à l'antenne, et ce que nous apprennent les vrais directs. Pour ce qui a changé dans chaque version, voir les <a href="/release-notes" style="color: var(--vp-c-brand-1)">notes de version</a> (en anglais).</p>
</div>
</section>
<section class="m-section">
<div class="m-wrap">
<div class="m-posts">
<a v-for="p in posts" :key="p.url" class="m-card m-post" :href="p.url"><time :datetime="p.date">{{ when(p.date) }}</time><h3>{{ p.title }}</h3><p>{{ p.description }}</p><span class="m-more">Lire l'article →</span></a>
</div>
</div>
</section>
<section class="m-section m-tight">
<div class="m-wrap">
<div class="m-cta">
<h2>Un sujet que nous devrions traiter ?</h2>
<p>Dites-nous ce que vous aimeriez savoir sur la diffusion en direct, et nous y répondrons peut-être ici.</p>
<div class="m-actions">
<a class="m-btn m-btn-primary" href="/fr/contact">Nous demander</a>
<a class="m-btn m-btn-ghost" href="/fr/glossary">Glossaire du streaming</a>
</div>
</div>
</div>
</section>
</div>
