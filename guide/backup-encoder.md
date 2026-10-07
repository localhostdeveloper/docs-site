# Backup encoder (failover)

When the encoder of a live stream drops (OBS crashes, the venue's internet
cuts out), the stream normally ends: viewers see it stop and restream
destinations such as YouTube disconnect. With **backup sources** on, the
stream stays on air instead. Unda switches to a backup encoder, to another
stream, or, when none of them has pictures, to a slate or a playlist of your
videos. When the main encoder is back, Unda switches back to it by itself.

Viewers keep watching throughout, with no reload and no reconnect. Restream
destinations and recordings of the stream continue too.

## Switch it on

An operator (or above) switches it on for a channel:

1. Open the stream in the dashboard (it doesn't have to be live) and go to its
   **Backup** tab.
2. Switch on **Keep this stream on air with backup sources**.

If the stream is live at that moment, its encoder is disconnected once and
reconnects by itself (OBS and vMix do this automatically).

[![The Backup tab: backup sources on, the main encoder on air and the backup encoder ready](/screens/backup.webp)](/screens/backup.webp)

The channel now has two keys:

| Key | For |
| --- | --- |
| The channel's key (unchanged) | The **main** encoder |
| The **backup key** (new) | A **backup** encoder |

Streamers see the backup key on the **Channels** page, under their channel.

## Set up the backup encoder

Use a second OBS or vMix, ideally on another machine with another internet
connection, and set it up like the main one, with the backup key:

- **Server:** `rtmp://tv.example.com:1935/live` (the same as the main)
- **Stream key:** the channel's backup key

Or over SRT: `srt://tv.example.com:6000?streamid=publish:BACKUP-KEY`.

Both encoders can stream at the same time: the backup waits, ready, and costs
viewers nothing. The two don't need the same resolution or settings.

## What viewers see

| Moment | Viewers see |
| --- | --- |
| The main encoder disconnects | The backup, within about a second |
| The main encoder freezes (connected, no pictures) | The last picture for 2 seconds (your setting), then the backup |
| The main is back | The main again, once it has sent steady pictures for 10 seconds (your setting) |
| Nothing is live | What you chose: black, a looped video, or your backup playlist (see below) |

The **Backup** tab lists the sources in order, which one is on air, and
every switch with its reason. The event log records each switch too. While
the stream runs on a backup, the slate or the backup playlist, an alert says
so.

**Use this** next to a source puts it on air ahead of the others (for example
when the main has a problem viewers can see but the server can't, such as bad
audio). **Automatic** goes back to the normal order.

## When no source has pictures

On the **Backup** tab, **When no source has pictures** sets what viewers see
while neither encoder (nor any other source) sends pictures:

| Choice | Viewers see |
| --- | --- |
| **Black picture** | Black, with silence (the default) |
| **A video** | That video, round and round |
| **Backup playlist** | Your playlist of videos, one after another, round and round |

The channel's owner can choose this, not only operators. The videos are the
channel's own files and the shared ones on the [Media](/guide/playout) page.
To add your own, choose your channel under **Upload to** on the Media page.
Changing the choice restarts the stream if it is running, so viewers
reconnect once.

### The backup playlist

When you choose **Backup playlist**, its editor opens below. Add videos in the
order they should play, then **Save**. It works like a
[24/7 channel's playlist](/guide/playout), and it loops by default. You can
also switch the loop off and give the videos times of day instead.

The playlist runs on its own clock, as if a 24/7 channel were playing it in
the background. When the main encoder drops, viewers join the playlist
wherever it is at that moment, not at its first video. If the main drops
twice in an hour, viewers don't see the same opening twice. When the main is
back and steady, it takes over again.

You can edit the playlist at any time, even while it is on air. The stream
picks up the changes within seconds, without restarting. Changing its list of
videos starts the loop again from the first one.

## More sources

Besides the backup encoder, an operator can add any other stream as a
source, in order: a [UDP input](/guide/udp), a program of a
[multi-channel input](/guide/mpts), or another channel. Each one is used
when every source above it has no pictures.

## Settings

| Setting | Default | |
| --- | --- | --- |
| Switch after no picture for | 2 s | A shorter freeze shows as a freeze, not a switch |
| Back to a better source after | 10 s | How long the main must be steady before it takes over again |
| When no source is live | end the stream after 5 minutes | Or keep the slate or backup playlist on air around the clock (24/7 channels) |
| Picture | 720p, 30 fps, 3000 kb/s | What viewers get, whatever the sources send |

These are an operator's. What shows when no source has pictures is set
separately (above).

Saving new settings restarts the stream, so viewers reconnect once.

## Cost

To make switching invisible, Unda encodes the stream itself: every source is
decoded, and one encoder produces what viewers get. This costs:

- about **60% of one CPU core** for a 720p stream, more for 1080p;
- about **13% more** for each source kept ready;
- about **13% more** while a looped video or the backup playlist is on air.

A 4-core server can handle 2 or 3 streams with backup sources. The picture is
re-encoded once, and latency grows by about a second.

Switching on is limited to 16 streams. With a license, a stream with backup
sources counts as one live stream: its main and backup don't count
separately.

## Limits

- Backup sources protect against an encoder or its connection failing, not
  against this server failing.
- Backup sources are for channels created on the **Channels** page. 24/7
  channels from a schedule have their own live input (see
  [24/7 channels](/guide/playout)).
- Watching the main or backup input directly (`/watch/main-show.main`) needs a
  [signed link](/guide/protect-playback). Viewers watch the channel itself.
