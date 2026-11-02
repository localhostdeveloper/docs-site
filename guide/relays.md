---
title: "Relays: pass a transport stream on untouched"
description: "Take an encoder's or IRD's UDP, RTP, SRT or RIST feed and send it on exactly as it arrives, with every channel, sound track and table, to up to four destinations over SRT, UDP, RTP or RIST."
---

# Relays

A relay takes a transport stream in and sends it on **exactly as it
arrives**: every channel, sound track, language, subtitle, teletext page, ad
cue and table, with the sender's own packet IDs, timestamps and bitrate.
Nothing is decoded or rebuilt, so a relay costs almost no CPU.

Use it where an IP gateway box would sit, for example:

- a station's encoder or IRD sends UDP on the local network, and the TV
  operator takes the channel over SRT across the internet;
- a contribution feed has to reach two places at once (the operator and a
  backup site, or a second operator);
- a feed arrives over SRT or RIST and equipment on the local network needs
  it as UDP multicast.

What the relay adds over a plain gateway: it checks what arrives against TR
101 290 and counts lost packets, raises an alert when the feed stops or a
destination can't be reached, and keeps each destination up on its own.

Relays need a licence with TV outputs (the Broadcast package) and are for
operators and above. Each running relay counts as one live stream toward the
licence's limit, however many channels its feed carries; at the limit a new
relay is refused with the reason. They are kept when the server restarts.

## Making a relay

**Broadcast → Relays → New relay**:

- **Name:** lowercase letters, digits, `-` or `_`.
- **Receive from:** where the stream comes from, as the sender sends it.

  | Sender | Address |
  |---|---|
  | UDP multicast (an encoder's or IRD's output) | `udp://239.1.1.1:5000` (fill in **Network interface** to choose the one it is joined on) |
  | UDP to a port of this server | `udp://:5000` |
  | RTP | `rtp://239.1.1.1:5004` or `rtp://:5004` |
  | SRT, this server connects to the sender | `srt://encoder.example.com:9000?passphrase=…` |
  | SRT, the sender connects to this server | `srt://:9000?passphrase=…` |
  | RIST | `rist://@:5000` (add `?secret=…` for an encrypted sender) |
  | MPEG-TS over HTTP | `http://…/channel.ts` |

- **Allowed senders:** the addresses the stream may come from (addresses or
  ranges like `10.0.1.0/24`, separated by commas). Set it whenever the port
  can be reached from outside.
- **Send to:** one to four destinations.

  | Receiver | Address |
  |---|---|
  | An SRT receiver Unda connects to | `srt://receiver.example.net:9000?passphrase=…` |
  | An SRT caller that connects to Unda | `srt://:9000?passphrase=…` (see [Letting the receiver connect](/guide/restreaming#letting-the-receiver-connect-srt-listener); `allow=` takes only that address) |
  | UDP, unicast or multicast | `udp://10.0.0.20:5000` or `udp://239.2.2.1:5000` |
  | RTP | `rtp://…` (`?fec=2d` adds SMPTE 2022-1 error correction, `?path2=` a second network path) |
  | RIST | `rist://receiver.example.net:5000` (`?secret=…` encrypts it) |

In the API: `POST /api/v1/relays` with
`{"name":"station","source":"udp://239.1.1.1:5000","allow":["10.0.0.5"],"destinations":["srt://receiver.example.net:9000?passphrase=…"]}`.

## Changing a relay

**Edit** on a relay opens its settings under it. An address left empty
keeps the one it has, passphrase included (the page never shows a saved
passphrase, so there is nothing to type again); type an address to replace
it, and remove a destination with the bin. Only what you change restarts:

- Destinations you keep stay connected, so a station receiving one of them
  sees no break while you add, replace or remove the others.
- A new source, network interface or list of allowed senders opens the
  receiving side again: every destination gets nothing for a moment. If the
  new source can't open (its port taken), the relay goes on with its old
  settings and the reason is shown.

While the relay is receiving, Unda asks before saving a change that stops or
interrupts something. The name can't change: alerts and events use it.

In the API: `PATCH /api/v1/relays/{name}` with the fields to change, the
destinations as a list of `{"keep": 1}` (the first of the current ones) or
`{"url": "…"}`.

## What you see

Each relay shows whether its feed is arriving (and from where, at what rate,
with how many packets lost on the way in), a transport-stream pill that opens
the full TR 101 290 report, and each destination with its state:

- **sending:** the stream is going out (for a destination that waits for its
  receiver: who is connected);
- **waiting:** the destination waits for its receiver to connect;
- **connecting**, **retrying:** with the reason in plain words, and how many
  packets weren't sent while it was down.

A destination that fails is retried after 1, 2, 4… up to 30 seconds; the
others carry on. While it is down, what arrives for it is dropped, so it
starts again at the live edge rather than with a backlog.

## How the checks are judged

A relay rebuilds nothing, so faults in the feed reach the destinations as
they are. Its report counts priority 1 and 2 errors (lost or damaged
packets, missing tables, a late clock reference or timestamps) as errors the
destinations receive. Priority 3 findings (the DVB network, service, guide
and time tables, how often they repeat) are notes: the receiving headend
makes its own tables. Its alerts follow the same line.

## Alerts

- **Relay receives nothing** (about 20 seconds after the last packet): its
  destinations get nothing. Critical.
- **Relay cannot send to a destination** (after 15 seconds), with the
  reason. Critical.
- **Relay isn't running:** a saved relay that couldn't start when the server
  started (its port taken, no licence, or the licence's live streams all in
  use). It stays saved and is tried again at
  the next start; **Edit** and **Save** to try again now.
- **Errors in the stream it passes on:** priority 1 and 2 errors in the last
  minute. A warning.

A destination waiting for its receiver raises no alert: whether the
receiving side connects is up to it.

## What a relay doesn't do

- It doesn't change the stream: no re-encoding, no new bitrate, no new
  tables. To send a channel in a TV station's format, use a
  [TV output](/guide/restreaming#broadcast-tv-terrestrial-and-satellite).
- It doesn't smooth the timing of a bursty feed: packets go out as they
  arrive. A sender that bunches its packets up reaches the destinations the
  same way (the report's rate and loss figures show it).
- It doesn't publish the stream on this server. To also watch, record or
  restream a channel from the same feed, receive it as a
  [UDP input](/guide/udp) or [MPTS input](/guide/mpts) on another port, or
  have the sender send it twice.

Tested with an encoder-style stream (H.264 with an English MP2 and a French
AC-3 sound track, 4 Mb/s constant) relayed to an SRT receiver connecting to
Unda (TSDuck 3.45, libsrt 1.5.7) and to a UDP receiver: both received the
same packet IDs, sound tracks, languages, service name and padding at exactly
4,000,000 b/s, with no continuity errors.
