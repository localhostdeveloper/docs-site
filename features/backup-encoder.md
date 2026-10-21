---
layout: page
title: Backup encoder and channel inputs (failover)
description: Keep a channel on air when the encoder, the venue's internet or a station's link fails. Each channel ranks its live encoder, a backup encoder, a pull stream and a playlist; Unda puts the best one with pictures on air and goes back when the first choice returns.
---

<div class="m-page">
<section class="m-hero-small">
<div class="m-wrap">
<p class="m-crumb"><a href="/media-server">Media Server</a> › <a href="/features/">Features</a> › Backup encoder</p>
<h1>Stay on air when the encoder drops</h1>
<p class="m-lead">OBS crashes, a cable is pulled, a station's link goes quiet. Each channel ranks its inputs: the live encoder and a backup encoder, a pull stream from a link, and a playlist of your videos. Unda puts the first one with pictures on air, and goes back to the first choice when it returns.</p>
<div class="m-actions">
<a class="m-btn m-btn-primary" href="/contact">Ask for a price</a>
<a class="m-btn m-btn-ghost" href="/guide/channel-inputs">Read the guide</a>
</div>
<div class="m-included">Included in <a href="/packages">Professional</a><a href="/packages">Broadcast</a></div>
</div>
</section>
<section class="m-section">
<div class="m-wrap">
<div class="m-figures">
<div class="m-figure"><b>About 1 s</b><span>to switch to the backup when the main encoder disconnects</span></div>
<div class="m-figure"><b>2 s</b><span>of frozen picture before switching, when the main is connected but sends nothing (your setting)</span></div>
<div class="m-figure"><b>0 reloads</b><span>for viewers through a switch between inputs encoded alike, or through any switch with seamless switching</span></div>
</div>
<p class="m-note-line">Measured on our test setup with two encoders, a pulled stream, viewers and a restream destination running throughout.</p>
</div>
</section>
<section class="m-section m-tint">
<div class="m-wrap">
<div class="m-split">
<div>
<span class="m-kicker">How it works</span>
<h2>Inputs in your order, switched for you</h2>
<p>Switch on the channel's inputs on the stream's Input tab and rank them first, second, third. The channel gets a second key for a backup encoder. Unda always shows the best input that has pictures.</p>
<ul class="m-checks">
<li>Live stream: your encoder, and a backup encoder with its own key</li>
<li>Pull stream: a station's HLS link (operators can also pull RTMP servers and RTSP cameras)</li>
<li>Playlist or looped video, running on its own clock</li>
<li>Back to your first choice by itself once it has been steady for 10 seconds (your setting)</li>
<li>Clients set the order, their pull link and their playlist on their own channels</li>
<li>Every switch in the event log, and an alert while not on the first choice</li>
</ul>
</div>
<div><a class="m-shot" href="/guide/channel-inputs"><img src="/screens/inputs.webp" width="1280" height="800" alt="A stream's Input tab: the live encoder on air, the pull stream ready as the second choice" loading="lazy"></a></div>
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
<div class="m-card"><h3>Direct or seamless</h3><p>By default Unda relays the input on air as it is, with no extra CPU: inputs encoded alike switch without viewers noticing, others restart the stream for a moment. With seamless switching, Unda encodes the channel itself and no switch is ever seen.</p></div>
<div class="m-card"><h3>Server cost</h3><p>Direct switching costs nothing extra. Seamless switching: about 60% of one CPU core for a 720p channel, plus about 13% for each input kept ready.</p></div>
<div class="m-card"><h3>One licence stream</h3><p>A channel with inputs counts as one live stream in your package: its encoders, pull and playlist don't count separately.</p></div>
</div>
<p class="m-note-line">Channel inputs protect against an encoder, a link or a station failing, not against the server itself failing.</p>
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
