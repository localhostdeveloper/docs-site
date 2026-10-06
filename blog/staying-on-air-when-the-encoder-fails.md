---
title: Staying on air when the encoder fails
description: Encoders crash, cables get pulled and venue internet drops. How to plan a live event that doesn't go dark, from the connection to a backup encoder, and what viewers see when something fails.
date: "2026-10-06"
---

# Staying on air when the encoder fails

*6 October 2026 · UndaMedia*

Every live team has a story: the laptop that updated itself mid-service, the
venue Wi-Fi that collapsed when the guests arrived, the cable someone tripped
over. On a platform the stream simply ends, viewers see an error, and when you
reconnect some of them never come back.

The good news is that most failures can be planned for. Here is how we think
about it, from the cheapest steps to the most thorough.

## 1. Give the encoder a solid connection

Most live problems start at the venue's internet.

- **Use a cable, not Wi-Fi**, wherever you can.
- **Test the upload on the streaming computer before the event**, at the time
  of day you'll stream. It should hold steady at about one and a half times
  your video bitrate: 5 Mb/s video needs 7 to 8 Mb/s of upload that doesn't
  drop.
- **Watch the encoder's dropped-frames counter** while you stream. If it
  climbs, lower the bitrate before viewers notice.

## 2. Use SRT on uncertain connections

RTMP, the usual way to send from OBS, stalls when packets are lost. SRT
recovers lost packets by asking for them again, as long as its latency setting
gives it time to: set the latency comfortably above the connection's round
trip. In our tests, SRT carried a stream through 5% packet loss in each
direction without a single missing frame. See [SRT](/guide/srt).

## 3. Have a second encoder ready

The step that covers the most: a backup encoder sending the same event over a
**different connection**, for example a second computer or a hardware encoder
on a 4G router while the main one uses the venue's line.

With [backup sources](/features/backup-encoder) switched on, Unda shows the
main encoder while it works and switches to the backup when it doesn't. With
the default settings, this is what viewers see (we measured the switches with
two encoders, a viewer and a restream destination running):

| What happens | What viewers see |
|---|---|
| The main encoder disconnects | The backup, after about a second |
| The main freezes (connected, no pictures) | The last picture for 2 seconds, then the backup |
| The main comes back | The main again, once it has been steady for 10 seconds |
| Both are gone | A slate (black, or your own looping video) |

Viewers don't reload anything, and YouTube or Facebook stay connected
throughout, because to them the stream never stopped. The switch times are
settings, and an operator can also put the backup on air by hand, for example
when the main has bad sound that the server can't detect.

## 4. Keep a slate ready

When nothing is live, a slate with your logo and "We'll be right back" keeps
viewers waiting instead of leaving. In Unda it can be any video from your media
library, looped.

## 5. Record on the server

Record on the server as well as at the venue. If the venue's recording fails,
you still have what viewers saw; if the venue's internet fails, the venue
recording covers the gap. See [Recording](/features/recording).

## 6. Rehearse the failure

The only way to trust a backup is to watch it work. During the rehearsal, pull
the main encoder's network cable and check that viewers see the backup, then
plug it back and check the main returns. It takes two minutes and turns a
plan into a habit.

## What it doesn't cover

A backup encoder protects against the encoder or its connection failing, not
against the server itself failing. And because the server re-encodes the
stream to make switches invisible, each stream with backups uses about 60% of
a processor core at 720p: plan the server for it.

Planning an event that can't go dark? [Tell us about it](/contact).

---

[← All articles](/blog/) · Related: [Backup encoder](/features/backup-encoder) · [Monitoring and alerts](/features/monitoring)
