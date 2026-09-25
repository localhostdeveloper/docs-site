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

## Restreaming

| Method and path | Role | |
|---|---|---|
| `GET /api/v1/streams/{name}/push` | streamer | Destinations with their state and last error (URLs shown with the key hidden) |
| `POST /api/v1/streams/{name}/push` | streamer | `{"name":"youtube","url":"rtmp://a.rtmp.youtube.com/live2/KEY"}` |
| `DELETE /api/v1/streams/{name}/push/{id}` | streamer | Remove a destination; returns once it is disconnected |

```bash
curl -X POST -H "Authorization: Bearer $KEY" \
     -d '{"name":"youtube","url":"rtmp://a.rtmp.youtube.com/live2/YOUR-KEY"}' \
     https://tv.example.com/api/v1/streams/main-show/push
```

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
| `GET /api/v1/events?limit=20&before=<id>` | streamer | Recent events, newest first |
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
