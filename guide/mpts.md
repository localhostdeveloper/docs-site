# Multi-channel (MPTS)

Unda works with **multi-channel transport streams** (MPTS) both ways: it can
take a bundle in and split it into separate channels, and it can combine
your streams into a bundle to send out.

## Taking a bundle in

A satellite receiver, an IPTV headend or a partner often sends several TV
channels in one stream. Unda can split it: each channel you pick becomes an
ordinary stream, with the browser player, HLS, recording, restreaming and
everything else.

```yaml
mpts_inputs:
  - name: sat-bundle
    source: udp://239.1.1.1:5000          # multicast; udp://:5000 to receive unicast, rtp:// for RTP
    interface: eth0
    programs:
      - program: 101                      # the channel's number in the bundle
        stream: sports-hd                 # the name it gets in Unda
        audio_language: eng               # optional: which audio track
      - program: 102
        stream: news-24
```

**Not sure what the bundle carries?** Set `discover_only: true` first: Unda
lists every channel with its name, provider and tracks (codec and language)
without putting anything online. Operators can see the list through the API
(`GET /api/v1/mpts/inputs/sat-bundle/programs`).

What gets published depends on the channel's formats:

| Channel carries | What Unda does | Cost |
|---|---|---|
| H.264 video, AAC audio | Splits it as it is | Almost nothing |
| H.264 video, MP2 or AC-3 audio | Converts the audio to AAC | Very little |
| MPEG-2 or HEVC video | Listed, not published, until you set `transcode_video: true` for it | About one CPU core per HD channel |

Each channel keeps one video and one audio track (subtitles and teletext are
not carried). If one channel in the bundle stops or has errors, the others
carry on.

## Sending a bundle out

Combine several of your streams into **one transport stream with several TV
channels**, for an IPTV network, a DVB multiplexer or modulator, or a
partner who takes a bundle. Each stream becomes a channel with its own name and
number, and the whole bundle is sent at a constant bitrate.

### Set it up

In the dashboard: **Server → Multi-channel → New bundle** (operators). Give it a
name, where to send it and a total bitrate, then add the channels: for each,
the stream, its channel number and name, and whether it is sent as it is or
converted to standard definition. **Add channel** adds one to a running bundle.
Bundles made in the dashboard are kept when the server restarts.

Or in the configuration file:

```yaml
mpts_outputs:
  - name: iptv-bundle-1
    destination: udp://239.2.2.1:6000     # or rtp://... or srt://host:port?streamid=...
    interface: eth0                       # for multicast: the network card to send on
    ttl: 4
    provider: "Unda Community TV"
    total_bitrate: 25Mbps                 # the whole bundle, padded to this rate
    offline: slate                        # what an offline channel shows: black (default), slate or none
    slate_image: /etc/unda/slate.png      # your "we'll be right back" picture
    programs:
      - stream: channel-1
        program: 1
        name: "Channel 1"
        bitrate: 6Mbps                    # sent as it is: this channel's share
      - stream: sports-hd
        program: 2
        name: "Sports HD"
        encode: { video_codec: h264 }     # converted to standard definition (720×576)
```

Each channel is either **sent as it is** (give it a `bitrate` a little above
what the stream uses at its busiest) or **converted** to standard definition for
TV equipment with `encode` (H.264 or MPEG-2 video, MP2 audio). Channel numbers,
PIDs and names can be set to match the plan agreed with the receiving side;
anything left out is chosen for you without clashes.

Channels can be added and removed while a bundle runs (in the dashboard or
through the API, `/api/v1/mpts`); receivers pick up the change by themselves.
Set the total bitrate with room to spare if you plan to add channels later: it
is fixed, and a channel that does not fit is refused.

### How it behaves

- If one stream goes offline, the others carry on and its channel stays listed,
  showing black with silence, or your slate picture with `offline: slate`.
  Receivers keep the channel instead of reporting "no signal". When the stream
  comes back it takes over by itself within a couple of seconds. With
  `offline: none` the channel is listed but carries nothing.
- Channel names and the provider appear in receivers' channel lists.
- If the channels need more than the total bitrate, the server refuses the
  setup, or, if a stream grows beyond its share while running, logs an error
  rather than silently dropping data.
- Each channel runs its own encoder process; sending as it is costs very little
  CPU, converting costs about a third of a core per channel.

The **Server** page lists each bundle with its channels: which stream feeds
each one, whether it is on air (or showing black or the slate), and any dropped
packets. The server also checks everything it sends the way broadcast test
equipment does (ETSI TR 101 290: sync, PAT and PMT, continuity, missing PIDs,
CRC, and PCR timing). Each bundle shows **TR 101 290 clean**, or the errors
counted in the last minute, and each channel shows its own. The counts are also
in `/metrics` (`unda_mpts_tr101290_errors_total`). A channel whose stream
goes offline raises a warning (and an entry in the event log); dropped packets
and a bundle that cannot be sent raise critical alerts, and transport-stream
errors raise a warning.

Multi-channel bundles are new in this version: they have been tested with
software receivers, not yet with a hardware set-top box or modulator.
