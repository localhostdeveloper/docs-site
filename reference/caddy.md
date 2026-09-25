# Caddy in front

These are the ready-made files for running Unda behind [Caddy](https://caddyserver.com)
with Docker, as described in the install guide's
[HTTPS options](/guide/install#2-https-options). Caddy gets the certificate and
Unda listens only for Caddy. The same files are in the `caddy/` folder of each
release.

## docker-compose.yml

<<< ../shared/caddy/docker-compose.yml{yaml}

## Caddyfile

<<< ../shared/caddy/Caddyfile

## unda.yaml

<<< ../shared/caddy/unda.yaml{yaml}
