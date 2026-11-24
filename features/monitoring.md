---
layout: page
title: Monitoring, alerts and viewer sessions
description: "See the health of every stream, get clear alerts, follow every viewer session, and connect Prometheus, Grafana, Slack or Discord."
---

<div class="m-page">
<section class="m-hero-small">
<div class="m-wrap">
<p class="m-crumb"><a href="/media-server">Media Server</a> › <a href="/features/">Features</a> › Monitoring and alerts</p>
<h1>Monitoring and alerts</h1>
<p class="m-lead">Unda watches every stream, viewer and destination, and tells you what needs attention: an encoder with long keyframes, a bitrate that halved, a destination that refuses its key, a disk filling up.</p>
<div class="m-actions">
<a class="m-btn m-btn-primary" href="/contact">Ask for a price</a>
<a class="m-btn m-btn-ghost" href="/guide/monitoring">Read the guide</a>
</div>
<div class="m-included">Included in <a href="/packages">Starter</a><a href="/packages">Professional</a><a href="/packages">Broadcast</a></div>
</div>
</section>
<section class="m-section">
<div class="m-wrap">
<div class="m-split">
<div>
<h2>Stream health</h2>
<p>For each live stream Unda measures what actually arrives, not what the encoder claims, and keeps the last hour of it on the server.</p>
<ul class="m-checks">
<li>Frame rate, keyframe interval, bitrate and audio/video drift</li>
<li>Reconnects of the encoder, and frames each viewer missed</li>
<li>Multiview: a picture of every live stream on one page</li>
<li>Bandwidth, CPU and memory over the last hour</li>
</ul>
</div>
<div><a class="m-shot" href="/guide/dashboard"><img src="/screens/overview.webp" width="1280" height="800" alt="The Overview: live streams, viewers, bandwidth over the last hour and what needs attention" loading="lazy"></a></div>
</div>
<div class="m-split m-flip">
<div>
<h2>Alerts and events</h2>
<p>Alerts open when something is wrong and close when it is fixed. The event log keeps the story of the day, with repeats grouped so the important lines stay visible.</p>
<ul class="m-checks">
<li>"A keyframe only every 8.3 s: new viewers wait that long to start… (set the encoder's keyframe interval to 2 s)", not an error code</li>
<li>Bitrate under half its usual level, no sound, a frozen or black picture, a channel with no input left, a full uplink</li>
<li>Restream destinations failing, certificates about to expire, disks filling</li>
<li>Sent to Slack, Discord or your own system by webhook</li>
</ul>
</div>
<div><a class="m-shot" href="/guide/monitoring"><img src="/screens/events.webp" width="1280" height="800" alt="Events: what happened on the server, newest first" loading="lazy"></a></div>
</div>
</div>
</section>
<section class="m-section m-tint">
<div class="m-wrap">
<div class="m-split">
<div>
<h2>Viewer sessions</h2>
<p>Every player watching now, and the history of past sessions: address, player, start time, length and traffic, per stream and per viewer. Export it as CSV for a client's report or an invoice.</p>
<ul class="m-checks">
<li>Browsers, apps, smart TVs, VLC, OBS and other players named</li>
<li>Totals per stream and per viewer</li>
<li>Kept 30 days by default</li>
</ul>
</div>
<div><a class="m-shot" href="/guide/monitoring#viewer-sessions"><img src="/screens/sessions.webp" width="1280" height="800" alt="Sessions: every player watching now, with its address, player, start time and traffic" loading="lazy"></a></div>
</div>
</div>
</section>
<section class="m-section">
<div class="m-wrap">
<div class="m-specs">
<div class="m-spec"><h3>For your own tools</h3><ul><li>Prometheus metrics for Grafana dashboards</li><li>A REST API for everything the dashboard shows</li><li>A health check for your load balancer or uptime monitor</li></ul></div>
<div class="m-spec"><h3>For the whole team</h3><ul><li>Streamers see their own channels only</li><li>Operators see everything that needs attention</li><li>A live connection: the page greys out if it loses touch with the server</li></ul></div>
</div>
</div>
</section>
<section class="m-section m-tight">
<div class="m-wrap">
<p class="m-note-line">See also: <a href="/features/backup-encoder">Backup encoder</a> · <a href="/features/restreaming">Restreaming</a> · <a href="/blog/why-your-hls-stream-is-30-seconds-behind">Why your stream is 30 seconds behind</a>.</p>
</div>
</section>
<section class="m-section m-tight">
<div class="m-wrap">
<div class="m-cta">
<h2>Questions about monitoring?</h2>
<p>Ask us for a demo of the dashboard with live streams.</p>
<div class="m-actions">
<a class="m-btn m-btn-primary" href="/contact">Ask for a demo</a>
<a class="m-btn m-btn-ghost" href="/guide/dashboard">Take a tour</a>
</div>
</div>
</div>
</section>
</div>
