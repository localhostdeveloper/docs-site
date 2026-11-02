---
title: "UDP and RTP MPEG-TS input and output"
description: "Take MPEG-TS in over UDP or RTP, unicast or multicast, from encoders, headends and receivers, and send it out to set-top boxes and IPTV systems."
---

# UDP / MPEG-TS

Plain MPEG-TS over UDP is what hardware encoders, IPTV headends, satellite
receivers and set-top boxes speak. Unda takes it in and sends it out, unicast
or multicast.

::: warning Local networks only
UDP has no retransmission, no login and no encryption: a lost packet is a
visible glitch, and anyone who can reach the port can send to it. Over the
internet, use [SRT](/guide/srt).
:::

## Input

Add an input on the dashboard's **Broadcast** page (_UDP inputs_) or in the
configuration file. Each input publishes as a stream with the name you give it,
and is immediately available on every output. A UDP input takes H.264 video
with AAC audio; for other formats, and for the settings a broadcast encoder
needs, see [Broadcast encoders (IP output)](/guide/broadcast-encoders).

```yaml
udp:
  inputs:
    - name: sat-feed
      listen: ":5001" # unicast: listen on this port
      allow: [192.168.1.20] # optional: only accept these senders (IPs or ranges)
    - name: headend
      multicast: "239.1.1.1:5000" # join this multicast group
      interface: eth1
```

Several multicast inputs can use the same port (`239.1.1.1:5000`,
`239.1.1.2:5000`, …), as head-ends often send them: each input receives its own
group only.

An input that listens on **all addresses** (`:5000`) or joins a multicast group
with no `allow` list would take a stream from anyone who can reach the port, so
the dashboard and API refuse to create one. Give it an `allow` list with the
sender's address, bind it to one address, or — to accept everyone on purpose
(a closed lab network) — set `allow: ["0.0.0.0/0"]`. An input already in your
configuration file keeps working and only logs a warning.

For RTP carrying MPEG-TS (RFC 2250), set `rtp: true` on the input. The RTP
payload type must be 33 and contain complete 188-byte TS packets:

```yaml
udp:
  inputs:
    - name: rtp-feed
      listen: ":5004"
      rtp: true
      allow: [192.168.1.20]
```

### Two paths (SMPTE 2022-7)

An RTP feed can arrive two ways at once, over two networks or two links, so a
packet lost on one is taken from the other and the stream carries on if one
link fails. Give the input a second address with `path2` (a port, an address
or a multicast group; `interface2` joins that group on another interface):

```yaml
udp:
  inputs:
    - name: contribution
      multicast: "239.1.1.1:5000"
      interface: eth1
      rtp: true
      path2: "239.2.1.1:5000"
      interface2: eth2
```

In the dashboard, tick **The sender wraps MPEG-TS in RTP** and fill in
**Second path**. The input's row shows each path's own losses (what that path
alone would have lost) and how many packets came both ways; **1 of 2 paths**
shows while one has gone quiet, and Events notes when a path stops or comes
back. Viewers see nothing of it while the other path brings everything. Both
paths must carry the same RTP stream (one sender, or two outputs of one
encoder sending the same packets); the copies are matched by packet number
within the input's delay (200 ms). Plain UDP can't be merged (it has no
packet numbers). MPTS inputs take `rtp://@239.1.1.1:5000?path2=@239.2.1.1:5000&iface2=eth2`.

Send a test stream with `ffmpeg -re -i input.ts -c copy -f rtp_mpegts
"rtp://SERVER:5004"`. The server reorders packets within its jitter window and
reports RTP packets, loss and duplicates in the UDP input API. RTP has no
authentication or encryption; keep it on a trusted network and restrict
senders with `allow` and firewall rules. Use SRT over untrusted networks.

- If packets stop for 5 seconds the stream goes offline; it comes back by
  itself when they return.
- **Packet loss** is measured and shown per stream. The stream's dot turns
  yellow at 0.1% loss and red at 1% (over the last minute).
- **What arrives is checked the way broadcast test equipment does**
  ([TR 101 290](/guide/mpts#transport-stream-checks-tr-101-290)). The input's row
  under _UDP inputs_ and its stream page show **TR 101 290 clean**, **Plays
  fine** when the sender only has faults that can't reach your viewers, or
  **Viewers may see glitches** with what went wrong in the last minute
  ([what reaches viewers](/guide/mpts#plays-fine-or-viewers-may-see-glitches)).
  Click it for the report: what the errors mean, what to do, and the full
  check (lost packets, the PCR interval, each PID and the tables the sender
  carries). Only errors viewers can notice raise a warning.
- A short delay (200 ms) smooths out bursts. Raw MPEG-TS has no sequence numbers
  and cannot be reordered; RTP inputs use RTP sequence numbers to restore order.
- At high bitrates, raise Linux's receive buffer limit:
  `sudo sysctl -w net.core.rmem_max=26214400 net.core.rmem_default=26214400`
  (and make it permanent in `/etc/sysctl.d/`).
- Inputs added in the dashboard are kept when the server restarts. One that
  can't start then (its port taken by another program, its network interface
  not up yet) is reported in Events and tried again at the next start.
- **Edit** on an input's row changes its address, interface, RTP, second
  path, allowed senders and timeout; the name stays (it is the stream's
  name). Saving opens the socket again, so a live stream starts again with
  the next packets (viewers lose it for a few seconds; Unda asks first). If
  the new settings can't open (the port is in use), the input goes on with
  the old ones and the reason is shown. Inputs listed in the configuration
  file are changed there.

## Output

Any stream can be sent out as MPEG-TS over UDP, from the stream's **Restream**
tab or the configuration file:

```
udp://192.168.1.50:6000                  unicast
udp://239.1.1.10:6000?ttl=4&iface=eth1   multicast
```

Play it with `vlc udp://@:6000` (unicast) or `vlc udp://@239.1.1.10:6000`
(multicast). Multicast needs switches with IGMP support and does not cross the
internet or most cloud networks.

The output is paced: each keyframe is spread over a few hundred milliseconds
instead of leaving in one burst, which a set-top box or a busy switch would
partly drop (the picture breaks up while the sound plays on). This adds up to
about half a second of delay. Add `pace=0` to the address to send every frame
at once.

The stream repeats its tables (PAT and PMT) every 100 ms and its clock (PCR)
at least every 35 ms, as DVB asks, so a receiver locks on quickly. Every packet
sent is checked against [TR 101 290](/guide/mpts#transport-stream-checks-tr-101-290): the destination's row on the
Restream tab shows **TR 101 290 clean** while it sends, and clicking it opens
the full report.
