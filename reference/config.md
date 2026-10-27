---
title: "Configuration file reference (unda.yaml)"
description: "Every setting in unda.yaml, the Unda Media Server configuration file, with its default value, and how to keep secrets out of the file."
---

# Configuration file

Unda reads one YAML file: `/etc/unda/unda.yaml` with the installer,
`/etc/unda/unda.yaml` inside the Docker container. Restart Unda after changing
it (`sudo systemctl restart unda`; live encoders reconnect by themselves).

Secrets can stay out of the file: `UNDA_API_TOKEN`, `UNDA_SRT_PASSPHRASE` and
`UNDA_STREAM_KEYS` (or the same names ending in `_FILE`, pointing at a file) in
`/etc/unda/unda.env` override it. Restream, webhook and pull input URLs take
`url_env` or `url_file` instead of `url`.

`api.token` (`UNDA_API_TOKEN`) is deprecated: for scripts and Prometheus,
create an API key under **API keys** in the dashboard instead. While the token is
set, Unda logs a warning at startup and shows one to admins on the Overview.

This is the complete example file, with every setting and its default:

<<< ../shared/unda.example.yaml{yaml}
