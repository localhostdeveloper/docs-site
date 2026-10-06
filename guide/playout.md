# 24/7 channels (playout)

A playout channel turns video files into a channel that never stops: it plays
them at the times a schedule gives, fills any gap with a slate, black or a
looping video, and hands over to a live stream (from vMix, OBS or any encoder)
as soon as it goes live, going back to the schedule when it ends.

The channel is an ordinary stream. Viewers watch it at `/watch/tv1`, it can be
restreamed to YouTube, recorded, given adaptive bitrate, or put in a
multi-channel bundle, exactly like a stream from an encoder.

## Setting up a channel

Everything is done in the dashboard, by operators and above, or by a client
running their own channel (see [Channels for your clients](#channels-for-your-clients)):

1. Upload the video files on the **Media** page. MP4, MOV, MKV, MPEG-TS, MXF
   and the like all work. You can also copy files into the server's media
   folder (`/var/lib/unda/media` with the installer; `paths.media_dir` to
   change it) with `scp`, `rsync` or SFTP; they appear by themselves.
2. On the **Playout** page, click **New channel**. Give it a name (the stream
   it publishes, like `tv1`), a picture size, what plays between items
   (black, or a video from Media looped) and, if you like, a live input. The
   schedule's time zone starts as yours. The channel goes on air at once,
   playing its filler.
3. On the channel's page, build the **Playlist** (below) and click **Save
   schedule**. The channel follows it within a few seconds.

**Settings** on the channel's page changes its picture, bitrate, filler or
live input (the channel restarts, so viewers reconnect once; the playlist is
kept). The bin button deletes the channel and its own media files; its as-run
log is kept.

### Channels for your clients

If you host streams for other organisations, each client can run their own
24/7 channels:

- A client (an account with the **streamer** role) sees **Playout** and
  **Media** in their menu, makes channels there, uploads their own videos and
  edits their own playlists. They see only their own channels and files.
- Their 24/7 channels count toward the same **channel limit** as their stream
  channels (set when you invite them, or on **Users**), and each one is a
  live stream for the license.
- The picture size, frame rate and bitrate of a client's channel are set by
  operators (the server's standard, 1280×720 at 30 fps, until you change it
  in the channel's **Settings**): they decide how much of the server the
  channel uses.
- A client's live input can only be one of their own streams.

### Each channel's own files, and shared files

Every channel has its own folder of files, and there is one set of **shared
files** that every channel may use (station idents, jingles, adverts):

- On the **Media** page, **Upload to** chooses where a file goes: one of the
  channels, or (operators only) the shared files. A channel's own files are
  named `channels/<channel>/<file>`; everything else is shared.
- A channel's playlist and filler can use its own files and the shared ones,
  never another channel's. The editor offers only those, and the server
  refuses anything else.
- Clients can use the shared files but not change or delete them.
- **Deleting a channel deletes its own files**, so a later channel of the same
  name starts empty.
- Files copied in by hand follow the same rule: put a channel's own files in
  `channels/<channel>/` inside the media folder.

[![A 24/7 channel's page: the item on air with its progress, and what plays next](/screens/playout.webp)](/screens/playout.webp)

### The playlist editor

Each row is one item: when it starts, which video, a title, and optional in
and out points (like `00:01:30`) to play only part of the file.

[![The playlist editor: items with start times, videos, titles and when each will play](/screens/schedule.webp)](/screens/schedule.webp)

- **Repeat:** *Every day* uses times of day (the day repeats); *Once* uses
  dates and times.
- **Starts at:** an item with a start time begins exactly then and cuts
  whatever plays before it. Leave it empty (the **×** button) for an item that
  follows the previous one. The first item needs a start time.
- **Plays** shows when each item will run and for how long, worked out from
  the videos' lengths. Warnings show where filler plays in a gap, where an
  item is cut short, and where a video is missing from Media.
- Rows move up and down, and can be duplicated or removed. Nothing changes
  on air until you save; the page asks before you leave with unsaved changes.
- If someone else saved the playlist after you opened it, saving is refused
  and the page offers to load their version, so nobody's work is silently
  overwritten.

### Channels in unda.yaml

A channel can also be set in `unda.yaml` (the way before the dashboard could
make channels); it is marked **from unda.yaml** on the Playout page, and its
settings are changed there. Its playlist can be edited in the dashboard when
the server may write the schedule file. A server installed with the installer
can't write `/etc/unda`, so for such a channel the dashboard shows the
playlist read-only: make the channel in the dashboard instead.

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
`filler: image` with `filler_file` (a still picture) is set here only.

## The Media page

**Media** lists the video files with their folder, length, picture size,
frame rate, sound and which channels use them. Operators see every file; a
client sees the shared files and their own channels' files. Files copied in by
hand appear by themselves.

- **Uploading:** drop files on the page or click to choose them. A file goes
  up in 8 MB pieces. If the connection drops, the server restarts or the page
  is reloaded, choose the same file again and it carries on where it stopped.
  An unfinished upload is removed after 24 hours without progress.
- **Checks:** each finished upload is checked before it joins the library; a
  file that isn't playable video is refused with the reason. Names are
  letters, digits, `.`, `_` and `-` (the page turns spaces and other
  characters into `-`). An existing name is never overwritten: delete the old
  file first.
- **Space:** a file may be up to 5 GB, an upload must leave 5 GB of the disk
  free, and `playout.media_max_gb` caps the whole folder if you set it.
- **Deleting:** a file on air, or about to be, can't be deleted. A file still
  named in a schedule can; the channel then skips it and shows a warning.
- **Behind a reverse proxy:** allow request bodies of 16 MB (nginx:
  `client_max_body_size 16m;`). Caddy needs no change.

## The Playout page

**Playout** shows each channel: what is on air and how far in, a preview, the
next items, the playlist editor, the schedule's state (and any item that
can't play), the encoder, the live input, and the as-run log with a CSV
download.

## The schedule file

The playlist editor writes this file for you; you only need it for a channel
set in `unda.yaml`, or to generate schedules with your own tools. A
dashboard channel's file is `<data folder>/playout/<name>.yaml` (edits made
to it by hand are picked up within 5 seconds, like any schedule file).

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
`items: []` is an empty schedule: the filler plays all the time.

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
