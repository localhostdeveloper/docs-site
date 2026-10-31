---
title: "Watch and embed live streams (HLS, DASH, RTMP)"
description: "Every way to watch a stream from Unda: the built-in player, HLS, DASH, MPEG-TS over HTTP for IPTV, RTMP and SRT, plus rewind and embedding."
---

# Watching and embedding

A live channel called `main-show` on `tv.example.com` can be watched in these
ways. The stream key is never part of a viewing address: anyone who knows the
name can watch, only the key can publish. To limit who can watch, protect the
stream with [signed links](/guide/protect-playback).

| Where                                                                          | Address                                              |
| ------------------------------------------------------------------------------ | ---------------------------------------------------- |
| Browser, built-in player                                                       | `https://tv.example.com/watch/main-show`             |
| HLS, for your own website or app                                               | `https://tv.example.com/hls/main-show/index.m3u8`    |
| HLS with several qualities (when [adaptive bitrate](/guide/transcoding) is on) | `https://tv.example.com/hls/main-show/master.m3u8`   |
| MPEG-DASH (H.264, optional AAC; several qualities when adaptive bitrate is on) | `https://tv.example.com/dash/main-show/manifest.mpd` |
| IPTV boxes, apps and panels: [MPEG-TS over HTTP](#mpeg-ts-over-http-iptv)       | `https://tv.example.com/ts/main-show.ts`             |
| VLC, OBS or vMix over RTMP                                                     | `rtmp://tv.example.com:1935/live/main-show`          |
| VLC, OBS or vMix over SRT                                                      | `srt://tv.example.com:6000?streamid=read:main-show`  |

The stream's **Output** tab in the dashboard lists every address, DASH
included, with copy buttons.

## MPEG-TS over HTTP (IPTV)

`https://tv.example.com/ts/main-show.ts` sends the live stream as one
continuous MPEG-TS, as it arrives (H.264 video and AAC audio). It is the
kind of link IPTV set-top boxes, IPTV apps and panels take, and one another
server can pull (an Unda [pull input](/guide/pull-inputs) takes it as it is).

- A viewer starts on the newest keyframe, at the live edge. There are no
  segments to wait for: the delay is the player's own buffer.
- When the stream ends the connection ends, and players reconnect by
  themselves. A player that stops reading is let go after about 10 seconds.
- The timestamps follow the stream's own clock, so a server that pulls the
  link (Flussonic, Wowza, another Unda) and reconnects carries on where it
  was instead of starting over. Each picture is sent 0.7 s ahead of its
  decode time, the margin set-top boxes and other receivers expect.
- A protected stream needs its [signed link](/guide/protect-playback): add
  `?token=…` as on the other addresses. A link for a number of devices
  counts each connection as one device.
- Each viewer costs the stream's bitrate in upload, like an RTMP or SRT
  viewer, and counts toward `limits.max_egress_mbps`. A CDN can't cache it:
  for a large audience use HLS.
- `/ts/main-show` without `.ts` plays the same stream.

```bash
ffplay https://tv.example.com/ts/main-show.ts
```

## MPEG-DASH

The DASH address serves the stream as fragmented MP4 (H.264 video, AAC audio
when the stream has it; FFmpeg must be installed on the server):

- **Without adaptive bitrate** the stream is served as it arrives, in one
  quality. Packaging starts with the first viewer, which takes a few seconds,
  and stops a minute after the last one. At most two streams are packaged for
  DASH at a time; more are refused with "try again".
- **With [adaptive bitrate](/guide/transcoding) on** the manifest lists every
  quality of the ladder, and players switch between them as the viewer's
  connection changes, like the HLS `master.m3u8`.
- Players stay about three segments (around 6 seconds) behind live.
- When the stream ends, the manifest turns into a finished recording of its
  last segments for 30 seconds, then goes away.

The built-in player page plays HLS. For DASH, use a DASH player: tested with
[dash.js](https://github.com/Dash-Industry-Forum/dash.js) and
[Shaka Player](https://github.com/shaka-project/shaka-player) in Chrome, and VLC.

```bash
vlc https://tv.example.com/dash/main-show/manifest.mpd
```

## The player page

`/watch/<name>` is the channel's own page, on computers and phones:

- At the top, the channel's logo, title and tagline, and **Share**.
- The player. **Pause** and **volume**; **LIVE** (lit while live; after going
  back it brings the viewer to live); a bar to go back when the stream keeps a
  [rewind window](#rewind); **Low latency**; **Quality** (Auto or a size, each
  with what it costs, plus the viewer's connection speed and buffer);
  **captions**; **picture in picture**; **full screen**. Keys: space or **k**
  play and pause, **m** sound, **f** full screen, **c** captions, the arrows go
  back and forth 10 seconds. The controls fade while the picture plays.
- **On now**: the programme, how long is left, its description, and what
  comes **next**.
- The **schedule** for today and the next two days, the programme on air
  marked.

The page starts playing at once, without sound (browsers allow that), with a
**Turn sound on** button. Full screen shows the player alone, with the
channel's name and LIVE over the top of the picture. On a phone the page is one
column; turned sideways, the player fills the screen.

If the encoder drops out, the page says _"The channel is off air. Trying again…"_
and plays again by itself when the stream is back: viewers never need to
reload.

### Setting up the page

On a channel's **Output** tab, under **Watch page**:

- **Title** and **tagline** (by default the title is the channel's name).
- **Colour**: the live badge, what's on now and the progress bars.
- **Logo**: a PNG or JPEG; without one, the title's first letter in the colour.
- **Show the schedule**: on by default. A 24/7 channel's comes from its
  playlist, a live channel's from its [EPG tab](/guide/playout#live-channels-a-typed-in-guide).
- **Show how many are watching**: off by default.

Clients set their own channels' pages. Streams that aren't channels (legacy
keys, inputs) show their name and the player. On a
[protected stream](/guide/protect-playback), the page's schedule and picture
need the link too, like the video.

## Closed captions

Captions that travel inside the picture (CEA-608 and CEA-708, the way many
broadcasters and caption services send them) stay with the stream, whichever
way it arrives: an RTMP encoder, SRT, UDP, RTP or RIST, a bundle or a pull
input. Viewers get them over HLS (the player page has a captions button),
in recordings, in TV outputs and in the qualities of
[adaptive bitrate](/guide/transcoding). The dashboard's own player has a
**CC** button (or press **c**) when the stream carries captions.

Captions are kept while the frame rate stays the same. Two cases change it:

- Adaptive bitrate makes its qualities at no more than 30 frames a second, so
  a 50 or 60 frames-a-second source loses its captions in those qualities (the
  stream as it arrives keeps them). To keep them, raise `transcode.fps` to 60
  in `unda.yaml`; the qualities then cost more processor time.
- A 720p50 TV output made from a 25 frames-a-second source doubles the frame
  rate and loses them. SD, 1080i and 720p50 from a 50 frames-a-second source
  keep them.

Captions are not kept by 24/7 channels made from files, and the low-latency
(WebRTC) player does not show them.

## Rewind

A stream can keep its last minutes so that viewers can go back in it while it
is live, then return to live. Choose how far on the stream's **Output** tab,
under **Rewind**: Off, 15 minutes, 30 minutes or 1 hour, up to the longest
the server allows. Clients choose it for their own channels.

- The player page and any HLS player get a seek bar over that window. In the
  dashboard's preview, pointing at the bar shows the time of day, and **Go
  live** returns to live.
- With [adaptive bitrate](/guide/transcoding), every quality keeps the same
  window.
- Rewind is for HLS players. RTMP, SRT, Low latency (WebRTC) and MPEG-TS over
  HTTP always play live.
- Changing the setting makes players start again once, within seconds. When
  the encoder reconnects, the window starts again empty.

**Disk space.** The minutes are kept on the server's disk, not in memory. A
stream takes its bitrate times its minutes: about 1.1 GB for 30 minutes of a
5 Mb/s stream, plus its qualities' when it is transcoded. Administrators set
the longest window under **Server → Playback → Rewind**, which also lists
every stream that keeps one and the space it uses.

The windows are kept in `paths.rewind_dir` (by default a `.rewind` folder
inside `hls_dir`). If the server has a larger second disk, point it there.
On an installer setup, a folder outside `/var/lib/unda` must also be opened
to the service:

```bash
sudo systemctl edit unda
# add these two lines, save, then: sudo systemctl restart unda
[Service]
ReadWritePaths=/mnt/data/unda-rewind
```

A new window needs 5 GB free on its disk. Below 2 GB free, windows stop and
the streams carry on without one; an event on the **Events** page says so.

## Embedding on your website

A church, school or news site can put the channel's player on its own pages.
On the channel's **Output** tab, under **Embed on another website**, choose the
player's colour and options, then **Copy code** and paste it into the site:

```html
<div style="position:relative;aspect-ratio:16/9;max-width:100%">
  <iframe src="https://tv.example.com/watch/main-show?embed=1&color=0e9f9a" title="Main Show"
    allow="autoplay; fullscreen; picture-in-picture" allowfullscreen
    style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe>
</div>
```

The embedded player shows the channel's picture, dimmed, with **LIVE** and
_Tap to watch live_, and starts on a tap, with sound. So a busy website
doesn't pull the stream for every visitor who never plays it. The options, on
the address:

| Option | Does |
|---|---|
| `color=rrggbb` | the player's colour (by default the watch page's) |
| `logo=0` | no logo in the corner |
| `autoplay=1` | plays at once, without sound (`muted=0` asks for sound, which most browsers refuse until the viewer taps) |
| `viewers=1` | shows how many are watching, when the watch page shows it |

Or use the HLS address with your own player (hls.js, Video.js, JW Player,
native players on iOS, Android and smart TVs). Cross-origin requests are
allowed, so it works from any domain.

## Starting to play

Unda packages every stream for HLS from the moment it goes live, so a viewer
opening a channel nobody else is watching finds segments ready instead of
waiting for one to be made. Measured in Chrome on the server itself: the first
picture 0.2 s after opening the page, against 3.3 s when packaging waited for
the first viewer. Over a real connection, add the time to download the first
segment. Apple's players (iPhone, iPad, Apple TV, Safari) start only once the
playlist holds about three segments; a stream packaged from the start already
has them.

It costs about 0.5 % of a CPU core and under 1 MB of memory per live stream,
and a few MB of disk per stream for its segments (written to the rewind folder
at the stream's bitrate). In the configuration file, `hls.on_demand: true`
packages a stream only once someone asks for it, and
`hls.segments_in_memory: true` keeps the segments in memory instead of on disk. When
that disk has under 2 GB free, streams move their segments to memory by
themselves (players start that stream afresh once).

## Delay behind live

| How                                                    | Delay                                                                              |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| RTMP or SRT (VLC, OBS, vMix)                           | well under 1 s from the server, plus the player's own buffer (VLC: 1 s by default) |
| MPEG-TS over HTTP (IPTV boxes and apps)                | no segments: the player's own buffer                                               |
| Browser / HLS, encoder keyframe every 2 s              | about 7 s                                                                          |
| Browser / HLS, encoder keyframe every 8 s (OBS "auto") | about 30 s                                                                         |

Browser players stay about three segments behind live, and a segment can only
end on a keyframe: hence the [2-second keyframe setting](/guide/streaming).

## Viewer counts

The dashboard counts viewers by protocol (HLS, RTMP, SRT, MPEG-TS over HTTP). A browser tab is one
viewer, whatever quality it switches to; several people behind the same
internet connection count separately. Someone who closes the tab stops counting
within 30–40 seconds. Opening the page for a moment without playing does not
count.

**Behind a CDN** every HLS viewer's addresses are unique (they carry a session
id), which stops the CDN from caching them. Either set the CDN to ignore the
query string when caching, or set `hls.disable_session_ids: true`. Most
viewers are then served from the CDN's copies and never reach this server, so
the dashboard counts the CDN's own computers rather than your audience: use the
CDN's statistics for viewer numbers. For streams protected with signed links,
see [With a CDN](/guide/protect-playback#with-a-cdn) first: a caching CDN would
hand them to anyone.

## Too many viewers for your connection

Set `limits.max_egress_mbps` a little under your server's upload. When it is
reached, **new** viewers are politely refused (the player retries), and
everyone already watching carries on. The **Overview** page shows how much room
is left, as "room for about N more viewers".
