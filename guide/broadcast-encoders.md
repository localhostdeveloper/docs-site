# Broadcast encoders (IP output)

How to set up a broadcast encoder or IRD with an IP output (Motorola / ARRIS,
Harmonic, Ericsson, Cisco and others) to send MPEG-TS over UDP or RTP to Unda.
Menu names differ from one make to another; the settings below are what Unda
needs, whatever they are called on your unit.

Unda takes what these units send: H.264, MPEG-2 or HEVC video with AAC, MP2
or AC-3 audio, over UDP or RTP, as one channel or a multi-channel bundle (see
[What works with Unda](/guide/compatibility)).

## Settings at a glance

| Encoder setting | Set it to |
|---|---|
| Output interface | The IP / Gigabit Ethernet port, not ASI |
| Protocol | UDP, or RTP (then tick RTP on the Unda input) |
| TS packets per IP packet | 7 (1316 bytes) |
| TS packet size | 188 bytes (204 is refused) |
| FEC (SMPTE 2022-1 / Pro-MPEG) | Off: Unda does not use it on input |
| Destination | The Unda server's address and the input's port |
| Transport stream | SPTS (one channel); an MPTS bundle needs a Multi-channel input |
| Rate control | CBR, with null packets |
| PCR interval | 40 ms or less |
| Scrambling (BISS, CA) | Off: Unda can't descramble |
| Video | H.264 Main or High |
| Frame rate | 25 or 50 frames/s (in 50 Hz countries such as Ghana) |
| GOP / keyframe interval | 1 to 2 seconds: 25 or 50 frames at 25 frames/s |
| Audio | AAC-LC, 48 kHz, stereo, 128 or 192 kb/s |

## Which input to add

Unda has two inputs for MPEG-TS over UDP and RTP. Which one depends on what the
encoder sends:

| The encoder sends | Add | Where |
|---|---|---|
| One channel, H.264 video and AAC audio (ADTS) | A UDP input (the lightest), or a Multi-channel input | Server → UDP inputs |
| H.264 with MP2, AC-3, or AAC packed as LATM/LOAS | A Multi-channel input: it converts the audio to AAC | Server → Multi-channel → Receiving |
| MPEG-2 or HEVC video | A Multi-channel input with `transcode_video: true`: it converts the video to H.264, about 1 to 2 CPU cores per HD channel | Server → Multi-channel → Receiving |
| Several channels (an MPTS bundle) | A Multi-channel input | Server → Multi-channel → Receiving |

::: warning MP2 or HEVC on a plain UDP input
A plain UDP input takes H.264 with AAC only. A feed with MP2 sound goes live
with no sound, and an HEVC feed gives no picture. Use a Multi-channel input for
those, even when the feed carries one channel.
:::

When in doubt, use a Multi-channel input. It lists what the feed carries (each
channel's number, name and formats) before anything goes live, it checks the
feed the way broadcast test equipment does (TR 101 290, including the PCR
interval), and inputs made in the dashboard are kept when the server restarts.
UDP inputs made in the dashboard last only until the server restarts; list
permanent ones in the configuration file. Both are described in
[UDP / MPEG-TS](/guide/udp) and [Multi-channel (MPTS)](/guide/mpts).

## Encoder settings

### Network output

- **Output interface:** the IP or Gigabit Ethernet output. Unda has no ASI
  input; use an ASI-to-IP gateway for a unit without one.
- **UDP or RTP:** both work. With RTP, tick _The sender wraps MPEG-TS in RTP_
  on the UDP input (`rtp: true` in the configuration file), or use an `rtp://`
  address on a Multi-channel input. RTP lets Unda put late packets back in
  order and count exactly how many were lost. The payload type must be 33
  (MPEG-TS).
- **7 TS packets per IP packet**, each **188 bytes**. Unda accepts any whole
  number of 188-byte packets per datagram, but not 204-byte packets (with
  Reed-Solomon bytes): those are refused, and the server's log says the
  datagrams are "not whole MPEG-TS packets".
- **FEC:** Unda does not use SMPTE 2022-1 (Pro-MPEG) error correction on its
  inputs, so it does not help here. Leave it off rather than send traffic that
  is thrown away.
- **Destination:** the Unda server's address and the port you gave the input.
  Unicast (one server address) is the simplest. Multicast, on a local
  network, needs switches that support IGMP. The dashboard shows the input's port;
  the address is the server's own (on a cloud server, its public IP, the one
  your domain points to).

