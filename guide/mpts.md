# Multi-channel (MPTS)

Combine several of your streams into **one transport stream with several TV
channels** (an MPTS), for an IPTV network, a DVB multiplexer or modulator, or a
partner who takes a bundle. Each stream becomes a channel with its own name and
number, and the whole bundle is sent at a constant bitrate.

## Set it up

In the configuration file:

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

Operators can also create bundles and add or remove channels while they run
through the API (`/api/v1/mpts`); receivers pick up the change by themselves.

## How it behaves

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
