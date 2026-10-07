# Restreaming

Send a live stream to other platforms at the same time: YouTube, Facebook,
Twitch, another Unda server, anything that takes RTMP, RTMPS, SRT, UDP or RTP.

## From the dashboard

Open the stream, **Restream** tab, add a destination with a name and its full
URL, key included:

| Platform                 | URL                                                        |
| ------------------------ | ---------------------------------------------------------- |
| YouTube                  | `rtmp://a.rtmp.youtube.com/live2/YOUR-STREAM-KEY`          |
| Facebook                 | `rtmps://live-api-s.facebook.com:443/rtmp/YOUR-STREAM-KEY` |
| Twitch                   | `rtmp://live.twitch.tv/app/YOUR-STREAM-KEY`                |
| Another server over SRT  | `srt://host:port?streamid=...&passphrase=...`              |
| A local network over UDP | `udp://239.1.1.10:5000`                                    |
| MPEG-TS over RTP         | `rtp://192.168.1.50:5004`                                  |

Use the exact URL and key the platform gives you.

[![A stream's Restream tab: a live YouTube destination, a paused Facebook one, and the form to add another](/screens/restream.webp)](/screens/restream.webp)

## How it behaves

- It starts straight away and keeps going for as long as the stream is live.
  If the stream stops, the destination waits and resumes by itself when the
  stream comes back.
- A destination shows **live** only once the platform has accepted the stream
  (for RTMP, its `NetStream.Publish.Start` answer), not merely when the
  connection opens: a wrong or expired key shows as a failure, never as live.
- A destination that fails is retried after 5 s, 10 s, 30 s, 1 min, 2 min, then
  every 5 minutes. One failing destination never affects the others or your
  viewers.
- **A destination that keeps failing for 30 minutes is switched off** (an
  ended live event, a revoked key), shown as "switched off" with the reason,
  and stays off (after a restart too) until you switch it back on.
- Each destination's state and why it fails are shown on the Restream tab in
  plain words ("The destination refused the stream key…"), with the technical
  error behind "Technical detail". A destination failing for more than two
  minutes raises one alert per stream, however many destinations fail and
  however often they retry; the event log shows one line per failure run.
- **Pause instead of delete.** The switch next to each destination stops
  sending to it without deleting it, so the same destination (and its key) can
  be switched back on later, for the next event, without typing the key again.
  Switching it on starts sending at once if the stream is live. A paused
  destination stays paused after a restart and raises no "not connected"
  notice.
- **Your platform keys stay secret:** after you add a destination, the dashboard,
  the API and the logs only ever show it as `rtmp://a.rtmp.youtube.com/live2/****`.
- **Destinations are kept across restarts.** Destinations added in the
  dashboard or through the API are saved in the server database (readable by
  the server account only, like channel keys) and come back by themselves after
  a restart or an upgrade, pushing again as soon as the stream is live.
- Destinations can also be listed in the configuration file under
  `restream.targets` (the URL can come from an environment variable or a file,
  to keep the key out of the configuration). Those are marked "from unda.yaml"
  on the Restream tab: to change them, edit the file.

Streamers can restream their own channels; operators and above any stream.

UDP, RTP, RIST and SRT destinations and broadcast outputs are TV outputs: they
need the `udp` feature in your [license](/guide/license), as well as
restreaming (SRT is what TV stations take in). Restreaming to social media over
RTMP and RTMPS needs only restreaming. SRT *input* and playback are separate
(the `srt` feature).
A streamer's destinations must be RTMP, RTMPS or SRT at a public internet
address: a private, local or loopback address, or a name that points to one, is
refused, and so are UDP and RTP. Operators and above can use any destination,
including ones on your own network. RTP carries MPEG-TS in RFC 2250 packets,
uses PCR for its 90 kHz timestamp, and has no encryption or authentication, so
use it only on a trusted network.

### Error correction for RTP (SMPTE 2022-1)

Broadcast equipment fed over IP (modulators, IRDs, teleport gateways) often
expects **SMPTE 2022-1 FEC** with RTP: extra packets from which the receiver
rebuilds lost ones, without asking for a resend. Add it to an `rtp://` address:

```
rtp://10.0.0.20:5000?fec=1d                     column FEC (on port 5002)
rtp://10.0.0.20:5000?fec=2d                     column and row FEC (ports 5002 and 5004)
rtp://239.1.1.20:5000?fec=2d&fec_l=5&fec_d=20   your receiver's matrix
```

The media packets are arranged in a matrix of `fec_l` columns by `fec_d` rows
(default 10 × 10). Each column's FEC packet rebuilds one lost packet in that
column, so column FEC repairs a burst of up to `fec_l` lost packets in a row;
`2d` adds a FEC packet per row and repairs more scattered loss. Column FEC
adds 1/`fec_d` to the bitrate (10 % at the default), row FEC another
1/`fec_l`. Limits: `fec_l` 1 to 20 (4 to 20 with `2d`), `fec_d` 4 to 20,
and `fec_l` × `fec_d` at most 100. Use the values from your receiver's
documentation or the operator's spec sheet; the FEC ports (+2 and +4) must be
open on the way. A receiver without FEC ignores them and plays the stream as
usual. Over the internet, prefer SRT or RIST, which resend what was lost.

## Broadcast TV (terrestrial and satellite)

For a DVB multiplexer, IP modulator or satellite uplink, tick **Re-encode for
broadcast TV** when adding a destination (operators only). The stream is
re-encoded to what TV equipment expects:

- **Picture:** 16:9 in one of three formats. A 4:3 or portrait source gets
  black bars at the sides; nothing is cropped.

  | Format | Picture | Use |
  |---|---|---|
  | `576p25` (default) | SD 720×576, 25 frames/s | SD services, older receivers |
  | `720p50` | HD 1280×720, 50 frames/s | HD services that use 720p |
  | `1080i25` | HD 1920×1080 interlaced, top field first | the usual HD format in 50 Hz countries |

- **Video:** H.264 (DVB-T2 / DVB-S2; High profile for HD), HEVC (H.265; for
  576p25 and 720p50, since HEVC services are progressive) or MPEG-2 (older
  DVB-T / DVB-S receivers; SD only), at the bitrate you set. Defaults: H.264
  2 Mb/s SD, 8 Mb/s HD; HEVC 1.2 Mb/s SD, 4 Mb/s HD; MPEG-2 4 Mb/s.
- **Audio:** MPEG-1 Layer II (MP2), AC-3 (Dolby Digital, signalled the DVB
  way) or AAC, 48 kHz stereo.
- **Transport stream:** a constant bitrate (the total you set, padded with
  null packets), with your channel name and provider in the service
  information (SDT), the service type receivers expect (SD or HD H.264,
  HEVC), and the service ID and PIDs your multiplexer expects.

In the configuration file:

```yaml
restream:
  targets:
    - stream: news
      name: uplink
      url: udp://10.0.0.20:5000
      broadcast:
        format: 1080i25
        video_codec: h264
        video_kbps: 10000
        audio_codec: ac3
        audio_kbps: 192
        service_name: "News HD"
```

Send it with `udp://` (unicast or multicast), `rtp://` (with
[SMPTE 2022-1 FEC](#error-correction-for-rtp-smpte-2022-1) if the equipment
expects it) or `srt://` (over the internet, encrypted). Ask the multiplexer operator for the bitrate reserved for
your service, and enter it as the constant total bitrate. Each broadcast
destination runs its own encoder: plan for about a third of a CPU core for SD
H.264, about one core for HD H.264 and about two for HEVC.
