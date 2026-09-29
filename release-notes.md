# Release notes

Changes in each Unda release, newest first. Servers check for new releases and
show a notice to admins and owners under Overview → Other notices. To upgrade,
re-run the installer ([Install](/guide/install)); it backs up the database
before replacing the binary.

<!-- Unreleased changes go in a "## Next release" section here. At release,
     rename it to "## vX.Y.Z {#vX-Y-Z}" (the anchor the update notice links
     to) and add the date under it. deploy/release.sh reads the version's
     section; its "- " points also show in the dashboard's update notice,
     so upgrade notes are written as paragraphs, not "- " points. -->

## v0.1.17 {#v0-1-17}

*29 September 2026*

### Fixed

- Server → Multi-channel: fields in the New bundle, Add channel, New input and
  Publish forms lost focus at each 3-second refresh, so typing stopped after a
  character or two. The card now waits while a field is in use.
- The playback signing secret (Server → Playback) and a channel's backup
  stream key (stream → Backup) could be shown but not hidden again without
  reloading the page. Both have a Hide button.

### Upgrade notes

No database change. Dashboard fixes only; nothing to do after the upgrade.

## v0.1.16 {#v0-1-16}

*29 September 2026*

### Fixed

- 24/7 channels and backup sources produced no picture or sound on servers
  with FFmpeg 6.1 (Ubuntu 24.04): the channel's encoder waited forever at
  start and was restarted every 13 seconds ("the encoder stopped producing
  output"). Channels start normally after the upgrade.
- Multi-channel bundles on FFmpeg 8.0 (Ubuntu 26.04): the black or slate
  picture of an offline channel was sent far too fast and pushed its audio out
  of the bundle, and switching from the slate to the live stream left the
  channel without sound for over 5 seconds. Both are fixed; the switch takes
  about 3 seconds, as on other versions.

### Upgrade notes

No database change. This release is tested with the FFmpeg that each Ubuntu
LTS installs: 4.4 on 22.04, 6.1 on 24.04 and 8.0 on 26.04. Nothing needs
changing after the upgrade; a channel that was stuck starts within a few
seconds.

## v0.1.15 {#v0-1-15}

*28 September 2026*

### Added

- MPTS bundles carry now and next (DVB EIT present/following) for channels
  whose stream is a 24/7 playout channel, taken from its playlist. Turn it off
  per bundle with `epg: false`. See [Multi-channel](/guide/mpts).

### Changed

- The largest media file that can be uploaded is now 5 GB (was 50 GB).
  Larger files can still be copied into the media folder by hand.

### Fixed

- Installing a license that adds a feature the server started without
  (playout, SRT, UDP/MPTS, transcoding, restreaming) now shows a banner and a
  note on the License page saying the server needs a restart. Previously the
  feature stayed off with no indication why.

### Upgrade notes

No database change. Multi-channel bundles that carry a 24/7 playout channel
start sending now and next as soon as the server is upgraded; if equipment
further down the chain inserts its own EIT, set `epg: false` on those bundles
before upgrading. Uploads larger than 5 GB that were in progress are refused
when they resume; copy such files into the media folder instead.

## v0.1.14 {#v0-1-14}

*28 September 2026*

### Added

- Playout channels can be created, changed and deleted in the dashboard
  (Playout → New channel). The playlist editor sets start times, media, titles
  and in/out points, and shows the computed air times before saving. See
  [24/7 channels](/guide/playout).

### Upgrade notes

No database change. Channels defined in `unda.yaml` still work and are
labelled "from unda.yaml". Their playlist is read-only in the dashboard when
the server cannot write their schedule file, which is the case on installs
made with the installer (the systemd unit mounts `/etc/unda` read-only).
Create new channels in the dashboard instead. Downgrading to v0.1.13 hides
dashboard-created channels; they reappear after upgrading again.

## v0.1.13 {#v0-1-13}

*28 September 2026*

### Added

- Signed playback links. A protected stream (or all streams) plays only with a
  token in the URL. The token sets a deadline for starting playback; a viewer
  already watching is not cut off when it passes. Applies to the watch page,
  HLS, DASH, RTMP and SRT. Tokens are HMAC-SHA256 with a server secret, so a
  website can generate them. See
  [Signed playback links](/guide/protect-playback).
- Device limit per link (1, 2, 3 or 5), set per stream or per link. When a new
  device exceeds the limit, the oldest one is disconnected; the watch page has
  a "Watch here" button to take the seat back.
- Backup sources (failover). Each channel can have a second key for a backup
  encoder. If the main encoder disconnects or sends no video for 2 s, the
  output switches to the backup, another stream or a slate, and switches back
  once the main has been stable. The output is re-encoded, so viewers,
  restreams and recordings continue without reconnecting. See
  [Backup encoder](/guide/backup-encoder).

### Upgrade notes

Adds a column to the channels table (the backup key). The installer backs up
the database first; downgrading to v0.1.12 requires restoring that backup.
Backup sources require the license's playout feature, which evaluation mode
includes and licenses issued before v0.1.12 do not. Existing streams are
unaffected until playback protection or a backup source is switched on.

## v0.1.12 {#v0-1-12}

*27 September 2026*

### Added

- 24/7 playout channels. A channel plays files from a schedule, fills gaps
  with black, a slate or a looping video, and switches to a live input (vMix,
  OBS) while it is publishing. It is published as a normal stream, so
  playback, recording and restreaming work on it. See
  [24/7 channels](/guide/playout).
- Media page: upload video files from the dashboard. Uploads are resumable
  (select the same file again after a reload) and each file is probed before
  it is accepted.
- Playout page: current item and position, preview, upcoming items, schedule
  status, and the as-run log with CSV export.
- Restream destinations can be paused and resumed. The URL and key are kept.

### Changed

- A restream target is reported live only after the destination accepts the
  publish. A wrong or expired key no longer shows as connected.
- Restream retries back off to every 5 minutes. After 30 minutes of failures
  the target is paused and the reason is shown; resume it manually.
- Restream errors state the likely cause (for example "The destination
  refused the stream key"), with the raw error under "Technical detail".
  Alerts are raised once per stream, not once per destination.
- Events are stored for 30 days and survive restarts ("Show older events").
  Repeated events are shown as one line with a count.

### Fixed

- False "possible leak" warnings. The check now requires the load to stay
  constant for the whole 30-minute window.

### Upgrade notes

Adds two tables (playout as-run log, event history). The installer backs up
the database first; downgrading to v0.1.11 requires restoring that backup.
Playout requires the license's playout feature, which evaluation mode
includes and licenses issued before this version do not; request a new
license file to run 24/7 channels. Behind nginx, set
`client_max_body_size 16m;` for uploads. Nothing changes until a playout
channel is configured.

## v0.1.11 {#v0-1-11}

*27 September 2026*

- MPTS inputs accept SRT and RIST sources.
- MPTS outputs can be sent over RIST and at a variable bitrate.
- UDP destinations that fall behind skip to the next keyframe instead of
  accumulating delay.
- Recordings play in the dashboard, with seeking, speed control and frame
  step.

## v0.1.10 {#v0-1-10}

*26 September 2026*

- Sessions page: viewer history (stream, address, player, duration, bytes)
  for HLS, DASH, RTMP and SRT.
- Recordings page: play, download and delete recordings.
- Restream destinations added in the dashboard persist across restarts.
- UDP and RTP restreams are paced. Receivers no longer drop packets on
  keyframe bursts.

## v0.1.9 {#v0-1-9}

*26 September 2026*

- Fixed a false "Reconnecting" state after the dashboard tab had been in the
  background.
- The restream destination field shows the URL while typing so the key can be
  checked. It is still hidden after saving.

## v0.1.8 {#v0-1-8}

*26 September 2026*

- MPTS bundles can be created from the dashboard.
- The Server page is split into tabs.

## v0.1.7 {#v0-1-7}

*26 September 2026*

- MPTS output: several streams sent as one transport stream.
- MPTS input: a received bundle split into separate streams.
- TR 101 290 monitoring, and black or a slate while a program is offline.
- 2-second DASH segments from RTMP sources.

## v0.1.6 {#v0-1-6}

*26 September 2026*

- Broadcast outputs: SD 720×576 CBR MPEG-TS for DVB multiplexers.
- DASH with adaptive bitrate.
- Locked accounts can be unlocked from the dashboard.

## v0.1.4 {#v0-1-4}

*26 September 2026*

- Transcoding is configured in the dashboard, with GPU detection and a CPU
  load alert.
- Encoder setting hints, update notices, and licenses bound to a domain.

## v0.1.2 {#v0-1-2}

*25 September 2026*

- The installer backs up the database before an upgrade, and can use an
  existing certificate on servers where ports 80/443 are already in use.
- The watch page reconnects by itself when a stream drops or stalls.

## v0.1.0 {#v0-1-0}

*24 September 2026*

- First release.
