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
| `GET /api/v1/streams/{name}/sound` | streamer | The stream's sound now: `measured`, `peak` and `rms` (dBFS, left and right), `silent_s`, `no_track`, plus `silence_dbfs` and `alarm_after_s`. `measured` is false for a stream not metered (a channel's inputs). 501 without sound meters (needs FFmpeg) |
| `GET /api/v1/audio/levels` | operator | Every metered stream's sound now (`streams`: the same fields per stream), as Multiview shows it |
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
| `POST /api/v1/playout/channels` | operator | Make a channel: `{"name", "live", "width", "height", "fps", "video_kbps", "filler": "black"\|"video", "filler_file", "timezone"}` (all but the name optional). It starts at once with an empty playlist (filler). 409 if the name is taken |
| `GET /api/v1/playout/channels/{name}/settings` | operator | The channel's settings and `origin` (`dashboard`, or `config` for unda.yaml) |
| `PUT /api/v1/playout/channels/{name}` | operator | New settings for a dashboard channel (it restarts; the schedule is kept). 409 for a channel from unda.yaml |
| `DELETE /api/v1/playout/channels/{name}` | operator | Delete a dashboard channel and its schedule (the as-run log is kept) |
| `GET /api/v1/playout/channels/{name}/schedule` | operator | The playlist: `timezone`, `repeat` (`loop`), `start_at`, `since`, `items` (`media`, `title`, `description`, `in`, `out`, and `at` + `days`, or `after`), `version`, `writable`, `error` if the file can't be used now. A schedule of times of day or dates is shown as the playlist that plays the same (`converted`) |
| `PUT /api/v1/playout/channels/{name}/schedule` | operator | Save the whole playlist with the `version` you read. 400 lists the problems (`problems`, one per item); 409 if it changed since that version, or the server can't write the file. The channel follows it at once |
| `POST /api/v1/playout/channels/{name}/schedule/preview` | operator | What a playlist would play if saved (nothing is saved): today's `slots` (`start`, `end`, `item`, `fixed`), `next` (when each item next starts, up to 8 days ahead), `on_air`, `round_s` |
| `POST /api/v1/playout/channels/{name}/skip` | operator | `{"action": "next"\|"previous"\|"play", "item": N}`: move the loop on air (`play`: loop item N, 0-based). 409 while a fixed-time item is on air, or while the channel is paused |
| `POST /api/v1/playout/channels/{name}/pause` | operator | Take the channel off air: `state` `paused`, with `paused_at`, `paused_by` and, for a looping playlist, `resume` (`item`, `media`, `title`, `position_seconds`: where it carries on). Kept across restarts (until the next start for a channel from unda.yaml); audited. The preview of a paused channel's playlist has `paused` and `resume`, `on_air` -1, and no `next` for loop items |
| `POST /api/v1/playout/channels/{name}/resume` | operator | Back on air; a looping playlist carries on where it was paused. 409 while the licence allows no more live streams; audited |
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

## WebRTC (WHIP and WHEP)

[WebRTC](/guide/webrtc), standard WHIP (RFC 9725) and WHEP. Not under `/api/v1` and not behind an account: a WHIP publisher shows its stream key, a WHEP player its playback token, each as `Authorization: Bearer …` (refused over plain HTTP, 403 `https_required`). Any origin may call them (CORS); `Location`, `ETag`, `Link` and `Accept-Patch` are readable.

| Method and path | Who | |
|---|---|---|
| `POST /whip/{name}` | publisher (stream key) | SDP offer (`application/sdp`, H.264 video, Opus audio) → **201** with the SDP answer, `Location` (the session), `ETag` and one `Link: <turn:…>; rel="ice-server"; username=…; credential=…` per STUN/TURN server. 401 wrong key, 403 another stream's key or not licensed, 409 already live, 406 no video, 503 too many publishers. The stream goes live once media arrives |
| `POST /webrtc/{name}` | viewer (token if protected) | SDP offer → **201** with the answer, `Location` and `Link` headers as above. 403 link refused, 404 not live, 409 link in use on its allowed devices, 503 too many viewers or the outbound cap reached |
| `PATCH /whip/resource/{id}`, `PATCH /webrtc/resource/{id}` | the session | Trickle ICE candidates (`application/trickle-ice-sdpfrag`, `If-Match` the `ETag`); 204. ICE restarts are not supported (501) |
| `DELETE /whip/resource/{id}`, `DELETE /webrtc/resource/{id}` | the session | Ends it; 200 |

