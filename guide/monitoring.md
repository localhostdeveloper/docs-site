---
title: "Monitoring, alerts and Prometheus metrics"
description: "Stream health, alerts and viewer sessions in the Unda dashboard, a no-sound alarm, webhooks to Slack or Discord, and Prometheus metrics for Grafana."
---

# Monitoring and alerts

## In the dashboard

- **Overview**: live streams, viewers, ingest and egress with the last hour's
  charts, how much room is left before the bandwidth cap, and **Needs
  attention**: every open problem, most serious first.
- **Streams**: every stream with its measured resolution, frame rate, bitrate
  trend, viewers and a health dot. Streams with a problem are always listed
  first. Expand a row to see who is reading it and whether anyone is falling
  behind.
- **A stream's page**: a **Health** card with the measured frame rate,
  keyframe interval, audio/video drift, bitrate against its normal level and
  reconnects.
- **Sessions**: every player watching a stream, now and in the past. See
  [Viewer sessions](#viewer-sessions) below.
- **Events**: what happened, newest first: streams starting, stopping and
  reconnecting, viewers joining and leaving, switches to a backup encoder,
  restream, recording and adaptive-bitrate changes, alerts. Kept for 30 days,
  across restarts; a line that repeats is shown once with a count.

[![The Overview page: live streams, viewers, bandwidth charts for the last hour, and Needs attention](/screens/overview.webp)](/screens/overview.webp)

## Viewer sessions

**Sessions** in the sidebar (operators and above) lists every player watching
a stream over HLS, DASH, RTMP or SRT: the stream, the protocol, the viewer's
address, the player (for example "Chrome 129 · Windows", "VLC 3.0.23",
"Apple player (iOS)"), when it started, how long it lasted, how much it was
sent and its average rate.

[![Sessions: every player watching now, with its address, player, start time and traffic](/screens/sessions.webp)](/screens/sessions.webp)

- **Watching now**: the sessions running at the moment.
- **History**: finished sessions, newest, longest or biggest first.
  **Download CSV** saves every matching session as a spreadsheet.
- **By stream** and **By viewer**: totals per stream or per viewer address
  for the last hour, day, week or month: sessions, how many are watching now,
  how many different addresses (or streams), watch time and traffic.

Filter any view by stream, protocol, address (the start of it: `10.1.` shows
a whole subnet), player and minimum length. Click an address or a stream name
to see all of its sessions.

A browser tab is one session, even when the player switches quality. It
counts once the player starts fetching video, not when a page is only opened,
and ends 30 seconds after the player's last request. If Unda runs behind a
reverse proxy, list the proxy under `server.trusted_proxies` so sessions show
the viewers' own addresses rather than the proxy's.

Sessions are kept for 30 days (`sessions.retention_days`, up to 365) in the
server database, and survive restarts. Viewer addresses are personal data in
many countries: set `sessions.disabled: true` to keep no history (the
**Watching now** view still works).

## Viewer figures for each channel

Every stream page, and every 24/7 channel's page, has a **Viewers** tab: how many watched the channel today,
yesterday, over the last 7 or 30 days, this month, last month or the last 12
months. A client sees it for their own channels only, so you can give a
channel's owner a sign-in and let them follow their audience themselves.

[![A channel's Viewers tab over the last 30 days: most at once, viewers, views, watch time, average watch and data sent, and the most viewers at once each day](/screens/viewers.webp)](/screens/viewers.webp)

- **Watching now** (today only), split by how they watch.
- **Most at once**, and when.
- **Viewers**: different devices that watched. A device is known by its
  internet address and its player, so phones sharing one mobile-network
  address with the same browser count once; the real number can be a little
  higher. Over more than eight days it is estimated, within about 3 %.
- **Views** (times someone started watching), **Watch time**, **Average
  watch** and **Data sent**.
- A chart of the most viewers at once: every 15 minutes for one day, every
  hour for up to eight days, every day beyond.
- **How they watched** (HLS, low latency, RTMP, SRT…) and **Devices**
  (phones and tablets, computers, TVs, player apps), as shares of watch time.
- **Day by day** for longer ranges, and **Download CSV**.

The figures are totals only: no viewer's address or player is shown. Days
run midnight to midnight on the server's clock. Unda keeps a summary of each
day for 13 months, long after the sessions themselves are deleted, and after
an upgrade it fills in the days whose sessions are still kept (30 days by
default). A server with `sessions.disabled: true` keeps no figures beyond the
viewers watching now.

### The figures in a website or app

**Figures for your website or app**, in the tab's **Use these figures
elsewhere** card, makes a private link to the channel's figures as a JSON
file. Give it to whoever shows them: a website, an app's admin page, a
report. No sign-in or key is needed, any website may read it, and nobody can
guess another channel's link.

```json
{
  "channel": "news",
  "live": true,
  "watching_now": 132,
  "time_zone": "GMT",
  "utc_offset": "+00:00",
  "today":        { "views": 1840, "viewers": 1210, "most_at_once": 410, "most_at_once_at": "2026-10-29T20:15:03Z",
                    "watch_hours": 612.5, "average_watch_minutes": 20, "data_gb": 210.4 },
  "yesterday":    { … },
  "last_7_days":  { … },
  "last_30_days": { … },
  "this_month":   { … },
  "last_month":   { … },
  "figures_from": "2026-09-29",
  "updated_at": "2026-10-29T20:31:07Z"
}
```

Add `?from=2026-10-01&to=2026-10-31` to the link for that period's `total`
and a `days` list (one entry a day, `no_figures` on days before figures
began). Over more than eight days `viewers_estimated` is true (within about
3 %). The figures are worked out at most once a minute.

Anyone with the link can read the figures (nothing can be changed with it).
If it reaches the wrong people, **Make a new link**: the old one stops working
at once. **Remove** ends it. Deleting the channel, or giving it to another
owner, ends it too, and it stops answering while its owner's account is
disabled. A link may ask for up to 30 custom periods (`?from=&to=`) a minute;
the usual periods are worked out at most once a minute and are not limited.
Links and public counts are only for channels made on the Channels or 24/7
pages.

**All channels' viewer figures**, on the **Channels** page (admins only),
makes one private link with every channel's figures in one file
(`channels`: one entry each, as above). With `?from=&to=` each channel
gives its total for the period; its own link gives the days. It shows every
client's figures, so keep it to yourself.

**Live viewer count on your website**, in the same card, lets anyone read
how many watch the channel now from `/api/v1/public/<channel>/viewers`, for a
"132 watching" on a public page. It updates every 5 seconds and shows nothing
else:

```json
{"stream":"news","live":true,"viewers":132,"peak_today":410,"at":"2026-10-29T19:20:05Z"}
```

Switched off, or for a channel that doesn't exist, it answers `404`.

## Alerts on the dashboard

Unda raises these by itself; each one clears by itself once the cause is gone.

| Alert | Raised when |
|---|---|
| Dropped frames | a viewer, recording or restream destination could not keep up |
| No data | nothing received from the encoder for 5 seconds |
| Bitrate low | the stream fell under half its usual bitrate for 10 seconds |
| Keyframe interval | keyframes further apart than 4 s (critical above 10 s) |
| Reconnects | the encoder reconnected 3 or more times in an hour |
| Near the bandwidth cap | egress above 80% of `limits.max_egress_mbps` |
| Recording disk | the recordings disk is 85% full (critical at 95%) |
| Certificate | the HTTPS certificate is close to expiry and not being renewed |
| CPU high | CPU above 85% for a minute (critical above 95%): streams may stutter |
| Possible leak | the server's memory keeps growing with the same load |
| No sound | a channel has been silent for 10 seconds (critical after a minute), or carries no sound track; see [No sound](#no-sound) |

## No sound

Unda listens to every live channel all the time: the sound viewers get, not a
channel's separate inputs. A channel is silent when its loudest moments stay
below -60 dBFS on both left and right (true silence reads about -91; quiet
speech and room noise are well above -60). After 10 seconds of silence it
raises **No sound**, which turns critical after a minute and clears as soon
as there is sound again. The Multiview shows each channel's level as it
happens.

[![Multiview with sound meters: the field camera has been silent for over five minutes and is marked No sound](/screens/multiview.webp)](/screens/multiview.webp)

```yaml
monitoring:
  silence_alarm_seconds: 10      # 3 to 3600
  # disable_audio_levels: true   # no sound meters and no alarm
```

It needs FFmpeg on the server (as the Multiview pictures do). Each channel
costs a small sound decoder: about 0.5% of a CPU core and 15 MB of memory.

## Messages to Slack, Discord or your own system

Unda can post to webhooks when a stream drops, comes back, or its bitrate
falls below a threshold:

```yaml
alerts:
  min_input_kbps: 1500          # alert under this bitrate; 0 = no bitrate alerts
  bitrate_grace_seconds: 20     # it must stay low this long
  cooldown_seconds: 60          # the same alert for the same stream at most once a minute
  webhooks:
    - name: ops
      url_env: UNDA_ALERT_OPS_URL   # the webhook URL, kept out of this file
```

Put `UNDA_ALERT_OPS_URL=https://hooks.slack.com/…` in `/etc/unda/unda.env`.
Each alert is a JSON `POST` with `event` (`stream_down`, `stream_up`,
`bitrate_low`, `bitrate_recovered`), `stream`, `time` and a readable `text`.

`stream_down` means the encoder's connection ended; Unda cannot tell a network
failure from someone pressing Stop. Stopping a stream from the dashboard and
restarting the server never alert.

## Prometheus and Grafana

`/metrics` serves Prometheus metrics to an **operator** API key:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: unda
    scheme: https
    authorization:
      credentials_file: /etc/prometheus/unda_token   # an operator API key (gsk_…)
    static_configs:
      - targets: ['tv.example.com']
```

Main metrics: `unda_streams_active`, `unda_stream_viewers{stream,protocol}`,
`unda_stream_input_bitrate_bps{stream}`, `unda_egress_bitrate_bps`,
`unda_dropped_frames_total`, `unda_restream_target_up{stream,target}`,
`unda_ffmpeg_restarts_total`, plus memory and CPU (`process_*`, `go_*`).
TR 101 290 errors by check: `unda_udp_input_tr101290_errors_total{input,check}`,
`unda_srt_publisher_tr101290_errors_total{stream,check}`,
`unda_restream_tr101290_errors_total{stream,target,check}` (MPEG-TS
destinations and TV outputs) and the bundles' `unda_mpts_*tr101290*` series.

## Health check

`GET /api/v1/health` answers `{"status":"ok"}` without signing in, for uptime
monitors and load balancers.
