---
layout: page
title: Adaptive bitrate (transcoding)
description: "One stream in, up to eight qualities out, planned for each source. Viewers on slow mobile data keep watching while fast connections get full HD."
---

<div class="m-page">
<section class="m-hero-small">
<div class="m-wrap">
<p class="m-crumb"><a href="/media-server">Media Server</a> › <a href="/features/">Features</a> › Adaptive bitrate</p>
<h1>Adaptive bitrate</h1>
<p class="m-lead">Your encoder sends one stream. Unda turns it into several qualities, from full HD down to 144p, and each viewer's player picks the one their connection can carry. People on slow mobile data keep watching instead of buffering.</p>
<div class="m-actions">
<a class="m-btn m-btn-primary" href="/contact">Ask for a price</a>
<a class="m-btn m-btn-ghost" href="/guide/transcoding">Read the guide</a>
</div>
<div class="m-included">Included in <a href="/packages">Professional</a><a href="/packages">Broadcast</a></div>
</div>
</section>
<section class="m-section">
<div class="m-wrap">
<div class="m-split">
<div>
<h2>Planned for each source</h2>
<p>Encoders are unpredictable: a phone in portrait, an old camera in 4:3, a 1080p stream at a low bitrate. Unda measures each stream when it starts and plans its qualities from what it finds, instead of applying one template to everything.</p>
<ul class="m-checks">
<li>Up to 8 qualities; by default 2160p (4K), 1080p, 720p, 480p, 360p, 240p and 144p</li>
<li>Never upscaled: a 720p source gets 720p and below</li>
<li>Portrait, 4:3 and widescreen kept in shape, with no black bars</li>
<li>No quality uses more bitrate than the source justifies</li>
<li>Keyframes aligned across qualities, so switching is smooth</li>
</ul>
</div>
<div><a class="m-shot" href="/guide/transcoding"><img src="/screens/transcoding.webp" width="1280" height="800" alt="A stream's Output tab, Adaptive bitrate: on, the source, and three chosen qualities with their bitrates" loading="lazy"></a></div>
</div>
</div>
</section>
<section class="m-section m-tint">
<div class="m-wrap">
<div class="m-head">
<h2>For viewers</h2>
<p>In our tests on a throttled connection, the player dropped to a lower quality and kept playing, then climbed back once the connection recovered.</p>
</div>
<div class="m-grid m-grid-3">
<div class="m-card"><h3>Automatic or chosen</h3><p>The built-in player picks the best quality for the connection, and has a Quality menu for viewers who want to choose.</p></div>
<div class="m-card"><h3>HLS and DASH</h3><p>The same qualities for websites, apps and smart TVs over HLS, and for DASH players.</p></div>
<div class="m-card"><h3>The original too</h3><p>RTMP and SRT viewers, recordings and restream destinations still get the stream exactly as it was sent.</p></div>
</div>
</div>
</section>
<section class="m-section">
<div class="m-wrap">
<div class="m-specs">
<div class="m-spec"><h3>Switched on where you need it</h3><ul><li>Off by default: streams are served as sent</li><li>Switched on per stream from its Output tab, or for every stream</li><li>Switched off at any moment without stopping the stream</li></ul></div>
<div class="m-spec"><h3>Server needs</h3><ul><li>About 1 to 2 CPU cores and 1 GB of memory per 1080p stream</li><li>A warning before you switch on when the server is already busy</li><li>A CPU graph and alert, so you see when to add capacity</li></ul></div>
<div class="m-spec"><h3>Graphics cards</h3><ul><li>NVIDIA, Intel and AMD encoders through FFmpeg</li><li>The dashboard detects and test-encodes on what your server has</li><li>Ask us which card fits your channels</li></ul></div>
<div class="m-spec"><h3>Kept running</h3><ul><li>A crashed converter restarts within about a second</li><li>Viewers carry on through a restart</li><li>The stream itself is never affected</li></ul></div>
</div>
</div>
</section>
<section class="m-section m-tight">
<div class="m-wrap">
<p class="m-note-line">See also: <a href="/features/24-7-channels">24/7 channels</a> · <a href="/features/signed-links">Signed playback links</a> · <a href="/blog/how-many-viewers-can-one-server-carry">How many viewers can one server carry?</a>.</p>
</div>
</section>
<section class="m-section m-tight">
<div class="m-wrap">
<div class="m-cta">
<h2>Questions about adaptive bitrate?</h2>
<p>Tell us where your viewers are and how they watch, and we'll help you size the server.</p>
<div class="m-actions">
<a class="m-btn m-btn-primary" href="/contact">Talk to us</a>
<a class="m-btn m-btn-ghost" href="/packages">See the packages</a>
</div>
</div>
</div>
</section>
</div>
