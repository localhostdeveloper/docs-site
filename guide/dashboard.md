---
title: "A tour of the Unda dashboard"
description: "Pictures of every page of the Unda dashboard: streams, Multiview, viewers and events, channels and people, recordings, 24/7 channels and server settings."
---

# A tour of the dashboard

Everything in Unda is run from the dashboard at `https://your-server/dashboard`:
streams, viewers, recordings, 24/7 channels, people and settings. These pictures
come from a demo server with a few live streams, a 24/7 channel and simulated
viewers. Select a picture to see it full size.

People see only what their role allows. A streamer sees their own channels and
streams; operators and admins see more (see
[Accounts and channels](/guide/accounts#roles)).

Explanations sit behind a small **i** beside a setting or title: point at it,
tap it, or Tab to it and press Enter. What you need to see at once (status,
warnings, errors) stays on the page.

## Overview

[![The Overview page: live streams, viewers, ingest and egress for the last hour, and what needs attention](/screens/overview.webp)](/screens/overview.webp)

The first page after signing in. Live streams, viewers, incoming and outgoing
bandwidth (with a bandwidth cap set, how many more viewers the server has room
for), and charts of the last hour. **Needs attention** lists open alerts, worst first: here, a
camera whose keyframes are too far apart. The dot at the bottom of the sidebar
shows the live connection to the server; if it drops, the page greys out and
says so.

## Streams

[![The Streams list: status, protocol, resolution, bitrate, viewers, uptime and health of every live stream](/screens/streams.webp)](/screens/streams.webp)

Every live stream with its protocol, picture size, measured frame rate,
bitrate, viewers and health. Tags show what is happening to each one:
recording, adaptive bitrate, restreaming, backup sources. Streams with a
problem always sort to the top. Open a row to see who is pulling the stream
and whether any of them is falling behind.

## A stream's page

[![A stream's page with a live preview, its sound meter and player choice, its input, health figures and viewers](/screens/stream.webp)](/screens/stream.webp)

A live preview with a sound meter, what the encoder is sending, and its health:
frame rate, keyframe interval, audio/video drift, bitrate against its usual
level and reconnects. From here you record, stop the stream, or open the
player.

Under the preview, choose how it plays: **HLS** (the stream as it arrives, a
few seconds behind live), **Adaptive** (the qualities of a transcoded stream)
or **Low latency** (WebRTC, under a second behind, when the server has it).
This browser remembers the choice. The preview starts muted and plays only
while the browser tab is in front. The meter beside the picture shows the
sound reaching the server, also while the preview is muted; with HLS it moves
a few seconds ahead of the picture, with Low latency in step with it. On a
stream that keeps a [rewind window](/guide/watching#rewind), a bar over the
picture lets you go back in it, and **Go live** brings you back.

Beside the choice are the stream's size, frame rate and bitrate, and under
it how fast your connection loads the preview. **Link** copies the watch
page's address and **Embed** the code that puts the watch page in your own
web page. When your connection is too slow for the stream, a note under the
preview says so: **Show a picture instead** shows its latest picture every
few seconds rather than a video that keeps stopping (and holds up the rest of
the page), and this browser remembers it until you click **Play video**;
**Keep playing** leaves the video on.

The tabs hold the stream's other settings:

- **Input**: the channel's [inputs in order](/guide/channel-inputs): its
  live encoder (and a backup encoder), a pull stream and a playlist; the first
  one with pictures is on air.
- **Restream**: [destinations](/guide/restreaming) such as YouTube and Facebook.
- **EPG**: a live channel's [programme guide](/guide/playout#live-channels-a-typed-in-guide).
- **Output**: every address to watch it by, who can watch
  ([signed links](/guide/protect-playback)), how far back viewers can go
  ([rewind](/guide/watching#rewind)) and [adaptive bitrate](/guide/transcoding).

## Multiview

[![Multiview: a picture of every channel with its sound levels; a silent camera is marked No sound](/screens/multiview.webp)](/screens/multiview.webp)

A picture of every live channel, refreshed every few seconds. The pictures
are stills, so the wall costs the server little, however many channels there
are. Point at a picture to see how old it is.

Under each picture is the channel's name, a tag for what feeds it
(**ENCODER**, **24/7** or **PULL**), and one line with its size, bitrate and
viewers. When a channel needs attention, that line says why instead, with a
coloured border: red for no sound or a critical alert, yellow for a warning
such as a playlist item that can't play.

Above the wall, type in **Filter channels** to find one by name, show only
**Encoders**, **24/7** channels, **Pull** streams or those that **Need
attention**, and sort by name, needs attention first, most viewers or highest
bitrate. This browser remembers the sort and the tile size.

A channel with [inputs](/guide/channel-inputs) has one tile: what its viewers
see, its tag saying what is on air (**ENCODER**, **BACKUP**, **PULL**,
**PLAYLIST** or **SLATE**). Pictures of its inputs are on the channel's
Input tab. The Overview and the Streams count in the menu count such a
channel once, as the licence does.

Each tile has two sound meters at the right edge of its picture, for the left
and right channel: green, yellow above -18 dBFS, red above -6 dBFS, with a
line marking the last peak. A channel that has been silent for 10 seconds
shows **NO SOUND** with how long, and a red border; a stream that carries no
sound at all shows **No sound track**, with a yellow one. The same alarm appears in **Needs
attention** and in Events, whether or not anyone has Multiview open (see
[No sound](/guide/monitoring#no-sound)).

## Viewers and events

[![Sessions: every player watching now, with its address, player, start time and traffic](/screens/sessions.webp)](/screens/sessions.webp)

**Sessions** lists every player watching now, over HLS, DASH, RTMP or SRT,
with its address, player, how long it has watched and how much it received.
The other tabs keep the history (downloadable as CSV) and add it up by
stream and by viewer.

[![Events: what happened on the server, newest first](/screens/events.webp)](/screens/events.webp)

**Events** is what happened, newest first: streams starting and stopping,
reconnects, switches to a backup encoder, recordings, restream destinations
connecting or failing, alerts opening and resolving. A line that repeats is
shown once with a count.

## Channels and people

[![Channels: every channel with whether it is live, its owner, viewers and time on air, and its Inputs and Encoder settings buttons](/screens/channels.webp)](/screens/channels.webp)

A **channel** is a public name for viewers and a secret key for the encoder.
Each row shows whether it is live (and, for a channel with
[inputs](/guide/channel-inputs), which one is on air), its owner, viewers and
time on air; an offline channel shows when it was last live. Search and the
owner filter help when there are many. A channel streaming with settings that
will make viewers buffer gets a warning with the fix.

- **Inputs** sets what the channel plays: its encoder, a pull stream or a
  playlist.
- **Encoder settings** has what to put in OBS or vMix: the server address and
  the stream key (RTMP, or SRT and WHIP when the server has them), the backup
  key when backup sources are on, the watch link and the recommended encoder
  settings. Keys stay hidden until you choose the eye; **Copy** copies a key
  without showing it, which is safe while you share your screen.
- The **⋯** menu holds the rest: **Copy stream key**, **New stream key**,
  **New backup key**, **Change owner** (admins), **Pause channel** and
  **Delete channel**.
- **Pause channel** takes a channel off air without deleting it: a live
  encoder is disconnected, and its stream key (and backup key) is refused
  until you choose **Resume** on its row or its page. Its pull stream and
  playlist stop too. Its settings, keys, watch links, guide and recordings
  are kept, it stays paused after a restart, and a paused channel doesn't
  count toward your licence.

**New channel** (top right) asks for the name, shows the watch link as you
type it, and opens the new channel's encoder settings.

<a href="/screens/encoder-settings.webp"><img src="/screens/encoder-settings.webp" width="560" alt="Encoder settings: the server address, the stream and backup keys hidden behind dots with Show and Copy buttons, the watch link and the recommended encoder settings" loading="lazy"></a>

[![Users: inviting people and setting their roles](/screens/users.webp)](/screens/users.webp)

People join by invitation, with a role: owner, admin, operator or streamer.
Two-factor sign-in can be required per role. **API keys** and the
**Audit log** sit next to it in the sidebar.

## Recordings

[![Recordings: files per stream with their length and size, to play, download or delete](/screens/recordings.webp)](/screens/recordings.webp)

Every recording with its length and size. Play it in the browser, download
it, or delete it. See [Recording](/guide/recording).

## 24/7 channels

[![A 24/7 channel on air, with what plays next](/screens/playout.webp)](/screens/playout.webp)

A [24/7 channel](/guide/playout) plays your files to a schedule and can hand
over to a live stream. Its page shows what is on air and what comes next; the
playlist is edited on the same page. **Pause** takes it off air until you
choose **Resume**, which carries on where it stopped (see
[Pausing a channel](/guide/playout#pausing-a-channel)). A channel's own videos are uploaded with **Add videos** on its playlist; the **Media** page holds every file, shared ones included.
The **Guide** page shows every channel's programmes for the coming days, with
the XMLTV link for IPTV apps (see [Programme guide](/guide/playout#programme-guide)).
A live channel's guide is typed in on its **EPG** tab (Streams → the
channel).

[![The Guide page: what each channel is showing now, and the day's programmes on a timeline](/screens/guide.webp)](/screens/guide.webp)

## Server settings

[![The Server page: bandwidth, CPU and memory now and over the last hour](/screens/server.webp)](/screens/server.webp)

How the server is doing (bandwidth, CPU, memory over the last hour, refused
requests), plus tabs for the addresses to give encoders, HTTPS certificates,
transcoding hardware, UDP inputs, [multi-channel bundles](/guide/mpts),
capacity and signed playback.

**Database backups** (Status tab, admins and owners) shows the newest daily
copy, how many days are kept and when the next one is made. An owner can also
**download a locked backup** to their own computer: a copy of the database
locked with a passphrase they choose, after typing their password again. The
dialog lists what is inside and what is left out (the licence file, who is
signed in, pending invitations and viewer history). Restoring is one command
on the server; see [Backups and upgrades](/guide/install#8-backups-and-upgrades).

<a href="/screens/backup-download.webp"><img src="/screens/backup-download.webp" width="560" alt="Download a locked backup: what is inside and left out, a passphrase typed twice, and your password" loading="lazy"></a>

## License

[![The License page: who the license is for, its expiry, limits and features](/screens/license.webp)](/screens/license.webp)

Who the license is for, when it ends, how much of it is in use, and which
features it includes. The owner installs a new license here, and can give the
vendor time-limited support access. See [License](/guide/license).

## Light or dark

The dashboard is light by default. The moon button at the bottom of the
sidebar switches to dark, and **Account → Appearance** can follow your
computer's setting instead.

[![The Overview page in the dark theme](/screens/overview-dark.webp)](/screens/overview-dark.webp)
