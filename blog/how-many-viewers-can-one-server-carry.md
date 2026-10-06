---
title: How many viewers can one server carry?
description: Viewer capacity is arithmetic on your server's upload, not a question of processor power. How to work it out, what restreaming and adaptive bitrate change, and what to check before a big event.
date: "2026-10-06"
---

# How many viewers can one server carry?

*6 October 2026 · UndaMedia*

It's the first question in almost every conversation we have: "How many
people can watch?" The answer is less about the server than people expect,
and more about one number on the hosting plan: **the upload speed**.

## Every viewer gets their own copy

On the internet, a server sends each viewer their own copy of the stream. A
3 Mb/s stream watched by 100 people means 300 Mb/s leaving the server. So the
sum is simple:

> viewers ≈ upload speed × 0.8 ÷ stream bitrate

The 0.8 keeps 20% spare, because connections are never perfectly steady.

| Server upload | Viewers at 3 Mb/s | Viewers at 5 Mb/s |
|---|---|---|
| 100 Mbit/s | about 25 | about 15 |
| 1 Gbit/s | about 250 | about 150 |
| 10 Gbit/s | about 2,500 | about 1,500 |

## The processor is rarely the limit

Sending a stream on is copying, not converting. On a test machine, Unda served
200 simulated viewers of a 1080p stream at 5 Mb/s, about 1 Gb/s in total,
using roughly a quarter of one processor core, with no freezes.

A more powerful server on the same connection does not serve more viewers.
Processor power matters for the work that converts video: making several
qualities, 24/7 channels and backup encoders. That is a separate sum; see
[how far one server goes](/guide/compatibility#how-far-one-server-goes).

## What changes the sum

- **Restreaming uses the same upload.** Each destination, such as YouTube or
  Facebook, costs as much as one viewer at its bitrate. Once there, those
  platforms serve their own viewers.
- **Adaptive bitrate lets more people fit.** Viewers on slow connections take
  a smaller quality, so the average bitrate per viewer drops. It also keeps
  those viewers watching instead of buffering.
- **The bitrate itself.** 720p at 2.5 Mb/s looks good on most phones and
  laptops and serves twice as many viewers as 1080p at 5 Mb/s.

## Check the monthly allowance too

Many hosting plans advertise a fast port but include a monthly transfer
allowance. Streaming uses it quickly: one viewer watching a 3 Mb/s stream for
two hours receives about 2.7 GB. A two-hour service watched by 100 people is
about 270 GB. Weekly, that is over a terabyte a month. Check the plan's
allowance and what it charges beyond it.

## When the uplink is full

When more people come than the upload can carry, everyone's picture suffers
together. Unda lets you set a cap on outgoing bandwidth instead: once it is
reached, new viewers are told to try later while everyone already watching
keeps a smooth picture. With a cap set, the dashboard shows how much room is
left as "room for about N more viewers", worked out from the actual traffic.

## Bigger than one server

For audiences beyond what one connection can carry, the usual answers are a
content delivery network (CDN) in front of the server, or restreaming the big
public part of the audience to YouTube or Facebook while your own players
serve members or paying viewers.

If you're planning an event and want a second opinion on the numbers,
[send us the details](/contact).

---

[← All articles](/blog/) · Related: [Adaptive bitrate](/features/adaptive-bitrate) · [Restreaming](/features/restreaming)
