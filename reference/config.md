# Configuration file

Unda reads one YAML file: `/etc/unda/unda.yaml` with the installer,
`/etc/unda/unda.yaml` inside the Docker container. Restart Unda after changing
it (`sudo systemctl restart unda`; live encoders reconnect by themselves).

Secrets can stay out of the file: `UNDA_API_TOKEN`, `UNDA_SRT_PASSPHRASE` and
`UNDA_STREAM_KEYS` (or the same names ending in `_FILE`, pointing at a file) in
`/etc/unda/unda.env` override it. Restream and webhook URLs take `url_env` or
`url_file` instead of `url`.

This is the complete example file, with every setting and its default:

<<< ../shared/unda.example.yaml{yaml}
