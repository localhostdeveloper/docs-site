# Release notes

What changed in each version of Unda, newest first. A server tells its
administrators when a newer version is out (Overview → Other notices) and
shows the first points from here; upgrading is re-running the installer
([Install](/guide/install)), which backs up the database first.

<!-- At release: rename this heading to "## vX.Y.Z {#vX-Y-Z}" (the anchor the
     update notice links to), add the date under it, and start a new
     "## Next release" above it. deploy/release.sh reads the version's section. -->

## Next release

- **24/7 channels (playout):** a channel plays video files from a schedule,
  fills gaps with black, a slate or a looping video, and hands over to a live
  stream (vMix, OBS) while it is live. It is watched, recorded and restreamed
  like any stream. See [24/7 channels](/guide/playout).
- **Media page:** upload video files from the dashboard. An interrupted upload
  carries on where it stopped; every file is checked before it is kept.
- **Playout page:** what is on air, a preview, what comes next, the schedule's
  state and the as-run log (with CSV download).
- **Restreaming:** a destination shows "live" only once the platform has
  accepted the stream, so a wrong or expired key no longer looks connected.
- **Restreaming:** a destination that keeps failing retries less and less
  often, and is switched off after 30 minutes, with the reason shown.
- **Restreaming:** errors are explained in plain words, with the technical
  detail one click away. Pause a destination instead of deleting it.
- **Events** are kept for 30 days (also across restarts), and a line that
  repeats is shown once with a count.
- Fewer false "possible leak" warnings: the check now waits for a steady load.

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