## Channel inputs

[Channel inputs](/guide/channel-inputs): a channel ranks its live encoder (`live`: `{name}.main`, then `{name}.backup`), its pull stream (`pull`: `{name}.pull`) and its playlist (`playlist`: `{name}.loop`); the first with pictures is published as `{name}`. Streamers reach their own channels only.

| Method and path | Role | |
|---|---|---|
| `GET /api/v1/streams/{name}/inputs` | streamer | `enabled`, `mode` (`splice` = direct, `seamless`), `order`, the timings (`stall_ms`, `return_seconds`, `idle_stop_seconds`), `slate` (`playlist` or `video` with `slate_file`), the seamless picture settings, `running`; while running in direct mode `splice`: `current`, `role`, `switches`, `restarts`, `last_switch` and `inputs` (each `on_air`/`standby`/`no_signal`), in seamless mode `status` as under backup sources below; `pull` (the channel's pull input, its address shortened), `has_backup_key`, `licensed` (`inputs`, `pull`, `playlist`, `seamless`), `can_operate` |
| `PUT /api/v1/streams/{name}/inputs` | streamer | Any of `enabled`, `order` (e.g. `["pull","live","playlist"]`; an input left out is off), the timings, `slate`/`slate_file`; operators also `mode`, `sources` (extra streams after these) and `width`, `height`, `fps`, `video_kbps`. 403 when a streamer sends an operator's field or the licence lacks an option. In direct mode a running channel takes new settings without restarting; a new mode, or new settings in seamless mode, restart the stream |
| `PUT /api/v1/streams/{name}/inputs/pull` | streamer | `{"url":"https://example.com/live/index.m3u8"}` (optional `rtsp_transport`, `user_agent`). A streamer's address must be `http://` or `https://` on the public internet (400 otherwise; host names are checked at every connection); an operator's may be anything a [pull input](#pull-inputs) takes |
| `DELETE /api/v1/streams/{name}/inputs/pull` | streamer | Remove the channel's pull address; 204 |

The playlist is `GET`/`PUT …/failover/playlist` and `POST …/failover/switch` (operator) puts an input on air ahead of the others in both modes (`{"source":"main-show.pull"}`). Audit: `inputs_changed`, `channel_pull_set`, `channel_pull_removed` (never the address).

## Programme guide

The [programme guide](/guide/playout#programme-guide): a 24/7 channel's comes from its playlist, a live channel's is [typed in](/guide/playout#live-channels-a-typed-in-guide). Part of the licence's playout feature. Streamers reach their own channels only.

| Method and path | Role | |
|---|---|---|
| `GET /api/v1/streams/{name}/guide` | streamer | A live channel's typed-in guide: `timezone`, `between` (what the guide shows between programmes), `programmes` (`at`: `"19:00"` or `"2026-10-25 15:00"`, `days`: `["mon","fri"]`, `title`, `description`, `length` in seconds), `version`, `plan` (`today` in the guide's zone, and `next`: when each programme is next on air or `on_now`, `null` when not in the next 8 days), `can_edit`. 404 for a stream that isn't a channel (`"code":"playout_channel"` for a 24/7 channel) |
| `PUT /api/v1/streams/{name}/guide` | streamer | Save it with the `version` you read (`""` when it had none). 400 names the problems (one line per programme); 409 if it changed since. No programmes and no `between` removes it. Audit `live_guide_saved` |
| `POST /api/v1/streams/{name}/guide/preview` | streamer | The `plan` of an unsaved guide, or its `problems`; nothing is saved |
| `GET /api/v1/epg` | streamer | Every channel's programmes (`kind`: `playout` or `live`; `between` marks a live channel's time between programmes) from `from` to `to` (RFC 3339; default today from midnight UTC; at most 8 days) |
| `GET /api/v1/epg/link` | streamer | Your XMLTV link (`path`, `enabled`) |
| `POST /api/v1/epg/link/rotate` | admin | New links for everyone: every link given out before stops working |
| `GET`/`PUT /api/v1/epg/settings` | admin | `{"xmltv": true\|false}` |
| `GET /epg/{token}/xmltv.xml` (or `.xml.gz`) | the link | XMLTV for IPTV apps: no sign-in, the link is the key. 404 when it is wrong, replaced or switched off |

## Backup sources (failover)

[Backup encoder](/guide/backup-encoder): the older form of the routes above, kept for existing scripts (a channel first switched on here gets seamless switching): with backup sources on, a channel's key publishes to `{name}.main`, its backup key to `{name}.backup`, and the server publishes `{name}` from the first source with pictures.

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
| `GET /api/v1/channels` | streamer | Channels you can see: whether each is live, its owner (`owner_id`, `owner_email`, `owner_name`), and for an offline one `last_live_at` (when it last stopped, while the event log still has it: 30 days) |
| `POST /api/v1/channels` | streamer | `{"name":"main-show"}` (operators and above may add `"owner_id"`) |
| `PATCH /api/v1/channels/{name}` | admin | `{"owner_id": 12}` gives the channel to that account, `0` to the house. Its keys stay the same; audited |
| `GET /api/v1/channels/{name}` | streamer | One channel, as in the list (no key) |
| `GET /api/v1/channels/{name}/key` | streamer | The channel's stream key |
| `POST /api/v1/channels/{name}/rotate` | streamer | A new key; a stream using the old one is disconnected |
| `DELETE /api/v1/channels/{name}` | streamer | Delete the channel |
| `POST /api/v1/channels/{name}/pause` | streamer | Take the channel off air: a live encoder is disconnected (`disconnected`), its keys (the backup key too) are refused until it is resumed, and its inputs stop. The channel shows `paused_at` and `paused_by` (to a client, `the server's staff` when staff paused it); kept across restarts; audited. Pausing a paused channel changes nothing |
| `POST /api/v1/channels/{name}/resume` | streamer | Its keys work again (encoders reconnect by themselves) and its inputs start; audited |

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

## Pull inputs

Streams Unda fetches from elsewhere ([guide](/guide/pull-inputs)). The address
is never returned: `url` in answers is its shortened form. A channel's own
pull (`{channel}.pull`, set under [channel inputs](#channel-inputs)) is listed
here too, with `channel` and `guarded` (fetched through the public-only
guard).

| Method and path | Role | |
|---|---|---|
| `GET /api/v1/pull/inputs` | operator | Inputs with their state (`live`, `reconnecting`, `connecting`, `retrying`, `unsupported`, `blocked`, `not_licensed`, `paused`), the reason in plain words, the last error, reconnects and what is converted |
| `POST /api/v1/pull/inputs` | operator | `{"name":"news","url":"https://example.com/live/index.m3u8"}`; optional `transcode_video`, `rtsp_transport` (`tcp`/`udp`), `user_agent`, `timeout_seconds` (2-600, default 10), `paused` |
| `PATCH /api/v1/pull/inputs/{name}` | operator | Change any of those, e.g. `{"paused":true}`; a new `url` restarts the input |
| `DELETE /api/v1/pull/inputs/{name}` | operator | Remove an input (its stream ends) |

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
| `POST /api/v1/mpts` | operator | `{"name":"bundle","url":"udp://239.2.2.1:6000","total_kbps":12000,"programs":[{"stream":"cam","program":1,"name":"Channel 1","bitrate_kbps":4000}]}`; add `"no_epg":true` to send no now/next for playout channels |
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
