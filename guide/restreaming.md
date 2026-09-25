# Restreaming

Send a live stream to other platforms at the same time: YouTube, Facebook,
Twitch, another Unda server, anything that takes RTMP, RTMPS, SRT or UDP.

## From the dashboard

Open the stream, **Restream** tab, add a destination with a name and its full
URL, key included:

| Platform | URL |
|---|---|
| YouTube | `rtmp://a.rtmp.youtube.com/live2/YOUR-STREAM-KEY` |
| Facebook | `rtmps://live-api-s.facebook.com:443/rtmp/YOUR-STREAM-KEY` |
| Twitch | `rtmp://live.twitch.tv/app/YOUR-STREAM-KEY` |
| Another server over SRT | `srt://host:port?streamid=...&passphrase=...` |
| A local network over UDP | `udp://239.1.1.10:5000` |

Use the exact URL and key the platform gives you.

## How it behaves

- It starts straight away and keeps going for as long as the stream is live.
  If the stream stops, the destination waits and resumes by itself when the
  stream comes back.
- A destination that fails is retried after 5 s, 10 s, 30 s, then every minute.
  One failing destination never affects the others or your viewers.
- Each destination's state (connecting, live, retrying) and last error are
  shown on the Restream tab.
- **Your platform keys stay secret:** after you add a destination, the dashboard,
  the API and the logs only ever show it as `rtmp://a.rtmp.youtube.com/live2/****`.
- Destinations added in the dashboard last until the server restarts. For
  permanent ones, list them in the configuration file under `restream.targets`
  (the URL can come from an environment variable or a file, to keep the key
  out of the configuration).

Streamers can restream their own channels; operators and above any stream.
