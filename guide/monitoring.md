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
- **Events**: the last 200 things that happened: streams starting, stopping
  and reconnecting, viewers joining and leaving, restream, recording and
  adaptive-bitrate changes, alerts. A server restart clears the list.

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
