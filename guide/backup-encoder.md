# Backup encoder (failover)

When the encoder of a live stream drops (OBS crashes, the venue's internet
cuts out), the stream normally ends: viewers see it stop and restream
destinations such as YouTube disconnect. With a **backup encoder**, a second
encoder takes over when the main one stops, and the main takes over again
when it is back.

The backup encoder is part of a channel's **live stream** input. A channel can
also fall back to a pull stream (a link Unda fetches) and a playlist of your
videos, in the order you choose: see [Channel inputs](/guide/channel-inputs).

## Switch it on

1. Open the stream in the dashboard (it doesn't have to be live) and go to its
   **Inputs** tab.
2. Switch on **Use this channel's inputs in order**. The live stream is the
   first input unless you move it.

If the stream is live at that moment, its encoder is disconnected once and
reconnects by itself (OBS and vMix do this automatically).

The channel now has two keys:

| Key | For |
| --- | --- |
| The channel's key (unchanged) | The **main** encoder |
| The **backup key** (new) | A **backup** encoder |

The channel's owner sees the backup key on the **Channels** page, under the
channel, and on the **Inputs** tab (**Show**).

## Set up the backup encoder

Use a second OBS or vMix, ideally on another machine with another internet
connection, with the backup key:

- **Server:** `rtmp://tv.example.com:1935/live` (the same as the main)
- **Stream key:** the channel's backup key

Or over SRT: `srt://tv.example.com:6000?streamid=publish:BACKUP-KEY`.

Both encoders can stream at the same time: the backup waits, ready, and costs
viewers nothing.

**Give both encoders the same settings** (resolution, frame rate, encoder
profile, audio sample rate and channels). With direct switching, the default,
Unda then switches between them without viewers noticing; encoders set up
differently make the stream restart for a moment at each switch. With
seamless switching (an operator's choice, which re-encodes the channel), the
two may differ. See
[Direct or seamless switching](/guide/channel-inputs#direct-or-seamless-switching).

## What viewers see

| Moment | Viewers see |
| --- | --- |
| The main encoder disconnects | The backup, within about a second |
| The main encoder freezes (connected, no pictures) | The last picture for 2 seconds (your setting), then the backup |
| The main is back | The main again, once it has sent steady pictures for 10 seconds (your setting) |
| Neither is live | The channel's next input (a pull stream or a playlist), or the stream ends |

See [Channel inputs](/guide/channel-inputs) for the settings, who can change
what, and the licence.

## Limits

- A backup encoder protects against an encoder or its connection failing, not
  against this server failing.
- Backup encoders are for channels created on the **Channels** page. 24/7
  channels from a schedule have their own live input (see
  [24/7 channels](/guide/playout)).
- Watching the main or backup input directly (`/watch/main-show.main`) needs a
  [signed link](/guide/protect-playback). Viewers watch the channel itself.
