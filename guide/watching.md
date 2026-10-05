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
| VLC, OBS or vMix over RTMP                                                     | `rtmp://tv.example.com:1935/live/main-show`          |
| VLC, OBS or vMix over SRT                                                      | `srt://tv.example.com:6000?streamid=read:main-show`  |

The stream's **Playback** tab in the dashboard lists every address, DASH
included, with copy buttons.

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

`/watch/<name>` plays in every current browser, on phones too. It shows the
quality being played, the viewer's connection speed and buffer, and, when
adaptive bitrate is on, a **Quality** menu (Auto or a fixed quality).

[![The player page: the stream, with the quality playing, the connection speed, the buffer and the Quality menu](/screens/watch.webp)](/screens/watch.webp)

If the encoder drops out, the page shows _"Stream is offline — trying again…"_
and resumes by itself when the stream is back: viewers never need to reload.

## Embedding on your website

The player page can be put in a frame on any site:

```html
<iframe
  src="https://tv.example.com/watch/main-show"
  width="1280"
  height="720"
  allow="autoplay; fullscreen"
  allowfullscreen
  style="border:0; max-width:100%; aspect-ratio:16/9; height:auto"
></iframe>
```

Or use the HLS address with your own player (hls.js, Video.js, JW Player,
native players on iOS, Android and smart TVs). Cross-origin requests are
allowed, so it works from any domain.

## Delay behind live

| How                                                    | Delay                                                                              |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| RTMP or SRT (VLC, OBS, vMix)                           | well under 1 s from the server, plus the player's own buffer (VLC: 1 s by default) |
| Browser / HLS, encoder keyframe every 2 s              | about 7 s                                                                          |
| Browser / HLS, encoder keyframe every 8 s (OBS "auto") | about 30 s                                                                         |

Browser players stay about three segments behind live, and a segment can only
end on a keyframe: hence the [2-second keyframe setting](/guide/streaming).

## Viewer counts

The dashboard counts viewers by protocol (HLS, RTMP, SRT). A browser tab is one
viewer, whatever quality it switches to; several people behind the same
internet connection count separately. Someone who closes the tab stops counting
within 30–40 seconds. Opening the page for a moment without playing does not
count.

**Behind a CDN** every HLS viewer's addresses are unique (they carry a session
id), which stops the CDN from caching them. Either set the CDN to ignore the
query string when caching, or set `hls.disable_session_ids: true`, in which
case viewers are counted by address and browser instead.

## Too many viewers for your connection

Set `limits.max_egress_mbps` a little under your server's upload. When it is
reached, **new** viewers are politely refused (the player retries), and
everyone already watching carries on. The **Overview** page shows how much room
is left, as "room for about N more viewers".
