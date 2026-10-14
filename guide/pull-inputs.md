# Pull inputs (HLS, HTTP, RTMP, RTSP)

Most sources push their stream to Unda: an encoder publishes over RTMP, SRT or
WebRTC, a receiver sends UDP. A **pull input** works the other way round: Unda
fetches the stream from somewhere else and publishes it under a name you
choose. Use it for:

- **TV channels that only exist as an HLS link** or an MPEG-TS stream over
  HTTP (an IPTV provider, a partner's CDN, another server);
- **another RTMP server** whose stream you want to relay;
- **IP cameras** that only offer RTSP.

The stream is then like any other: watch it on the player page, restream it,
record it, put it in a [multi-channel bundle](/guide/mpts) or a
[TV output](/guide/udp), or use it as an extra input of a channel
([Channel inputs](/guide/channel-inputs)).

Pull inputs are in the **Professional** and **Broadcast** packages (licence
feature `pull`). They need **FFmpeg** on the server (`install.sh
--with-ffmpeg`; the Docker image has it). Only operators, admins and owners can
add them here. A channel's owner can also give their own channel a pull
stream, from public HLS and HTTP links only, as one of its
[inputs](/guide/channel-inputs).

## Add one

On the dashboard, open **Server → Pull inputs**, give the stream a name and
paste the source address:

| Source | Address |
|---|---|
| HLS | `https://example.com/live/news/index.m3u8` |
| MPEG-TS or FLV over HTTP | `http://iptv.example.com:8080/live/user/pass/123.ts` |
| RTMP | `rtmp://other-server.example.com/live/stream` (`rtmps://` too) |
| RTSP camera | `rtsp://user:password@192.168.1.64:554/Streaming/Channels/101` (`rtsps://` too) |

The stream goes live as soon as the source answers, usually within a few
seconds. Its row shows the state, the bitrate, the picture size and, if the
source fails, why in plain words (with FFmpeg's own message under
**Technical detail**).

Or in the [configuration file](/reference/config):

```yaml
pull_inputs:
  - name: news
    url: https://example.com/live/news/index.m3u8
  - name: lobby-camera
    url_env: LOBBY_CAMERA_URL      # keeps the camera's password out of the file
    rtsp_transport: tcp            # or udp
```

Or with the [API](/reference/api#pull-inputs):

```bash
curl -X POST -H "Authorization: Bearer $KEY" \
  -d '{"name":"news","url":"https://example.com/live/news/index.m3u8"}' \
  https://your-server/api/v1/pull/inputs
```

## What Unda does with the source

- **HLS:** when the address is a master playlist with several qualities,
  Unda takes the one with the highest bitrate. An HLS source is about three
  segments behind the source's live edge (6 seconds with 2-second segments,
  more with longer ones), on top of the source's own delay.
- **Video:** H.264 is passed through as it is. Other video (HEVC, MPEG-2) is
  refused with the reason, unless you tick **Re-encode video that isn't
  H.264**, which costs about a CPU core per HD channel.
- **Audio:** AAC is passed through; anything else (MP2, AC-3, a camera's
  G.711) is converted to AAC by itself. The row says "audio converted".
- **One video and one audio track** are kept: the first of each (for HLS, those
  of the chosen quality). Subtitles are not carried.
- **Pacing:** what the source hands over in a burst (the first HLS segments,
  FFmpeg's probe) is released at the stream's own pace, so viewers, bundles and
  TV outputs get a steady stream.

## When the source drops

- A short drop is invisible except for a frozen picture: the stream stays up
  for **10 seconds** (change it with `timeout`) while Unda connects again.
- If the source is still gone after that, the stream ends, so a
  channel's [next input](/guide/channel-inputs) or a bundle's filler takes over, and
  the drop shows in **Events**.
- Unda keeps trying: after 1, 2, 5 and 10 seconds, then every 30 seconds, for
  as long as the input exists. When the source is back, so is the stream.
- An input off the air raises an alert after 30 seconds (critical after
  5 minutes), on the Overview and the Events page.

**To take a pulled stream off the air, pause its input** (the switch on its
row). **Stop** on the stream page ends it only until the next attempt a second
later, the way an encoder that reconnects by itself would come back.

## Security

- The address often holds a password or a token. Unda keeps it on the server
  (the database, or your configuration file) and **never shows it again**:
  the dashboard, the API, the logs and the events show it shortened, like
  `rtsp://192.168.1.64:554/…/101`. To change it, enter a new one under
  **Edit**.
- Unda passes the address to FFmpeg on its command line, where **other
  accounts on the same server** can read it (`ps`). On a server that runs only
  Unda, that is nobody else.
- FFmpeg may only fetch over http, https, rtmp(s), rtsp(s) and their
  transports: a playlist can't make it read the server's own files.
- Pull inputs can reach any address the server can, including your internal
  network: that is why only operators and above can add them. A channel
  owner's pull goes through a guard inside Unda that connects to public
  internet addresses only, checked at every connection (redirects and HLS
  segments on other hosts included).
- A finished HLS playlist (`#EXT-X-ENDLIST`) is not pulled: FFmpeg would play
  it as a recording from its first segment. The input reads **The playlist has
  ended** and tries again later.

## Limits

- Up to 64 pull inputs. Each live one counts as a live stream in your licence,
  except a channel's own pull (the channel counts once).
- One address per input. For a second source, add a second input and use it as
  an extra input of a channel ([Channel inputs](/guide/channel-inputs)).
- A source is pulled all the time, whether anyone watches or not. A channel's
  own pull stops while it is switched off in the channel's order.
- FFmpeg 7.1 and newer refuse HLS segment addresses without a media file
  extension (`.ts`, `.m4s`, `.aac`…). Most providers use one.

## What has been tested

Pulled from FFmpeg's own HLS (several qualities, with a separate audio track),
HTTP MPEG-TS and RTMP servers, from another Unda's HLS, and from a stand-in RTSP
camera over TCP and UDP with G.711 audio and a password. Not yet tested: real IP
cameras, commercial CDNs and IPTV providers. If yours misbehaves,
[tell us](/contact) which one.
