---
title: Glossary of live streaming terms
description: Live streaming and broadcast terms explained in plain words, from adaptive bitrate and HLS to keyframes, SRT, MPEG-TS and TR 101 290, with where each one appears in Unda Media Server.
outline: [2, 2]
---

# Glossary of live streaming terms

Live video comes with a lot of abbreviations. Here they are in plain words,
with a note on where each one appears in Unda Media Server. Something missing?
[Ask us](/contact).

## AAC

The most common sound format for streaming (Advanced Audio Coding). Phones,
browsers and smart TVs all play it. Unda passes AAC through untouched and
converts other sound formats, such as MP2 and AC-3 from broadcast equipment,
to AAC for web viewers.

## AC-3

A sound format used in television, also called Dolby Digital. Unda can take
it in from broadcast equipment and can send it in its TV outputs.

## Adaptive bitrate (ABR)

Making several copies of a stream at different qualities, so each viewer's
player can pick the one their connection can carry and switch as the
connection changes. Viewers on slow mobile data keep watching while fast
connections get full HD. See [Adaptive bitrate](/features/adaptive-bitrate).

## As-run log

A record of what actually went on air and when, as opposed to what was
scheduled. Broadcasters use it as proof of broadcast for advertisers. Unda
keeps one for every [24/7 channel](/features/24-7-channels).

## Bitrate

How much data a stream uses each second, in kilobits (kb/s) or megabits
(Mb/s). A 720p stream is typically 2 to 4 Mb/s. Every viewer receives their
own copy, so the bitrate multiplied by the number of viewers is what the
server's upload must carry. See
[how many viewers one server can carry](/blog/how-many-viewers-can-one-server-carry).

## CBR and VBR

Constant bitrate (CBR) sends exactly the same amount of data every second,
filling any spare room with padding; TV modulators and multiplexers need it.
Variable bitrate (VBR) sends only what the picture needs, which saves
bandwidth on IP links. Unda's [TV outputs](/features/tv-outputs) can do both.

## CDN

A content delivery network: many servers around the world that keep copies
of a stream close to viewers. Useful for very large audiences. Unda serves
viewers directly; the guide explains how to put a CDN in front of its HLS
output, which we have not yet tested with a real CDN.

## Codec

The method used to compress video or sound, such as H.264 or AAC. The encoder
compresses, the player decompresses, and both must support the same codec.

## DASH

MPEG-DASH, a way of delivering video over the web in small segments, like
HLS. It is an international standard used by many apps and smart TVs. Unda
offers DASH next to HLS, with the same qualities.

## Encoder

The software or device that compresses the camera's picture and sends it to
the server: OBS Studio, vMix, an ATEM Mini, a phone app, or a broadcast
encoder. See [stream from OBS, vMix or ffmpeg](/guide/streaming).

## EPG and now/next

The electronic programme guide that set-top boxes show. "Now/next" (in DVB,
the EIT present/following table) names the programme on air and the one
after it. Unda fills it in automatically for 24/7 channels in its
multi-channel outputs.

## Failover

Switching automatically to a backup source when the main one fails, so the
stream stays on air. See [Backup encoder](/features/backup-encoder).

## FEC

Forward error correction: extra data sent alongside a stream so the receiver
can rebuild packets lost on the way without asking for them again. Unda
supports SMPTE 2022-1 FEC on RTP outputs.

## Frame rate

How many pictures a second a video has, such as 25, 30, 50 or 60 fps.
Europe, Africa and much of Asia use 25 and 50 for television; the Americas
use 30 and 60.

## GOP and keyframe interval

A keyframe is a complete picture; the frames after it only describe changes.
A group of pictures (GOP) runs from one keyframe to the next. A player can
only start at a keyframe, so a long interval makes viewers wait and makes
HLS fall far behind live. Set your encoder to a keyframe every 2 seconds.
See [why your HLS stream is 30 seconds behind](/blog/why-your-hls-stream-is-30-seconds-behind).

## H.264

Also called AVC: the most widely supported video codec, played by
practically every browser, phone and smart TV. Unda's streams are H.264.

## HEVC

Also called H.265: a newer video codec that needs about half the bitrate of
H.264 for the same quality, but is supported by fewer devices. Unda can send
HEVC in its TV outputs.

