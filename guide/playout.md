# 24/7 channels (playout)

A playout channel turns video files into a channel that never stops: it plays
them at the times a schedule gives, fills any gap with a slate, black or a
looping video, and hands over to a live stream (from vMix, OBS or any encoder)
as soon as it goes live, going back to the schedule when it ends.

The channel is an ordinary stream. Viewers watch it at `/watch/tv1`, it can be
restreamed to YouTube, recorded, given adaptive bitrate, or put in a
multi-channel bundle, exactly like a stream from an encoder.

## Setting up a channel

1. Upload the video files on the dashboard's **Media** page, or copy them into
   the server's media folder (`/var/lib/unda/media` with the installer;
   `paths.media_dir` to change it) with `scp`, `rsync` or SFTP. MP4, MOV,
   MKV, MPEG-TS, MXF and the like all work.
2. Write a schedule file (below).
3. Add the channel to `unda.yaml` and restart the server:

```yaml
playout:
  channels:
    - name: tv1                          # the channel's stream name
      schedule: /etc/unda/schedules/tv1.yaml
      live: studio                       # optional: this stream takes over while live
      filler: image                      # black (default), image, or video (looped)
      filler_file: /etc/unda/slate.png
```

Optional settings: `width` and `height` (default 1280×720, up to 1920×1080),
`fps` (25, 30, 50 or 60; default 30), `video_kbps` (default 3000),
`audio_kbps` (default 128), `preset` (libx264, default `veryfast`).

## The Media page

**Media** (operators and above) lists every video file in the media folder
with its length, picture size, frame rate, sound and which channels use it.
Files copied in by hand appear by themselves.

- **Uploading:** drop files on the page or click to choose them. A file goes
  up in 8 MB pieces. If the connection drops, the server restarts or the page
  is reloaded, choose the same file again and it carries on where it stopped.
  An unfinished upload is removed after 24 hours without progress.
- **Checks:** each finished upload is checked before it joins the library; a
  file that isn't playable video is refused with the reason. Names are
  letters, digits, `.`, `_` and `-` (the page turns spaces and other
  characters into `-`). An existing name is never overwritten: delete the old
  file first.
- **Space:** a file may be up to 50 GB, an upload must leave 5 GB of the disk
  free, and `playout.media_max_gb` caps the whole folder if you set it.
- **Deleting:** a file on air, or about to be, can't be deleted. A file still
  named in a schedule can; the channel then skips it and shows a warning.
- **Behind a reverse proxy:** allow request bodies of 16 MB (nginx:
  `client_max_body_size 16m;`). Caddy needs no change.

## The Playout page

**Playout** shows each channel: what is on air and how far in, a preview, the
next items, the schedule file's state (and any item that can't play), the
encoder, the live input, and the as-run log with a CSV download.

## The schedule file

YAML or JSON. An item with a `start` begins exactly then, cutting whatever
plays before it; an item without one follows the previous item. The first item
needs a start.

```yaml
timezone: Africa/Accra       # default: the server's time zone
items:
  - start: "2026-10-01 06:00"
    title: Morning show
    media: morning-show.mp4
  - media: news.mp4          # right after the morning show
  - start: "2026-10-01 12:00"
    media: film.mp4
    in: "00:00:30"           # skip the first 30 seconds
    out: "01:35:00"          # stop here
```

For a schedule that repeats every day, add `repeat: daily` and give start times
as times of day (`"06:00"`, `"18:30:00"`). The last item of the day is cut by
the next day's first start.

The server re-reads the file within a few seconds of it changing: edit it and
save, no restart. A file with a mistake is refused with the reason (on the
dashboard, in the events and in the log) and the previous schedule keeps
playing. A file named in the schedule that isn't in the media folder is
reported and skipped.

## What viewers see

- Between items, before the first one and after the last: the filler.
- **Live takeover:** when the `live` stream starts, the channel switches to it
  within a few seconds (about 3 s measured); when it stops, the channel goes
  back to whatever the schedule has at that moment, joining the item where it
  would be by then.
- Every item is scaled to the channel's picture (letterboxed, never
  stretched), at the channel's frame rate, with its sound at 48 kHz stereo.
  Viewers' players never restart between items.
- A file that can't be played shows the filler until the next item.

## The as-run log

Everything that goes on air is recorded: each item, filler and live takeover,
with its scheduled time, when it really started and ended, where in the file it
started, and why it ended (`completed`, `cut` by the next start time, `live`,
`error`, `stopped`). It is kept for 90 days (`playout.asrun_retention_days`).

```bash
curl -H "Authorization: Bearer $KEY" "https://tv.example.com/api/v1/playout/channels/tv1/asrun?format=csv" > asrun.csv
```

## Alerts

The dashboard warns when a channel is off air, when its schedule file was not
loaded, when scheduled files can't play, when a one-off schedule runs out
within a day, and when the server can't keep up (pictures repeated).

## Server capacity

Each channel re-encodes everything it plays, all the time: about half to two
thirds of one CPU core at 720p30, and more at 1080p. A 4-core server runs two
or three 720p channels next to its other work.

A channel counts as a live stream for the license, and needs the `playout`
feature in it.
