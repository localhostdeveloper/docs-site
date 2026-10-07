# A tour of the dashboard

Everything in Unda is run from the dashboard at `https://your-server/dashboard`:
streams, viewers, recordings, 24/7 channels, people and settings. These pictures
come from a demo server with a few live streams, a 24/7 channel and simulated
viewers. Select a picture to see it full size.

People see only what their role allows. A streamer sees their own channels and
streams; operators and admins see more (see
[Accounts and channels](/guide/accounts#roles)).

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

[![A stream's page with a live preview, its input, health figures and viewers](/screens/stream.webp)](/screens/stream.webp)

A live preview, what the encoder is sending, and its health: frame rate,
keyframe interval, audio/video drift, bitrate against its usual level and
reconnects. From here you record, stop the stream, or open the player. The
tabs hold the stream's other settings:

- **Playback**: every address to watch it by, and
  [signed links](/guide/protect-playback).
- **Backup**: a [backup encoder](/guide/backup-encoder) that takes over by
  itself, and what shows when no encoder has pictures (black, a video or a
  backup playlist).
- **Transcoding**: [adaptive bitrate](/guide/transcoding) on or off.
- **Restream**: [destinations](/guide/restreaming) such as YouTube and Facebook.

## Multiview

[![Multiview: a still picture of every live stream, refreshed every few seconds](/screens/multiview.webp)](/screens/multiview.webp)

A picture of every live stream, refreshed every few seconds, with its bitrate
and viewers. The pictures are stills, so the wall costs the server little,
however many streams there are.

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

[![Channels: each channel's public name, owner, and secret stream key](/screens/channels.webp)](/screens/channels.webp)

A **channel** is a public name for viewers and a secret key for the encoder.
Keys stay hidden until you choose **Show key**. A channel streaming with
settings that will make viewers buffer gets a warning with the fix.

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
playlist is edited on the same page. Files are uploaded on the **Media** page.
The **Guide** page shows every channel's programmes for the coming days, with
the XMLTV link for IPTV apps (see [Programme guide](/guide/playout#programme-guide)).

## Server settings

[![The Server page: bandwidth, CPU and memory now and over the last hour](/screens/server.webp)](/screens/server.webp)

How the server is doing (bandwidth, CPU, memory over the last hour, refused
requests), plus tabs for the addresses to give encoders, HTTPS certificates,
transcoding hardware, UDP inputs, [multi-channel bundles](/guide/mpts),
capacity and signed playback.

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
