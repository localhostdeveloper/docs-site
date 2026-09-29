# Installing Unda

This guide takes you from a fresh Linux server to your first live stream, with
your team signed in. It is written for the person who runs the server.

You need:

- a Linux server (4 vCPU, 8 GB RAM and 100 Mbit/s+ upload are enough for about
  ten 720p streams and a few hundred viewers without transcoding);
- a DNS name pointing at it, e.g. `tv.example.com` (needed for HTTPS);
- the Unda **Docker image** or **binary** from your vendor, and your
  **license file** (`something.license.json`). Without a license Unda runs
  in evaluation mode: everything works, up to 2 live streams and 2 accounts
  besides the owner.

Steps:

1. [Install](#1-install): Docker **or** a binary with systemd
2. [HTTPS options](#2-https-options): built in (Let's Encrypt), Caddy, nginx or your own certificate
3. [Create the owner account](#3-create-the-owner-account)
4. [Install the license](#4-install-the-license)
5. [Invite your team](#5-invite-your-team)
6. [First stream](#6-first-stream)
7. [Firewall](#7-firewall)
8. [Backups and upgrades](#8-backups-and-upgrades)
9. [If someone is locked out](#9-if-someone-is-locked-out)
10. [Support access for your vendor](#10-support-access-for-your-vendor)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Install

**Quickest (Ubuntu/Debian):** one command downloads, verifies and installs
everything, with HTTPS. Your vendor gives you the exact address:

```bash
curl -fsSL https://RELEASE-URL/install.sh | sudo bash -s -- --domain tv.example.com --email you@example.com
```

It stops before changing anything if a port is taken or a download does not
match its checksum. `--help` lists the options (`--staging`,
`--with-ffmpeg`, the port options, `--cert-file`). The manual ways follow.

**Another program already holds ports 80 and 443** (a web server, another
media server)? Let's Encrypt can then not reach Unda. Give Unda other ports
and a certificate file instead: see "Sharing a server" in [section 2](#2-https-options).

Pick one: **Docker** (A) or **binary + systemd** (B). Both get HTTPS certificates
from Let's Encrypt automatically, with nothing else to install. Replace
`tv.example.com` with your domain, and point its DNS (an `A` record) at the
server **before** the first start. Let's Encrypt checks the domain by
connecting to it on ports 443 and 80.

(Prefer a reverse proxy? [Section 2](#2-https-options) has Caddy and nginx.)

### A. Docker

Create a directory, e.g. `/opt/unda`, with these two files.

`docker-compose.yml`:

```yaml
services:
  unda:
    image: REGISTRY/unda:VERSION        # from your vendor
    restart: unless-stopped
    ports:
      - "443:8443"          # HTTPS: dashboard, watch pages, HLS
      - "80:8080"           # HTTP: redirects to HTTPS, answers Let's Encrypt
      - "1935:1935"         # RTMP (encoders)
      - "6000:6000/udp"     # SRT (encoders, optional)
    volumes:
      - unda-data:/data
      - ./unda.yaml:/etc/unda/unda.yaml:ro
    read_only: true
    tmpfs: [/tmp]
    cap_drop: [ALL]
    security_opt: [no-new-privileges:true]
    ulimits:
      nofile: 65536

volumes:
  unda-data:
```

`unda.yaml`:

```yaml
server:
  rtmp_addr: ":1935"
  http_addr: ":8443"                   # published as 443
  http_redirect_addr: ":8080"          # published as 80
  tls:
    letsencrypt:
      domains: [tv.example.com]
      email: ops@example.com           # optional: expiry notices
log:
  level: info
paths:
  recordings_dir: /data/recordings
  hls_dir: /data/hls
  data_dir: /data/state                # accounts, channels, license, certificates: back this up
srt:
  addr: ":6000"
```

Start it:

```bash
docker compose up -d
docker compose logs unda | grep -E 'certificate ready|could not get|setup_link'
```

`certificate ready` means HTTPS works. Keep the `setup_link` line; you need it
in step 3.

Admin commands (used below) run inside the container:

```bash
docker compose exec unda unda admin -config /etc/unda/unda.yaml list-users
```

### B. Binary + systemd

```bash
# the binary from your vendor
sudo install -m 755 unda /usr/local/bin/unda
sudo useradd --system --no-create-home --shell /usr/sbin/nologin unda
sudo install -d -o unda -g unda -m 750 /var/lib/unda
sudo install -d /etc/unda
sudo install -m 644 unda.service /etc/systemd/system/unda.service   # shipped with the binary
sudo touch /etc/unda/unda.env && sudo chmod 640 /etc/unda/unda.env \
  && sudo chown root:unda /etc/unda/unda.env   # optional secrets; may stay empty
```

`/etc/unda/unda.yaml`:

```yaml
server:
  rtmp_addr: ":1935"
  http_addr: ":443"
  http_redirect_addr: ":80"            # redirects to HTTPS, answers Let's Encrypt
  tls:
    letsencrypt:
      domains: [tv.example.com]
      email: ops@example.com           # optional: expiry notices
log:
  level: info
paths:
  recordings_dir: /var/lib/unda/recordings
  hls_dir: /var/lib/unda/hls
  data_dir: /var/lib/unda/state        # accounts, channels, license, certificates: back this up
srt:
  addr: ":6000"
```

The service may bind ports 443 and 80 (`CAP_NET_BIND_SERVICE` in
`unda.service`), and nothing more.

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now unda
sudo journalctl -u unda | grep -E 'certificate ready|could not get|setup_link'
```

`certificate ready` means HTTPS works. Keep the `setup_link` line; you need it
in step 3.

Admin commands always run **as the `unda` user**. As root they can leave files
in the data directory that the server can no longer open:

```bash
sudo -u unda unda admin -config /etc/unda/unda.yaml list-users
```

Transcoding (adaptive quality for viewers) needs FFmpeg on the server
(`sudo apt install ffmpeg`, or `install.sh --with-ffmpeg`); the Docker image
already has it. Turn it on in the dashboard under **Server → Transcoding**, which
lists the encoders this server has (the CPU, and NVIDIA, Intel or other GPUs),
each tested. On an NVIDIA server, install the NVIDIA driver first so
`nvidia-smi` works, and use an FFmpeg built with NVENC.

---

## 2. HTTPS options

People sign in with an email and a password, so Unda **refuses a sign-in over
plain HTTP from another machine**: anyone on the network could read the
password. Section 1 already sets up HTTPS the built-in way. The details, and
the alternatives:

**Built-in Let's Encrypt (section 1):**

- **Getting the certificate:**
  - on the first start, Unda asks Let's Encrypt for a certificate for each
    domain in `server.tls.letsencrypt.domains`;
  - Let's Encrypt checks you control the domain by connecting on port 443 or 80;
  - the certificate is stored in `<data_dir>/acme`.
- **Renewal** happens on its own, well before expiry, with no restart.
- **The dashboard's Server page** shows each certificate's expiry. An alert
  opens if renewal fails for long enough to matter.
- **Trying a setup first?** Add `directory_url: staging`. You get Let's
  Encrypt's test certificates, which browsers warn about, without using up the
  real rate limits (5 certificates per domain set per week). Remove the line
  and the `<data_dir>/acme` folder when it works.
- **Behind a router or firewall:** forward public ports 443 and 80 to the
  server. At least one must reach it: 443 to `http_addr`, or 80 to
  `http_redirect_addr`.
- **Wildcard certificates** (`*.example.com`) are not supported. List each
  name instead.

**Caddy in front.** Ready-made files are in [deploy/caddy/](caddy/) (Docker).
Caddy gets the certificate; Unda listens only for Caddy. Leave out
`server.tls` and list Caddy in `server.trusted_proxies`; otherwise Unda
ignores its headers and treats every browser as plain HTTP.

On a systemd install:

```bash
sudo apt install caddy
printf 'tv.example.com {\n    reverse_proxy 127.0.0.1:8080\n}\n' | sudo tee /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Then in `unda.yaml`:

```yaml
server:
  http_addr: "127.0.0.1:8080"
  trusted_proxies: ["127.0.0.1/32", "::1/128"]
```

**nginx instead of Caddy.** Keep the `Host` header, turn off buffering so
the dashboard's live updates flow, and allow 16 MB request bodies (media
uploads arrive in 8 MB pieces):

```nginx
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_buffering off;
    proxy_request_buffering off;
    client_max_body_size 16m;
    proxy_read_timeout 1h;
}
```

**Your own certificate files.** Set `server.tls.cert_file` and `key_file`
(e.g. certbot's `fullchain.pem` / `privkey.pem`, readable by the service user)
instead of `letsencrypt`. Unda re-reads the files when they are renewed.
`install.sh --cert-file F --key-file F` does this for you: it checks the pair
(the key matches, the certificate names your domain and has not expired),
copies it to `/etc/unda/tls` so the `unda` user can read it, and installs
`unda-cert-sync.timer`, which copies it again daily when the source changes.
One combined PEM can be given as `--cert-file` alone.

**Sharing a server with a program that holds ports 80 and 443.** Unda then
runs on other ports (e.g. HTTPS 8443, RTMP 1936) with a certificate file. Where
the certificate comes from is up to you, from most to least independent:

1. **Unda's own, through DNS** (recommended): certbot proves the domain with a
   DNS record instead of a port, so it works whatever holds 80 and 443. Use a
   name of its own, e.g. `unda.example.com` (an `A` record to this server).
   With a DNS provider that has a certbot plugin, renewal is automatic, e.g.
   Cloudflare (an API token with *Zone: DNS: Edit*):

   ```bash
   sudo apt install certbot python3-certbot-dns-cloudflare
   echo "dns_cloudflare_api_token = YOUR_TOKEN" | sudo tee /root/cloudflare.ini
   sudo chmod 600 /root/cloudflare.ini
   sudo certbot certonly --dns-cloudflare --dns-cloudflare-credentials /root/cloudflare.ini -d unda.example.com
   ```

   Plugins exist for Route 53, DigitalOcean, Google, OVH, Linode and others
   (`apt search python3-certbot-dns`). Without one, `certbot certonly --manual
   --preferred-challenges dns` works too, but must be repeated every 90 days.
   Then:

   ```bash
   curl -fsSL https://RELEASE-URL/install.sh | sudo bash -s -- --domain unda.example.com \
     --cert-file /etc/letsencrypt/live/unda.example.com/fullchain.pem \
     --key-file  /etc/letsencrypt/live/unda.example.com/privkey.pem \
     --https-port 8443 --rtmp-port 1936
   ```

2. **A certificate you bought**, or one the other program already renews for
   the same name: the same `--cert-file`/`--key-file` options. Unda then
   depends on that program keeping it renewed.
3. **Behind that program as a reverse proxy** (Caddy/nginx above), if it is a
   web server that can forward a name to Unda.

Or give Unda a server of its own: nothing to share, and the one-line install
needs no options.

**A closed studio LAN without HTTPS** can set `auth.allow_insecure_login: true`.
The server logs a warning at every start, because passwords then cross the
network unencrypted. Without it, plain HTTP from another machine refuses every
credential (password, API key, `api.token`, session cookie) with 403
`https_required`, so scripts and Prometheus need `https://` too. On a public
server, also firewall the plain HTTP port if nothing needs it.

---

## 3. Create the owner account

The first account is the **owner**, who can do everything. On its first start
the server logs a one-time link (`setup_link`) and saves the token in
`<data_dir>/setup-token`.

Open it on your HTTPS address:

```
https://tv.example.com/dashboard#setup/<token>
```

Enter your email, name and a password of at least 10 characters. The link
stops working once the owner exists.

**No HTTPS yet, or the link is lost?** Create the owner from the server's shell
instead. The password is read from standard input:

```bash
# systemd
sudo -u unda unda admin -config /etc/unda/unda.yaml create-user you@example.com owner "Your Name"
# Docker (-T: the password is piped in)
read -rs PW && printf '%s\n' "$PW" | docker compose exec -T unda \
  unda admin -config /etc/unda/unda.yaml create-user you@example.com owner "Your Name"
```

Then, under **Account**, turn on **two-factor sign-in** (any authenticator app)
and store the recovery codes in your password manager.

---

## 4. Install the license

As the owner: **License** → *Install a license* → choose your `.license.json`
file → **Install**. Or from the shell:

```bash
sudo -u unda unda license -config /etc/unda/unda.yaml install acme.license.json
sudo -u unda unda license -config /etc/unda/unda.yaml show
```

Installed from the dashboard, stream and account limits apply at once; from the
shell, the running server picks the file up within the hour (restart it to apply
at once). Features that start with the server (SRT, UDP inputs, transcoding)
follow a new license **after a restart**.

What the states mean:

| State | What happens |
|---|---|
| valid | everything in the license |
| expiring | a banner shows from 30 days before the end date |
| grace | expired less than 14 days ago; everything still works and the banner counts down |
| expired | **new** streams are refused; streams already live keep going. Install a renewed license: it takes effect at once |
| evaluation | no license file: 2 live streams, 2 accounts besides owners |
| invalid | the file is damaged or not for this server: evaluation limits until a valid one is installed |

A license can be issued for your domain(s). Then it only works on a server
whose HTTPS certificate is for those names. Behind Caddy or nginx, where Unda
has no certificate of its own, list the name(s) in `/etc/unda/unda.yaml`:

```yaml
server:
  public_domains: [tv.example.com]
```

The License page shows the domains a license is for, and says so when this
server's domain is not one of them.

The license is checked on the server, offline. Nothing is sent to your vendor.

---

## 5. Invite your team

**Users** → *Invite someone*: email, role and, for streamers, how many
channels they may create. You get a link valid for 72 hours, usable once.
Send it yourself (chat, email); the person opens it and picks a password.

| Role | Can |
|---|---|
| **owner** | everything: license, support access, other owners |
| **admin** | users (not owners), security settings, API keys, audit log, and everything an operator can |
| **operator** | runs the production: all streams, stop, record, restream, transcoding, UDP inputs, server page |
| **streamer** | only their own channels: stream key, status, health, viewers, their restream destinations |

Useful settings:

- **Users → Security**: require two-factor sign-in for roles (for example
  owner, admin and operator). People in those roles must set it up at their
  next sign-in before they can do anything else.
- **API keys** (admin): for scripts and Prometheus. Each key has a role, is
  shown once and can be revoked. Prometheus: `authorization.credentials_file`
  holding an operator key, scraping `https://tv.example.com/metrics`.
- **Audit log** (admin): who did what — sign-ins, failed sign-ins, role
  changes, stream keys revealed or replaced, licenses, support access. Kept for
  a year.

Sessions last 12 hours without activity and 7 days at most. Five wrong
passwords from one address block that address from the account for 15 minutes,
doubling each time up to a day; the account keeps working from other addresses.
`unda admin unlock` clears every block. Behind a reverse proxy, list it in
`server.trusted_proxies`, or every visitor shares the proxy's address and one
guesser blocks everyone.

---

## 6. First stream

Streams publish to **channels**. A channel has a public **name**, used in the
watch link (`/watch/<name>`), and a secret **stream key** (`sk_…`), which is
the only thing that lets someone go live on it.

1. **Channels** → *New channel* → e.g. `main-show`. An admin can create it for
   a streamer; a streamer creates their own.
2. The page shows the encoder settings. In OBS: **Settings → Stream → Service
   “Custom…”**, then:
   - Server: `rtmp://tv.example.com:1935/live`
   - Stream key: the `sk_…` key
3. Start streaming. Within a few seconds it appears under **Streams** as
   `main-show`.
4. Viewers watch at `https://tv.example.com/watch/main-show`. The key is never
   in that link.

If a key leaks, use **New key** on the channel. The old key stops working at
once and a live stream using it is disconnected.

SRT encoders use
`srt://tv.example.com:6000?streamid=publish:<sk_… key>` (from **Channels**).

---

## 7. Firewall

Open only what is used:

```bash
sudo ufw allow 443/tcp     # HTTPS: dashboard, watch pages, HLS
sudo ufw allow 80/tcp      # Let's Encrypt checks and the HTTP → HTTPS redirect
sudo ufw allow 1935/tcp    # RTMP encoders
sudo ufw allow 6000/udp    # SRT encoders (if used)
```

With a proxy in front (section 2), do **not** open Unda's own HTTP port (8080):
only the proxy should reach it.

**UDP and RTP inputs have no password and no encryption:** anyone who can reach
the port can send a stream into it, and anyone on the path can watch it. Keep
them on a private network you trust (a studio LAN, a leased line, a VPN), give
each input an `allow` list of its senders, and open the port only to those
senders:

```bash
sudo ufw allow from 192.0.2.20 to any port 5004 proto udp   # one sender, one input
```

The same holds for UDP and RTP outputs: whatever they send can be read on the
way, so send them only across a network you trust. Over the internet, use SRT
(with a passphrase) or RIST instead.

---

## 8. Backups and upgrades

Everything that cannot be recreated is in the data directory
(`/var/lib/unda/state` or the `/data/state` Docker volume):
`unda.db` holds accounts, channels and keys, API keys, settings and the
audit log. `license.json` is the license. `acme/` holds the HTTPS certificates
(they can be obtained again, but keeping them avoids Let's Encrypt's rate limits). Recordings are separate
(`recordings_dir`).

**Back up daily.** The backup command is safe while the server runs:

```bash
# systemd, e.g. from /etc/cron.daily/unda-backup
sudo -u unda unda admin -config /etc/unda/unda.yaml \
  backup /var/lib/unda/backup-$(date +%F).db
# Docker
docker compose exec unda unda admin -config /etc/unda/unda.yaml \
  backup /data/backup-$(date +%F).db
```

The backup file must not exist yet (it is never overwritten), hence the date in
its name. Copy the backup and `license.json` off the server. The database holds stream
keys, so keep backups as private as the server.

**Restore:**

```bash
sudo systemctl stop unda
sudo -u unda rm -f /var/lib/unda/state/unda.db-wal /var/lib/unda/state/unda.db-shm
sudo -u unda cp backup-2026-09-24.db /var/lib/unda/state/unda.db
sudo systemctl start unda
```

**Upgrade:**

- **Installed with `install.sh`:** run the same install command again (the
  `curl … | sudo bash -s -- --domain …` line, or `./install.sh` from the new
  release folder). It first backs up the database to
  `/var/lib/unda/backups/pre-upgrade-<date_time>.db` (the five newest are
  kept), then replaces the binary and restarts Unda. Your configuration,
  accounts, channels, license and certificates are kept. If the backup
  fails, nothing is upgraded.
- **By hand or with Docker:** take a backup, then replace the binary and
  `systemctl restart unda`, or change the image tag and `docker compose up -d`.

**Knowing when there is one:** twice a day Unda reads the description of the
latest release from your vendor's release page. When a newer version exists,
owners and admins see it on the dashboard (Overview → *Other notices*, and at the
bottom of the sidebar) with a link to its release notes. It only reads: nothing
is downloaded or installed until you run the upgrade. The request carries no
information about your server beyond its version. To turn it off:

```yaml
updates:
  disabled: true
```

`unda -version` prints the installed version.

The database is upgraded automatically at start. A server restart disconnects
live encoders for a few seconds; OBS reconnects by itself.

Going back to an older version after an upgrade is refused ("newer than this
build knows"). Restore the backup taken before the upgrade, or run the newer
version.

---

## 9. If someone is locked out

**Anyone but the owner:** an admin fixes it in **Users**:

- *Disable* / *Enable*;
- *Sign out* (ends every session of that person);
- *Reset 2FA* (a lost phone).

**The owner, or nobody can sign in:** use the server's shell. Having shell
access to the server is the credential here:

```bash
G="sudo -u unda unda admin -config /etc/unda/unda.yaml"
# Docker: G="docker compose exec -T unda unda admin -config /etc/unda/unda.yaml"
$G list-users
$G unlock you@example.com                                   # after too many wrong passwords
read -rs PW && printf '%s\n' "$PW" | $G reset-password you@example.com
$G disable-2fa you@example.com                              # lost phone and recovery codes
read -rs PW && printf '%s\n' "$PW" | $G create-user new@example.com owner "New Owner"
```

Every one of these is recorded in the audit log as done by `shell`.

---

## 10. Support access for your vendor

Your vendor has **no account and no way in** unless you give them one.

- **Give access:** as the owner, go to **License → Support access**, enter the
  vendor's email and a duration (1 to 14 days). Send them the link it shows.
- **What they get:** an admin account. Everything it does appears in the audit
  log marked “(support)”.
- **When it ends:** automatically at the end date. *End support access now*
  closes it at once and signs them out.

---

## 11. Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `could not get a certificate` in the log, or the browser warns about the certificate | The domain's DNS must point at this server, and ports 443 and/or 80 must be open and forwarded to it. The log line gives Let's Encrypt's reason. Repeated failures can hit Let's Encrypt's rate limit (5 failed checks per hour), so test with `directory_url: staging` |
| Unda does not start: `listen tcp :1935: bind: address already in use` (or :443, :80, :6000) | Another program uses that port. Give Unda another one in `/etc/unda/unda.yaml` (`rtmp_addr: ":1936"`: encoders then use `rtmp://DOMAIN:1936/live`; `srt.addr`; `http_addr: ":8443"`: viewers then use `https://DOMAIN:8443`), or pass `--rtmp-port`, `--https-port`, `--http-port`, `--srt-port` to `install.sh` on a new install. Let's Encrypt still needs port **80 or 443** for Unda: if another program holds both, use a certificate file (`--cert-file`; "Sharing a server" in section 2) or put Unda behind it |
| “signing in over plain HTTP is only allowed from this machine” | Use the HTTPS address. Behind a proxy, check `server.trusted_proxies` lists it and that it sends `X-Forwarded-Proto` |
| “cross-site request refused” | The proxy changes the `Host` header; keep it (`proxy_set_header Host $host`) |
| Dashboard stays on “Reconnecting…” behind nginx | Add `proxy_buffering off` (live updates are a long-lived response) |
| An encoder is refused with “license limit” | The license's concurrent stream limit is reached (or evaluation's 2). See **License** |
| The encoder is refused and the key looks right | The channel's key was replaced (**New key**), or the channel was deleted. Copy the key again from **Channels** |
| “… is at schema version N, newer than this build knows” | An older version was started on a database from a newer one: restore the pre-upgrade backup or run the newer version |
| The banner says “invalid” | The license file is damaged or signed for another build: ask your vendor for a new file |
| Nobody can sign in | [Section 9](#9-if-someone-is-locked-out) |

Logs: `journalctl -u unda` or `docker compose logs unda` (one JSON
line per event; passwords and stream keys are never logged).
