# Test results

What has been measured, how, and the result. The figures come from recorded
runs. Where a line doesn't say otherwise, it was measured on a 10-core
development machine over its own network loopback, which shows what the
server software can do, not what a given network or server will. The
equipment and players that have been tested are listed in
[What works with Unda](/guide/compatibility).

*Last updated 27 October 2026, Unda v0.1.47.*

## Long runs

| Test | Result |
|---|---|
| 24 hours on a production server: 3 live streams, 3 viewers, about 8.3 Mb/s out | No restart, 0 dropped frames, memory flat (146 MB at hour 8, 147 MB at hour 24), memory handed back when a stream stopped |
| UDP input at 20 Mb/s for 26 minutes (3.9 GB) | 0 packets lost |
| A 12-channel bundle (12 × 720p) received at 60 Mb/s for 10 minutes | 0 packets lost, 0 continuity errors, 0 dropped by the operating system; 6 % of one CPU core listing the channels, 13 % with all 12 published |

## Capacity

| Test | Result |
|---|---|
| 10 incoming 720p streams at 3 Mb/s, with 5 RTMP and 20 HLS viewers, for 3 minutes | Every stream at 30 fps, 0 dropped frames, no alerts; about a quarter of one CPU core, 480 MB of memory |
| 200 HLS viewers of a 1080p stream at 5 Mb/s (about 1 Gb/s out) for 3 minutes | 0 freezes of a quarter second or more, 0 errors, 95 % of viewers playing within 2.6 s; about a quarter of one CPU core |
| Start-up, to the first answer | 0.05-0.07 s for a new server, 0.2 s with 15 channels |
| Installing on a fresh Ubuntu 24.04 server with the one-line installer | Running in under 2 minutes |

## Delay (latency)

Measured by stamping the time into the picture at the encoder and reading
it back from what the player shows (Chrome).

| Path | Delay |
|---|---|
| RTMP in, RTMP out | 0.1 s |
| RTMP in, WebRTC (WHEP) out | 0.11 s; first picture in 0.5 s |
| WebRTC (WHIP) in, WebRTC out | 0.14 s |
| RTMP in, HLS out, keyframe every 2 s | 6.8 s |
| RTMP in, HLS out, keyframe every 8 s | 28.8 s (keep keyframes at 2 s) |

## Lossy networks

| Test | Result |
|---|---|
| SRT through 5 % packet loss each way, 80 ms round trip, 500 ms SRT latency | Every frame from the first keyframe on delivered, in order, no gaps (the control run with 60 ms latency lost most frames, as it should) |
| RIST from Unda to VLC (librist) through 5 % loss each way | Everything recovered except the stream's very first packet (sent before the receiver knew the stream); 276 packets resent |
| RIST from VLC (librist) to Unda through 5 % loss | 1,474 packets recovered, 0 lost |
| WebRTC (WHIP) publishing through 3 % loss | 30 pictures a second kept (6 before v0.1.47) |
| UDP input loss measurement, against a relay dropping 0.92 % of datagrams | Reported 0.88 % |

## Broadcast outputs

| Test | Result |
|---|---|
| A 3-channel 8 Mb/s bundle (a 24/7 channel with its guide, a live channel, an offline channel showing black) analysed by TSDuck for 12 minutes | 0 sync, transport or continuity errors; all 108,570 clock references (PCR) within one tick of their position; PCR every 23 ms or less; channel list every 100 ms, names every 0.5 s, guide every second |
| Single-channel TV outputs, SD (H.264, MPEG-2) | Every second within 0.5 % of the set rate (0.7 % for MPEG-2), PCR every 22 ms or less |
| Single-channel TV outputs, HD (720p50, 1080i25; H.264, HEVC) | Every second within 1 % of the set rate, PCR every 40 ms or less |
| Network and time tables on all five TV output formats (TSDuck) | Present and correct in every one; clock references exact against their position |
| Unda's SD TV output analysed as a receiver sees it (Unda's own analyser, judged as a TV output) | Clean on all three TR 101 290 priorities; rate exactly 1300 kb/s, constant; PCR accuracy 0 errors; network jitter (MDI) 8.8 ms, 0 lost |
| The same 2-channel bundle analysed by TSDuck and by Unda's analyser at once | Both: 3,000,000 b/s, the same channels and PIDs, padding within 0.4 %, no errors |
| VLC opening a 3-channel bundle | All three channels listed by name; switching between them works |

TV outputs are tested with the FFmpeg versions customers' systems carry:
4.4 (Ubuntu 22.04), 6.1 (Ubuntu 24.04), 8.0 (Ubuntu 26.04), 8.1 (the
Docker image) and 9.

## Adaptive bitrate and DASH

| Test | Result |
|---|---|
| A 7-quality ladder from a 4K source | Every quality's real bitrate within what the playlist announces; the 4K quality decodes cleanly |
| DASH players (dash.js, Shaka) forced through every quality every 6 s | 0 stalls |
| A slowed link (HLS in Chrome, Shaka) | Moved down to a smaller quality and back up when the link recovered; Shaka with 0 stalls |
| DASH manifests | Valid against MPEG's schema; segment times match the manifest |

## How the software is checked

- Every change runs the full test suite with Go's race detector, and
  `go vet` and a linter.
- Every parser that reads data from the network (RTMP, SRT, UDP, RTP, RIST,
  WebRTC, MPEG-TS, the DVB tables, playlists) is fuzzed with random input on
  every change.
- Test coverage of the core and the protocol packages: 64 % to 100 % (the
  core: 96 %).
- Each release is checked for known vulnerabilities in Go and every library
  used (govulncheck): none reachable in v0.1.47.

See [Releases and support](/guide/releases) for how releases are made, and
the [release notes](/release-notes) for what each one changed.
