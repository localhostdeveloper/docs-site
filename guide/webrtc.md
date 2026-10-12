# WebRTC (low latency)

WebRTC brings the delay between the camera and the viewer down to about a
second, where HLS takes 6 to 10. Unda speaks both standard WebRTC protocols:

- **WHIP** to publish: OBS 30 and newer, FFmpeg, browsers.
- **WHEP** to play: the watch page's **Low latency** switch, or any WHEP player.

A stream published over WebRTC is an ordinary Unda stream: HLS, RTMP, SRT,
recording, restreaming and TV outputs all work on it. A stream published over
RTMP or SRT can be watched over WebRTC.

WebRTC needs the license's WebRTC feature (Professional and Broadcast) and
HTTPS: stream keys and playback links are refused over plain HTTP.

## Turning it on

It is on whenever the license includes it. All its audio and video use one
UDP port, 8189 unless you change it:

```yaml
webrtc:
  udp_port: 8189
```

Open that port in the firewall:

```bash
sudo ufw allow 8189/udp
```

**Docker, or a server with a private address (1:1 NAT):** Unda tells players
which address to send their media to, and behind NAT it can't see its public
one. Give it:

```yaml
webrtc:
  public_ips: [203.0.113.7]   # this server's public IPv4 address
```

and publish the port: `- "8189:8189/udp"` under `ports:`.

## Publishing from OBS (WHIP)

In OBS 30 or newer, **Settings → Stream**:

- **Service:** WHIP
- **Server:** `https://tv.example.com/whip/main-show` (your channel's name)
- **Bearer Token:** the channel's `sk_…` stream key

The dashboard's **Channels** page shows these for each channel. In **Output**,
set the keyframe interval to 1 or 2 seconds and turn B-frames off (WebRTC
viewers can't show them in order).

OBS sends Opus audio over WHIP; Unda converts it to AAC for everything else,
keeping it in step with the picture (measured within 2 ms over several minutes).

With FFmpeg:

```bash
ffmpeg -re -i input.mp4 -c:v libx264 -tune zerolatency -bf 0 -g 50 \
       -c:a libopus -b:a 96k -ar 48000 -ac 2 \
       -f whip -authorization sk_YOURKEY https://tv.example.com/whip/main-show
```

Stream keys work exactly as with RTMP: a wrong key is refused, a channel with
backup sources takes its backup key at the same address, and a stream that is
already live is refused unless `rtmp.publish_policy` is `replace`.

## Watching (WHEP)

- **The watch page:** `https://tv.example.com/watch/main-show` has a
  **Low latency** switch; the choice is remembered. A link ending in
  `?ll=1` opens in low latency. If the viewer's network can't connect, the
  page falls back to the standard player by itself.
- **Other players:** the WHEP address is `https://tv.example.com/webrtc/main-show`.
  For a [protected stream](./protect-playback), the player sends the link's
  token as a bearer token (`Authorization: Bearer TOKEN`).

The stream's **Playback** tab lists both addresses.

Viewers hear the sound when the server's FFmpeg has the Opus encoder
(libopus; Ubuntu's FFmpeg package has it). **Server → Connect** says when it
doesn't. One converter per stream serves all its viewers.

## Networks that block UDP: a TURN relay

Most viewers connect straight to the server. On networks that block UDP
(some offices, hotels, mobile carriers), WebRTC needs a TURN relay. Unda
works with [coturn](https://github.com/coturn/coturn); give coturn a shared
secret and tell Unda the same one, and every player gets its own
credentials, valid for a day:

```yaml
webrtc:
  ice_servers:
    - urls: ["turn:turn.example.com:3478?transport=udp", "turns:turn.example.com:443?transport=tcp"]
  turn_secret_env: UNDA_TURN_SECRET   # or turn_secret_file: /run/secrets/turn
```

```ini
# /etc/turnserver.conf
use-auth-secret
static-auth-secret=THE-SAME-SECRET
realm=turn.example.com

# Relay to the Unda server only. Anyone allowed to watch gets TURN
# credentials (on a public stream, anyone at all), so without these lines
# the relay would carry their traffic to any address.
no-multicast-peers
denied-peer-ip=0.0.0.0-255.255.255.255
denied-peer-ip=::-ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff
allowed-peer-ip=203.0.113.10   # the address Unda gives players: its public_ips, or its own
```

coturn treats an address that is both allowed and denied as allowed, so
this relays to the one address and nothing else.

A fixed TURN account works too: `username` and `credential` (or
`credential_env` / `credential_file`) on the server's entry. The credentials
are given only to players that were allowed to play.

## Good to know

- **B-frames:** WebRTC players show frames in the order they arrive, so a
  stream with B-frames looks jerky. The stream's Playback tab says when a
  stream has them; set B-frames to 0 in the encoder.
- **Joining:** a new viewer starts at the live picture at once, not at the
  last keyframe.
- **Limits:** `webrtc.max_viewers` (500), `max_publishers` (64) and
  `max_audio_streams` (16 streams converting sound at once). For large
  audiences HLS costs less: each WebRTC viewer is sent their own encrypted copy.
  `limits.max_conns_per_ip` also caps the WebRTC sessions one address may
  hold (the next one gets 429).
- **Viewers** are counted on the dashboard and listed under **Sessions** as
  WebRTC.
- **Not supported:** VP8, VP9 and AV1 video; simulcast; ICE restarts; WebRTC
  over TCP without a TURN relay.
