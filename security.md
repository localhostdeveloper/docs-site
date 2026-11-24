---
layout: page
title: Security and reporting a vulnerability
description: How to report a security problem in Unda Media Server, what we do with your report, and how the software and its releases are protected.
---

<div class="m-page">
<section class="m-hero-small">
<div class="m-wrap">
<h1>Security</h1>
<p class="m-lead">How to tell us about a security problem, what we do with your report, and how Unda Media Server and its downloads are protected.</p>
</div>
</section>
<section class="m-section">
<div class="m-wrap m-prose m-legal">
<p class="m-legal-date">Last updated 23 November 2026</p>
<h2>Report a problem</h2>
<p>Email <a href="mailto:support@undamedia.com?subject=Security">support@undamedia.com</a> with "Security" in the subject. Please tell us before you tell anyone else.</p>
<ul>
<li><b>What to send.</b> The Unda version (<code>unda -version</code>), how it was installed (the installer or Docker), the steps that show the problem, and what someone could do with it. Leave out other people's data; if you came across any, tell us and delete it.</li>
<li><b>When we answer.</b> Within two working days (Monday to Friday) to say we have your report, then as we go: what we found, and when the fix will be released.</li>
<li><b>The fix.</b> Security fixes are released as soon as they are ready, whatever the date (see <a href="/guide/releases">Releases and support</a>). The <a href="/release-notes">release notes</a> say what was fixed, and name you if you'd like.</li>
<li><b>Going public.</b> Please keep the details to yourself until the fix is out. We agree a date with you, normally within 90 days of your report.</li>
</ul>
<h2>What to test, and how</h2>
<ul>
<li><b>Test your own copy.</b> Unda runs for 30 days without a licence, so you can <a href="/guide/install">install it</a> on a server of your own and test that.</li>
<li><b>In scope.</b> Unda Media Server, its installers and downloads (get.undamedia.com and our GitHub releases), and this website.</li>
<li><b>Out of scope.</b> Servers run by our customers: they are theirs, so don't test them, but do tell us about a problem you see and we will pass it on. Also out of scope: floods or load tests against this website or the download site, tricking people, and things the dashboard lets an owner or admin do on purpose, such as sending a stream to an address inside their own network.</li>
<li><b>Good faith.</b> If you test your own copy, keep to these rules and report to us first, we won't take legal action against you for that research.</li>
</ul>
</div>
</section>
<section class="m-section m-tint">
<div class="m-wrap">
<div class="m-head">
<h2>How Unda is protected</h2>
</div>
<div class="m-grid m-grid-3">
<div class="m-card"><h3>Signed releases</h3><p>Every release is signed with our key, which is kept offline. The installer and <code>unda upgrade</code> check the signature and every file before installing anything, and won't put an older version over a newer one. Docker installs pull the image by the fingerprint the signed list gives.</p><a class="m-more" href="/guide/install#1-install">Check a release yourself</a></div>
<div class="m-card"><h3>Sign-in</h3><p>Passwords are stored with argon2id. Two-step sign-in with an authenticator app can be required for any role. Wrong passwords lock that address out of the account for a while. Passwords and keys are accepted only over HTTPS or on the server itself.</p></div>
<div class="m-card"><h3>Roles</h3><p>Owners, admins, operators and clients see and change only what their role allows, and an automated test checks every part of the API against every role. A client never sees another client's channels. Every change is in the audit log.</p><a class="m-more" href="/guide/accounts">Accounts and roles</a></div>
<div class="m-card"><h3>Keys stay secret</h3><p>Stream keys and the keys of the platforms you send to are never written to the logs or shown back in full. Playback can be limited to signed links that expire.</p><a class="m-more" href="/guide/protect-playback">Signed playback links</a></div>
<div class="m-card"><h3>Contained on the server</h3><p>The service runs as its own user in a locked-down systemd sandbox: no new privileges, the system files read-only, and no special rights except opening ports under 1024. The Docker image runs without root. Uploaded files are opened only as video files.</p></div>
<div class="m-card"><h3>Checked on every change</h3><p>The tests run on every change, and every part that reads data from the network is fed random input to find faults. Each release is checked for known vulnerabilities in Go and every library, and regular security reviews try to reach one client's data from another's account.</p><a class="m-more" href="/guide/test-results#how-the-software-is-checked">How the software is checked</a></div>
</div>
</div>
</section>
<section class="m-section">
<div class="m-wrap m-prose m-legal">
<h2>Your data stays on your server</h2>
<p>Your streams, recordings, viewers and accounts stay on your server and never pass through us. The licence is a signed file checked there, with no activation call. Twice a day the server asks our download site whether a newer version exists (you can switch this off), and it shows only a release we signed.</p>
<p>We can sign in to your server only when its owner gives us support access, for as long as they choose, and everything we do there is in your audit log. See the <a href="/privacy">privacy policy</a> for the details.</p>
</div>
</section>
</div>
