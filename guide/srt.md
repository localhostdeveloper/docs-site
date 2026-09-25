# SRT

SRT (Secure Reliable Transport) carries live video over the open internet much
better than RTMP: it resends lost packets, and it can be encrypted. Use it from
remote locations, mobile connections and for contribution between studios.

## Enabling it

`install.sh` enables SRT on UDP port 6000 unless you pass `--no-srt`. In the
configuration file:

```yaml
srt:
  addr: ":6000"
  latency_ms: 500        # see below
  # passphrase: "..."    # optional: 10-79 characters; then everyone must use it
```

Open UDP port 6000 in the firewall.

## Publishing

```
srt://tv.example.com:6000?streamid=publish:sk_…
```

In OBS: Service **Custom…**, that address as the Server, Stream Key empty. With
ffmpeg (built with SRT support):

```bash
ffmpeg -re -i show.mp4 -c:v libx264 -g 60 -b:v 3M -c:a aac -f mpegts \
       "srt://tv.example.com:6000?streamid=publish:sk_…"
```

## Watching over SRT

```
srt://tv.example.com:6000?streamid=read:main-show
```

In VLC: `vlc --streamid "read:main-show" "srt://tv.example.com:6000"`. In OBS: a
**Media Source** with *Local File* unticked and that address as the input.
Any live stream can be watched over SRT, however it came in.

## Latency and packet loss

`latency_ms` is how long SRT may take to recover lost packets. It must be
comfortably **more than the round trip** between the two ends (check with
`ping`): with 500 ms, a stream with 5% of its packets lost in each direction
over an 80 ms round trip arrived complete, while the same link at 60 ms broke.
Raise it for long or poor connections; lower it for a local network.

## Encryption

With `passphrase` set, every publisher and every SRT viewer must use the same
passphrase (OBS: add `&passphrase=...` to the address; VLC:
`--passphrase ...`). A connection without it is refused.
