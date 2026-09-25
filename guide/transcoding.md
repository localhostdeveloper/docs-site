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
   `apt install ffmpeg`; the Docker image includes it).
2. In `/etc/unda/unda.yaml`:

   ```yaml
   transcode:
     enabled: true        # makes it available; nothing is transcoded yet
     max_concurrent: 2    # how many streams at once
   ```

   and restart Unda. It refuses to start if FFmpeg is missing, rather than
   failing later.
3. On a stream's **Transcoding** tab, switch it on. It starts at once, and stays
   on for that channel when the encoder reconnects (until the server restarts).

To transcode some channels automatically, list them: `streams: ["main-show"]`
(or `["*"]` for all).

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

A 4-core, 8 GB server runs about two adaptive streams comfortably alongside
everything else. Streams beyond `max_concurrent` are served as they arrive.

`hardware: nvenc | qsv | vaapi` use NVIDIA, Intel and AMD/Intel GPUs. These
have not been tested yet; Unda checks the encoder with a test encode when it
starts and refuses to start if it does not work.

If FFmpeg crashes it is restarted within a few seconds; after 10 failures in a
row the stream carries on without adaptive bitrate.
