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

Add an input on the dashboard's **Server** page (*UDP inputs*) or in the
configuration file. Each input publishes as a stream with the name you give it,
and is immediately available on every output.

```yaml
udp:
  inputs:
    - name: sat-feed
      listen: ":5001"                # unicast: listen on this port
      allow: [192.168.1.20]          # optional: only accept these senders (IPs or ranges)
    - name: headend
      multicast: "239.1.1.1:5000"    # join this multicast group
      interface: eth1
```

- If packets stop for 5 seconds the stream goes offline; it comes back by
  itself when they return.
- **Packet loss** is measured and shown per stream. The stream's dot turns
  yellow at 0.1% loss and red at 1% (over the last minute).
- A short delay (200 ms) smooths out bursts. RTP-wrapped streams are not
  supported.
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
