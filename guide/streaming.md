# Stream from OBS, vMix or ffmpeg

Every stream goes to a **channel**. Create one under **Channels** in the
dashboard; the channel page shows the exact server address and the secret
stream key (`sk_…`) to paste into your encoder. In the examples below,
`tv.example.com` is your server and `sk_…` is the channel's key.

## OBS Studio

**Settings → Stream**

- Service: **Custom…**
- Server: `rtmp://tv.example.com:1935/live`
- Stream Key: `sk_…`

**Settings → Output** (Output Mode: *Advanced*) **→ Streaming**

| Setting | 720p | 1080p |
|---|---|---|
| Rate control | CBR | CBR |
| Bitrate | 2500–3500 kbps | 4500–6000 kbps |
| **Keyframe interval** | **2 s** | **2 s** |
| Profile | high | high |
| x264 CPU preset | veryfast | veryfast |
| Audio bitrate | 128 kbps | 128 kbps |

**Settings → Video**: set the output resolution, and 30 fps unless you need
60 (60 fps needs about 50% more bitrate).

::: warning Set the keyframe interval to 2
OBS's default, **0 (auto)**, sends a keyframe only every 8 seconds or so. Browser
viewers then join about 30 seconds behind live instead of about 7, wait up to 8
seconds before the picture starts, and can freeze shortly after starting. The
dashboard flags it as *"a keyframe only every 8.3 s"*.
:::

**Your upload must be steady at about 1.5× the video bitrate.** Check with a
speed test on the streaming computer before a show: 1080p at 5000 kbps needs
7–8 Mbit/s of upload that does not drop. While streaming, watch the bottom of
the OBS window: if *dropped frames* climbs or the square turns yellow or red,
lower the bitrate. Use a cable rather than Wi-Fi where you can.

If OBS loses its connection it reconnects by itself, and viewers' players carry
on by themselves once the stream is back.

### OBS over SRT

SRT copes much better with a poor internet connection than RTMP. It must be
enabled on the server (see [SRT](/guide/srt)).

- Service: **Custom…**
- Server: `srt://tv.example.com:6000?streamid=publish:sk_…`
- Stream Key: leave empty

## vMix

Open the streaming settings (the gear next to **Stream**):

- Destination: **Custom RTMP Server**
- URL: `rtmp://tv.example.com:1935/live`
- Stream Name or Key: `sk_…`
- Quality: a profile with **H.264 video and AAC audio**, with the keyframe
  interval set to 2 seconds.

## ffmpeg

```bash
# a test pattern: no camera needed
ffmpeg -re -f lavfi -i testsrc2=size=1280x720:rate=30 -f lavfi -i sine=frequency=1000 \
       -c:v libx264 -preset veryfast -g 60 -b:v 3M -c:a aac -b:a 128k \
       -f flv "rtmp://tv.example.com:1935/live/sk_…"

# a file, looped
ffmpeg -re -stream_loop -1 -i show.mp4 -c:v libx264 -preset veryfast -g 60 -b:v 3M \
       -c:a aac -b:a 128k -f flv "rtmp://tv.example.com:1935/live/sk_…"
```

`-g 60` is a keyframe every 60 frames: 2 seconds at 30 fps.

## Hardware encoders and IP cameras

Anything that can push **RTMP**, **SRT** or **MPEG-TS over UDP** works, as long as
it sends **H.264 video and AAC audio**. For UDP inputs see
[UDP / MPEG-TS](/guide/udp).

## What the server accepts

| | |
|---|---|
| Video | H.264 (any profile), any size up to 4K for adaptive bitrate |
| Audio | AAC |
| Not supported | H.265/HEVC, AV1, Opus over RTMP, RTSP pull from cameras |

A second encoder using the same key while the channel is live is refused, so
two people cannot accidentally fight over one channel.

## Stopping someone

**Stop** on the stream's page disconnects the encoder, but OBS reconnects by
itself; use **Stop and block key** to keep it off, then give the channel a new
key (**Channels → New key**) when you want it back.
