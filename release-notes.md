---
title: "Unda Media Server release notes"
description: "What changed in each Unda Media Server release, newest first, and how to upgrade a server installed with the installer or with Docker."
---

# Release notes

Changes in each Unda release, newest first. Servers check for new releases and
show a notice to admins and owners under Overview → Other notices. To upgrade,
re-run the installer, or with Docker change the image tag and pull
([Backups and upgrades](/guide/install#8-backups-and-upgrades)). The
database is backed up first. How often releases come and what 1.0 will
mean: [Releases and support](/guide/releases).

<!-- Unreleased changes go in a "## Next release" section here. At release,
     rename it to "## vX.Y.Z {#vX-Y-Z}" (the anchor the update notice links
     to) and add the date under it. deploy/release.sh reads the version's
     section; its "- " points also show in the dashboard's update notice,
     so upgrade notes are written as paragraphs, not "- " points. -->

## Next release

### New

- Upgrade with `sudo unda upgrade`: your server checks the new release with
  the vendor's key built into it (its signature, every file, and that it is
  newer than the version you have) before it installs anything.
  `unda upgrade -check` only says whether there is one. From this version
  on, the dashboard's update notice shows this command.
- A channel's backup playlist can start from its first video each time the
  live stream goes off air, instead of carrying on where its own clock is:
  choose **When the live stream goes off air** on the channel's Input tab.
- TV outputs and bundle channels can go out as SD **576i25** (720×576
  interlaced, top field first) in H.264 or MPEG-2, for TV equipment that
  expects interlaced SD.
- TV outputs and converted bundle channels can label their sound track with
  its language (**Sound language**), which receivers show in their audio
  menu.
- A stream's **Input** card shows the picture's and the sound's bitrates
  next to the total, measured over the same few seconds.
- When a channel's left and right sound arrive out of phase (phones and mono
  TVs then hear almost nothing), the new **Sound** card on its Output tab
  says so and **Flip one side** puts it right; an alert, **Sound sides
  cancel**, is raised after 30 seconds.

### Changed

- A channel on air from its backup encoder, its pull or its playlist no
  longer raises an alert: it is on air, which is what matters. Its tag,
  now grey, says which input is on. A channel none of whose inputs has
  pictures still raises one.
- A channel's inputs (its main and backup encoders, its pull and its
  playlist) only feed the channel. Restream destinations, TV outputs,
  recordings, bundles and watch links are set up on the channel.
  **Streams** shows one line per channel, naming the input on air (for
  example "SRT · encoder"); open the line to see every input with its
  picture, bitrate and problems, and a problem with the input on air shows
  on the channel's own light. Destinations set up on an input before keep
  sending; they are listed on the channel's Restream tab.
- **Streams** moved to fourth in the menu, after Overview, Multiview and
  Broadcast.
- A destination address with a setting its kind doesn't take now names that
  setting: for example, an SRT address changed to `udp://` with its
  `latency=` still on the end says that UDP doesn't take latency.

### Fixed

- HLS viewers could hear a channel's sound slightly behind its picture, a
  little more each time its encoder sent its sound settings again during
  the stream.
- On a phone, the Streams page was wider than the screen.
- A channel with inputs showed its source as "FAILOVER" or "INPUTS"; it now
  names the input on air (for example "SRT · encoder"). In Seamless mode
  an "i" explains that the picture and bitrates shown are the channel's
  re-encoded ones.
- On Ubuntu 22.04 (FFmpeg 4), SD channels in a bundle had little time to
  spare before each picture was due. New SD bundle channels there now get
  1000 kb/s of video in a 1300 kb/s share (1040 elsewhere), which leaves them
  more room. For a channel you already have, edit it and clear its video
  rate.
- An SRT destination whose latency is short for its round trip is no
  longer shown in orange while it plays fine: the light turns orange only
  when packets are being resent often or given up, and otherwise stays
  green with the advice in grey.
- Low latency (WebRTC) viewers of 24/7 channels, and of channels using
  backup sources in Seamless mode, saw some pictures out of order. On a
  server with WebRTC on, Unda now encodes these channels without B-frames.
- An encoder sending over RTMPS is now shown as RTMPS, not RTMP.
- A channel playing its playlist input (a playlist or a looped video) is
  shown as PLAYLIST, not SLATE. An empty playlist or a gap between items
  shows black, and that still raises an alert.
- TV outputs pulled over HTTP: a receiver that connects again is no longer
  cut off after 10 seconds; turning off plain HTTP now disconnects the
  receivers using it; and an edit saved while someone made a new link no
  longer brings the old link back (it asks you to open the output again).
- On a server behind nginx or Caddy, the "Plain HTTP" link of a TV output
  now points at your web server, not at a port only it can reach.
- Support access: the link to send your vendor disappeared as soon as it was
  made. It now stays on the page, and **New link** replaces one that was
  lost. A link for a short access no longer outlives the access itself.
  When the link uses an address inside your network, the page says how your
  vendor can still open it.
