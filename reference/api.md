# REST API

Everything the dashboard does goes through this API, so scripts can do it too.
All requests and responses are JSON.

## Authentication

Create an API key in the dashboard under **API keys** (admins), with the role
it should have, and send it on every request:

```bash
KEY=gsk_…
curl -H "Authorization: Bearer $KEY" https://tv.example.com/api/v1/streams
```

A key can do what its role can do (see [roles](/guide/accounts#roles)). A
streamer's key sees only that streamer's channels; any other stream answers
`404`. Repeated wrong keys from one address are refused with `429` for a while.

Only `GET /api/v1/health` works without a key.

Recording, adaptive bitrate, UDP inputs and adding restream destinations also need
the feature in your [license](/guide/license); without it they answer `403`.

## Streams

| Method and path | Role | |
|---|---|---|
| `GET /api/v1/streams` | streamer | Live streams: codec, resolution, bitrate, viewers by protocol, health, recording, adaptive bitrate |
| `GET /api/v1/streams/{name}` | streamer | One stream |
| `DELETE /api/v1/streams/{name}` | operator | Disconnect the encoder (it may reconnect by itself) |
| `GET /api/v1/streams/{name}/consumers` | streamer | Everything reading the stream, and who is dropping frames |
| `GET /api/v1/streams/{name}/thumbnail` | streamer | A JPEG of the latest keyframe (needs FFmpeg) |
| `GET` / `POST /api/v1/streams/{name}/record` | operator | Recording status / `{"action":"start"}` or `{"action":"stop"}` |
| `PUT /api/v1/streams/{name}/transcode` | operator | `{"enabled": true}` turns adaptive bitrate on for this stream |

## Viewer sessions

| Method and path | Role | |
|---|---|---|
| `GET /api/v1/sessions` | operator | Sessions running now: stream, protocol, ip, user_agent, started_at, duration_seconds, bytes |
| `GET /api/v1/sessions/history` | operator | Finished sessions, a page at a time (`limit` up to 500, `offset`), with `total`; `?format=csv` downloads them |
| `GET /api/v1/sessions/summary?by=stream` | operator | Totals per stream (`by=ip`: per viewer address): sessions, active, distinct, view_seconds, bytes, protocols |

Filters for all three: `stream`, `protocol` (`hls`, `dash`, `rtmp`, `srt`),
`ip` (address prefix), `agent` (player contains), `from` and `to` (start time,
RFC 3339 or unix seconds), `min_duration` (seconds), `sort` (`started`,
`duration`, `bytes`).

## Recordings

| Method and path | Role | |
|---|---|---|
| `GET /api/v1/recordings[?stream=]` | operator | Recorded files, newest first: stream, name, size, start, length, whether it is still being written; plus the total size and retention |
| `GET /api/v1/recordings/{stream}/{file}` | operator | The file itself (supports `Range`); add `?download=1` to save it |
| `GET /api/v1/recordings/{stream}/{file}/index.m3u8` | operator | An HLS playlist over the file, for playing and seeking in a browser |
| `DELETE /api/v1/recordings/{stream}/{file}` | operator | Delete a recording (not the one being written: 409) |

## 24/7 channels (playout)

| Method and path | Role | |
|---|---|---|
| `GET /api/v1/playout/channels` | operator | Every channel: state, what is on air (and where in the file), the live input, the next items, the schedule's state and problems, the encoder |
| `GET /api/v1/playout/channels/{name}` | operator | One channel |
| `GET /api/v1/playout/channels/{name}/asrun` | operator | What went on air, newest first; `from`, `to` (RFC 3339 or unix seconds), `limit`; `?format=csv` downloads it |
| `GET /api/v1/media` | operator | The media folder: files (length, size, codecs, `state` ready/checking/error, `on_air`/`scheduled` channels), unfinished uploads, space |
| `GET /api/v1/media/{name}` | operator | One file |
| `DELETE /api/v1/media/{name}` | operator | Delete a file; 409 while it is on air. The answer lists channels whose schedule still names it |
| `POST /api/v1/media/uploads` | operator | `{"name","size","fingerprint"}` starts an upload (201), or returns the unfinished upload of the same file (200) to resume |
| `GET /api/v1/media/uploads/{id}` | operator | Where an upload is (`offset`) |
| `PUT /api/v1/media/uploads/{id}?offset=N` | operator | The file's bytes from `N` (at most 16 MB per request). A wrong offset is 409 with the right one. The last piece answers `done` and the file once it is checked (422 if it isn't playable video) |
| `DELETE /api/v1/media/uploads/{id}` | operator | Cancel an upload |

## Restreaming

| Method and path | Role | |
|---|---|---|
| `GET /api/v1/streams/{name}/push` | streamer | Destinations with their state (`live` only once the destination accepted the stream), `last_error` in plain words, `error_detail` (the underlying error), `failing_since`, and `paused_reason` when the server switched a destination off after 30 minutes of failures (URLs shown with the key hidden) |
| `POST /api/v1/streams/{name}/push` | streamer | `{"name":"youtube","url":"rtmp://a.rtmp.youtube.com/live2/KEY"}` |
| `PATCH /api/v1/streams/{name}/push/{id}` | streamer | `{"paused": true}` stops sending but keeps the destination; `{"paused": false}` starts it again |
| `DELETE /api/v1/streams/{name}/push/{id}` | streamer | Remove a destination; returns once it is disconnected |

```bash
curl -X POST -H "Authorization: Bearer $KEY" \
     -d '{"name":"youtube","url":"rtmp://a.rtmp.youtube.com/live2/YOUR-KEY"}' \
     https://tv.example.com/api/v1/streams/main-show/push
```

## Playback protection

[Signed links](/guide/protect-playback): a protected stream plays only with `?token=`. A playback request from a device a link was taken from answers **409** (403 is a missing, wrong or expired link).

| Method and path | Role | |
|---|---|---|
| `GET /api/v1/streams/{name}/playback` | streamer | `{"protected", "stream", "all", "devices_per_link", "pushed_off_24h"}`: whether a link is needed (set on this stream, or for every stream), how many devices one link may play on at once (0 = unlimited), and how many devices were stopped in the last 24 hours because a link was opened on more |
| `PUT /api/v1/streams/{name}/playback` | streamer | `{"protected": true}` requires a signed link for this stream (it need not be live); `{"devices_per_link": 1}` (0–99) limits every link to that many devices at once, the newest winning. Either or both |
| `POST /api/v1/streams/{name}/playback-link` | streamer | `{"ttl_seconds": 7200, "devices": 1}` (60 s to 30 days, default 1 hour; devices 0 = the stream's setting, 1–99) → `{"token", "expires_at", "devices"}`: the latest time a viewer can start |
| `GET /api/v1/playback` | admin | `{"protect_all", "streams"}` |
| `PUT /api/v1/playback` | admin | `{"protect_all": true}` protects every stream |
| `GET /api/v1/playback/secret` | admin | The signing secret (hex) for a website that makes its own links; audited |
| `POST /api/v1/playback/secret/rotate` | admin | A new secret; every link made before stops working; audited |

## Backup sources (failover)

[Backup encoder](/guide/backup-encoder): with backup sources on, a channel's key publishes to `{name}.main`, its backup key to `{name}.backup`, and the server publishes `{name}` from the first source with pictures.

| Method and path | Role | |
|---|---|---|
| `GET /api/v1/streams/{name}/failover` | streamer | The settings (`enabled`, `sources` after main and backup, `stall_ms`, `return_seconds`, `idle_stop_seconds` (0 = always on), `slate` `black`/`video` with `slate_file`, `width`, `height`, `fps`, `video_kbps`), `running`, and while running `status`: `current` (the source on air, `""` = the slate), `forced`, `switches` and `sources` (each with `state` `offline`/`starting`/`standby`/`on_air`/`stalled`, `last_picture`, `steady_seconds`) |
| `PUT /api/v1/streams/{name}/failover` | operator | Any of the settings; the rest stay. `{"enabled": true}` switches on (a live encoder reconnects once; the channel gets a backup key). Saving while it runs restarts the stream |
| `POST /api/v1/streams/{name}/failover/switch` | operator | `{"source": "main-show.backup"}` puts that source on air ahead of the others while it has pictures; `""` = the automatic order |
| `GET /api/v1/streams/{name}/failover/log` | streamer | The switches, newest first (`?limit=`, `?format=csv`) |
| `GET /api/v1/channels/{name}/backup-key` | streamer | The channel's backup key; audited |
| `POST /api/v1/channels/{name}/backup-key/rotate` | streamer | A new backup key; a backup encoder using the old one is disconnected |

## Channels

| Method and path | Role | |
|---|---|---|
| `GET /api/v1/channels` | streamer | Channels you can see, with whether each is live |
| `POST /api/v1/channels` | streamer | `{"name":"main-show"}` (operators and above may add `"owner_id"`) |
| `GET /api/v1/channels/{name}/key` | streamer | The channel's stream key |
| `POST /api/v1/channels/{name}/rotate` | streamer | A new key; a stream using the old one is disconnected |
| `DELETE /api/v1/channels/{name}` | streamer | Delete the channel |

## Monitoring

| Method and path | Role | |
|---|---|---|
| `GET /api/v1/health` | none | `{"status":"ok"}` |
| `GET /api/v1/alerts` | streamer | Open alerts, then those resolved in the last 10 minutes |
| `GET /api/v1/events?limit=20&before=<id>` | streamer | Events, newest first, kept 30 days in the database (`before` pages back through them). A line that repeats within an hour is one entry with `count` and `first_ts`; a repeat replaces the earlier line (`replaces` names it) |
| `GET /api/v1/metrics/history?metric=egress&range=1h` | streamer | The last hour, one point every 5 s. `metric`: `ingest`, `egress`, `viewers`, `heap`, `goroutines`, `bitrate` (with `stream=`); `range`: `5m`, `15m`, `30m`, `1h` |
| `GET /api/v1/metrics/peaks` | streamer | Today's peak viewers, overall and per stream |
| `GET /api/v1/live` | streamer | A live feed (Server-Sent Events): a heartbeat every 5 s and each event as it happens |
| `GET /api/v1/server` | streamer | Ports, addresses and limits in force |
| `GET /metrics` | operator | Prometheus metrics |

## UDP inputs

| Method and path | Role | |
|---|---|---|
| `GET /api/v1/udp/inputs` | operator | Inputs with packet counts and loss |
| `POST /api/v1/udp/inputs` | operator | `{"name":"sat-feed","listen":":5001","allow":["192.168.1.20"]}` or `{"name":"…","multicast":"239.1.1.1:5000","interface":"eth1"}` |
| `DELETE /api/v1/udp/inputs/{name}` | operator | Remove an input |

## Multi-channel (MPTS)

| Method and path | Role | |
|---|---|---|
| `GET /api/v1/mpts/inputs` | operator | Bundles being received, with their channels, state, bitrates and TR 101 290 counts |
| `GET /api/v1/mpts/inputs/{name}/programs` | operator | The channels a bundle carries: number, name, provider, PMT and PCR PIDs, and each track's PID, codec and language |
| `POST /api/v1/mpts/inputs` | operator | `{"name":"sat","source":"udp://239.1.1.1:5000","programs":[{"program":101,"stream":"sports-hd"}]}`; add `"discover_only":true` to only list the channels |
| `DELETE /api/v1/mpts/inputs/{name}` | operator | Stop receiving a bundle (its channels' streams end) |
| `PUT /api/v1/mpts/inputs/{name}/programs/{program}` | operator | Publish one channel of a running bundle: `{"stream":"sports-hd"}` (optional `audio_pid`, `audio_language`, `transcode_video`); changes only that channel |
| `DELETE /api/v1/mpts/inputs/{name}/programs/{program}` | operator | Stop publishing that channel (the bundle keeps running) |
| `GET /api/v1/mpts` | operator | Bundles being sent, with their channels and TR 101 290 counts |
| `POST /api/v1/mpts` | operator | `{"name":"bundle","url":"udp://239.2.2.1:6000","total_kbps":12000,"programs":[{"stream":"cam","program":1,"name":"Channel 1","bitrate_kbps":4000}]}` |
| `POST /api/v1/mpts/{name}/programs` | operator | Add a channel to a running bundle |
| `DELETE /api/v1/mpts/{name}/programs/{program}` | operator | Remove a channel from a running bundle |
| `DELETE /api/v1/mpts/{name}` | operator | Stop sending a bundle |

## Users and security

| Method and path | Role | |
|---|---|---|
| `GET /api/v1/users` | admin | Users and pending invites |
| `POST /api/v1/users/invite` | admin | `{"email":"…","role":"streamer","channel_quota":3}` → an invite link |
| `DELETE /api/v1/pending-invites/{id}` | admin | Withdraw an invite |
| `PATCH /api/v1/users/{id}` | admin | Any of `role`, `disabled`, `channel_quota`, `name` |
| `POST /api/v1/users/{id}/signout` | admin | End that person's sessions |
| `POST /api/v1/users/{id}/reset-2fa` | admin | Remove their two-factor setup |
| `GET` / `POST /api/v1/apikeys`, `DELETE /api/v1/apikeys/{id}` | admin | API keys; `POST {"name":"grafana","role":"operator"}` shows the key once |
| `GET /api/v1/audit` | admin | Audit log |
| `GET` / `PUT /api/v1/settings/security` | admin | Which roles must use two-factor sign-in |

## License and support access

| Method and path | Role | |
|---|---|---|
| `GET /api/v1/license` | operator | State, limits, features, usage |
| `PUT /api/v1/license` | owner | The license file as the request body |
| `GET` / `POST` / `DELETE /api/v1/support-access` | owner | Vendor support access: `POST {"email":"…","hours":72}` |

## Legacy stream keys

`GET` / `POST /api/v1/keys` and `DELETE /api/v1/keys/{key}` manage keys from the
configuration file's `streams.keys`, which publish under their own name. Use
channels instead; changes here last until the next restart.
