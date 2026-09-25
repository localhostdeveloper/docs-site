# Troubleshooting

Problems with installing, HTTPS, ports and signing in are in the
[install guide's troubleshooting table](/guide/install#11-troubleshooting).
This page is about streams and viewers.

## Viewers buffer or start slowly

1. **Check the keyframe interval.** On the stream's page, the Health card shows
   it; the dashboard also raises an alert. It should be **2 s**. In OBS:
   *Settings → Output → Streaming → Keyframe Interval: 2*. With OBS's "auto"
   setting (about 8 s), viewers wait up to 8 s to start and can freeze just
   after starting.
2. **Check the encoder's upload.** Alerts or events saying *"no media received"*,
   *"bitrate low"* or *"reconnected after N s offline"* mean the encoder's
   connection cannot keep up. Lower the bitrate, use a cable, or switch to
   [SRT](/guide/srt).
3. **Check the viewers' connections.** On the watch page, the box at the top
   right shows each viewer's connection speed and buffer. If it is below the
   stream's bitrate, that viewer will buffer: turn on
   [adaptive bitrate](/guide/transcoding) so they get a lower quality instead.
4. **Check the server's upload.** On Overview, egress close to your server's
   connection speed means the server is full. Set `limits.max_egress_mbps` so
   new viewers are refused instead of everyone slowing down.

## The stream is live but the page says "Stream is offline"

- The address must use the channel's **name**, not its key:
  `/watch/main-show`, not `/watch/sk_…`.
- The player retries by itself; give it 10 seconds after the stream starts.

## OBS says "Failed to connect" or stops immediately

- Server must be `rtmp://your-server:1935/live` and the key the channel's
  `sk_…` key, copied again from **Channels** (it changes when someone uses
  **New key**).
- Someone else is already live on that channel: only one encoder at a time.
- The license's stream limit is reached (Events shows it).
- Port 1935 (TCP) must be open on the server's firewall.

## OBS keeps reconnecting

Events shows *"stopped publishing (connection closed)"* and *"reconnected"*
again and again. The encoder's internet connection is dropping out. Viewers'
players recover by themselves, but each drop is a gap in the picture. Lower
the bitrate or use SRT, which rides out short losses.

## The picture freezes but the sound continues (or the other way round)

- Look at the Health card's **A/V drift**: a large value means the encoder is
  sending audio and video out of step. Restart the encoder's audio source.
- Expand the stream's row on **Streams** to see its readers. **Dropped frames**
  there are frames one reader could not take in time: on a single viewer, that
  viewer's connection is too slow; on the HLS packager or every reader at once,
  the server is overloaded.
- If the freezes are already in what OBS sends, OBS shows *"skipped frames due
  to encoding lag"* in its stats: lower the resolution or use a faster preset.

## Logs

```bash
journalctl -u unda -f            # systemd
docker compose logs -f unda      # Docker
```

One line per event, in JSON. Passwords and stream keys are never written to
the log.
