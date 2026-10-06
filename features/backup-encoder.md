---
layout: page
title: Backup encoder (failover)
description: Keep a live stream on air when the encoder or the venue's internet fails. Unda switches to a backup encoder, another stream or a slate within seconds, and back to the main when it returns, without viewers reloading.
---

<div class="m-page">
<section class="m-hero-small">
<div class="m-wrap">
<p class="m-crumb"><a href="/media-server">Media Server</a> › <a href="/features/">Features</a> › Backup encoder</p>
<h1>Stay on air when the encoder drops</h1>
<p class="m-lead">OBS crashes, a cable is pulled, the venue's internet cuts out. With backup sources on, Unda switches to a backup encoder, another stream or a slate within seconds, and back to the main when it returns. Viewers keep watching without reloading.</p>
<div class="m-actions">
<a class="m-btn m-btn-primary" href="/contact">Ask for a price</a>
<a class="m-btn m-btn-ghost" href="/guide/backup-encoder">Read the guide</a>
</div>
<div class="m-included">Included in <a href="/packages">Professional</a><a href="/packages">Broadcast</a></div>
</div>
</section>
<section class="m-section">
<div class="m-wrap">
<div class="m-figures">
<div class="m-figure"><b>About 1 s</b><span>to switch to the backup when the main encoder disconnects</span></div>
<div class="m-figure"><b>2 s</b><span>of frozen picture before switching, when the main is connected but sends nothing (your setting)</span></div>
<div class="m-figure"><b>0 reloads</b><span>for viewers, restream destinations and recordings: they carry on through every switch</span></div>
</div>
<p class="m-note-line">Measured on our test setup with two encoders, a viewer and a restream destination running throughout.</p>
</div>
</section>
<section class="m-section m-tint">
<div class="m-wrap">
<div class="m-split">
<div>
<span class="m-kicker">How it works</span>
<h2>Sources in order, switched for you</h2>
<p>Switch on backup sources on the stream's Backup tab. The channel gets a second key for a backup encoder, and you can add other streams as further sources. Unda always shows the best source that has pictures.</p>
<ul class="m-checks">
<li>Main encoder first, then the backup encoder, then any other stream you add</li>
<li>A slate (black, or a looping video) when nothing is live</li>
<li>Back to the main by itself once it has been steady for 10 seconds (your setting)</li>
<li>Use this: put any source on air by hand, then back to automatic</li>
<li>Every switch logged with its reason, and an alert while on a backup</li>
</ul>
</div>
<div><a class="m-shot" href="/guide/backup-encoder"><img src="/screens/backup.webp" width="1280" height="800" alt="A stream's Backup tab: sources in order, which one is on air, and the switch log" loading="lazy"></a></div>
</div>
</div>
</section>
<section class="m-section">
<div class="m-wrap">
<div class="m-head">
<span class="m-kicker">Good to know</span>
<h2>What it costs and what it covers</h2>
</div>
<div class="m-grid m-grid-3">
<div class="m-card"><h3>Seamless by design</h3><p>To make switches invisible, Unda encodes the stream itself: every source is decoded and one encoder produces what viewers get. Picture size and quality stay the same whatever the source sends.</p></div>
<div class="m-card"><h3>Server cost</h3><p>About 60% of one CPU core for a 720p stream, plus about 13% for each source kept ready. A 4-core server handles two or three streams with backups.</p></div>
<div class="m-card"><h3>One licence stream</h3><p>A stream with backup sources counts as one live stream in your package: its main and backup inputs don't count separately.</p></div>
</div>
<p class="m-note-line">Backup sources protect against an encoder or its connection failing, not against the server itself failing.</p>
</div>
</section>
<section class="m-section m-tint">
<div class="m-wrap">
<div class="m-head">
<span class="m-kicker">Goes well with</span>
<h2>Related features</h2>
</div>
<div class="m-grid m-grid-3">
<a class="m-card" href="/features/restreaming"><h3>Restreaming</h3><p>YouTube and Facebook stay connected through every switch.</p><span class="m-more">Learn more →</span></a>
<a class="m-card" href="/features/monitoring"><h3>Monitoring and alerts</h3><p>Know the moment a stream runs on its backup.</p><span class="m-more">Learn more →</span></a>
<a class="m-card" href="/blog/staying-on-air-when-the-encoder-fails"><h3>Staying on air when the encoder fails</h3><p>Our article on planning a live event that can't go dark.</p><span class="m-more">Read the article →</span></a>
</div>
</div>
</section>
<section class="m-section m-tight">
<div class="m-wrap">
<div class="m-cta">
<h2>Make your next event fail-safe</h2>
<p>Tell us about your events and your encoders, and we'll help you set up a backup.</p>
<div class="m-actions">
<a class="m-btn m-btn-primary" href="/contact">Talk to us</a>
<a class="m-btn m-btn-ghost" href="/packages">See the packages</a>
</div>
</div>
</div>
</section>
</div>
