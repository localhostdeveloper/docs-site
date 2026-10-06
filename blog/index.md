---
layout: page
title: Blog
description: "Articles from UndaMedia on running live video yourself: encoder settings, server sizing, reliability and what's new in Unda Media Server."
---

<script setup>
import { data as posts } from "./posts.data.ts";
const when = (d) => new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
</script>

<div class="m-page">
<section class="m-hero-small">
<div class="m-wrap">
<span class="m-kicker">Blog</span>
<h1>Running live video yourself</h1>
<p class="m-lead">Practical articles from the team behind Unda Media Server: encoder settings, server sizing, staying on air, and what we learn from real streams. For what changed in each version, see the <a href="/release-notes" style="color: var(--vp-c-brand-1)">release notes</a>.</p>
</div>
</section>
<section class="m-section">
<div class="m-wrap">
<div class="m-posts">
<a v-for="p in posts" :key="p.url" class="m-card m-post" :href="p.url"><time :datetime="p.date">{{ when(p.date) }}</time><h3>{{ p.title }}</h3><p>{{ p.description }}</p><span class="m-more">Read the article →</span></a>
</div>
</div>
</section>
<section class="m-section m-tight">
<div class="m-wrap">
<div class="m-cta">
<h2>A question we should write about?</h2>
<p>Tell us what you'd like to know about live streaming, and we may answer it here.</p>
<div class="m-actions">
<a class="m-btn m-btn-primary" href="/contact">Ask us</a>
<a class="m-btn m-btn-ghost" href="/glossary">Streaming glossary</a>
</div>
</div>
</div>
</section>
</div>
