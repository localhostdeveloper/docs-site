# Release notes

Changes in each Unda release, newest first. Servers check for new releases and
show a notice to admins and owners under Overview → Other notices. To upgrade,
re-run the installer, or with Docker change the image tag and pull
([Backups and upgrades](/guide/install#8-backups-and-upgrades)). The
database is backed up first.

<!-- Unreleased changes go in a "## Next release" section here. At release,
     rename it to "## vX.Y.Z {#vX-Y-Z}" (the anchor the update notice links
     to) and add the date under it. deploy/release.sh reads the version's
     section; its "- " points also show in the dashboard's update notice,
     so upgrade notes are written as paragraphs, not "- " points. -->

## Next release

### New

- Clients can run their own 24/7 channels. A streamer sees Playout and Media,
  makes channels within their channel limit, uploads their own videos and
  edits their own playlists; they see only their own channels and files.
  Operators set the picture of every channel.
- Each 24/7 channel has its own files, and operators keep a set of shared
  files (idents, jingles, adverts) that every channel can use. A playlist can
  use only its own channel's files and the shared ones. Deleting a channel
  deletes its own files.

### Changed

- UDP, RTP and RIST destinations and broadcast outputs on the Restream tab
  now need the `udp` feature in the license, like UDP inputs and
  multi-channel bundles. Restreaming over RTMP, RTMPS and SRT is unchanged.

If your license doesn't include `udp` and you already send a stream over UDP,
RTP or RIST, or to a broadcast output, that destination is kept but switched
off after the upgrade, with the reason shown. Ask your vendor for a license
with `udp`; it starts again after a restart.

Existing media files become shared files: every channel keeps playing them,
and nothing moves.

## v0.1.25 {#v0-1-25}

*5 October 2026*

### Changed

- Every release now includes the `LICENSE` file (also in the Docker image, at
  `/usr/share/licenses/unda/LICENSE`). The dashboard's sign-in page and
  sidebar and `unda -version` show the copyright notice.
- Sessions name smart-TV players (Samsung TV, LG TV, Fire TV, Roku) instead
  of reading them as Safari.

### Fixed

- Chart peaks on the Overview and Server pages showed a date in January 1970
  instead of the time of the peak.
- Times of events and alerts were shown in UTC instead of your own time zone,
  with the full date even for today.
- On the Users page the role menu no longer cuts off "streamer", and a
  streamer's row keeps its buttons on one line.

## v0.1.24 {#v0-1-24}

*1 October 2026*

### Changed

- `api.token` (`UNDA_API_TOKEN`) is deprecated. It still works, but while it
  is set the server logs a warning and admins see one on the Overview. Create
  an API key under **API keys** for each script or Prometheus instead.
- Admins and owners see a **Security** notice on the Overview for each setting
  that weakens the server's protection: the legacy token, sign-in over plain
  HTTP without HTTPS, or a config file with secrets that other users can read.

### Fixed

- A video-only stream (a camera without a microphone) now plays on the watch
  page and over HLS. Before, it never started, and while a viewer kept
  trying, the server kept every frame of it in memory.
- A player asking for a stream that is not ready yet waits at most 30
  seconds, and stops waiting when the viewer leaves. Before, such requests
  stayed open on the server for as long as the stream was live.
- An SRT publisher sending malformed data can no longer stop the whole
  server; only its own connection ends.
- An encoder announcing an impossible picture size is treated as a bad
  stream description instead of being shown with a negative size.

## v0.1.23 {#v0-1-23}

*1 October 2026*

### Added

- **Docker image:** `ghcr.io/localhostdeveloper/unda`, for 64-bit Intel/AMD
  and ARM servers, built from the same files as the installer. See
  [Install](/guide/install#a-docker).
- Every upgrade now keeps a copy of the database: the new version's first
  start copies it to `backups/pre-upgrade-<old>-to-<new>-<time>.db` in the
  data directory before changing anything (the five newest are kept), however
  Unda was upgraded. If the copy fails, Unda does not start. See
  [Backups and upgrades](/guide/install#8-backups-and-upgrades).
- The update notice now says how to upgrade: run the install command again,
  or, in Docker, pull the new image.
- `unda healthcheck` checks the running server where its configuration puts
  it; the Docker image's health check uses it.

### Changed

- Docker: the example files keep uploaded media in `/data/media`, rotate
  Docker's logs, and show the `TZ` setting. New installs with the installer
  keep media in `/var/lib/unda/media`. Existing configurations are not
  changed.

### Fixed

- A playout channel now follows the server's clock when it jumps (the
  machine or its virtual machine slept, or the clock was set by hand). It
  used to stay behind its schedule by the whole jump until a restart; it
  now joins the item that should be on air and logs a warning event.
- In Docker, plain `http://` addresses redirected to the container's own
  HTTPS port (8443) instead of the published 443. Set
  `server.public_https_port: 443` (now in the Docker example of
  [Install](/guide/install)) and the redirect sends browsers to 443.

## v0.1.22 {#v0-1-22}

*1 October 2026*

### Added

- Broadcast outputs and re-encoded multi-channel programs can now be HD:
  720p50 or 1080i25 (interlaced, top field first) besides 576p25 SD, with
  H.264 (High profile) or HEVC video and AC-3 (Dolby Digital) or AAC audio
  besides MP2. Choose them under **Re-encode for broadcast TV**, in a
  bundle's channel rows, or with `format`, `video_codec` and `audio_codec`
  in the configuration file. HEVC is offered for progressive formats only.
- RTP outputs can carry SMPTE 2022-1 forward error correction, which
  broadcast equipment fed over IP often expects: add `?fec=1d` (columns) or
  `?fec=2d` (columns and rows) to an `rtp://` destination, with `fec_l` and
  `fec_d` for the matrix. It works for restream destinations, broadcast
  outputs and multi-channel bundles. See
  [Restreaming](/guide/restreaming#error-correction-for-rtp-smpte-2022-1).

### Fixed

- Switching on backup sources raised a false "input bitrate under half its
  baseline" alert: the stream is then Unda's own re-encode at its configured
  bitrate, and it was compared with the old encoder's. Streams Unda encodes
  itself (backup sources, playout channels) now start a new baseline whenever
  their encoder starts.
- On a stream's **Backup** tab, a drop-down could close and a field lose
  focus while you were using it, because the tab redrew itself every few
  seconds. It now waits until you leave the field.

### Changed

- Broadcast outputs now tell receivers what kind of service they carry (SD or
  HD H.264, HEVC; MPEG-2 stays "digital television"), so receivers that sort
  or filter channels by type show them correctly.

## v0.1.21 {#v0-1-21}

*1 October 2026*

SMPTE 2022-1 error correction on RTP outputs, also listed under v0.1.22.

## v0.1.20 {#v0-1-20}

*29 September 2026*

### Changed

- MPEG-DASH is no longer experimental. It was checked against the MPEG-DASH
  schema and with three players (dash.js and Shaka Player in Chrome, and VLC),
  in one quality and with adaptive bitrate, including switching qualities
  while playing.
- The dashboard and the documentation no longer mark DASH as experimental,
  and the install guide now covers firewalling UDP and RTP inputs.

### Fixed

- DASH players that follow the manifest's timing played 3 to 6 seconds
  further behind live than needed, and with adaptive bitrate dash.js stalled
  briefly when it changed quality. The manifest now gives the time each
  segment really becomes available.
- With adaptive bitrate, the DASH manifest understated what the smaller
  qualities use (up to 17 %), so a player could choose one its connection
  could not hold. It now includes the real overhead and peaks.
- Restreams over SRT, UDP, RTP, RIST and RTMP, and SRT viewers, could begin
  with a fraction of a second of audio stacked at the very start when the
  source was MPEG-TS (UDP, RTP, SRT). Some receivers reported the timestamps as
  invalid. That audio is now left out.

### Upgrade notes

No database change and nothing to configure.

## v0.1.19 {#v0-1-19}

*29 September 2026*

### Changed

- The dashboard menu is in three sections: Live (Overview, Streams,
  Multiview, Sessions, Events), Content (Channels, Recordings, Playout,
  Media) and Settings (Server, Users, API keys, Audit log, License, Account).
  Events and Channels moved up into their sections. Streamers, who see only a
  few pages, get the menu without section headings.

### Fixed

- On laptops with a short screen (1366×768, or Windows display scaling at
  125–150 %) the menu pushed the bottom of the sidebar (the connection
  status, the theme button, Sign out and the version) off the screen, with
  no way to scroll to it. The menu now scrolls on its own and the bottom of
  the sidebar always stays visible; on shorter screens the menu rows are
  also a little tighter.
- On narrow windows, a page with little on it stretched the top menu bar
  and left large empty gaps around it.

### Upgrade notes

No database change and nothing to configure. Reload the dashboard after the
upgrade to get the new menu.

## v0.1.18 {#v0-1-18}

*29 September 2026*

### Added

- Multi-channel: each channel in the New bundle and Add channel forms has an
  optional PIDs line (PMT, video, audio) for equipment configured by PID
  number. Left empty, PIDs are assigned automatically as before.

### Fixed

- Multi-channel bundles made in the dashboard kept automatic PIDs only until
  the next restart: they were then numbered again in channel order, so after a
  channel was removed, or added out of order, other channels moved to
  different PIDs. Each channel now keeps the PIDs it was given.
- A bundle mixing set and automatic PIDs could be refused when an automatic
  channel took a number a later channel asked for. Automatic PIDs now avoid
  every number the bundle's channels ask for.

### Upgrade notes

No database change. Existing dashboard bundles are numbered once more at the
first start after the upgrade (in channel order, as at any restart before) and
keep those PIDs from then on. Check each channel's PIDs in Server →
Multi-channel afterwards if equipment downstream is set up by PID.

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
