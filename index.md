---
layout: home
hero:
  name: Unda Media Server
  text: The live streaming and broadcast server you run yourself
  tagline: Take streams in from OBS, vMix, cameras and broadcast encoders, and send them to browsers, apps, players, social platforms and TV equipment. Adaptive bitrate, recording, restreaming, multi-channel transport streams and a dashboard for your team, in one program on one server.
  actions:
    - theme: brand
      text: Install
      link: /guide/install
    - theme: alt
      text: What is Unda?
      link: /guide/introduction
    - theme: alt
      text: API reference
      link: /reference/api
features:
  - title: Every common way in
    details: RTMP and RTMPS from OBS and vMix, SRT with encryption for contribution over the internet, and MPEG-TS over UDP or RTP, unicast or multicast, from hardware encoders and IPTV headends.
    link: /guide/streaming
    linkText: Start streaming
  - title: Every common way out
    details: A browser player with a quality menu, HLS for any website or app, MPEG-DASH (experimental), RTMP and SRT for VLC, OBS and vMix, and UDP or RTP for set-top boxes.
    link: /guide/watching
    linkText: Watching and embedding
  - title: Adaptive bitrate
    details: One stream in, up to eight qualities out, planned for each source's size, shape and frame rate. Runs on the CPU or a GPU, switched on per stream from the dashboard.
    link: /guide/transcoding
    linkText: About transcoding
  - title: Restream everywhere at once
    details: Push each stream to YouTube, Facebook, Twitch or another server at the same time, over RTMP, RTMPS, SRT or UDP. A failing destination never affects the others, and stream keys are never shown.
    link: /guide/restreaming
    linkText: Set up restreaming
  - title: Broadcast and IPTV outputs
    details: Standard-definition H.264 or MPEG-2 at a constant bitrate with DVB channel names, for multiplexers and modulators. Bundle several streams as the channels of one transport stream; an offline channel shows black or your slate.
    link: /guide/mpts
    linkText: Multi-channel (MPTS)
  - title: Recording
    details: Record any live stream to files with one click or one API call, split every hour, safe against a crash, with optional automatic clean-up.
    link: /guide/recording
    linkText: Recording
  - title: A dashboard for your team
    details: Accounts with roles and two-factor sign-in, channels with secret stream keys, multiview of every live stream, an audit log, and API keys for automation.
    link: /guide/accounts
    linkText: Accounts and channels
  - title: Health you can see
    details: Live charts, stream health (keyframes, frame rate, audio/video drift), packet loss on UDP inputs, broadcast-style TR 101 290 checks, alerts and an event log, plus Prometheus metrics and webhooks.
    link: /guide/monitoring
    linkText: Monitoring and alerts
  - title: Yours to run
    details: A single program on your own Linux server or in Docker, installed with one command, with automatic HTTPS. Your streams, viewers and data never pass through anyone else.
    link: /guide/install
    linkText: Install
---

## Who it is for

- **Churches, schools and community broadcasters** who stream from OBS or vMix
  and want their own player page, their own viewers and no platform in between.
- **Production teams** who send a program to several platforms at once, record
  it, and give each operator or presenter their own account and stream key.
- **Internet TV channels** that need adaptive quality for viewers on slow
  connections and a dashboard that shows what is wrong before viewers notice.
- **IPTV and broadcast operators** who take feeds over SRT, UDP or RTP and hand
  them to set-top boxes, multiplexers or partners as standard transport
  streams.

## Protocols at a glance

| | In | Out |
|---|---|---|
| **RTMP / RTMPS** | OBS, vMix, ffmpeg, most encoders | Players (VLC, OBS, vMix), restreaming to platforms |
| **SRT** | Contribution over the internet, encrypted | Players that pull over SRT, restreaming |
| **HLS** | | Browsers, apps, smart TVs; adaptive bitrate |
| **MPEG-DASH** | | DASH players (experimental) |
| **UDP / RTP (MPEG-TS)** | Hardware encoders, IPTV headends, multicast | Set-top boxes, multiplexers, multi-channel bundles |

A stream is available on every output as soon as it arrives, however it came
in: a stream sent over SRT plays in the browser, in VLC over RTMP and on a
set-top box over UDP, with nothing to configure.

## Get started

1. [Install Unda](/guide/install) on a Linux server with a domain name. It gets
   its own HTTPS certificate.
2. Open the dashboard, create the owner account and a **channel**. You get a
   public name to watch by and a secret key to stream with.
3. [Point OBS or vMix](/guide/streaming) at the server with that key, and share
   the watch page.
