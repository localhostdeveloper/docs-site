---
layout: page
title: TV and IPTV outputs (UDP, RTP, RIST, MPTS)
description: Take channels in over UDP, RTP, SRT or RIST, choose channels from multi-channel feeds, and send constant-bitrate SD and HD transport streams with DVB channel names and now/next to multiplexers, set-top boxes and partners.
---

<div class="m-page">
<section class="m-hero-small">
<div class="m-wrap">
<p class="m-crumb"><a href="/media-server">Media Server</a> › <a href="/features/">Features</a> › TV and IPTV outputs</p>
<h1>From the internet to TV equipment, and back</h1>
<p class="m-lead">Unda speaks the transport streams that broadcast and IPTV equipment uses. Take channels in from encoders and satellite receivers, pick channels out of multi-channel feeds, and send standard SD and HD channels to multiplexers, modulators, set-top boxes and partners.</p>
<div class="m-actions">
<a class="m-btn m-btn-primary" href="/contact">Ask for a price</a>
<a class="m-btn m-btn-ghost" href="/guide/mpts">Read the guide</a>
</div>
<div class="m-included">Included in <a href="/packages">Broadcast</a></div>
</div>
</section>
<section class="m-section">
<div class="m-wrap">
<div class="m-split">
<div>
<span class="m-kicker">Multi-channel</span>
<h2>Bundle channels into one transport stream</h2>
<p>Build a bundle in the dashboard: give it a destination and a total bitrate, add channels, and Unda sends them as one multi-program transport stream with names, IDs and tables in place.</p>
<ul class="m-checks">
<li>Up to 8 bundles, each with up to 32 channels</li>
<li>DVB channel and provider names, fixed IDs that survive a restart</li>
<li>Now and next in the programme guide for 24/7 channels</li>
<li>Constant bitrate for modulators, or variable for IP links</li>
<li>Black or a slate while a channel's source is off, so the bundle never breaks</li>
<li>Channels added and removed while the bundle is on air</li>
</ul>
</div>
<div><a class="m-shot" href="/guide/mpts#sending-a-bundle-out"><img src="/screens/mpts.webp" width="1280" height="800" alt="Server → Multi-channel: a bundle of three channels being sent, with its PIDs and a clean TR 101 290 check" loading="lazy"></a></div>
</div>
</div>
</section>
<section class="m-section m-tint">
<div class="m-wrap">
<div class="m-head">
<span class="m-kicker">In and out</span>
<h2>What Unda takes and sends</h2>
</div>
<div class="m-grid m-grid-3">
<div class="m-card"><h3>Take in</h3><ul><li>MPEG-TS over UDP or RTP, unicast or multicast</li><li>SRT and RIST, with packet recovery over the internet</li><li>Multi-channel feeds: choose the channels you want</li><li>MPEG-2 video and MP2 or AC-3 sound converted for the web</li><li>Packet loss shown per input</li></ul></div>
<div class="m-card"><h3>Send single channels</h3><ul><li>576p, 720p50 or 1080i25</li><li>H.264, HEVC or MPEG-2 video</li><li>MP2, AC-3 or AAC sound</li><li>Constant bitrate, with the right DVB service type</li><li>Over UDP, RTP, SRT or RIST</li></ul></div>
<div class="m-card"><h3>Send reliably</h3><ul><li>SMPTE 2022-1 error correction on RTP</li><li>RIST with retransmission of lost packets</li><li>Multicast with the TTL and network interface you choose</li><li>Even pacing, so receivers don't drop bursts</li></ul></div>
</div>
</div>
</section>
<section class="m-section">
<div class="m-wrap">
<div class="m-split">
<div>
<span class="m-kicker">Checked as it is sent</span>
<h2>TR 101 290 on every bundle</h2>
<p>Unda analyses every packet it sends against the TR 101 290 checks used by broadcast engineers: sync, continuity, tables and timing. Errors in the last minute show on the dashboard and raise an alert.</p>
<p>We also analysed Unda's bundles with TSDuck, an independent transport stream analyser, over a 12-minute run: no errors, and every timing reference within a tick of where it should be.</p>
</div>
<div>
<div class="m-table-wrap">
<table class="m-table">
<thead><tr><th>Tested so far</th><th></th></tr></thead>
<tbody>
<tr><td>Transport stream analysis</td><td>Unda's own TR 101 290 monitor and TSDuck: no errors</td></tr>
<tr><td>Receiving software</td><td>VLC, ffmpeg, vMix (UDP, in use by a customer)</td></tr>
<tr><td>RIST</td><td>VLC (librist), both directions, through 5% packet loss</td></tr>
<tr><td>Hardware receivers</td><td>Not yet tested: talk to us about yours</td></tr>
</tbody>
</table>
</div>
</div>
</div>
</div>
</section>
<section class="m-section m-tint">
<div class="m-wrap">
<div class="m-head">
<span class="m-kicker">Goes well with</span>
<h2>Related features</h2>
</div>
<div class="m-grid m-grid-3">
<a class="m-card" href="/features/24-7-channels"><h3>24/7 channels</h3><p>Fill a bundle with channels from your own programmes, with their programme guide.</p><span class="m-more">Learn more →</span></a>
<a class="m-card" href="/features/monitoring"><h3>Monitoring and alerts</h3><p>Packet loss, transport errors and silent inputs, in plain words.</p><span class="m-more">Learn more →</span></a>
<a class="m-card" href="/solutions/iptv-operators"><h3>For IPTV operators</h3><p>How Unda fits between your sources and your subscribers.</p><span class="m-more">Learn more →</span></a>
</div>
</div>
</section>
<section class="m-section m-tight">
<div class="m-wrap">
<div class="m-cta">
<h2>Tell us about your headend</h2>
<p>Which sources, which receivers, how many channels: we'll tell you honestly what fits and what we still need to test with you.</p>
<div class="m-actions">
<a class="m-btn m-btn-primary" href="/contact">Talk to us</a>
<a class="m-btn m-btn-ghost" href="/guide/compatibility">What works with Unda</a>
</div>
</div>
</div>
</section>
</div>
