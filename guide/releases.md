---
title: "Releases, upgrades and support"
description: "How often Unda Media Server is released, what version 1.0 will mean, which versions get fixes, and how upgrades and licenses work."
---

# Releases and support

How Unda is released, what version 1.0 will mean, and how upgrades work.

## How often

- **A feature release each month.** New features are collected and
  released together, with their [release notes](/release-notes).
- **Fix releases in between, when needed.** They only fix faults; they add
  nothing new, so they are safe to install straight away.
- **Security fixes as soon as they are ready**, whatever the date.

Every server checks for new releases and shows a notice to its admins and
owners under Overview → Other notices.

## Version 1.0

Unda is at version 0.x. It becomes 1.0 when all three of these are true:

1. A 24/7 channel has run for 72 hours without a break, with memory steady.
2. Unda has run in production at a customer for 30 days with no critical
   fault.
3. After that, two weeks of fixes only: no new features.

We expect 1.0 in December 2026. Features added in the meantime ship in 0.x
releases first.

## Which versions get fixes

Until 1.0, fixes go into the next release: upgrade to the newest version to
get them. A version with a serious fault may be withdrawn from download;
its release notes then say so and which version to install instead.

After 1.0, a stable line will receive fixes only, for a period announced
with 1.0, so you can stay on it while new features arrive in later releases.

## Upgrading

- **Installed with the installer:** run the install command again. It backs
  up the database first and keeps your configuration and data.
- **Docker:** change the image tag to the new version and pull it.
- **Every upgrade starts with a copy of the database,** made by the server
  itself before anything changes; going back is described in
  [Backups and upgrades](/guide/install#8-backups-and-upgrades).
- An older version refuses a database that a newer one has changed: to go
  back, restore the copy made before the upgrade.

## Licences

A licence keeps working when you upgrade. Licences issued or renewed from
26 October 2026 need Unda v0.1.46 or later. See [License](/guide/license).
