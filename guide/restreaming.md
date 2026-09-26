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

## How it behaves

- It starts straight away and keeps going for as long as the stream is live.
  If the stream stops, the destination waits and resumes by itself when the
  stream comes back.
- A destination that fails is retried after 5 s, 10 s, 30 s, then every minute.
  One failing destination never affects the others or your viewers.
- Each destination's state (connecting, live, retrying) and last error are
  shown on the Restream tab.
- **Your platform keys stay secret:** after you add a destination, the dashboard,
  the API and the logs only ever show it as `rtmp://a.rtmp.youtube.com/live2/****`.
- Destinations added in the dashboard last until the server restarts. For
  permanent ones, list them in the configuration file under `restream.targets`
  (the URL can come from an environment variable or a file, to keep the key
  out of the configuration).

Streamers can restream their own channels; operators and above any stream.
A streamer's destinations must be RTMP, RTMPS or SRT at a public internet
address: a private, local or loopback address, or a name that points to one, is
refused, and so are UDP and RTP. Operators and above can use any destination,
including ones on your own network. RTP carries MPEG-TS in RFC 2250 packets,
uses PCR for its 90 kHz timestamp, and has no encryption or authentication, so
use it only on a trusted network.

## Broadcast TV (terrestrial and satellite)

For a DVB multiplexer, IP modulator or satellite uplink, tick **Re-encode for
broadcast TV** when adding a destination (operators only). The stream is
re-encoded to what TV equipment expects:

- **Picture:** standard definition, 720×576 at 25 frames/s, shown at 16:9. A
  4:3 or portrait source gets black bars at the sides; nothing is cropped.
- **Video:** H.264 (DVB-T2 / DVB-S2) or MPEG-2 (older DVB-T / DVB-S
  receivers), at the bitrate you set.
- **Audio:** MPEG-1 Layer II (MP2), 48 kHz stereo.
- **Transport stream:** a constant bitrate (the total you set, padded with
  null packets), with your channel name and provider in the service
  information (SDT), and the service ID and PIDs your multiplexer expects.

Send it with `udp://` (unicast or multicast), `rtp://` or `srt://` (over the
internet, encrypted). Ask the multiplexer operator for the bitrate reserved for
your service, and enter it as the constant total bitrate. Each broadcast
destination runs its own encoder, so plan for about a third of a CPU core each
with H.264.
