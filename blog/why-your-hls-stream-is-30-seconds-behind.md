---
title: Why your stream is 30 seconds behind (and how to get it to 7)
description: The keyframe interval in your encoder decides how far behind live your browser viewers are, how long they wait for a picture, and whether they freeze. We measured it, and one setting fixes it.
date: "2026-10-06"
---

# Why your stream is 30 seconds behind (and how to get it to 7)

*6 October 2026 · UndaMedia*

"The stream is half a minute behind." "It takes ages to start." "It freezes
just after it begins." When people stream to a website, these are the
complaints we hear most. Very often all three have the same cause, and it is
one setting in the encoder: the **keyframe interval**.

## What a keyframe is

Video is compressed by sending a complete picture now and then, a
**keyframe**, and in between only what changed. A player can only start from
a keyframe: before one arrives it has nothing to draw.

Web players (HLS, the format the browser player and most apps use) receive
video in short files called segments, and **a segment can only start at a
keyframe**. So however short the server wants its segments, they can't be
shorter than the gap between keyframes. Players hold about three segments
before they start playing, to ride out small hiccups in the connection.

Put those together and the keyframe interval sets the delay: three segments of
8 seconds is a lot further behind live than three segments of 2 seconds.

## What we measured

We stamped the wall-clock time into the picture of a test stream, then read it
back from what a browser was showing, with Unda in between:

| Keyframe interval | How far behind live (browser, HLS) |
|---|---|
| 2 seconds | about 7 seconds |
| 8 seconds | about 29 seconds |

The same test over RTMP, as VLC or OBS would play it, was about a tenth of a
second through the server. HLS trades delay for working everywhere; with the
right keyframe interval that trade is small.

Long keyframe intervals cause the other two complaints too. A viewer who opens
the page has to wait for the next keyframe before anything appears, up to the
full interval. And browser players that start at the very edge of a long
segment often run dry a few seconds later and freeze.

## The usual culprit: "auto"

OBS Studio's keyframe interval defaults to **0, meaning automatic**. In our
tests that came out at a keyframe every 8.3 seconds (250 frames at 30 frames a
second). Many streamers never change it, because platforms with their own
re-encoding hide the problem.

## The fix

Set the encoder to a keyframe every **2 seconds**:

- **OBS Studio:** Settings → Output → Output Mode *Advanced* → Streaming →
  **Keyframe Interval: 2**. While you're there, rate control **CBR**.
- **ffmpeg:** `-g` with twice the frame rate, such as `-g 60` at 30 fps.
- **Hardware encoders:** look for "keyframe interval", "GOP" or "I-frame
  interval", and set 2 seconds (or 60 frames at 30 fps, 50 at 25 fps).

There is little to lose. Keyframes take a little more of the bitrate, but at
normal streaming bitrates the difference is hard to see, and 2 seconds is what
YouTube and Facebook ask for too, so the same settings work for restreaming.

The full recommended settings are in
[Stream from OBS, vMix or ffmpeg](/guide/streaming).

## How Unda helps

Unda measures the keyframe interval of every stream as it arrives, so you
don't have to trust what the encoder says it sends:

- an alert opens when keyframes are more than 4 seconds apart, saying
  *"a keyframe only every 8.3 s"* and what to change;
- the Channels page shows the encoder settings to copy next to each channel,
  and warns on a channel whose encoder will make viewers buffer.

If your viewers complain about delay, check that first. More on what the
dashboard measures: [Monitoring and alerts](/features/monitoring).

---

[← All articles](/blog/) · Questions? [Talk to us](/contact)