### Transport stream

- **SPTS** (one channel) for a UDP input. A Multi-channel input takes one
  channel or a bundle.
- **CBR with null packets.** Unda accepts a variable rate too, but a constant
  one keeps the feed predictable. It matters most when the channel goes on to
  a TV bundle as it is: its rate must stay below its share there, or pictures
  reach TVs late (Unda raises an alert when that happens).
- **PCR every 40 ms or less** (DVB's limit). A Multi-channel input reports a
  longer interval as a TR 101 290 error; a UDP input does not measure it.
- **No scrambling:** BISS and conditional access must be off on the output
  sent to Unda.

### Video

- **H.264, Main or High profile**, is passed through as it is, at almost no
  cost. MPEG-2 and HEVC are converted to H.264 by a Multi-channel input (see
  the table above).
- **25 or 50 frames per second** in 50 Hz countries. A channel sent on to a DVB
  bundle as it is at 30 or 60 frames per second gets a warning.
- **Keyframe every 1 to 2 seconds** (GOP 25 or 50 at 25 frames/s; IBBP or IP
  are both fine). New viewers start at a keyframe, and HLS delay follows it:
  measured 6.8 s with a 2-second keyframe interval and 28.8 s with 8 seconds.
  Unda warns when keyframes are more than 4 seconds apart.
- **Interlaced H.264** (1080i25) is passed through as it is, and a web browser
  may show it with combing on movement. For a stream watched online, prefer a
  progressive format (720p50 or 1080p25). Interlaced MPEG-2 converted by Unda
  is deinterlaced.
- **B-frames** are fine. Only low-latency WebRTC playback prefers a stream
  without them; the stream's Playback tab warns when it has them.

### Audio

- **AAC-LC, 48 kHz, stereo**, at 128 kb/s (what Ghanaian stations take) or
  192 kb/s.
- AAC can be packed two ways: **ADTS** works on both inputs; **LATM/LOAS** needs
  a Multi-channel input, which converts it.
- **MP2** and **AC-3** need a Multi-channel input, which converts them to AAC.
- 48 kHz is DVB's rate; a channel sent on to a DVB bundle with 44.1 kHz sound
  gets a warning.

## Over the internet

UDP and RTP have no password and no encryption, and a lost packet is a visible
glitch: nothing is resent. Use them on a network you trust: the studio LAN, a
leased line or a VPN.

If the encoder must reach a server over the internet:

- **Best:** send SRT or RIST, which resend what the network loses. If the
  encoder speaks SRT, send to Unda's SRT port with the channel's key
  ([SRT](/guide/srt)). If it doesn't, put a gateway next to the encoder that
  turns its UDP into SRT or RIST, and receive that with a Multi-channel input
  (`srt://:9000?passphrase=…` or `rist://@:5000`; see
  [Over SRT or RIST](/guide/mpts#over-srt-or-rist)).
- **Unda does not speak Zixi's protocol.** A Zixi gateway (or any other) must
  hand Unda UDP, RTP or SRT.
- **Plain UDP or RTP anyway:** give the input an allow list with the encoder's
  public address, open the port only to that address in the server's firewall
  (see the Firewall section of [Install](/guide/install)) and in your cloud
  provider's firewall, and expect occasional glitches from lost packets.

## Checking that it arrived

Before the first broadcast, send a test feed and check it here:

- The channel appears under **Streams** with its picture size and frame rate.
  A UDP input's stream page shows its **packet loss** (the dot turns yellow at
  0.1 % and red at 1 % over the last minute) and what was discarded:
  duplicates, malformed packets, senders not on the allow list.
- A Multi-channel input lists every channel of the feed with its formats on
  Server → Multi-channel, and each published channel's TR 101 290 errors.
- **Nothing arrives?** Check the server's firewall and the encoder's
  destination. Then check the packet size (188, not 204) and whether RTP is
  ticked on the input when the encoder sends RTP: both mismatches show as
  malformed datagrams.
- **Picture but no sound** on a UDP input: the encoder sends MP2, AC-3 or LATM
  audio. Use a Multi-channel input instead.