## HLS

HTTP Live Streaming: delivering video in short files (segments) listed in a
playlist that the player keeps reloading. It plays in every browser, phone
and smart TV and passes through firewalls like any web page, at the cost of a
few seconds of delay. Unda's player page uses HLS.

## Ingest

Taking a stream into the server from an encoder. Unda ingests RTMP, SRT, UDP,
RTP and RIST.

## Latency

The delay between something happening in front of the camera and viewers
seeing it. Through Unda it is about a tenth of a second for RTMP and SRT
viewers, and around 7 seconds for HLS with 2-second keyframes.

## MPEG-TS

MPEG transport stream: the container format of digital television, made of
small 188-byte packets. Unda uses it for recordings, SRT, UDP, RTP and RIST,
and for its TV outputs.

## MPTS and SPTS

A single-program transport stream (SPTS) carries one channel; a
multi-program transport stream (MPTS) carries several channels in one stream,
as a TV multiplexer does. Unda can pick channels out of an MPTS and build its
own. See [TV and IPTV outputs](/features/tv-outputs).

## Multicast and unicast

Unicast sends a separate copy of a stream to each receiver. Multicast sends
one copy onto a network, and every receiver that has joined the group gets it.
IPTV networks use multicast to reach many set-top boxes without multiplying
the traffic.

## Packet loss

Data that leaves the sender but never arrives, common on the internet and on
busy networks. SRT and RIST recover lost packets by asking for them again;
UDP does not, so Unda measures and shows the loss on every UDP input.

## PID

Packet identifier: the number that tells which channel and which track (video,
sound, tables) each MPEG-TS packet belongs to. Receivers and multiplexers are
often set up by PID, so Unda keeps a bundle's PIDs fixed across restarts.

## Playout

Playing programmes to air from a schedule, as a TV channel does. See
[24/7 channels](/features/24-7-channels).

## Restreaming

Sending a stream received by your server on to other platforms, such as
YouTube and Facebook, at the same time. See [Restreaming](/features/restreaming).

## RIST

Reliable Internet Stream Transport: a broadcast-industry protocol for sending
transport streams over the internet, recovering lost packets by asking for
them again. Unda supports the RIST Simple Profile, in and out.

## RTMP and RTMPS

Real-Time Messaging Protocol: the most common way for encoders such as OBS to
send a stream to a server, and how YouTube and Facebook take streams in.
RTMPS is RTMP inside an encrypted connection.

## RTP

Real-time Transport Protocol: a thin wrapper around UDP packets that numbers
them, so a receiver can put them back in order and notice losses. Common in
broadcast and IPTV.

## Segment

A short piece of a stream, usually 2 to 6 seconds, that HLS and DASH players
download one after another. A segment can only start at a keyframe.

## Signed link

A playback address with a token that proves it was made by someone who holds
the server's secret, and says until when it is valid. Used for ticketed and
private streams. See [Signed playback links](/features/signed-links).

## Slate

A still picture or short looping video shown when there is nothing else to
show, such as "We'll be right back". Unda uses one for gaps in a 24/7
schedule and when every source of a stream with backups is off.

## SRT

Secure Reliable Transport: a protocol for sending live video over the
internet that recovers lost packets and can encrypt the stream. Good for
contributing from a remote venue over an unreliable connection. See
[SRT](/guide/srt).

## Stream key

The secret part of an encoder's address that proves it may publish to a
channel. Anyone with the key can stream to that channel, so keep it private.
In Unda each channel has its own key, separate from the public name viewers
watch by.

## TR 101 290

The ETSI checklist broadcast engineers use to judge a transport stream's
health: synchronisation, continuity, tables and timing. Unda checks its own
multi-channel outputs against it continuously.

## Transcoding

Decoding a stream and encoding it again in another size, bitrate or codec. It
is what adaptive bitrate needs, and the part of streaming that uses the most
processor time.

## UDP

User Datagram Protocol: sends packets without checking that they arrive. It is
fast and simple, and is how most broadcast and IPTV equipment exchanges
transport streams on a local network. See [UDP / MPEG-TS](/guide/udp).

## Upload bandwidth

How much data the server can send out each second. It decides how many viewers
one server can serve: every viewer and every restream destination needs the
stream's bitrate.
