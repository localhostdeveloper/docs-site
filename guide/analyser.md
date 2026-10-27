# Stream analyser

**Server → Analyse** checks any transport stream the way broadcast test
equipment does, for a minute or up to a whole day, without publishing it.
Use it to:

- check a feed before you rely on it: a satellite receiver's IP output, a
  station's SRT link, a partner's multicast group, an IPTV channel;
- see your own output as a receiver sees it, for example the multicast group
  a bundle or a TV output sends to;
- catch errors that come and go (a weak satellite link in the rain, a
  congested network every evening) by leaving it running for hours;
- give a supplier a report that shows what was wrong and when.

The analyser needs a licence with TV outputs (the Broadcast package) and is
for operators and above.

## Starting an analysis

| Stream | Address to type |
|---|---|
| UDP multicast | `udp://239.1.1.1:5000` (fill in **Network interface** to choose the one it is joined on) |
| UDP on a port of this server | `udp://:5000` |
| RTP (MPEG-TS in RTP) | `rtp://239.1.1.1:5004` or `rtp://:5004` |
| SRT, this server calls the sender | `srt://encoder.example.com:9000` (add `?streamid=…&passphrase=…` as the sender needs) |
| SRT, the sender calls this server | `srt://:9000` |
| RIST | `rist://@:5000` |
| MPEG-TS over HTTP | `http://…/channel.ts` (an IPTV channel's link, another server's `/ts` link) |

Choose how long it runs (1 minute to 24 hours) and how to judge it:

- **Incoming feed** (the default): a table counts once it has been seen, as
  for any input. Many satellite and IPTV feeds carry no network or time
  table, and that is not an error for a feed.
- **TV output**: every table DVB asks for (PAT, PMT, SDT, NIT, TDT) is
  expected from the start, as a modulator or a set-top box needs. Use it for
  a stream about to go on air.

Two analyses can run at once. A port one of this server's inputs listens on
can't be analysed (the input already has its own report: click its
**TR 101 290** label); a multicast group that an input has joined can.

An HLS address (`.m3u8`) is refused: give the MPEG-TS address instead. An
address with an account in it (`http://host/live/user/password/101.ts`) is
shown without it.

## The report

Click **View** on an analysis to see its report. A running one refreshes
every 3 seconds.

- **Rate**: measured from the PCR, padding included. **Constant** means
  every 10-second window agrees within 50 parts per million, as a
  multiplexer's output does. Each PCR is then also checked against its
  position in the stream (PCR accuracy, ±500 ns). **Variable** is normal
  for IPTV and internet streams, but not for a DVB modulator or a
  satellite uplink.
- **Packets**: 188 bytes, or 204 when the sender adds Reed-Solomon bytes (as
  some ASI and satellite gateways do). Unda removes them before checking, but
  most IP receivers expect 188: set the gateway to 188 if you can.
- **Lost**: packets missing on the way, counted from the continuity counters.
- **MDI (DF:MLR)**, for UDP and RTP only: the Media Delivery Index (RFC
  4445), for the last second and the worst second. **DF** (delay factor) is
  how much the network bunched or spread the packets, in milliseconds. It is
  the buffer a receiver needs. A few ms is normal; tens of ms means bursts or
  jitter on the way, which receivers with small buffers turn into lost
  packets. **MLR** (media loss rate) is TS packets lost a second; for video,
  0 is the only good figure.
- **Link**: for SRT, RIST and HTTP, whether the connection is up and the
  last reason it dropped.
- **Minute by minute**: one bar per minute (per few minutes on a long
  analysis), red for priority 1 errors, yellow for priority 2, blue for
  priority 3, green for a clean minute, grey where nothing arrived. Point at
  a bar for its counts, bitrate, worst DF and lost packets.
- Below that, the full TR 101 290 report: every check with its count, the
  latest errors and what caused them, each PID with its bitrate and PCR
  interval, how often each table comes, and the channel names, network and
  time the tables carry. The checks are explained in
  [Transport-stream checks](/guide/mpts#transport-stream-checks-tr-101-290).

**Download report** saves it all as a text file (including the minute-by-minute
table), to keep or to send.

An analysis ends by itself when its time is up, or with **Stop**; its report
stays until you remove it. The last ten finished analyses are kept until the
server restarts.

## Reading it

- **Continuity errors with a high MLR**: the network loses packets. Use SRT,
  RIST or RTP with FEC over that path, or fix the link.
- **High DF, no loss yet**: the packets arrive in bursts. A receiver with a
  small buffer will start losing them. Check the sender's pacing, or the
  switches and links between.
- **PCR interval or PCR jump errors**: the encoder or multiplexer's clock
  reference, not the network (unless packets are lost too).
- **PCR accuracy errors on a constant-rate stream**: something on the way
  changed the stream without correcting its PCR (a re-multiplexer, a gateway
  dropping padding).
- **Missing NIT, SDT or TDT, judged as a TV output**: a receiver won't show
  the channel names, or will show the wrong time. Bundles and TV outputs sent
  by Unda carry them all ([Network and time tables](/guide/mpts#network-and-time-tables)).

## Over the API

`POST /api/v1/analyses` starts one, `GET /api/v1/analyses/{id}` reads its
report: see the [REST API](/reference/api).
