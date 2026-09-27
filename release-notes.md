# Release notes

What changed in each version of Unda, newest first. A server tells its
administrators when a newer version is out (Overview → Other notices) and
shows the first points from here; upgrading is re-running the installer
([Install](/guide/install)), which backs up the database first.

<!-- Unreleased changes go in a "## Next release" section here. At release,
     rename it to "## vX.Y.Z {#vX-Y-Z}" (the anchor the update notice links
     to) and add the date under it. deploy/release.sh reads the version's
     section; its "- " points also show in the dashboard's update notice. -->

## v0.1.12 {#v0-1-12}

*27 September 2026*

- **24/7 channels (playout):** a channel plays video files from a schedule,
  fills gaps with black, a slate or a looping video, and hands over to a live
  stream (vMix, OBS) while it is live, returning to the schedule when it ends.
  It is watched, recorded and restreamed like any stream. See
  [24/7 channels](/guide/playout).
- **Media page:** upload video files from the dashboard. An interrupted upload
  carries on where it stopped (choose the same file again after a reload);
  every file is checked before it is kept.
- **Playout page:** what is on air and how far in, a preview, what comes next,
  the schedule's state, and the as-run log with a CSV download.
- **Restreaming shows "live" only once the platform has accepted the stream,**
  so a wrong or expired key no longer looks connected.
- **A restream destination that keeps failing** retries less and less often
  (up to every 5 minutes), and is switched off after 30 minutes with the
  reason shown; switch it back on when the platform is ready.
- **Restream errors in plain words** ("The destination refused the stream
  key…"), with the technical detail one click away, and one alert per stream
  instead of one per destination.
- **Pause a restream destination** with its switch instead of deleting it: the
  key is kept for the next event.
- **Events are kept for 30 days,** also across restarts ("Show older events"),
  and a line that repeats is shown once with a count.
- **Fewer false "possible leak" warnings:** the check now needs the load to hold
  still for the whole half hour.

**Upgrading.** The database gains two tables (the playout as-run log and the
event history). The installer backs the database up first; going back to
v0.1.11 needs that backup. Playout is included in evaluation mode; licenses
issued before this version don't include it, so ask for a new license file to
run 24/7 channels. Behind nginx, allow 16 MB request bodies for uploads
(`client_max_body_size 16m;`). Everything new is optional: nothing changes
until a playout channel is configured.

## v0.1.11 {#v0-1-11}

*27 September 2026*

- Multi-channel inputs can arrive over SRT or RIST; bundles can be sent over
  RIST, and at a variable bitrate.
- UDP destinations that fall behind skip ahead instead of drifting further.
- Recordings play in the dashboard with a full player.

## v0.1.10 {#v0-1-10}

*26 September 2026*

- **Sessions page:** who watched what, for how long and how much, over HLS,
  DASH, RTMP and SRT.
- **Recordings page:** play, download and delete recordings.
- Restream destinations are saved and come back after a restart.
- UDP and RTP restreams are paced, so receivers no longer lose packets on
  keyframes.

## v0.1.9 {#v0-1-9}

*26 September 2026*

- No false "Reconnecting" after the dashboard tab was in the background.
- A restream key stays visible while you type it.

## v0.1.8 {#v0-1-8}

*26 September 2026*

- Create multi-channel bundles from the dashboard; the Server page is split
  into tabs.

## v0.1.7 {#v0-1-7}

*26 September 2026*

- **Multi-channel (MPTS):** send several streams as one transport stream, and
  split a received bundle into streams, with TR 101 290 checks and black or a
  slate while a program is offline.
- DASH segments of 2 seconds from RTMP sources.

## v0.1.6 {#v0-1-6}

*26 September 2026*

- **Broadcast outputs:** SD 720×576 constant-bitrate MPEG-TS for DVB
  multiplexers.
- DASH with adaptive bitrate.
- Unlock blocked accounts from the dashboard.

## v0.1.4 {#v0-1-4}

*26 September 2026*

- Transcoding is set up in the dashboard, with graphics-card detection and a
  CPU alert.
- Encoder tips, update notices, and licenses bound to your domain.

## v0.1.2 {#v0-1-2}

*25 September 2026*

- The installer backs up the database before an upgrade, and can use your own
  certificate on servers whose ports 80/443 are taken.
- The watch page recovers by itself when a stream drops or stalls.

## v0.1.0 {#v0-1-0}

*24 September 2026*

- First release.
