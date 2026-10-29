---
title: "Compatible encoders, players and equipment"
description: "Encoders, players and broadcast equipment that work with Unda Media Server, from OBS, vMix and VLC to hardware encoders, receivers and set-top boxes."
---

# What works with Unda

Unda is not tied to OBS or vMix. It speaks the standard protocols of live video
(RTMP, SRT, MPEG-TS over UDP and RTP, RIST, HLS, DASH and WebRTC), so anything that
sends or receives one of them can work with it: a phone app, a software
encoder, a hardware streaming box, a broadcast encoder or satellite receiver on
your local network, a DVB multiplexer, or YouTube.

This page separates three things:

- **Tested:** we ran it and checked the result.
- **Should work:** the equipment speaks a protocol and format that is tested
  with Unda.
- **Not supported:** don't plan on it.

The measurements behind it (long runs, capacity, delay, lossy networks,
broadcast analysis) are on [Test results](/guide/test-results).

## Sending to Unda

| Source | Connects with | Status |
|---|---|---|
| OBS Studio | RTMP, SRT | Tested (OBS 32) |
| OBS Studio 30 and newer | WebRTC (WHIP) | Should work: the same standard as the tested ffmpeg client |
| ffmpeg | RTMP, SRT, UDP, RTP, RIST, WebRTC (WHIP) | Tested |
| VLC | RIST | Tested |
| vMix | RTMP, SRT | Should work |
| Wirecast, Streamlabs, Larix Broadcaster (phone) | RTMP, SRT | Should work |
| Hardware streaming encoders with RTMP or SRT (Blackmagic ATEM Mini and Web Presenter, Teradek, Magewell, Kiloview, Haivision, AJA and others) | RTMP, SRT | Should work |
| Broadcast encoders and satellite/IRD receivers with an IP output (Motorola / ARRIS, Harmonic, Ericsson, Cisco and others) | MPEG-TS over UDP or RTP, one channel or a multi-channel bundle | Should work: the formats they send are tested (see below); [setup](/guide/broadcast-encoders) |
| IP cameras that can push RTMP or SRT | RTMP, SRT | Should work |
| IP cameras that only offer RTSP | [Pull input](/guide/pull-inputs) (Unda fetches RTSP over TCP or UDP) | Should work: RTSP is tested over TCP and UDP, with H.264 video, G.711 audio and a password |
| HLS links and MPEG-TS over HTTP (IPTV providers, CDNs, other servers) | [Pull input](/guide/pull-inputs) | Tested with HLS and HTTP sources, a public HLS stream on the internet and another Unda server |
| Another RTMP server | [Pull input](/guide/pull-inputs) | Tested (pulling from FFmpeg's RTMP server) |
| ASI or SDI | — | Not supported; use an ASI-to-IP gateway or an SDI encoder in front |
| NDI | — | Not supported |

### Video and audio formats

| The source sends | What happens | Cost |
|---|---|---|
| H.264 video, AAC audio | Passed through as is, over any input | Almost nothing |
| H.264 video, MP2 or AC-3 audio, or AAC packed as LATM/LOAS (UDP/RTP) | Audio converted to AAC | Very little |
| MPEG-2 video (typical of broadcast encoders and IRDs) | Converted to H.264, interlaced pictures deinterlaced | 1 to 2 CPU cores per HD channel (see [sizing](#converting-the-cpu-or-gpu)) |
| HEVC (H.265) video over UDP/RTP | Converted to H.264, like MPEG-2 | A little more than MPEG-2: HEVC is heavier to decode |
| HEVC over RTMP or SRT | Not supported: send H.264 | — |

Conversion is done by a [Multi-channel input](/guide/mpts) with
`transcode_video: true`, **also when the feed carries only one channel**. The
plain [UDP input](/guide/udp) takes H.264 with AAC only.

Also good to know:

- **Scrambled channels** (BISS, conditional access) can't be descrambled by
  Unda. The receiver must send them in the clear.
- Each stream keeps **one video and one audio track**. Subtitles, teletext and
  SCTE-35 cue messages are not carried through.

### Example: a broadcast encoder on the same network

A Motorola / ARRIS encoder or IRD (or any other make) with an IP output sits on
the same subnet as the Unda server and sends an MPEG-2 feed with AC-3 audio.

**What we tested:** a 1920×1080 interlaced MPEG-2 feed at 12 Mb/s with AC-3
audio, sent over UDP. Unda converted it to H.264 1080p at 59.94 frames per
second with AAC stereo audio, and it played over HLS without a single decoder
warning. Plan 1 to 2 CPU cores per HD channel converted like this.

1. On the encoder, set the IP output to the server's address and a port
   (unicast, the simplest), or to a multicast group.
2. In `unda.yaml` (or the dashboard: Server → MPTS inputs):

   ```yaml
   mpts_inputs:
     - name: motorola
       source: udp://:5000              # unicast to the server's port 5000
       # source: udp://239.1.1.1:5000   # or a multicast group
       # interface: eth1                # multicast: the network card facing the encoder
       allow: [192.168.10.20]           # only accept packets from the encoder
       programs:
         - program: 1                   # the channel's number in the feed
           stream: channel-1            # its name in Unda
           transcode_video: true        # MPEG-2 → H.264
   ```

3. Not sure what the feed carries? Add `discover_only: true` first: Unda lists
   every channel with its number, name and formats, without publishing
   anything.
4. Above about 20 Mb/s, raise Linux's receive buffer (see
   [UDP / MPEG-TS](/guide/udp)).

**Multicast** needs a switch with IGMP snooping and a querier, or the traffic
floods every port.

Every encoder setting Unda needs (packet size, PCR, keyframes, audio), which
input to add for which formats, and sending over the internet:
[Broadcast encoders (IP output)](/guide/broadcast-encoders).

### IP cameras that only speak RTSP

Add the camera as a [pull input](/guide/pull-inputs): Unda fetches its RTSP
stream and converts the camera's audio to AAC by itself (H.264 video is passed
through). Without the pull feature in your licence, run ffmpeg next to Unda to
pull the camera and push it in:

```bash
ffmpeg -rtsp_transport tcp -i "rtsp://user:pass@192.168.1.64/stream1" \
       -c:v copy -c:a aac -f flv "rtmp://your-server/live/sk_…"
```

## Getting streams out of Unda

| Destination | How | Status |
|---|---|---|
| Web browsers (the built-in player, your website) | HLS | Tested in Chrome; Safari and Firefox play the same HLS |
| Web browsers, low latency (the watch page's Low latency switch, or a WHEP player) | WebRTC (WHEP) | Tested in Chrome; Safari and Firefox support the same standard |
| Phones, tablets and smart TVs | HLS | Should work (the same HLS) |
| IPTV set-top boxes, IPTV apps and panels | MPEG-TS over HTTP (`/ts/<name>.ts`) or HLS | Should work: the link is tested with FFmpeg as the player |
| VLC | RTMP, SRT, HLS | Tested |
| OBS as a receiver | SRT (Media Source) | Tested |
| vMix as a receiver | UDP | In use by a customer |
| YouTube, Facebook | RTMP, RTMPS | Tested in production |
| Twitch and other RTMP platforms | RTMP | Should work |
| DASH players | MPEG-DASH, one quality or the adaptive-bitrate ladder | Tested with dash.js and Shaka Player in Chrome, and VLC |
| DVB multiplexers, modulators, IRDs and set-top boxes | MPEG-TS over UDP, RTP, SRT or RIST: single channels or multi-channel bundles, constant bitrate, DVB channel names and an 8-day programme guide | Should work: the output is checked by Unda's own TR 101 290 monitor and was analysed with TSDuck with no errors |
| Another streaming server | RTMP, SRT, UDP, RIST, MPEG-TS over HTTP | Tested with Unda and VLC at the other end (MPEG-TS over HTTP: another Unda pulling it) |

## How far one server goes

Two things decide what a server can do, and they have to be sized separately:
its **network connection** decides how many viewers it can serve, and its
**CPU (or GPU)** decides how much converting it can do. A more powerful machine
does not serve more viewers on the same connection.

### Viewers: the upload bandwidth

Every viewer receives their own copy of the stream, so the server's upload must
carry the stream's bitrate once per viewer. This is arithmetic, the same on
any server however powerful. Leaving 20% headroom:

| Server upload | Viewers at 3 Mb/s | Viewers at 5 Mb/s |
|---|---|---|
| 100 Mbit/s | about 25 | about 15 |
| 1 Gbit/s | about 250 | about 150 |
| 10 Gbit/s | about 2,500 | about 1,500 |

- Restream destinations (YouTube, Facebook…) use the same upload: each one
  costs as much as one viewer at its bitrate.
- Incoming streams use the download side, which is usually separate.
- With adaptive bitrate, viewers on slow connections take a smaller quality,
  so more of them fit.
- Set `limits.max_egress_mbps` so that when the uplink is full, new viewers are
  refused instead of everyone buffering (see [Monitoring](/guide/monitoring)).

Serving viewers needs little CPU: sending streams on is copying, not
converting. A modest server can fill a 1 Gbit/s connection.

### Converting: the CPU or GPU

Passing streams through (H.264 with AAC in, the same out) costs almost nothing,
whatever the number of streams. The work that needs cores:

| Work | Rough need |
|---|---|
| Adaptive bitrate for one 1080p stream (6 qualities), on the CPU | 1 to 2 CPU cores and about 1 GB of memory |
| An MPEG-2 HD channel converted to H.264 | 1 to 2 CPU cores and about 0.5 GB |
| A 24/7 playout channel at 720p | About 1 CPU core |
| Splitting a multi-channel bundle (no conversion) | A small fraction of one core |

The lower figure is for a recent CPU, the higher for older server CPUs. A GPU
(NVIDIA, Intel or AMD) takes the conversion off the CPU: the **Transcoding**
page detects your cards and test-encodes on each before offering it. These
are starting points: check the CPU graph on the Server page under your real
load before adding more.

### Built-in limits

| | Per server |
|---|---|
| Live streams | Set by your license |
| UDP inputs | 32 |
| Multi-channel inputs and bundles out | 8 each, up to 32 channels each |
| Restream destinations | 16 per stream, 64 in total |

### Delay

- **RTMP and SRT:** about 0.1 s through the server (measured for RTMP), plus
  the encoder's and player's own buffers.
- **HLS:** about 7 s with a keyframe every 2 seconds; much more with longer
  keyframe intervals (29 s with 8 s keyframes).
- **WebRTC:** about 0.1 s through the server to the watch page in low-latency
  mode (measured in Chrome, publisher, server and viewer on one machine; a real
  network adds its own delay). The picture starts about half a second after the
  page opens. See [WebRTC](/guide/webrtc).

## Beyond one server

- **More viewers:** put a CDN in front of HLS. Set
  `hls.disable_session_ids: true` so the CDN can cache segments; viewer
  numbers then come from the CDN's statistics. Streams protected with signed
  links need the CDN to check its own links, or no caching
  ([With a CDN](/guide/protect-playback#with-a-cdn)).
- **One server per installation:** Unda has no clustering, load balancing or
  automatic failover between servers. [Channel inputs](/guide/channel-inputs)
  protect against an encoder or a source failing, not the server.
- **Not available yet:** NDI, SDI/ASI, and DRM (Widevine, FairPlay;
  [signed playback links](/guide/protect-playback) are available).

If your equipment is marked "should work" or isn't listed, tell us what it is:
we will test it with you before you go live.
