---
title: "Adaptive bitrate streaming (transcoding)"
description: "Turn on adaptive bitrate in Unda: several qualities of each stream, from 4K down to 144p, on the CPU or an NVIDIA card, planned for you or chosen by you."
---

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
3. On a stream's **Output** tab, under **Adaptive bitrate**, switch it on for
   that stream. It starts at
   once and stays on when the encoder reconnects and when the server restarts.
   Clients can switch it on for their own channels too; the switch works while
   the stream is offline, and then starts with its next broadcast.

[![A stream's Output tab, Adaptive bitrate: on, the source, and the ladder of qualities with how much each is watched](/screens/transcoding.webp)](/screens/transcoding.webp)

There is no limit on how many streams are transcoded at once. When the CPU
stays above 85% for a minute, the dashboard raises a **CPU** alert, and the
Output tab warns before you add another stream. You can still set a limit
(**Streams at once**) if you prefer.

## What viewers get

The watch page switches to the adaptive version by itself and shows a
**Quality** menu. For your own player use
`https://tv.example.com/hls/<name>/master.m3u8`.

The default qualities, which are **ceilings**:

| Quality | Video | Audio |
|---|---|---|
| 2160p (4K) | 15000 kbps | 128 kbps |
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
they are; the stream's Output tab says why.

## Choosing the qualities yourself

Under **Qualities** on the Output tab, **Auto** is the planning above.
**Choose** lets you pick the qualities for one stream instead:

- tick up to 8 sizes from 2160p, 1440p, 1080p, 720p, 576p, 480p, 360p, 240p
  and 144p;
- type each one's video bitrate; the suggested value is shown beside it;
- each smaller size needs less bitrate than the one above it;
- sound follows the size (128 kbps down to 24 kbps), as in Auto.

What you type is used up to what the source justifies, as in Auto: a quality
can't look better than the stream it is made from, so a higher bitrate would
only cost viewers and the server. The stream's Output tab shows the bitrates
in use and, under the **i** beside **Quality**, which ones were held back.
Clients can give each size up to twice its suggested bitrate (1080p up to
10000 kbps); operators up to 50000 kbps.

Sizes bigger than the source are left out, and each size keeps the source's
shape, as in Auto. When you open **Choose**, it starts from the qualities Auto
is making for the stream now, so **Save qualities** right away keeps them as
they are.

Saving changes a live stream at once: its adaptive bitrate starts again with
the new qualities, and viewers watching it start again once. RTMP and SRT
viewers, recordings and restreams are not affected. Several changes within
30 seconds start it again once, with the last one. Clients choose the
qualities of their own channels; operators of any stream. **Auto** goes back
to the planning above.

## Server cost

Per 1080p stream, with the default settings:

| Encoder | CPU | Memory |
|---|---|---|
| Software (`hardware: none`) | about 1.2 CPU cores | about 0.9 GB |
| Apple VideoToolbox | about 0.35 cores | about 0.2 GB |

A 4K stream also gets the 2160p quality, which costs much more: in our test a
4K stream took about 3.4 CPU cores and 2.8 GB, against about 2 cores and
1.2 GB without 2160p. For 4K, use a graphics card, or leave 2160p out by
listing your own qualities under `transcode: renditions:` in
`unda.yaml` (the example file shows the format).

A 4-core, 8 GB server runs about two adaptive streams on the CPU alongside
everything else. A GPU takes most of that load off the CPU.

Unda test-encodes with your NVIDIA, Intel or AMD (VAAPI) card before using it,
and shows why if it fails.

### Graphics cards

With an NVIDIA card chosen under **Server → Transcoding**, Unda shares the
card between everything that encodes video: adaptive streams, 24/7 channels
and TV outputs in H.264 or HEVC. Adaptive streams also decode and resize their
pictures on the card. Each job goes to the card with the most room, and when
every card is busy the job runs on the CPU instead. MPEG-2 and 1080i TV
outputs always encode on the CPU.

Unda keeps the card's encoder below about 85 % and leaves the rest of the work
to the CPU. It learns what your card really costs while its jobs run and
keeps that, so after a restart the same jobs go to the card. If the card's
encoder still stays above 95 % for 30 seconds, Unda moves one adaptive
stream to the CPU, then checks again; viewers of that adaptive stream start
again once. 24/7 channels and TV outputs stay where they started.

**Server → Transcoding** shows each card's load and how many jobs it has,
and a stream's Output tab, a 24/7 channel's Output tab and the Restream rows
say where each job runs. On a server with an RTX A5000, moving two 1080p
adaptive streams and fourteen 720p 24/7 channels onto the card halved the CPU
they used.

### When your graphics card isn't listed

**Server → Transcoding** says why under the encoder list, and what to do:

- **The driver isn't running.** Install the NVIDIA driver (on Ubuntu:
  `sudo ubuntu-drivers install`) and restart the machine. With Secure Boot on,
  the driver must be signed for it to load.
- **Unda can't see the card's device files, or NVIDIA's test says
  `cuInit(0) failed -> CUDA_ERROR_OPERATING_SYSTEM`.** Installs made before
  v0.1.41 hide graphics cards from Unda (`PrivateDevices=true`) and block the
  local sockets NVIDIA's encoder needs (`AF_UNIX`). Run the installer again,
  or:

  ```bash
  sudo mkdir -p /etc/systemd/system/unda.service.d
  printf '[Service]\nPrivateDevices=false\nRestrictAddressFamilies=\nRestrictAddressFamilies=AF_INET AF_INET6 AF_NETLINK AF_UNIX\n' | sudo tee /etc/systemd/system/unda.service.d/gpu.conf
  sudo systemctl daemon-reload && sudo systemctl restart unda
  ```

  In Docker, give the container the card: `devices: [/dev/dri]` in
  `docker-compose.yml` for an Intel or AMD card.
- **Unda can't open the card.** Add the `unda` user to the `render` group
  (`sudo usermod -aG render unda`) and restart Unda. The installer does this
  itself from v0.1.41.
- **This FFmpeg has no encoder for the card.** The card is listed but can't be
  chosen. `ffmpeg -hide_banner -encoders | grep -E "nvenc|vaapi"` shows what
  your FFmpeg has; Ubuntu's and Debian's own (`sudo apt install ffmpeg`)
  includes both.

After a change, press **Detect again**.

If FFmpeg crashes it is restarted within a few seconds; after 10 failures in a
row the stream carries on without adaptive bitrate.
