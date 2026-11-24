---
title: "Test results: capacity, delay and long runs"
description: "What has been measured on Unda Media Server: 24-hour runs, viewer capacity, delay, lossy networks, broadcast outputs and adaptive bitrate."
---

# Test results

What has been measured, how, and the result. The figures come from recorded
runs. Where a line doesn't say otherwise, it was measured on a 10-core
development machine over its own network loopback, which shows what the
server software can do, not what a given network or server will. The
equipment and players that have been tested are listed in
[What works with Unda](/guide/compatibility).

*Last updated 23 November 2026.*

## Long runs

| Test | Result |
|---|---|
| 72 hours on a customer's production server, 5 to 8 November 2026 (48 cores, an NVIDIA RTX A5000 graphics card, Ubuntu 24.04, Unda v0.1.49): 35 live streams, among them 24/7 channels, adaptive bitrate on the graphics card, pulled channels and a TV output; 1 to 7 viewers, about 6 Mb/s out | No restart. Memory 1,355 MB after the first 8 hours and 1,482 MB at hour 72 (+9.4 %; the target is under 10 %). Two snapshots of what the server holds, taken 44 hours apart afterwards: 653 MB, then 667 MB |
| 24 hours on a production server: 3 live streams, 3 viewers, about 8.3 Mb/s out | No restart, 0 dropped frames, memory flat (146 MB at hour 8, 147 MB at hour 24), memory handed back when a stream stopped |
| UDP input at 20 Mb/s for 26 minutes (3.9 GB) | 0 packets lost |
| A 12-channel bundle (12 × 720p) received at 60 Mb/s for 10 minutes | 0 packets lost, 0 continuity errors, 0 dropped by the operating system; 6 % of one CPU core listing the channels, 13 % with all 12 published |

## Capacity

| Test | Result |
|---|---|
| 10 incoming 720p streams at 3 Mb/s, with 5 RTMP and 20 HLS viewers, for 3 minutes | Every stream at 30 fps, 0 dropped frames, no alerts; about a quarter of one CPU core, 480 MB of memory |
| 200 HLS viewers of a 1080p stream at 5 Mb/s (about 1 Gb/s out) for 3 minutes | 0 freezes of a quarter second or more, 0 errors, 95 % of viewers playing within 2.6 s; about a quarter of one CPU core |
| Start-up, to the first answer | 0.05-0.07 s for a new server, 0.2 s with 15 channels |

## Operating systems

| Test | Result |
|---|---|
| Installing on a fresh Ubuntu 24.04 server with the one-line installer | Running in under 2 minutes |
| Installing on a fresh Debian 13 server (4 cores, 4 GB) with the one-line installer, Let's Encrypt and Debian's FFmpeg 7.1.5 (Unda v0.1.49) | Running with HTTPS; a live channel played from another network over HLS, RTMP and MPEG-TS over HTTP with 0 decoder errors |
| Debian 13: adaptive bitrate, 5 qualities from 144p to 720p | Every quality decoded with 0 errors; with an SD TV output alongside, Unda used about 1.3 of the 4 cores |
| Debian 13: an SD TV output fetched over the internet, analysed by TSDuck | Exactly 1,500,000 b/s, constant; all 1,741 clock references (PCR) within 1 ms; no lost or out-of-order packets; the DVB tables present |
| Debian 13: a 24/7 channel, then a reboot | Played on across its playlist's loop; after the reboot Unda, the 24/7 channel and the TV output came back by themselves |
| Installing on a fresh AlmaLinux 10.2 server (4 cores, 4 GB, SELinux enforcing) with the one-line installer and Let's Encrypt, after opening the ports in firewalld and installing FFmpeg 7.1.5 from RPM Fusion (Unda v0.1.49) | Running with HTTPS; a live channel played from another network over HLS, RTMP and MPEG-TS over HTTP with 0 decoder errors; SELinux blocked nothing |
| AlmaLinux 10: adaptive bitrate (5 qualities, 144p to 720p) on a live channel and a 24/7 channel | Every quality decoded with 0 errors |
| AlmaLinux 10: a 720p50 TV output at 2,000 kb/s fetched over the internet, analysed by TSDuck | Exactly 2,000,000 b/s, constant; all 1,764 clock references (PCR) correct; no lost packets; the DVB tables present; 0 decoder errors from the first keyframe. With both ladders running, Unda used about 2 of the 4 cores |
| AlmaLinux 10: a 24/7 channel, then a reboot | Played 75 s across its playlist's loop with 0 errors; after the reboot Unda and the 24/7 channel came back by themselves, still with nothing blocked by SELinux |
| Alpine Linux 3.24.3 (4 cores, 4 GB): the plain one-line install | Stopped at once with "systemd is required", nothing changed |
| Alpine 3.24: Docker 29.9 from Alpine's packages, then the installer with `--docker` (Unda v0.1.49) | Release signature verified, image pinned to its checksum, Let's Encrypt HTTPS; a live channel played from another network over HLS, RTMP and MPEG-TS over HTTP with 0 decoder errors |
| Alpine 3.24: adaptive bitrate (5 qualities), a 720p50 TV output with MP2 sound at 2,000 kb/s (TSDuck), a 1080p25 24/7 channel | Every quality and 75 s of the 24/7 channel across its loop with 0 errors; the TV output exactly 2,000,000 b/s, all 1,763 PCRs correct, 0 discontinuities, the DVB tables present. All four jobs at once filled the 4 cores (load 17): size HD work to the cores |
| Alpine 3.24: a reboot | Docker (OpenRC) and Unda came back by themselves; the 24/7 channel played again with 0 errors |

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
| RTMP in, HLS out: the first picture for a viewer who opens it | 0.2 s (3.3 s before v0.1.48) |

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
| Single-channel TV outputs, HD 1080p25 and 1080p50 (H.264; HEVC 1080p50) | Every second within 0.5 % of the set rate, PCR every 21 ms or less, every picture at least half a second before its decode time. As a bundle channel beside an SD channel (4 minutes): no picture late, nothing dropped, TR 101 290 clean |
| Network and time tables on all five TV output formats (TSDuck) | Present and correct in every one; clock references exact against their position |
| Unda's SD TV output analysed as a receiver sees it (Unda's own analyser, judged as a TV output) | Clean on all three TR 101 290 priorities; rate exactly 1300 kb/s, constant; PCR accuracy 0 errors; network jitter (MDI) 8.8 ms, 0 lost |
| The same 2-channel bundle analysed by TSDuck and by Unda's analyser at once | Both: 3,000,000 b/s, the same channels and PIDs, padding within 0.4 %, no errors |
| VLC opening a 3-channel bundle | All three channels listed by name; switching between them works |

TV outputs are tested with the FFmpeg versions customers' systems carry:
4.4 (Ubuntu 22.04), 6.1 (Ubuntu 24.04), 7.1 (Debian 13, and AlmaLinux 10 from RPM
Fusion), 8.0 (Ubuntu 26.04), 8.1 (the Docker image) and 9.

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
  used (govulncheck): none reachable in v0.1.50.
- How to report a security problem, and how releases and accounts are
  protected: [Security](/security).

See [Releases and support](/guide/releases) for how releases are made, and
the [release notes](/release-notes) for what each one changed.
