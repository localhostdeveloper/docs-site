# What is Unda?

Unda Media Server is a live streaming server you run yourself. Encoders such as
OBS, vMix, hardware encoders and IP cameras send it a stream; Unda passes that
stream on to viewers in a browser, to players such as VLC, to production
software such as OBS and vMix, and to other platforms such as YouTube.

It is one program. It runs on one Linux server (or in Docker), keeps its data
in a single file, and gets its own HTTPS certificate.

## What it does

| | |
|---|---|
| **Takes streams in** | RTMP / RTMPS (OBS, vMix, ffmpeg), SRT (contribution over the internet), MPEG-TS over UDP or RTP, unicast or multicast (hardware encoders, IPTV) |
| **Gives them out** | A browser player page, HLS for websites and apps, MPEG-DASH (experimental), RTMP and SRT for VLC / OBS / vMix, UDP or RTP for set-top boxes |
| **Adaptive bitrate** | Several qualities of one stream (1080p down to 144p) so every viewer gets one their connection can carry. On the CPU or a GPU; optional; needs FFmpeg |
| **Restreaming** | The same stream to YouTube, Facebook, Twitch or other servers at once |
| **Broadcast TV and IPTV** | Standard-definition H.264 or MPEG-2 at a constant bitrate with DVB channel names for multiplexers and modulators; several streams bundled as the channels of one transport stream (MPTS) |
| **Recording** | Record any live stream to files, split every hour, with optional automatic clean-up |
| **Dashboard** | Streams, multiview, viewers, health, alerts and events live; channels, users, API keys and settings |
| **Monitoring** | Stream health, packet loss on UDP inputs, TR 101 290 checks on broadcast outputs, Prometheus metrics and webhook alerts |

## How it fits together

1. An admin creates a **channel**. A channel has a public **name** (for example
   `main-show`) and a secret **stream key** (`sk_…`).
2. The encoder publishes with the key: `rtmp://your-server/live/sk_…`.
3. Viewers watch by the name: `https://your-server/watch/main-show`. Only the
   key can publish; knowing the name only lets you watch.

Every stream is available on every output as soon as it arrives, whichever way
it came in: a stream sent over SRT plays in the browser, in VLC over RTMP and
on a set-top box over UDP, with nothing to configure.

## What you need

- A Linux server. **4 CPU cores, 8 GB of memory and 100 Mbit/s of upload**
  carry about ten 720p streams and a few hundred viewers without adaptive
  bitrate. Adaptive bitrate costs about one CPU core per stream.
- A domain name pointing at the server, for HTTPS.
- A license file from your vendor. Without one Unda runs in evaluation mode:
  everything works, for up to 2 live streams and 2 accounts besides the owner.

## Measured performance

On a single machine, with no network in between, as a reference:

| Test | Result |
|---|---|
| 10 inputs of 720p at 3 Mb/s | all at 30 fps, no dropped frames, about a quarter of one CPU core |
| 200 browser-style viewers of a 1080p stream at 5 Mb/s (1 Gb/s in total) | no freezes, no errors |
| Delay, RTMP | 0.1 s |
| Delay, browser (HLS) | about 7 s with a 2 s keyframe interval |

A real server's limits are usually its network connection: 200 viewers of a
5 Mb/s stream need 1 Gb/s of upload.

Next: [install Unda](/guide/install).