- Security: behind nginx or Caddy, another program on the same machine (or
  another container on Unda's Docker network) could pretend to be any
  visitor and so get round the sign-in lockout. The web server can now send
  Unda a secret with each request, and only requests carrying it speak for
  visitors. New installs with `--behind-proxy` and the ready-made Caddy
  folder set it up; on an existing setup the dashboard shows a notice, and
  the install guide's HTTPS section shows the steps.
- Security: several ways for someone without a key or password to make the
  server run out of memory are closed (RTMP connections before their key is
  checked, HLS playlist requests, and junk packets sent to UDP, RTP, SRT or
  RIST inputs). A new RIST input now needs the sender's passphrase or an
  allow list, as a UDP input does.
- Installing in Docker on a machine whose only Docker is Ubuntu's snap
  version no longer stops with "Docker is not running": the installer
  switches the snap off (keeping what is in it) and installs Ubuntu's own
  Docker. When Docker won't start, it now shows Docker's own reason and the
  usual fixes; the install guide lists every message with its fix.
- More security fixes: a crafted link to a watch page can no longer make a
  signed-in visitor's browser change anything on the server; a flood of
  sign-in attempts, a viewer's WebRTC request naming many addresses, a
  stream that never sends another keyframe, or a restream destination's
  own server can no longer make Unda use memory or send traffic without
  limit; and a client can no longer take over a live stream by naming a
  channel after it.
- Inputs and players hold up better against misbehaving or hostile
  senders: RIST inputs can no longer be used to bounce traffic at someone,
  junk can no longer push an encrypted RIST sender's key out, an RTMP viewer
  that stops reading is let go after 15 seconds, a bundle input whose
  tables keep changing no longer floods the log and the event list or
  restarts its channels' converter many times a second, and junk tables no
  longer fill the stream checks' memory.
- Bundle inputs, the stream analyser and transport-stream reports now name
  MPEG-5 (EVC and LCEVC) and VVC (H.266) streams, and name every stream type
  in their PID lists ("H.264 (0x1B)" instead of "type 0x1B"). Relays already
  pass these streams on untouched.
- A day with very many viewer sessions no longer stops the viewer figures
  of the days after it.
- Ending support access, or disabling or demoting an administrator, now
  also stops the API keys and unused invite links that account made.
- The installer's database copy before an upgrade is made as Unda's own
  account, and a data folder written in quotes in unda.yaml is now backed up
  too.
- Deleting a channel now removes its restream destinations, and changing a
  channel's owner removes the destinations the previous owner added: a new
  channel of the same name, or the new owner, could otherwise send to the
  previous owner's accounts.
- Two relays added at the same moment can no longer start more streams
  than the license allows.
- If a page of the server fails, the error written to the log no longer
  contains the secret links of TV outputs, the guide or viewer figures.
- On a channel's Viewers tab, the figures no longer squeeze into one row
  on mid-size screens (labels ran out of their boxes): they now sit in
  even rows that fit the window.
- The install command (`curl … | sudo bash`) could install Unda files left
  in the folder you ran it from, instead of downloading and checking the
  release. It now always downloads the release and checks its signature;
  files next to the installer are used only when you run `./install.sh`
  from an unpacked release folder.
- The installer no longer puts an older version over a newer one, so an old
  release can't take your server back by mistake. To go back on purpose,
  add `--allow-downgrade` (see Backups and upgrades in the install guide).
- The install guide's way to check the installer before it runs now names
  the newest version itself, instead of asking the download site for it.
- The installer now makes sure the files and the Docker image it installs
  belong to its own release, and a Docker install always pulls the image
  by its signed fingerprint: if that can't be checked, nothing is installed.
- Limits for clients: one client can no longer use every live dashboard
  connection (staff saw "Connection lost"), every restream slot, or every
  WebRTC publishing slot with one key; reading months of figures is paced
  like the reports; and the all-channels figures link is for
  administrators only.
- A deleted channel's 13 months of figures no longer pass to a new channel
  of the same name, and a 24/7 channel set to take over from a stream
  channel stops doing so when that channel is deleted or given to someone
  else.
- A long programme description (emoji especially) no longer breaks the
  guide sent to TVs.
- Playlist items shorter than a second are skipped, like a missing file,
  with the reason shown in the playlist.
- An encoder that keeps changing its picture settings restarts a Direct
  channel at most once every five seconds, and one RTMP connection can
  publish only one stream (a second publish left the first stuck on air).
- A Seamless channel set to stop when idle, with its playlist ranked
  first, now goes on air from its playlist (it showed black and never
  published), and a Direct channel no longer loses its playlist when its
  looped video or picture size is changed.
- Two-step sign-in: wrong codes sent all at once can no longer get past
  the five-try lock, and one code can complete only one sign-in.
- After signing out, the sign-in form no longer clears itself every minute
  while you type.
- An encoder that changes its picture size or sound settings mid-stream no
  longer breaks UDP, RTP, RIST and SRT outputs, TV outputs and MPEG-TS
  players until it reconnects: they follow the new settings at the next
  keyframe. The sound meter no longer restarts many times a second for
  such an encoder.
- When the alert list is full, an important alert (a full disk, a channel
  off air) now takes the place of a less important one instead of being
  dropped unseen.
- A licence no longer reads expired for good after the server's clock was
  wrong for a moment (a machine starting with a wrong clock before it
  syncs).
- With a limit on the number of qualities ladders, choosing another
  encoder no longer leaves every ladder refused.
- "Start from the first item" now applies to a running channel at once.
- Playlists: saving a very long playlist no longer holds up other
  channels' saves, and a media folder of more than 4,000 files is checked
  once instead of over and over.
- A bundle input waiting for an SRT sender refuses one not on its allow
  list before taking it (a stranger could hold the sender's place). A new
  one waiting on every address needs a passphrase or an allow list.
- Clients' changes that restart an encoder or rewrite a file (inputs,
  playlists, guides, 24/7 settings, restream destinations, skipping,
  pausing, new keys) are paced like the other settings.
- The watch page's **Share** gives the page's address without your own
  viewing link.
- Watch-page logos are stored one by one, so saving a title while a logo
  uploads keeps both.
- A server with thousands of viewers on one stream lists them without
  holding the stream up.
- An upgrade leaves the firewall as it is (rules you narrowed stay narrow)
  and lists the ports Unda uses; the ports are opened on the first install
  only.
- Sign-in: guess limits hold even for someone who also has a valid key, an
  unknown email locks after the same number of tries as a real account
  (so the answers don't reveal which accounts exist), and two-step sign-in
  can't be set up again while it is on (turn it off with your password
  first).
- An upgrade checks that the new version can read your configuration
  before it replaces the running one, and changes nothing if it can't.
  `unda check-config -config FILE` does that check on its own.
- The update notice in the dashboard shows only what the vendor signed.
- Clients no longer see their viewers' addresses or the server's folders,
  and a few more of their actions are paced (viewer figures, two-step
  setup).
- A deleted or reassigned channel leaves nothing to the next holder of its
  name: not its events, "Last live", as-run log, playback protection or
  pull address.
- Names of clients' channels (and their inputs) can't be used for legacy
  keys, UDP inputs or bundle programmes, and a client's channel limit holds
  when several channels are created at once.
- A licence no longer reads expired for good after the clock was wrong for
  a moment, and removing an expired licence no longer starts an
  evaluation.
- Low latency (WebRTC) viewers count once they are connected, not when
  they ask.
- A saved setting that can't be read at start-up is kept aside instead of
  being overwritten, and unreadable playback protection now protects every
  stream instead of none.
- Dashboard: "too many requests" messages say what was too many, a request
  that never answers no longer stops the page refreshing, edits made while
  a playlist or guide saves aren't lost, the Events page keeps every line,
  and the Ad break countdown follows the server's clock.
- Smaller fixes: a full alert list makes room for the alerts that matter,
  long live guides can be saved, very long playlists and media folders
  stay quick, an SRT bundle input refuses senders not on its allow list
  before taking them, relays refuse an edit made from an out-of-date list,
  and uploads don't land in a channel deleted meanwhile.

## v0.1.49 {#v0-1-49}

*5 November 2026*

The database gains a table that keeps the server's figures for 13 months:
going back to v0.1.48 needs the copy of the database the upgrade makes first.
The installer opens port 1936 (RTMPS) in ufw when ufw is on; open it in your
provider's firewall too, and with Docker publish `1936:1936`. Set
`server.rtmps_addr: off` if you don't want RTMPS. With Docker, set the image
tag to `v0.1.49`. This is the first signed release: the installer checks the
signature before it installs ([Install](/guide/install#1-install)).

### New

- **A clearer Restream tab:** platforms and TV outputs are in two lists, one row each, with a summary on top and, under a destination that fails, the reason and the fix. Adding happens in a short dialog: a service's server link and stream key go in separate fields, well-known services show their logo, and a TV output takes four short steps instead of one long form ([Restreaming](/guide/restreaming#from-the-dashboard)).
- **Let the station pull your channel over HTTP:** a TV output can be fetched by the station's receiver from a secret link on your server, over HTTPS or plain HTTP if you allow it, from the addresses you list, by up to 8 receivers, with a new link whenever you need one ([Letting the receiver pull a link](/guide/restreaming#letting-the-receiver-pull-a-link-http)).
- **A new watch page.** `/watch/<channel>` is now the channel's own page: its logo, title and tagline, a player with its own controls (quality with what each costs, LIVE and going back, low latency, captions, full screen), what's on now and next, and the day's schedule. On a phone it fits the screen, and sideways the player fills it. Set it up on the channel's Output tab ([The player page](/guide/watching#the-player-page)).
- **Put a channel on another website:** the Output tab gives the code for a player in the site's own colour, which waits for a tap before it plays ([Embedding on your website](/guide/watching#embedding-on-your-website)).
- Unda now notices when a channel's picture freezes or goes black, even while its sound carries on, and raises an alarm. A channel whose picture stands still on purpose, such as a radio station showing its logo, can turn the frozen-picture alarm off ([Frozen or black picture](/guide/monitoring#frozen-or-black-picture)).
- **Relays:** pass a transport stream on exactly as it arrives, for example an encoder's UDP output to a TV station over SRT, with every channel, sound track, subtitle and table, to up to four destinations. Unda checks what arrives, counts lost packets, and raises an alert when the feed stops or a destination can't be reached ([Relays](/guide/relays)).
- **Edit instead of remove and add:** restream destinations, relays, UDP and MPTS inputs, bundles and each bundle channel now have **Edit**. Leave an address empty to keep it with its passphrase or stream key, only what you change restarts (a relay's other destinations and a bundle's other channels carry on), and settings that can't start leave things as they were. A finished analysis can be run again with one click.
- The server's figures are now kept for 13 months, not just the last hour: Server → History shows viewers, bandwidth, CPU and memory over a day, a week, a month or a year, and a channel report gives each channel's time on air, interruptions and stops, also as a CSV file ([History and channel reports](/guide/monitoring#history-and-channel-reports)).
- **Ad breaks for TV operators (SCTE 35):** start an ad break from a stream's page, and its TV outputs and bundle channels tell the ad inserter downstream when to leave the programme and when to come back, with a countdown and End now. Cues arriving in a feed are never passed on ([Ad breaks](/guide/restreaming#ad-breaks-scte-35)).
- **Let the station's receiver connect to you:** a TV output or a bundle can wait on an SRT port for the station's or teleport's receiver, with a passphrase or a list of allowed addresses, instead of Unda connecting out. Up to 8 receivers at once, and the page shows who is connected ([TV outputs](/guide/restreaming#letting-the-receiver-connect-srt-listener), [bundles](/guide/mpts#letting-the-receiver-connect-srt-listener)).
- **Clear an alert you have seen:** on the Multiview (a tile, the list or the details) and in the Overview's Needs attention, clearing an alert calms it for everyone, with who cleared it. It comes back by itself if it gets worse or happens again ([Clearing an alert](/guide/monitoring#clearing-an-alert)).
- **Encrypted RIST:** bundles, TV outputs and restreams can be sent, and bundle inputs received, with RIST Main Profile and a passphrase (AES-128 or AES-256), so a feed crossing the internet can't be watched on the way. It works with librist-based equipment and software, and a wrong passphrase is named on the input and in its alert ([Encrypted RIST](/guide/mpts#encrypted-rist-main-profile)).
- RTP and RIST can now use two network paths at once (SMPTE 2022-7): outputs send every packet both ways, and inputs merge the two, so a packet lost on one path is taken from the other and a failed link goes unnoticed by viewers ([UDP inputs](/guide/udp#two-paths-smpte-2022-7), [outputs](/guide/restreaming#two-paths-smpte-2022-7)).
- **Download a channel's logs:** a channel's page has a **Logs** button, and Server → Status a Logs card. Pick the last minute up to the last 24 hours and download the server's log lines for that channel (its inputs, the bundles that carry it, the addresses it sends to) or for the whole server ([Logs](/guide/monitoring#logs)).
- **See how an SRT link is doing:** restreams, TV outputs, bundles and relays sent by SRT show the link on their row: green while nothing is lost, orange when packets keep failing to arrive in time or the latency is too short for the distance, with the latency to set. A single burst shows in grey, and when it came right after a pause of the server itself, the line says so.
- **RTMPS for encoders:** OBS, vMix and FFmpeg can publish over RTMPS (RTMP with encryption) on port 1936 whenever the server has HTTPS, so the stream key and the pictures can't be copied on the way. A channel's encoder settings now show it first ([Stream from OBS](/guide/streaming#obs-studio)).
- **A logo on a channel's backup playlist:** a live channel's playlist or looped video can carry your logo, so viewers still see it while the live feed is down. The live encoder and pull streams are left as they come ([A logo on the playlist](/guide/channel-inputs#a-logo-on-the-playlist)).
- Closed captions inside the picture now stay with streams that arrive over SRT, UDP, RTP or RIST, from bundles and from pull inputs, as they already did over RTMP. They reach HLS, recordings, TV outputs and every quality of adaptive bitrate, and the dashboard's player has a CC button ([Closed captions](/guide/watching#closed-captions)).
- **Install in Docker with one command:** `install.sh --docker` installs Docker if needed, writes the files, starts Unda and prints the setup link, and running it again upgrades. With a domain it gets HTTPS from Let's Encrypt; on a PC on your own network it uses the machine's network directly, so multicast works, with a certificate made for the machine ([Install](/guide/install)).
- **Install next to your own web server in one command:** on a server where nginx, Caddy or Apache already serve other sites (a radio station's AzuraCast, an Owncast), `--behind-proxy PORT` lets that web server keep ports 80 and 443 and forward your domain to Unda. With nginx the installer adds the site and gets the certificate through certbot. A graphics card, NVIDIA included, works as in any installation without Docker ([Install](/guide/install)).
- In Docker on Linux, Unda can now transcode on an Intel graphics card: the image carries Intel's drivers.
- Downloads are now signed. The installer checks a signature before it installs, and Docker installs are pinned to the exact image, so a tampered download or registry is refused rather than installed.
- **A tidier menu:** broadcast work (UDP, pull and MPTS inputs, MPTS outputs, relays and the stream analyser) has its own **Broadcast** page, and **API keys**, **License** and **Account** are now tabs of the **Server** page, so the Server page has one row of tabs and the menu is shorter. Old links and bookmarks still open the right page ([A tour of the dashboard](/guide/dashboard)).

### Changed

- **TV outputs and bundle channels now always encode on the CPU.** On an NVIDIA graphics card their bitrate went above the set rate in busy scenes, so a TV taking the stream could freeze for a moment; the CPU holds the rate exactly. Adaptive streams and 24/7 channels still use the card ([Graphics cards](/guide/transcoding#graphics-cards)).
- Work now moves between the graphics card and the CPU by itself. When the CPU is overloaded, jobs go back to the card as soon as it has room; when the card is full, jobs go to the CPU. A restart no longer leaves the CPU struggling beside a card with room ([Graphics cards](/guide/transcoding#graphics-cards)).
- **Ubuntu's morning security updates no longer restart Unda by themselves**, which took every channel off the air for a few seconds. The updates still install; restart Unda at a quiet time when one is waiting (`sudo needrestart -r l` lists them). The installer sets this up when you upgrade ([Backups and upgrades](/guide/install#8-backups-and-upgrades)).
- **More of the stream for the picture:** an SD H.264 TV output or bundle channel now gets 1040 kb/s of video in a 1300 kb/s stream with AAC at 128 (it was 960), as broadcast encoders give. Outputs you already have keep their video rate: edit one and clear its video rate to get the new one ([TV outputs](/guide/restreaming#broadcast-tv-terrestrial-and-satellite)).
- Transport-stream checks on incoming feeds now say what matters to your viewers. A feed whose sender only has faults Unda corrects (its clock or tables) shows **Plays fine** and raises no alert; lost or damaged packets show **Viewers may see glitches** with what to do ([Transport-stream checks](/guide/mpts#plays-fine-or-viewers-may-see-glitches)).
- A fault in one channel, restream or viewer no longer stops the whole server: only that job starts again, and the dashboard says so for an hour.
- A server that stops responding restarts itself instead of staying frozen.
- When a disk is nearly full, recordings stop cleanly and streams keep playing. The dashboard warns for every disk Unda writes to, and when the machine is nearly out of memory.
- A 24/7 channel that keeps falling behind starts its playback again by itself, without viewers losing the stream.
- Unda reopens its RTMP and SRT ports by itself if the system closes them, and warns while one is down.
- The Overview stays accurate when something goes wrong: a figure that stops arriving says "not updated" instead of showing an old or empty value, and a part of the page that can't be shown no longer stops the rest. A stream whose adaptive bitrate fails is now an alert, so it shows on Multiview too and can be cleared.
- A running relay now counts as one live stream toward the licence's limit, however many channels its feed carries ([Relays](/guide/relays)).
- On Multiview, clicking a channel's name opens its page.
- On Docker Desktop for Windows, Server → Transcoding now says that Unda encodes on the CPU there, instead of suggesting a setting that can't help. In Docker on Linux, an NVIDIA card is now named as needing the installer.

### Fixed

- A UDP, RTP or RIST destination or TV output now carries on as one stream when you edit, pause or resume it, or when its source reconnects. A receiver that keeps listening, such as VLC, a gateway or a headend, no longer loses the sound until it is restarted.
- The network and time tables and the ad-break cues a TV output adds now always go out on time, even while its encoder fills the whole stream for seconds at a time. Before, an ad break could be missed then.
- SRT streams Unda sends no longer fill the receiving equipment's log with an error several times a second, and that equipment now measures the round trip properly. It affected SRT receivers built on libsrt, which most hardware and software uses.
- Encoders and gateways that start an SRT stream with a very short first message, or send one transport-stream packet per UDP datagram, are now accepted. Before, Unda dropped them as soon as they connected.
- Several multicast inputs can now use the same port, as head-ends often send their channels. On Linux each input used to receive the other channels' packets as well.
- A multicast input, relay or analysis with no network interface chosen now joins its group on the right network card by itself. On a Mac it used to fail with "can't assign requested address".
- When an encoder changes its resolution mid-stream, HLS viewers' players start afresh with the new picture instead of showing it broken.
- RTMP viewers of a 24/7 channel on air for more than 49 days keep their picture.
- Edit boxes on a stream's Restream tab and on the Broadcast pages no longer close an open drop-down or lose a click when the page refreshes.
- A client can no longer change the address of a TV output that your staff set up on their channel (they can still pause or remove it).

## v0.1.48 {#v0-1-48}

*29 October 2026*

The database gains tables for viewer figures. On its first start the server
sums up the viewer sessions it already keeps (the last 30 days unless you
changed that), so the new Viewers tab has history at once. Streams are now
prepared for HLS as soon as they go live, which uses a few MB of disk per
live stream ([Starting to play](/guide/watching#starting-to-play)). With
Docker, set the image tag to `v0.1.48`.

### New

- **Viewer figures for each channel:** every channel has a **Viewers** tab
  with viewers now, today, yesterday, the last 7 or 30 days, this month,
  last month and 12 months, by device and by how people watch, with a CSV
  download. Clients see it for their own channels. A private link gives a
  channel's figures as a JSON file for a website or app (admins can make one
  link for every channel), and a channel's live viewer count can be shown on
  a public page ([Viewer figures](/guide/monitoring#viewer-figures-for-each-channel)).
- **Multiview has a new look:** a summary bar, a wall of pictures with a
  details panel for the channel you click, and a list grouped by type, with
  more ways to sort. Red now means viewers are losing a channel; a channel on
  a backup source shows orange.
- **TR 101 290 reports and their alerts say what to do:** the most likely
  cause of the errors (packets lost on the network, a damaged satellite
  signal, an encoder setting, a TV output whose encoder can't keep up) and
  how to fix it.
- The Server page's Multi-channel tab is now two: **MPTS inputs** (bundles
  received) and **MPTS outputs** (bundles sent). A bundle's channel list
  offers every 24/7 channel, on air or not.

### Fixed

- A viewer opening a stream nobody else was watching now sees it start
  almost at once, instead of after a few seconds.
- The Guide page no longer shows a live channel as off air for its first
  seconds after the page opens.
- Security updates to the networking libraries Unda is built with.

## v0.1.47 {#v0-1-47}

*27 October 2026*

Bundles and TV outputs start sending the DVB network and time tables after
the upgrade. If equipment further down your chain inserts its own, switch
them off on each output (**DVB tables** on a bundle, or **Network and time
tables** in a TV output's settings).

### New

- **Network and time tables on TV outputs:** bundles and single-channel TV
  outputs now send the NIT (your network's name and its channels) and the
  time (UTC, and the local time when you set a time zone), as DVB receivers
  and modulators expect. They are on by default and set per output
  ([Network and time tables](/guide/mpts#network-and-time-tables)).
- **Full TR 101 290 report:** bundles, sent or received, are now checked on
  all three TR 101 290 priorities, including the DVB tables TVs read. Click a
  bundle's **TR 101 290** label to see every check, the latest errors and
  what caused them, each PID's bitrate and PCR interval, and how often each
  table comes ([Transport-stream checks](/guide/mpts#transport-stream-checks-tr-101-290)).
- **The same checks on every transport stream:** UDP and RTP inputs, SRT
  publishers, TV outputs and UDP, RTP, RIST and SRT destinations now have the
  same **TR 101 290** label and report, and their errors raise a warning.
  MPEG-TS sent over UDP, RTP, RIST and SRT now repeats its tables every 100 ms
  and its clock at least every 35 ms, as DVB asks, so receivers lock on
  quickly.
- **Stream analyser:** Server → Analyse checks any stream (UDP, RTP, SRT,
  RIST or MPEG-TS over HTTP) against TR 101 290 for a minute up to a day,
  judged as an incoming feed or as a finished TV output. It also measures the
  rate and the network's jitter and loss (MDI), shows errors minute by minute,
  and gives a report to download ([Stream analyser](/guide/analyser)).

### Fixed

- **SRT outputs** (SRT destinations and viewers pulling over SRT) now send
  whole TS packets in each SRT message, as hardware decoders and gateways
  expect. Multi-channel inputs over SRT also accept senders that don't.
- Channels sent as they are in a bundle are announced as SD or HD H.264, not
  as MPEG-2, so receivers label them correctly.
- The stream page of an RTP input now shows its packet loss, as a UDP
  input's does.
- **Publishing over WHIP (low latency) on real internet connections:**
  pictures whose packets were lost on the way and sent again by the encoder
  are now used. Before, losing even a few packets could leave a WHIP stream
  showing only a picture every few seconds.

## v0.1.46 {#v0-1-46}

*26 October 2026*

Versions before v0.1.46 are no longer available to download: please upgrade.
Your current licence keeps working, but a licence issued or renewed from now
on needs v0.1.46 or later. With Docker, set the image tag to `v0.1.46`.

### Changed

- **Licences issued or renewed from now on need v0.1.46 or later.** The
  licence you have keeps working on this version
  ([License](/guide/license#installing-or-replacing-it)).
- **Evaluation mode lasts 30 days.** Without a licence, Unda works for 30
  days from the first time it runs without one; after that streams already
  live carry on and new streams need a licence. On a server already running
  without a licence, the 30 days start with this version
  ([License](/guide/license#states)).
- Every owner after the first now counts toward the licence's number of
  accounts, and the stream limit applies to every kind of input, a channel's
  inputs counting as part of their channel.

### Fixed

- The dashboard can no longer be shown inside another website's page, and
  its pages only run the dashboard's own scripts.

## v0.1.45 {#v0-1-45}

*26 October 2026*

On a server that shares an NVIDIA graphics card, the first start after
upgrading plans with a cautious estimate of the card until it has measured
it, so a few more jobs may run on the CPU until the next restart.

### Changed

- A quality chosen by hand is held to what the stream itself justifies, as
  Auto does: a higher bitrate could not look better and only cost viewers and
  the server. Clients can give each size up to twice its suggested bitrate
  ([Choosing the qualities yourself](/guide/transcoding#choosing-the-qualities-yourself)).
- Clients see the transcoder's state in plain words, without technical
  detail about the server.
- **A graphics card is shared more evenly:** Unda learns what your card
  really costs and keeps it, so a restart puts the same jobs on the card each
  time instead of sometimes filling it. When the card stays nearly full, an
  adaptive stream moves to the CPU by itself
  ([Graphics cards](/guide/transcoding#graphics-cards)).

### Fixed

- **Save** under Server → Transcoding works while the graphics card is busy,
  and a busy card is no longer shown as "Not usable".

## v0.1.44 {#v0-1-44}

*25 October 2026*

### New

- **Choose the qualities of each stream:** keep Auto, or pick the sizes and
  type each bitrate on the stream's Output tab. Clients can switch adaptive
  bitrate on and choose its qualities for their own channels
  ([Choosing the qualities yourself](/guide/transcoding#choosing-the-qualities-yourself)).

### Changed

- **4K streams get a 4K quality:** adaptive bitrate now makes a 2160p
  quality above 1080p for 4K sources. It takes much more processing on the
  CPU, so use a graphics card for 4K streams where you can
  ([Server cost](/guide/transcoding#server-cost)).

## v0.1.43 {#v0-1-43}

*25 October 2026*

### New

- Viewers can go back in a live stream, up to a time you choose for each
  stream, and return to live ([Rewind](/guide/watching#rewind)).
- **A graphics card is shared by everything that encodes video:** with an
  NVIDIA card chosen under Server → Transcoding, adaptive streams, 24/7
  channels and TV outputs encode on the card, and whatever doesn't fit runs
  on the CPU ([Graphics cards](/guide/transcoding#graphics-cards)).
- **Multiview finds channels faster:** filter by name, show only encoders,
  24/7 channels, pull streams or the channels that need attention, and sort
  them. Each tile gives the channel's name and what feeds it, and a problem
  (no sound, a playlist item that can't play) takes the place of its figures
  with a coloured border ([Multiview](/guide/dashboard#multiview)).
- **The Playout page is a table:** each channel's latest picture, what is on
  air and how far in, and what is next, with filter and sort, and Resume,
  Settings, Pause and Delete on its row
  ([The Playout page](/guide/playout#the-playout-page)).
- **The dashboard's preview shows how fast your connection loads it.** When
  your connection is too slow for the stream, it says so and can show a
  picture every few seconds instead. **Link** and **Embed** copy the watch
  page's address or the code to put it in your own web page
  ([A stream's page](/guide/dashboard#a-streams-page)).

### Changed

- Saving a playlist no longer starts it again: the programme on air keeps
  playing and the playlist carries on from it
  ([The playlist editor](/guide/playout#the-playlist-editor)).
- Live previews in the dashboard stop while the browser tab is in the
  background, so they no longer use your internet connection when nobody is
  watching them.
- The dashboard's preview has its own controls: it starts muted, nothing is
  written over the picture, and the quality is shown in the controls.
- A 24/7 channel's page shows the channel's latest picture instead of a
  video, so it no longer uses your connection; **Watch live** opens the
  stream page's player.
- The dashboard's text is a little smaller, so more fits on the screen.

### Fixed

- Streams that stay on air for more than 28 hours keep playing. Before, web
  playback stopped for a moment at that point, and recordings and TV outputs
  got a jump in time.
- A pulled HLS channel whose source sends long pieces of video no longer
  drops off air every few seconds.

### Upgrade notes

No database change and nothing to configure. In Docker, change the image
tag to v0.1.43.

## v0.1.42 {#v0-1-42}

*24 October 2026*

### Added

- **Add many videos to a playlist at once:** **Add to the loop** (and **Then
  another item**) opens the list of the channel's videos with tick boxes.
  Tick as many as you want, in the order they should play, or search a series
  and **Select all**, then add them in one go
  ([The playlist editor](/guide/playout#the-playlist-editor)).
- **A tidier 24/7 channel page:** what is on air sits at the top with
  **Previous** and **Next** and the next three programmes, and the rest is in
  tabs: **Playlist**, **Logo**, **As-run log** (a day at a time, 50 entries a
  page) and **Output**. The playlist is two tables: tick programmes to move
  them to the top or bottom of the loop or remove them, or drag one by its
  handle. A bar at the bottom of the window shows unsaved changes, with
  **Save playlist** and **Discard**
  ([The channel's page](/guide/playout#channel-page)).
- **The menu folds to icons:** the round button on the menu's edge folds it
  to a slim strip of icons, which show their names when you point at them,
  and back. Each browser remembers the choice. On phones the menu stays at
  the top.

### Changed

- Page tabs (Server, a stream's page, Sessions, a 24/7 channel) have more
  room and are underlined instead of packed in a box. When they don't fit on
  one line they wrap onto the next, so every tab stays in view: before, the
  Server page's last tabs could be hidden off the edge on a laptop or phone.

### Fixed

- On a channel's Input tab, the page no longer jumps back up every few
  seconds after you click **Add videos** and scroll down, and the playlist
  under the cursor no longer blinks.

## v0.1.41 {#v0-1-41}

*23 October 2026*

### Fixed

- A stream could freeze for HLS viewers when its encoder's clock jumped. The
  stream now plays on, and HLS recovers by itself if it ever stops.
- Graphics cards now work with the standard install. Before, **Server →
  Transcoding** could offer only the CPU on a server with an NVIDIA card.
- **Server → Transcoding** says why a graphics card can't be used, so you
  know what to fix
  ([When your graphics card isn't listed](/guide/transcoding#when-your-graphics-card-isnt-listed)).

### Upgrade notes

Run the installer again to get the new service file (it keeps your
settings); on a server with a graphics card, then press **Detect again**
under Server → Transcoding. In Docker, change the image tag to v0.1.41. No
database change.

## v0.1.40 {#v0-1-40}

*22 October 2026*

### Added

- **Add videos** on a channel's playlist, and on a streaming channel's Input
  tab, uploads straight into that channel's own folder: no folder to choose,
  so nothing lands in the shared files by mistake. The videos are offered in
  the playlist as soon as they have been checked
  ([Each channel's own files](/guide/playout#each-channels-own-files-and-shared-files)).

## v0.1.39 {#v0-1-39}

*21 October 2026*

### Added

- 24/7 channels can carry a logo: choose a PNG or JPEG on the channel's
  page, pick the corner, size and opacity, and it is on the channel's
  picture from the next frame, on every output, live takeover included. No
  restart, almost no CPU. Clients can set the logo of their own channels
  ([The channel's logo](/guide/playout#the-channels-logo)).

### Upgrade notes

No database change and nothing to configure.

## v0.1.38 {#v0-1-38}

*21 October 2026*

### Changed

- A client whose channel was paused by the server's staff sees "paused by
  the server's staff" (on the channel, its page and in Events), not the
  staff member's name or email. Staff still see who it was, and admins
  have it in the audit log.

### Upgrade notes

No database change and nothing to configure.

## v0.1.37 {#v0-1-37}

*21 October 2026*

### Fixed

- Built with Go 1.27.3, which refuses a set of intermediate certificates
  that are no longer trustworthy (GO-2026-6809). It concerns the
  connections the server opens itself: restreams over RTMPS, Let's Encrypt,
  alert webhooks and the update check. Viewers and encoders connecting to
  the server were not affected.

### Upgrade notes

No database change and nothing to configure.

## v0.1.36 {#v0-1-36}

*21 October 2026*

### New

- Channels can be paused, without deleting them. Pausing an encoder
  channel disconnects its encoder and refuses its keys until it is resumed;
  pausing a 24/7 channel takes it off air (its guide is empty meanwhile), and
  **Resume** carries its playlist on with the item it stopped in, from the
  same point. Settings, keys, links and recordings are kept, a pause lasts
  across restarts, and a paused channel doesn't count toward the licence.
  **Pause channel** is in the Channels page's **⋯** menu and at the top of a
  24/7 channel's page
  ([Pausing a channel](/guide/playout#pausing-a-channel)).
- Owners can download a backup of the database to their own computer from
  Server → Status, locked with a passphrase they choose: accounts, channels
  and their keys, every setting and the logs, without the licence file, who
  is signed in or the viewer history. `unda admin restore` puts it back (or a
  daily copy) with the server stopped
  ([Backups and upgrades](/guide/install#8-backups-and-upgrades)).
- Multiview shows one tile per channel: a channel with inputs shows what its
  viewers see, tagged with what is on air (encoder, backup encoder, pull,
  playlist or slate). The channel's Input tab shows a small live picture of
  each input. The Overview and the menu count a channel with its inputs as
  one stream.
- Setting up two-factor sign-in shows a QR code to scan with the
  authenticator app, as well as the key to type.
- Playlists play as soon as they are saved and go round and round. Any item
  can instead cut in at a fixed time (every day, on chosen days, or on a
  date), with items right after it as a block; the loop then carries on where
  it stopped. A playlist can also start at a set date and time. The editor
  draws today and shows when each item plays next, and **Next**, **Previous**
  and **Play now** move a 24/7 channel's loop on air
  ([24/7 channels](/guide/playout#the-playlist-editor)). Schedules made with
  earlier versions open as the playlist that plays the same.
- Sound meters on Multiview: every channel's left and right level, live. A
  channel silent for 10 seconds raises **No sound** (on the tile, in Needs
  attention and in Events), even when nobody is watching
  ([No sound](/guide/monitoring#no-sound)).
- Live channels get a programme guide too: type their programmes in on the
  channel's new **EPG** tab (every day, on chosen days or on a date, each
  with a title, length and description, plus what to show between them). It
  appears on the Guide page, in the XMLTV link and in the TV guide of every
  bundle carrying the channel, 8 days ahead
  ([Live channels](/guide/playout#live-channels-a-typed-in-guide)).
- A stream's page has a live sound meter beside its preview, and a choice of
  player under it: **HLS**, **Adaptive** (while the stream is transcoded) or
  **Low latency** (WebRTC, when the server has it)
  ([A stream's page](/guide/dashboard#a-streams-page)).
- Admins can give a channel to another client, or to the house: **Channels →
  ⋯ → Change owner**. Its keys stay the same, so a live encoder carries on.

### Changed

- A stream's tabs are now **Overview**, **Input**, **Restream**, **EPG** and
  **Output**. Output holds what the Playback and Transcoding tabs did: every
  address to watch the stream by, who can watch (signed links) and adaptive
  bitrate. Old links to those tabs open Output.
- Explanations across the dashboard sit behind a small **i** beside the
  setting or title they explain (point at it, tap it, or Tab to it and press
  Enter), so pages are shorter. Settings are laid out as rows with more room,
  and tables keep figures and dates on one line.
- Downloading a locked backup opens a dialog that lists what is inside and
  what is left out, and checks the passphrase as you type.
- The Channels page is a list you can search and filter by owner: each
  channel shows whether it is live (and which input is on air), its owner,
  viewers and time on air, or when it was last live. **Encoder settings**
  opens everything an encoder needs, with the key hidden until shown and a
  **Copy** that copies it without showing it; new keys, change owner and
  delete are in the **⋯** menu. **New channel** shows the watch link as you
  type. A client who can't make more channels is told so, instead of seeing
  "1 of 0 channels" and a greyed button.
- A stream with B-frames: the warning on the Output tab now says what Low
  latency viewers see (pictures out of order), with the fix behind the **i**,
  and the Overview shows it while its preview plays in Low latency. The
  recommended encoder settings include B-frames 0 when the server has
  WebRTC.
- The broadcast settings when adding a restream destination, the new 24/7
  channel form and the new bundle and input forms line their fields up in
  equal columns, grouped (video, sound, transport stream), with the button
  under the fields.
- The playlist editor is tidier: it shows **The loop** and **Fixed times**
  (each fixed time with the items right after it, listed by time), one line
  per item with when it plays next; click a line to open its fields under
  it, and the **⋯** menu moves, duplicates or removes it. A live channel's
  EPG tab lists its programmes the same way.
- The dashboard and the watch page's player load faster on slow connections:
  their files are sent compressed (about a third of the size), and the
  dashboard asks for all its parts at once.

### Fixed

- With no `recordings_dir` in the configuration, recordings were written to
  the server's working folder and the Recordings page listed none of them.
  They now go to `recordings` inside the data folder. (The installer and the
  Docker files set the folder, so their installs were not affected.)
- The Overview's six figures fit in one row on a 1280-pixel screen.
- A restream destination that worked again was still reported as failing for
  up to ten minutes: in Needs attention, and in red on the Restream tab. It
  now clears as soon as the stream reaches it again.
- Wide tables, such as a multi-channel bundle's, scroll inside their card
  instead of making the whole page wider than the window.
- Small Multiview tiles kept the channel's name only while their figures and
  tags fitted beside it; they now go on a line of their own.
- A looped video as a channel's playlist input showed black instead of the
  video. Video fillers of 24/7 channels and backup sources that started
  before their file had been checked (after a restart) now switch to the
  video as soon as it has been.
- The Overview's "Ingest" no longer counts a channel with inputs twice (its
  inputs and the channel they feed).
- A server pulling a stream's MPEG-TS link (`/ts/<name>.ts`, or SRT with
  `read:`) restarted its own output each time it reconnected: every
  connection began its timestamps at zero. They now follow the stream's own
  clock. MPEG-TS sent to other equipment (`/ts`, SRT, UDP, RTP and RIST
  outputs) also gives each picture the usual 0.7 s margin before its decode
  time, which some set-top boxes and receivers need to play smoothly.
- 24/7 channels lost some or all of the sound of video files that store it
  after the pictures (phone recordings and some MPEG-TS files): the picture
  played, the sound broke up or was silent, the more so on a busy server.
  Playlist items, filler videos and looped videos now keep their sound, in
  step with the picture.
- Multiview shows each picture as soon as its tile is on screen, not a few
  seconds later.
- SRT pushes, SRT broadcast outputs and SRT inputs that call out could leave
  a little memory behind each time they reconnected (the SRT library is
  updated).

### Upgrade notes

One database change: a channel can now be paused (two new columns in the
channels table). The upgrade backs the database up first; to go back to
v0.1.35 afterwards, restore that copy (an older version refuses the newer
database). Reload the dashboard after the upgrade: its files changed.

## v0.1.35 {#v0-1-35}

*19 October 2026*

### New

- Every stream can be watched as one continuous MPEG-TS over HTTP,
  `https://<your server>/ts/<name>.ts`: the kind of link IPTV set-top boxes,
  IPTV apps and panels take. The stream's Playback tab lists it, signed links
  and the bandwidth limit apply to it, and its viewers are counted
  ([MPEG-TS over HTTP](/guide/watching#mpeg-ts-over-http-iptv)).
- The server copies its database once a day (accounts, channels and their
  keys, playlists, inputs, settings) and keeps the seven newest copies.
  Server → Status shows the newest one, and a copy that fails is an alert.
  The copies are on the server's own disk: copy them to another machine
  ([Backups and upgrades](/guide/install#8-backups-and-upgrades)).

### Fixed

- UDP inputs made in the dashboard are kept when the server restarts,
  upgrades included. Until now they were lost at every restart.
- A stream's transcoding switch stays as you set it when the server
  restarts. Until now it went back to its default.
- A TV output (SD or HD, sent over UDP, RTP, SRT or RIST) whose destination
  refuses or drops the stream now says so. It showed "write |1: file already
  closed" instead, and each failed attempt took 5 seconds longer than needed.

### Changed

- The Docker image is built on Alpine 3.24 (security updates until June
  2028) with FFmpeg 8.1. The image it replaces, Alpine 3.21, stops getting
  security updates on 1 November 2026.

## v0.1.34 {#v0-1-34}

*16 October 2026*

### Fixed

- A new channel's pull stream and playlist can be set up before it has ever
  been live: each channel on the Channels page has an **Inputs** button, and
  its name opens its Inputs tab while it is offline. Until now the page was
  reached only through a live stream.
- A looped video chosen as a channel's playlist input (direct switching)
  now goes on air. It never started before, and the server log repeated the
  failure ten times a second.

## v0.1.33 {#v0-1-33}

*16 October 2026*

### New

- Bundles (MPTS) catch a channel sent as it is whose stream sends more than
  its share. Its pictures reach TVs late (freezes, a broken picture) seconds
  before any data is dropped, and nothing reported it until then. The server
  now checks each picture's timing as it leaves: a critical alert when one is
  late, with what the stream sends against its share, and a warning when
  pictures have less than 100 ms to spare
  ([Multi-channel bundles](/guide/mpts#how-it-behaves)).
- A channel sent as it is gets a warning when its stream isn't shaped for DVB
  TV: a frame rate other than 25 or 50, sound not at 48 kHz, a portrait or
  larger-than-HD picture, or an H.264 profile or level TV boxes don't decode.
- A new guide, [Broadcast encoders (IP output)](/guide/broadcast-encoders),
  lists the settings a broadcast encoder needs and which input to add for its
  formats.

### Changed

- The dashboard no longer shows the company name in the sidebar or on the
  sign-in page.

### Fixed

- The Server page no longer scrolls sideways when a multi-channel bundle shows
  a long warning on one of its channels.

## v0.1.32 {#v0-1-32}

*14 October 2026*

### New

- Channel inputs: each channel ranks up to three inputs, its live encoder
  (with a backup encoder), a pull stream and a playlist or looped video, and
  the first one with pictures is on air. Channel owners set the order, their
  pull link and their playlist on the stream's Inputs tab, which replaces the
  Backup tab ([Channel inputs](/guide/channel-inputs)).
- Direct switching, the default, relays the input on air without re-encoding:
  inputs encoded alike switch without viewers noticing, others restart the
  stream for a moment. Operators can choose seamless switching per channel
  (re-encoded, about 60% of a CPU core at 720p).
- Pull inputs: Unda fetches a stream from elsewhere and publishes it under a
  name you choose: HLS links (the best quality of a master playlist), MPEG-TS
  or FLV over HTTP, other RTMP servers, and RTSP cameras over TCP or UDP. Add
  them on Server → Pull inputs, in unda.yaml (pull_inputs) or with the API.
- A pulled stream works like any other: watch, restream, record, bundle, or use
  it as a backup source. Audio that isn't AAC is converted; HEVC or MPEG-2
  video is re-encoded on request.
- A source that drops is reconnected by itself; the stream stays up (frozen)
  for 10 seconds meanwhile, then ends until the source is back. Drops show in
  Events and raise an alert after 30 seconds.
- The address (passwords, tokens) is kept on the server and never shown again.
- Pull inputs are in the Professional and Broadcast packages (licence feature
  pull) and need FFmpeg. Licences issued before this release don't include
  them: ask for a new licence.
- Channel owners may pull public HLS and HTTP links only: Unda refuses
  addresses on the server or a private network, checked at every connection.
  RTMP servers, RTSP cameras and internal addresses are set by operators.
- Channel inputs are in Professional and Broadcast (the pull option needs the
  new pull feature, the playlist and seamless switching the 24/7 channels
  feature). On Starter the options show greyed, "not included in your
  licence". A channel counts as one live stream whatever its inputs.

### Fixes

- Backup sources and seamless switching: the sound of a live input could be
  up to a second ahead of its picture once it went on air (measured 0.9 s
  with a 2-second keyframe interval). Sound and picture are now in step,
  within one frame.

### Changes

- Streams with backup sources switched on keep working as before, with
  seamless switching; their tab on the stream page is now called Inputs.
- An HLS stream that ends and is live again at once (a publisher replaced
  under `publish_policy: replace`, a channel restarting on another input)
  shows players the end for a few seconds first, so they start again cleanly.
  Before, hls.js could go on into the new stream and stall repeatedly.

## v0.1.31 {#v0-1-31}

*12 October 2026*

### Security

- Built with Go 1.27.2, which fixes flaws in Go's own web server and
  libraries that v0.1.30 was built without: a crafted HTTP/2 or HTTP request
  could crash the server or keep it busy. Upgrade any server reachable from
  the internet.
- WebRTC: one address can hold no more sessions than
  limits.max_conns_per_ip (the next gets 429), a viewer's picture no longer
  breaks after 28 hours of watching, and sound packets no Opus encoder makes
  are refused before they reach FFmpeg.
- The WebRTC guide shows how to limit a coturn relay to the Unda server, so
  the per-viewer credentials can't be used to relay anything else.

### Fixed

- Text selected on the dashboard stays selected so it can be copied: pages
  that refresh every few seconds (Streams, Overview, Multi-channel, Playout,
  Media, Sessions) used to clear it.
- The Programme guide shows its timeline in a narrow or zoomed-in desktop
  browser (it switched to the phone list below 900 px), and changes layout
  as the window is resized.
- In the one-row menu of a narrow window, section names no longer overlap
  the next entry.

## v0.1.30 {#v0-1-30}

*11 October 2026*

### New

- WebRTC: about a second of delay. Encoders publish over WHIP (OBS 30 and
  newer: Service "WHIP", the stream key as Bearer Token; FFmpeg; a web page)
  and viewers watch over WHEP: the watch page has a Low latency switch. A
  WebRTC stream works with everything else (HLS, recording, restreaming, TV
  outputs), and any stream can be watched over WebRTC. Measured on one machine:
  0.1 to 0.15 s from the encoder to the browser.
- WebRTC uses one UDP port (8189) for all its media; behind NAT or in Docker,
  give the server's public address (webrtc.public_ips). Viewers on networks
  that block UDP can be given a TURN relay (coturn, with per-viewer
  credentials from a shared secret).
- TV outputs: AAC can be sent the DVB way (LATM, stream type 0x11) for
  receivers that need it.
- A multi-channel bundle's converted channel fits its video into the share you
  type, and the bundle table shows each channel's video and audio rates.

### Changed

- SD H.264 TV outputs and bundle channels default to a 1300 kb/s transport
  stream with AAC at 128 kb/s (video 960 kb/s), a common rate for SD channels.
  They were 2000 kb/s video with MP2 192 (2600 kb/s in all).
- TV outputs' audio defaults to AAC with H.264 and HEVC (the receivers of
  H.264-only DVB-T2 networks must play it; MP2 is optional for them), and to MP2
  with MPEG-2.
- The Guide page has zoom levels, an "On now" strip and channel badges, and
  the multi-channel bundles under Server are laid out more clearly.

Outputs and bundles made before keep the settings they were saved with. A
bundle in unda.yaml whose channels don't set audio_codec now sends AAC, and a
converted channel with a bitrate (share) now fills it with video instead of
using 2000 kb/s. The licenses' new webrtc feature is in Professional and
Broadcast; licenses issued before it need reissuing for WebRTC.

## v0.1.29 {#v0-1-29}

*8 October 2026*

### Fixed

- XMLTV links: a link stops showing every channel as soon as its account is
  demoted (it took up to a minute), an API key's link is its own and ends
  when the key is revoked, and the Guide page shows the link hidden until you
  click Show.

## v0.1.28 {#v0-1-28}

*7 October 2026*

### New

- An 8-day programme guide for TVs. Multi-channel bundles now send the coming
  8 days of each 24/7 channel (DVB EIT schedule) as well as now and next, so
  set-top boxes and TVs fill their guide grid. It goes only in the bundle's
  padding, never ahead of the channels.
- The guide can be chosen per bundle (now and next + 8 days, now and next only,
  or off), changed while the bundle is on air, and each channel can be left out.
- Programme descriptions: each playlist item can have one, shown in the TV's
  programme info and in XMLTV.
- XMLTV for IPTV apps: a private link on the new Guide page gives the guide of
  your channels in the standard XMLTV format. Administrators can switch the
  links off or replace them all.
- A Guide page shows every channel's programmes for today and the next 7 days.

### Security

- Files uploaded to the Media page are read only as video containers. On
  servers with an older FFmpeg (4.4, Ubuntu 22.04), a client could upload a
  playlist disguised as a video and play other clients' videos or recordings
  on their own channel. Newer FFmpeg already refused this.
- A multi-channel (MPTS) bundle stays up when one channel's source sends far
  more than its bitrate: the excess is dropped and the channel shows an
  overflow alert. Before, the server kept the excess in memory without limit.
- A client's restream destination can no longer point at the server itself
  when the server's network addresses can't be read. The systemd service
  now allows the socket Linux uses to list them, which multicast interface
  settings also need.
- Control characters in programme titles are removed from the TV guide (EIT)
  and service names.

### Changed

- Restreaming to SRT destinations is now a TV output, like UDP, RTP and RIST:
  it needs the `udp` feature in the license (the Broadcast package).
  Restreaming to YouTube, Facebook and other RTMP or RTMPS servers is
  unchanged, and so are SRT input and SRT playback.

If your license doesn't include `udp` and you already restream to an SRT
destination, that destination is kept but switched off after the upgrade, with
the reason shown. Ask your vendor for a license that includes it.

## v0.1.27 {#v0-1-27}

*7 October 2026*

### New

- A stream with backup sources can play a playlist of your videos while none
  of its sources has pictures, instead of black or one looped video. The
  playlist runs on its own clock, so viewers join it wherever it is rather
  than at its first video. Choose **Backup playlist** on the stream's
  **Backup** tab and edit it there.
- The channel's owner chooses what shows when no source has pictures (black,
  a video or the backup playlist) and edits the playlist. Switching backup
  sources on and the other settings stay with operators.
- A streaming channel has its own folder on the Media page for its backup
  videos, like a 24/7 channel's.

### Changed

- Deleting a streaming channel also deletes the videos in its own folder on
  the Media page.

## v0.1.26 {#v0-1-26}

*6 October 2026*

### New

- Clients can run their own 24/7 channels. A streamer sees Playout and Media,
  makes channels within their channel limit, uploads their own videos and
  edits their own playlists; they see only their own channels and files.
  Operators set the picture of every channel.
- A 24/7 channel's playlist can loop: switch on **Loop the playlist** and
  its videos play one after another, round and round, with no start times.
- Each 24/7 channel has its own files, and operators keep a set of shared
  files (idents, jingles, adverts) that every channel can use. A playlist can
  use only its own channel's files and the shared ones. Deleting a channel
  deletes its own files.

### Changed

- UDP, RTP and RIST destinations and broadcast outputs on the Restream tab
  now need the `udp` feature in the license, like UDP inputs and
  multi-channel bundles. Restreaming over RTMP, RTMPS and SRT is unchanged.

If your license doesn't include `udp` and you already send a stream over UDP,
RTP or RIST, or to a broadcast output, that destination is kept but switched
off after the upgrade, with the reason shown. Ask your vendor for a license
with `udp`; it starts again after a restart.

Existing media files become shared files: every channel keeps playing them,
and nothing moves.

## v0.1.25 {#v0-1-25}

*5 October 2026*

### Changed

- Every release now includes the `LICENSE` file (also in the Docker image, at
  `/usr/share/licenses/unda/LICENSE`). The dashboard's sign-in page and
  sidebar and `unda -version` show the copyright notice.
- Sessions name smart-TV players (Samsung TV, LG TV, Fire TV, Roku) instead
  of reading them as Safari.

### Fixed

- Chart peaks on the Overview and Server pages showed a date in January 1970
  instead of the time of the peak.
- Times of events and alerts were shown in UTC instead of your own time zone,
  with the full date even for today.
- On the Users page the role menu no longer cuts off "streamer", and a
  streamer's row keeps its buttons on one line.

## v0.1.24 {#v0-1-24}

*1 October 2026*

### Changed

- `api.token` (`UNDA_API_TOKEN`) is deprecated. It still works, but while it
  is set the server logs a warning and admins see one on the Overview. Create
  an API key under **API keys** for each script or Prometheus instead.
- Admins and owners see a **Security** notice on the Overview for each setting
  that weakens the server's protection: the legacy token, sign-in over plain
  HTTP without HTTPS, or a config file with secrets that other users can read.

### Fixed

- A video-only stream (a camera without a microphone) now plays on the watch
  page and over HLS. Before, it never started, and while a viewer kept
  trying, the server kept every frame of it in memory.
- A player asking for a stream that is not ready yet waits at most 30
  seconds, and stops waiting when the viewer leaves. Before, such requests
  stayed open on the server for as long as the stream was live.
- An SRT publisher sending malformed data can no longer stop the whole
  server; only its own connection ends.
- An encoder announcing an impossible picture size is treated as a bad
  stream description instead of being shown with a negative size.

## v0.1.23 {#v0-1-23}

*1 October 2026*

### Added

- **Docker image:** `ghcr.io/localhostdeveloper/unda`, for 64-bit Intel/AMD
  and ARM servers, built from the same files as the installer. See
  [Install](/guide/install#a-docker).
- Every upgrade now keeps a copy of the database: the new version's first
  start copies it to `backups/pre-upgrade-<old>-to-<new>-<time>.db` in the
  data directory before changing anything (the five newest are kept), however
  Unda was upgraded. If the copy fails, Unda does not start. See
  [Backups and upgrades](/guide/install#8-backups-and-upgrades).
- The update notice now says how to upgrade: run the install command again,
  or, in Docker, pull the new image.
- `unda healthcheck` checks the running server where its configuration puts
  it; the Docker image's health check uses it.

### Changed

- Docker: the example files keep uploaded media in `/data/media`, rotate
  Docker's logs, and show the `TZ` setting. New installs with the installer
  keep media in `/var/lib/unda/media`. Existing configurations are not
  changed.

### Fixed

- A playout channel now follows the server's clock when it jumps (the
  machine or its virtual machine slept, or the clock was set by hand). It
  used to stay behind its schedule by the whole jump until a restart; it
  now joins the item that should be on air and logs a warning event.
- In Docker, plain `http://` addresses redirected to the container's own
  HTTPS port (8443) instead of the published 443. Set
  `server.public_https_port: 443` (now in the Docker example of
  [Install](/guide/install)) and the redirect sends browsers to 443.

## v0.1.22 {#v0-1-22}

*1 October 2026*

### Added

- Broadcast outputs and re-encoded multi-channel programs can now be HD:
  720p50 or 1080i25 (interlaced, top field first) besides 576p25 SD, with
  H.264 (High profile) or HEVC video and AC-3 (Dolby Digital) or AAC audio
  besides MP2. Choose them under **Re-encode for broadcast TV**, in a
  bundle's channel rows, or with `format`, `video_codec` and `audio_codec`
  in the configuration file. HEVC is offered for progressive formats only.
- RTP outputs can carry SMPTE 2022-1 forward error correction, which
  broadcast equipment fed over IP often expects: add `?fec=1d` (columns) or
  `?fec=2d` (columns and rows) to an `rtp://` destination, with `fec_l` and
  `fec_d` for the matrix. It works for restream destinations, broadcast
  outputs and multi-channel bundles. See
  [Restreaming](/guide/restreaming#error-correction-for-rtp-smpte-2022-1).

### Fixed

- Switching on backup sources raised a false "input bitrate under half its
  baseline" alert: the stream is then Unda's own re-encode at its configured
  bitrate, and it was compared with the old encoder's. Streams Unda encodes
  itself (backup sources, playout channels) now start a new baseline whenever
  their encoder starts.
- On a stream's **Backup** tab, a drop-down could close and a field lose
  focus while you were using it, because the tab redrew itself every few
  seconds. It now waits until you leave the field.

### Changed

- Broadcast outputs now tell receivers what kind of service they carry (SD or
  HD H.264, HEVC; MPEG-2 stays "digital television"), so receivers that sort
  or filter channels by type show them correctly.

## v0.1.21 {#v0-1-21}

*1 October 2026*

SMPTE 2022-1 error correction on RTP outputs, also listed under v0.1.22.

## v0.1.20 {#v0-1-20}

*29 September 2026*

### Changed

- MPEG-DASH is no longer experimental. It was checked against the MPEG-DASH
  schema and with three players (dash.js and Shaka Player in Chrome, and VLC),
  in one quality and with adaptive bitrate, including switching qualities
  while playing.
- The dashboard and the documentation no longer mark DASH as experimental,
  and the install guide now covers firewalling UDP and RTP inputs.

### Fixed

- DASH players that follow the manifest's timing played 3 to 6 seconds
  further behind live than needed, and with adaptive bitrate dash.js stalled
  briefly when it changed quality. The manifest now gives the time each
  segment really becomes available.
- With adaptive bitrate, the DASH manifest understated what the smaller
  qualities use (up to 17 %), so a player could choose one its connection
  could not hold. It now includes the real overhead and peaks.
- Restreams over SRT, UDP, RTP, RIST and RTMP, and SRT viewers, could begin
  with a fraction of a second of audio stacked at the very start when the
  source was MPEG-TS (UDP, RTP, SRT). Some receivers reported the timestamps as
  invalid. That audio is now left out.

### Upgrade notes

No database change and nothing to configure.

## v0.1.19 {#v0-1-19}

*29 September 2026*

### Changed

- The dashboard menu is in three sections: Live (Overview, Streams,
  Multiview, Sessions, Events), Content (Channels, Recordings, Playout,
  Media) and Settings (Server, Users, API keys, Audit log, License, Account).
  Events and Channels moved up into their sections. Streamers, who see only a
  few pages, get the menu without section headings.

### Fixed

- On laptops with a short screen (1366×768, or Windows display scaling at
  125–150 %) the menu pushed the bottom of the sidebar (the connection
  status, the theme button, Sign out and the version) off the screen, with
  no way to scroll to it. The menu now scrolls on its own and the bottom of
  the sidebar always stays visible; on shorter screens the menu rows are
  also a little tighter.
- On narrow windows, a page with little on it stretched the top menu bar
  and left large empty gaps around it.

### Upgrade notes

No database change and nothing to configure. Reload the dashboard after the
upgrade to get the new menu.

## v0.1.18 {#v0-1-18}

*29 September 2026*

### Added

- Multi-channel: each channel in the New bundle and Add channel forms has an
  optional PIDs line (PMT, video, audio) for equipment configured by PID
  number. Left empty, PIDs are assigned automatically as before.

### Fixed

- Multi-channel bundles made in the dashboard kept automatic PIDs only until
  the next restart: they were then numbered again in channel order, so after a
  channel was removed, or added out of order, other channels moved to
  different PIDs. Each channel now keeps the PIDs it was given.
- A bundle mixing set and automatic PIDs could be refused when an automatic
  channel took a number a later channel asked for. Automatic PIDs now avoid
  every number the bundle's channels ask for.

### Upgrade notes

No database change. Existing dashboard bundles are numbered once more at the
first start after the upgrade (in channel order, as at any restart before) and
keep those PIDs from then on. Check each channel's PIDs in Server →
Multi-channel afterwards if equipment downstream is set up by PID.

## v0.1.17 {#v0-1-17}

*29 September 2026*

### Fixed

- Server → Multi-channel: fields in the New bundle, Add channel, New input and
  Publish forms lost focus at each 3-second refresh, so typing stopped after a
  character or two. The card now waits while a field is in use.
- The playback signing secret (Server → Playback) and a channel's backup
  stream key (stream → Backup) could be shown but not hidden again without
  reloading the page. Both have a Hide button.

### Upgrade notes

No database change. Dashboard fixes only; nothing to do after the upgrade.

## v0.1.16 {#v0-1-16}

*29 September 2026*

### Fixed

- 24/7 channels and backup sources produced no picture or sound on servers
  with FFmpeg 6.1 (Ubuntu 24.04): the channel's encoder waited forever at
  start and was restarted every 13 seconds ("the encoder stopped producing
  output"). Channels start normally after the upgrade.
- Multi-channel bundles on FFmpeg 8.0 (Ubuntu 26.04): the black or slate
  picture of an offline channel was sent far too fast and pushed its audio out
  of the bundle, and switching from the slate to the live stream left the
  channel without sound for over 5 seconds. Both are fixed; the switch takes
  about 3 seconds, as on other versions.

### Upgrade notes

No database change. This release is tested with the FFmpeg that each Ubuntu
LTS installs: 4.4 on 22.04, 6.1 on 24.04 and 8.0 on 26.04. Nothing needs
changing after the upgrade; a channel that was stuck starts within a few
seconds.

## v0.1.15 {#v0-1-15}

*28 September 2026*

### Added

- MPTS bundles carry now and next (DVB EIT present/following) for channels
  whose stream is a 24/7 playout channel, taken from its playlist. Turn it off
  per bundle with `epg: false`. See [Multi-channel](/guide/mpts).

### Changed

- The largest media file that can be uploaded is now 5 GB (was 50 GB).
  Larger files can still be copied into the media folder by hand.

### Fixed

- Installing a license that adds a feature the server started without
  (playout, SRT, UDP/MPTS, transcoding, restreaming) now shows a banner and a
  note on the License page saying the server needs a restart. Previously the
  feature stayed off with no indication why.

### Upgrade notes

No database change. Multi-channel bundles that carry a 24/7 playout channel
start sending now and next as soon as the server is upgraded; if equipment
further down the chain inserts its own EIT, set `epg: false` on those bundles
before upgrading. Uploads larger than 5 GB that were in progress are refused
when they resume; copy such files into the media folder instead.

## v0.1.14 {#v0-1-14}

*28 September 2026*

### Added

- Playout channels can be created, changed and deleted in the dashboard
  (Playout → New channel). The playlist editor sets start times, media, titles
  and in/out points, and shows the computed air times before saving. See
  [24/7 channels](/guide/playout).

### Upgrade notes

No database change. Channels defined in `unda.yaml` still work and are
labelled "from unda.yaml". Their playlist is read-only in the dashboard when
the server cannot write their schedule file, which is the case on installs
made with the installer (the systemd unit mounts `/etc/unda` read-only).
Create new channels in the dashboard instead. Downgrading to v0.1.13 hides
dashboard-created channels; they reappear after upgrading again.

## v0.1.13 {#v0-1-13}

*28 September 2026*

### Added

- Signed playback links. A protected stream (or all streams) plays only with a
  token in the URL. The token sets a deadline for starting playback; a viewer
  already watching is not cut off when it passes. Applies to the watch page,
  HLS, DASH, RTMP and SRT. Tokens are HMAC-SHA256 with a server secret, so a
  website can generate them. See
  [Signed playback links](/guide/protect-playback).
- Device limit per link (1, 2, 3 or 5), set per stream or per link. When a new
  device exceeds the limit, the oldest one is disconnected; the watch page has
  a "Watch here" button to take the seat back.
- Backup sources (failover). Each channel can have a second key for a backup
  encoder. If the main encoder disconnects or sends no video for 2 s, the
  output switches to the backup, another stream or a slate, and switches back
  once the main has been stable. The output is re-encoded, so viewers,
  restreams and recordings continue without reconnecting. See
  [Backup encoder](/guide/backup-encoder).

### Upgrade notes

Adds a column to the channels table (the backup key). The installer backs up
the database first; downgrading to v0.1.12 requires restoring that backup.
Backup sources require the license's playout feature, which evaluation mode
includes and licenses issued before v0.1.12 do not. Existing streams are
unaffected until playback protection or a backup source is switched on.

## v0.1.12 {#v0-1-12}

*27 September 2026*

### Added

- 24/7 playout channels. A channel plays files from a schedule, fills gaps
  with black, a slate or a looping video, and switches to a live input (vMix,
  OBS) while it is publishing. It is published as a normal stream, so
  playback, recording and restreaming work on it. See
  [24/7 channels](/guide/playout).
- Media page: upload video files from the dashboard. Uploads are resumable
  (select the same file again after a reload) and each file is probed before
  it is accepted.
- Playout page: current item and position, preview, upcoming items, schedule
  status, and the as-run log with CSV export.
- Restream destinations can be paused and resumed. The URL and key are kept.

### Changed

- A restream target is reported live only after the destination accepts the
  publish. A wrong or expired key no longer shows as connected.
- Restream retries back off to every 5 minutes. After 30 minutes of failures
  the target is paused and the reason is shown; resume it manually.
- Restream errors state the likely cause (for example "The destination
  refused the stream key"), with the raw error under "Technical detail".
  Alerts are raised once per stream, not once per destination.
- Events are stored for 30 days and survive restarts ("Show older events").
  Repeated events are shown as one line with a count.

### Fixed

- False "possible leak" warnings. The check now requires the load to stay
  constant for the whole 30-minute window.

### Upgrade notes

Adds two tables (playout as-run log, event history). The installer backs up
the database first; downgrading to v0.1.11 requires restoring that backup.
Playout requires the license's playout feature, which evaluation mode
includes and licenses issued before this version do not; request a new
license file to run 24/7 channels. Behind nginx, set
`client_max_body_size 16m;` for uploads. Nothing changes until a playout
channel is configured.

## v0.1.11 {#v0-1-11}

*27 September 2026*

- MPTS inputs accept SRT and RIST sources.
- MPTS outputs can be sent over RIST and at a variable bitrate.
- UDP destinations that fall behind skip to the next keyframe instead of
  accumulating delay.
- Recordings play in the dashboard, with seeking, speed control and frame
  step.

## v0.1.10 {#v0-1-10}

*26 September 2026*

- Sessions page: viewer history (stream, address, player, duration, bytes)
  for HLS, DASH, RTMP and SRT.
- Recordings page: play, download and delete recordings.
- Restream destinations added in the dashboard persist across restarts.
- UDP and RTP restreams are paced. Receivers no longer drop packets on
  keyframe bursts.

## v0.1.9 {#v0-1-9}

*26 September 2026*

- Fixed a false "Reconnecting" state after the dashboard tab had been in the
  background.
- The restream destination field shows the URL while typing so the key can be
  checked. It is still hidden after saving.

## v0.1.8 {#v0-1-8}

*26 September 2026*

- MPTS bundles can be created from the dashboard.
- The Server page is split into tabs.

## v0.1.7 {#v0-1-7}

*26 September 2026*

- MPTS output: several streams sent as one transport stream.
- MPTS input: a received bundle split into separate streams.
- TR 101 290 monitoring, and black or a slate while a program is offline.
- 2-second DASH segments from RTMP sources.

## v0.1.6 {#v0-1-6}

*26 September 2026*

- Broadcast outputs: SD 720×576 CBR MPEG-TS for DVB multiplexers.
- DASH with adaptive bitrate.
- Locked accounts can be unlocked from the dashboard.

## v0.1.4 {#v0-1-4}

*26 September 2026*

- Transcoding is configured in the dashboard, with GPU detection and a CPU
  load alert.
- Encoder setting hints, update notices, and licenses bound to a domain.

## v0.1.2 {#v0-1-2}

*25 September 2026*

- The installer backs up the database before an upgrade, and can use an
  existing certificate on servers where ports 80/443 are already in use.
- The watch page reconnects by itself when a stream drops or stalls.

## v0.1.0 {#v0-1-0}

*24 September 2026*

- First release.
