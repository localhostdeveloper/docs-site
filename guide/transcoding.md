# Adaptive bitrate

Without adaptive bitrate every viewer receives exactly what the encoder sends.
A 1080p stream at 5 Mb/s then buffers for anyone whose connection is slower
than about 6 Mb/s. With it on, Unda makes several qualities of the stream and
each viewer's player picks the best one their connection can carry, switching
as it changes.

It is **off by default**, because it costs real CPU, and it applies to browser
and HLS viewers only. RTMP and SRT viewers, recordings and restream
destinations always get the original.

## Turning it on

1. The server needs **FFmpeg** (`install.sh --with-ffmpeg`, or
   `sudo apt install ffmpeg`; the Docker image includes it). For an NVIDIA
   card, install the NVIDIA driver so `nvidia-smi` works.
2. In the dashboard, **Server → Transcoding**: switch it on and pick the
   encoder. Unda lists what this server has (the CPU, each NVIDIA card, Intel
   Quick Sync, VAAPI devices, Apple VideoToolbox) and tests each one; an encoder
   that fails its test says why and can't be chosen. **Save** tests your choice
   again before applying it.
3. On a stream's **Transcoding** tab, switch it on for that stream. It starts at
   once and stays on when the encoder reconnects (until the server restarts).

[![A stream's Transcoding tab: adaptive bitrate on, the source, and the ladder of qualities with how much each is watched](/screens/transcoding.webp)](/screens/transcoding.webp)

There is no limit on how many streams are transcoded at once. When the CPU
stays above 85% for a minute, the dashboard raises a **CPU** alert, and the
Transcoding tab warns before you add another stream. You can still set a limit
(**Streams at once**) if you prefer.

## What viewers get

The watch page switches to the adaptive version by itself and shows a
**Quality** menu. For your own player use
`https://tv.example.com/hls/<name>/master.m3u8`.

The default qualities, which are **ceilings**:

| Quality | Video | Audio |
|---|---|---|
| 1080p | 5000 kbps | 128 kbps |
| 720p | 2500 kbps | 128 kbps |
| 480p | 1000 kbps | 96 kbps |
| 360p | 600 kbps | 64 kbps |
| 240p | 300 kbps | 48 kbps |
| 144p | 64 kbps | 24 kbps |

Unda measures each stream for a few seconds and plans the qualities for it:

- never bigger than the source, and in the source's shape: a phone streaming
  portrait gets portrait qualities, with no black bars;
- never more bitrate than the source justifies: a 1080p stream at 1.5 Mb/s is
  offered 1080p at about 1.5 Mb/s, not 5;
- the source's frame rate, up to 30 (50 and 60 are halved);
- keyframes every 2 seconds whatever the encoder sends, which also keeps the
  delay low when an encoder is set badly.

The 144p quality plays on connections as slow as about 250 kbit/s.

Sources bigger than 4K, over 120 fps, over 60 Mb/s or without video stay as
they are; the Transcoding tab says why.

## Server cost

Per 1080p stream, with the default settings:

| Encoder | CPU | Memory |
|---|---|---|
| Software (`hardware: none`) | about 1.2 CPU cores | about 0.9 GB |
| Apple VideoToolbox | about 0.35 cores | about 0.2 GB |

A 4-core, 8 GB server runs about two adaptive streams on the CPU alongside
everything else. A GPU takes most of that load off the CPU.

NVIDIA, Intel and VAAPI encoders have not yet been tested on real hardware by
the vendor; Unda test-encodes with your card before using it, and shows why if
it fails.

If FFmpeg crashes it is restarted within a few seconds; after 10 failures in a
row the stream carries on without adaptive bitrate.
