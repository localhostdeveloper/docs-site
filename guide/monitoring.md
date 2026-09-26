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
- **Events**: the last 200 things that happened: streams starting, stopping
  and reconnecting, viewers joining and leaving, restream, recording and
  adaptive-bitrate changes, alerts. A server restart clears the list.

## Viewer sessions

**Sessions** in the sidebar (operators and above) lists every player watching
a stream over HLS, DASH, RTMP or SRT: the stream, the protocol, the viewer's
address, the player (for example "Chrome 129 · Windows", "VLC 3.0.23",
"Apple player (iOS)"), when it started, how long it lasted, how much it was
sent and its average rate.

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

## Health check

`GET /api/v1/health` answers `{"status":"ok"}` without signing in, for uptime
monitors and load balancers.
