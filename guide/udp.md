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

Add an input on the dashboard's **Server** page (_UDP inputs_) or in the
configuration file. Each input publishes as a stream with the name you give it,
and is immediately available on every output.

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

Send a test stream with `ffmpeg -re -i input.ts -c copy -f rtp_mpegts
"rtp://SERVER:5004"`. The server reorders packets within its jitter window and
reports RTP packets, loss and duplicates in the UDP input API. RTP has no
authentication or encryption; keep it on a trusted network and restrict
senders with `allow` and firewall rules. Use SRT over untrusted networks.

- If packets stop for 5 seconds the stream goes offline; it comes back by
  itself when they return.
- **Packet loss** is measured and shown per stream. The stream's dot turns
  yellow at 0.1% loss and red at 1% (over the last minute).
- A short delay (200 ms) smooths out bursts. Raw MPEG-TS has no sequence numbers
  and cannot be reordered; RTP inputs use RTP sequence numbers to restore order.
- At high bitrates, raise Linux's receive buffer limit:
  `sudo sysctl -w net.core.rmem_max=26214400 net.core.rmem_default=26214400`
  (and make it permanent in `/etc/sysctl.d/`).
- Inputs added in the dashboard last until the server restarts; list permanent
  ones in the configuration file.

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
