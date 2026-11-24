---
layout: page
title: Backup encoder and channel inputs (failover)
description: "Keep a channel on air when the encoder or the internet fails: rank a live encoder, a backup encoder, a pull stream and a playlist; the best one airs."
---

<div class="m-page">
<section class="m-hero-small">
<div class="m-wrap">
<p class="m-crumb"><a href="/media-server">Media Server</a> › <a href="/features/">Features</a> › Backup encoder</p>
<h1>Backup encoder and channel inputs</h1>
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
<h2>How it works</h2>
<p>Switch on the channel's inputs on the stream's Input tab and rank them first, second, third. The channel gets a second key for a backup encoder. Unda always shows the best input that has pictures.</p>
<ul class="m-checks">
<li>Live stream: your encoder, and a backup encoder with its own key</li>
<li>Pull stream: a station's HLS link (operators can also pull RTMP servers and RTSP cameras)</li>
<li>Playlist or looped video, running on its own clock</li>
<li>Back to your first choice once it has been steady for 10 seconds (your setting)</li>
<li>Clients set the order, their pull link and their playlist on their own channels</li>
<li>Every switch in the event log; an alert only when no input has pictures</li>
</ul>
</div>
<div><a class="m-shot" href="/guide/channel-inputs"><img src="/screens/inputs.webp" width="1280" height="800" alt="A stream's Input tab: the live encoder on air, the pull stream ready as the second choice" loading="lazy"></a></div>
</div>
</div>
</section>
<section class="m-section">
<div class="m-wrap">
<div class="m-head">
<h2>Costs and limits</h2>
</div>
<div class="m-grid m-grid-3">
<div class="m-card"><h3>Direct or seamless</h3><p>By default Unda relays the input on air as it is, with no extra CPU: inputs encoded alike switch without viewers noticing, others restart the stream for a moment. With seamless switching, Unda encodes the channel itself and no switch is ever seen.</p></div>
<div class="m-card"><h3>Server cost</h3><p>Direct switching costs nothing extra. Seamless switching: about 60% of one CPU core for a 720p channel, plus about 13% for each input kept ready.</p></div>
<div class="m-card"><h3>One licence stream</h3><p>A channel with inputs counts as one live stream in your package: its encoders, pull and playlist don't count separately.</p></div>
</div>
<p class="m-note-line">Channel inputs protect against an encoder, a link or a station failing, not against the server itself failing.</p>
</div>
</section>
<section class="m-section m-tight">
<div class="m-wrap">
<p class="m-note-line">See also: <a href="/features/restreaming">Restreaming</a> · <a href="/features/monitoring">Monitoring and alerts</a> · <a href="/blog/staying-on-air-when-the-encoder-fails">Staying on air when the encoder fails</a>.</p>
</div>
</section>
<section class="m-section m-tight">
<div class="m-wrap">
<div class="m-cta">
<h2>Planning a backup for your events?</h2>
<p>Tell us about your events and your encoders, and we'll help you set up a backup.</p>
<div class="m-actions">
<a class="m-btn m-btn-primary" href="/contact">Talk to us</a>
<a class="m-btn m-btn-ghost" href="/packages">See the packages</a>
</div>
</div>
</div>
</section>
</div>
