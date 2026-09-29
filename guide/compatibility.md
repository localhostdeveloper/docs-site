# What works with Unda

Unda is not tied to OBS or vMix. It speaks the standard protocols of live video
(RTMP, SRT, MPEG-TS over UDP and RTP, RIST, HLS and DASH), so anything that
sends or receives one of them can work with it: a phone app, a software
encoder, a hardware streaming box, a broadcast encoder or satellite receiver on
your local network, a DVB multiplexer, or YouTube.

This page separates three things:

- **Tested:** we ran it and checked the result.
- **Should work:** the equipment speaks a protocol and format that is tested,
  but we have not run that product with Unda yet. Test it before you rely on it.
- **Not supported:** don't plan on it.

## Sending to Unda

| Source | Connects with | Status |
|---|---|---|
| OBS Studio | RTMP, SRT | Tested (OBS 32) |
| ffmpeg | RTMP, SRT, UDP, RTP, RIST | Tested |
| VLC | RIST | Tested |
| vMix | RTMP, SRT | Should work (not yet tested as a sender) |
| Wirecast, Streamlabs, Larix Broadcaster (phone) | RTMP, SRT | Should work |
| Hardware streaming encoders with RTMP or SRT (Blackmagic ATEM Mini and Web Presenter, Teradek, Magewell, Kiloview, Haivision, AJA and others) | RTMP, SRT | Should work |
| Broadcast encoders and satellite/IRD receivers with an IP output (Motorola / ARRIS, Harmonic, Ericsson, Cisco and others) | MPEG-TS over UDP or RTP, one channel or a multi-channel bundle | The formats they send are tested (see below); these makes have not been tried yet |
| IP cameras that can push RTMP or SRT | RTMP, SRT | Should work |
| IP cameras that only offer RTSP | — | Not supported directly; relay with ffmpeg (below) |
| ASI or SDI | — | Not supported; use an ASI-to-IP gateway or an SDI encoder in front |
| NDI, WebRTC (WHIP) | — | Not supported |

### Video and audio formats

| The source sends | What happens | Cost |
|---|---|---|
| H.264 video, AAC audio | Passed through as is, over any input | Almost nothing |
| H.264 video, MP2 or AC-3 audio (UDP/RTP) | Audio converted to AAC | Very little |
| MPEG-2 video (typical of broadcast encoders and IRDs) | Converted to H.264, interlaced pictures deinterlaced | 1 to 2 CPU cores per HD channel (see [sizing](#converting-the-cpu-or-gpu)) |
| HEVC (H.265) video over UDP/RTP | Converted like MPEG-2 | Not yet tested |
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
warning. Plan 1 to 2 CPU cores per HD channel converted like this. We have not
yet connected a real Motorola unit.

1. On the encoder, set the IP output to the server's address and a port
   (unicast, the simplest), or to a multicast group.
2. In `unda.yaml` (or the dashboard: Server → Multi-channel → Receiving):

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
floods every port. We have tested multicast on one machine, not yet across a
real switch.

### IP cameras that only speak RTSP

Run ffmpeg next to Unda to pull the camera and push it in (H.264 cameras need
no conversion):

```bash
ffmpeg -rtsp_transport tcp -i "rtsp://user:pass@192.168.1.64/stream1" \
       -c:v copy -c:a aac -f flv "rtmp://your-server/live/sk_…"
```

## Getting streams out of Unda

| Destination | How | Status |
|---|---|---|
| Web browsers (the built-in player, your website) | HLS | Tested in Chrome; Safari and Firefox not yet tested |
| Phones, tablets and smart TVs | HLS | Should work (the same HLS) |
| VLC | RTMP, SRT, HLS | Tested |
| OBS as a receiver | SRT (Media Source) | Tested |
| vMix as a receiver | UDP | In use by a customer |
| YouTube, Facebook | RTMP, RTMPS | Tested in production |
| Twitch and other RTMP platforms | RTMP | Should work |
| DASH players | MPEG-DASH | Experimental |
| DVB multiplexers, modulators, IRDs and set-top boxes | MPEG-TS over UDP, RTP, SRT or RIST: single channels or multi-channel bundles, constant bitrate, DVB channel names and now/next | The output is checked by Unda's own TR 101 290 monitor and was analysed with TSDuck with no errors; not yet tested with a hardware receiver |
| Another streaming server | RTMP, SRT, UDP, RIST | Tested with Unda and VLC at the other end |

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
(NVIDIA, Intel or AMD) takes the conversion off the CPU; Unda supports them but
has not yet been tested on real NVIDIA, Intel or AMD hardware. The
**Transcoding** page's encoder detection shows what works on your server. These
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
- **Under one second:** not available (that needs WebRTC, which Unda does not
  have yet).

## Beyond one server

- **More viewers:** put a CDN in front of HLS. Set
  `hls.disable_session_ids: true` so the CDN can cache segments (viewer counts
  are then per address). Not yet tested with a real CDN.
- **One server per installation:** Unda has no clustering, load balancing or
  automatic failover between servers. [Backup encoder](/guide/backup-encoder)
  protects against an encoder failing, not the server.
- **Not available yet:** WebRTC, RTSP, NDI, SDI/ASI, DRM (Widevine, FairPlay;
  [signed playback links](/guide/protect-playback) are available), rewinding a
  live stream (DVR), and a full 7-day programme guide (now and next is
  available).

If your equipment is marked "should work" or isn't listed, tell us what it is:
we will test it with you before you go live.
