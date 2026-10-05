# Ways to earn with Unda

Unda does not charge your viewers itself: it has no payment page and inserts
no ads. You earn by selling a service built on it. These are the ways
customers use it today, with the parts of Unda each one relies on.

## Streaming events for clients

Churches, weddings, funerals, graduations, conferences, concerts: many
organisations want their event online and have no one to do it. A production
team or a freelance streamer charges per event, or a monthly fee for a weekly
service.

What Unda gives you to sell:

- **The client's own player page** (`/watch/<name>`), to share or embed on
  their website, not only a Facebook or YouTube link
  ([Watching and embedding](/guide/watching)).
- **Every platform at once**: the same stream to YouTube, Facebook and others
  ([Restreaming](/guide/restreaming)).
- **The recording**, ready to hand over after the event
  ([Recording](/guide/recording)).
- **A backup encoder**, so the stream stays on air if the main one drops
  ([Backup encoder](/guide/backup-encoder)).
- **Viewer figures** to report back: how many watched, from where and for how
  long ([Viewer sessions](/guide/monitoring#viewer-sessions)).

One server serves many clients: give each a channel with its own key
([Accounts and channels](/guide/accounts#channels)).

## Ticketed and pay-per-view events

Sell tickets to a concert, a match, a conference or a paid course, and let
only buyers watch.

Unda provides the lock: with [signed playback links](/guide/protect-playback),
a stream plays only with a link you make. Each link has a deadline for
starting to watch and a limit on how many devices can use it at once, so a
link passed around stops being useful.

Your website provides the till: it takes the payment (Paystack, Flutterwave,
Stripe or any other), then makes a link for that buyer and shows or emails
it. [Make links on your own website](/guide/protect-playback#make-links-on-your-own-website)
has the code, a few lines in PHP, Node.js or Python, for your web developer.

## Your own internet TV channel

Run a channel that is on air all day: your programmes play to a schedule,
live shows take over when they start, and the schedule picks up again when
they end ([24/7 channels](/guide/playout)). Viewers on mobile data get a
quality their connection can carry ([Adaptive bitrate](/guide/transcoding)).

The income comes from sponsors and advertisers (with their spots edited into
your programmes), from paid subscriptions using signed links as above, or
from carrying the channel on other platforms through restreaming. Unda does
not insert ad breaks by itself.

## Hosting streams for other organisations

Run one Unda server and rent streaming to smaller organisations (churches,
schools, radio stations, community groups) for a monthly fee. They stream
from their own OBS or vMix; you run the server.

- **An account for each client** with the streamer role: they see their own
  channels and nothing else, in the dashboard or the API
  ([Roles](/guide/accounts#roles)).
- **A channel limit per client**, set when you invite them.
- **Usage per client for billing**: the **Sessions** page adds up watch time,
  viewers and traffic per stream for the last day, week or month, and its
  **History** tab downloads every session as a CSV file
  ([Viewer sessions](/guide/monitoring#viewer-sessions)).

::: warning Check your license first
Hosting streams for other organisations is not the same as running Unda for
your own. Before you sell this, ask your vendor whether your license allows
it and how many live streams it covers.
:::

## What Unda does not do

So that you can plan for it:

- **No payments.** Tickets, subscriptions and invoices are handled by your
  own website or billing system.
- **No automatic ad breaks.** Adverts are part of the programme you play.
- **No public catch-up library.** Recordings are for your team in the
  dashboard; to publish them, download them and post them where your viewers
  watch.
