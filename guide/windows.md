---
title: "Run Unda Media Server on Windows (WSL or Docker Desktop)"
description: "Run Unda on a Windows PC: in Ubuntu under WSL with mirrored networking, or in Docker Desktop. Which to choose, the steps, ports, start-up without sign-in, and the limits of each."
---

# Unda on Windows

Unda is a Linux program. On a Windows PC it runs in one of two ways:

- **WSL**: Windows' built-in Ubuntu (Windows Subsystem for Linux), with
  Unda installed by the normal Linux installer.
- **Docker Desktop**: Docker's Windows app, running Unda's image.

Both run Linux in a small virtual machine inside Windows. They differ in how
that machine is connected to your network and how it starts.

## Which to choose

| | Linux server or VPS | WSL on Windows 11 | Docker Desktop |
|---|---|---|---|
| Starts after a reboot without anyone signing in | Yes | Yes, with a start-up task ([step 6](#_6-keep-it-running-after-a-reboot)) | No: Docker Desktop starts when a user signs in |
| Other machines reach Unda on the PC's address | Yes | Yes (mirrored networking) | Yes, on the ports you publish |
| Multicast in and out (UDP/RTP from encoders, IRDs, set-top boxes) | Yes | Out: yes, in use (a TV output to a station's SRT gateway). In: should work, through the same mirrored networking | Out with the [unda-mcast helper](#multicast-out-the-unda-mcast-helper); not in |
| The dashboard sees each viewer's real address | Yes | Yes | No: every viewer shows Docker's own address, so per-address limits and the Sessions page can't tell viewers apart |
| Encodes on a graphics card | Yes (NVIDIA; Intel should work) | No: the CPU | No: the CPU |
| Cost | Free | Free (part of Windows) | Docker's paid plan for larger companies |

**Our advice:**

1. **A Linux machine or VPS is best** for channels on air around the
   clock: nothing else shares its processor, it restarts by itself after a
   power cut, and it can encode on a graphics card. Use one for three
   channels or more.
2. **A TV station with one or two channels that wants to stay on Windows:
   use WSL on Windows 11** ([in one command](#in-one-command)). It starts
   with Windows, carries multicast and keeps viewers' real addresses, at
   no cost. Two channels, each with an H.264 TV output, use about 2 to 4
   of the processor's cores, so a recent PC with 6 cores or more has room
   without a graphics card. For a station:
   - **Give Unda a PC of its own**, not the one running vMix or your
     playout. TV outputs re-encode in real time and need their share of
     the processor at every moment; on a shared PC, a busy moment in the
     programme can break up the station's picture. Restreaming to
     platforms is fine on a shared PC.
   - **Set the PC never to sleep** (Settings → System → Power).
   - **Set Windows Update's active hours to your programme hours**
     (Settings → Windows Update → Advanced options). Windows then
     restarts for updates only outside them, and Unda is back by itself
     a minute or two after the restart.
3. **Use Docker Desktop to try Unda out, or on Windows 10**, where WSL
   can't share the PC's network (its mirrored networking needs Windows 11).

## WSL on Windows 11

### In one command

One PowerShell command does every step below for you. First, what it
needs and what it can't do:

- **Windows 11, version 22H2 or newer.** Older Windows can't put WSL on
  the PC's network; on Windows 10 use [Docker Desktop](#docker-desktop).
- **Virtualization switched on** in the PC's firmware: Task Manager →
  Performance → CPU shows "Virtualization: Enabled". If it says Disabled,
  the command stops and tells you how to switch it on. A Windows VPS needs
  its provider to allow nested virtualization; where that's not possible,
  use a Linux machine or VPS.
- **PowerShell as administrator, signed in as the Windows user who will
  use Ubuntu.** Ubuntu and its start-up task belong to that user.
- **The first time, two things by hand:** if WSL is new to the PC, it asks
  you to restart Windows and run the command again; and Ubuntu opens in a
  window of its own, where you choose a Linux user name and password. When
  that window shows Ubuntu's prompt, close it: the command carries on.
- **Docker Desktop installed?** Uninstall it first, or switch off its WSL
  integration for Ubuntu (**Settings → Resources → WSL integration**).
  Otherwise Ubuntu uses Docker Desktop's `docker` and the installer stops
  to say so.
- **Encoding on the CPU only:** Unda in WSL doesn't use a graphics card.
  It shares the processor with whatever else runs on the PC (vMix, OBS).
  For a channel on air around the clock, a Linux machine is better.
- **A certificate Unda makes itself:** browsers warn once about it (choose
  Advanced, then continue).
- **Unda's usual ports:** the dashboard on 8443, RTMP on 1935 (RTMPS
  1936), SRT on 6000. For other ports, follow the steps below by hand.
- **Starting with Windows:** on an account with a password, the task
  starts Unda a minute after Windows starts, before anyone signs in (it
  asks for the password once). On an account without one, Windows must
  sign in by itself, which it does when it's the only account.
- **Opening it from a Mac:** if the browser says the address can't be
  reached (`ERR_ADDRESS_UNREACHABLE`) while other devices open it, allow
  the browser in **System Settings → Privacy & Security → Local Network**,
  then quit and reopen it.

Then, in PowerShell as administrator:

```powershell
irm https://get.undamedia.com/windows.ps1 | iex
```

It installs WSL and Ubuntu 24.04 if they're missing, puts WSL on the PC's
own network, opens Unda's ports in WSL's firewall, runs Unda's installer
in Ubuntu (which checks the release's signature before installing
anything), creates the start-up task, checks that Unda answers at the PC's
address, and prints the link that creates the owner account. Running it
again is safe: it skips what's done, and on a working install it upgrades
Unda.

To read it before running it:
`irm https://get.undamedia.com/windows.ps1 -OutFile windows.ps1`, open the
file, then `Get-Content .\windows.ps1 -Raw | iex`.

### Step by step

The same steps by hand. Run the PowerShell commands in a PowerShell window
opened **as administrator**, and the Ubuntu commands in the Ubuntu window.

### 1. Install Ubuntu

```powershell
wsl --install -d Ubuntu-24.04
```

Restart Windows when asked, then open **Ubuntu** from the Start menu and
choose a Linux user name and password.

::: tip On a Windows VPS or a virtual machine
WSL runs a small virtual machine of its own, so inside a VPS it needs the
provider to allow a virtual machine within theirs (nested virtualization).
If `wsl --install` says "Failed to detect nested virtualization support"
even after a restart, ask the provider to turn nested virtualization on.
Docker Desktop needs it as well. Where a provider can't, use a Linux VPS:
Unda installs there with [one command](/guide/install).
:::

### 2. Put WSL on the PC's own network

Do this before installing Unda (step 5): the installer makes Unda's HTTPS
certificate for the addresses Ubuntu has at that moment.

```powershell
notepad $env:USERPROFILE\.wslconfig
```

Put this in the file and save it:

```ini
[wsl2]
networkingMode=mirrored
[experimental]
hostAddressLoopback=true
```

Then restart WSL:

```powershell
wsl --shutdown
```

With mirrored networking, Ubuntu uses the PC's own addresses: encoders and
viewers on your network reach Unda at the PC's address. The
`hostAddressLoopback` line lets the PC's own programs (vMix on the same
PC, a browser) reach it at that address too; they can always use
`localhost`. In Ubuntu, `ip -4 -o addr show` now lists the PC's network
address (192.168.… or 10.…), not one starting with 172.

### 3. Open Unda's ports

Mirrored WSL has a firewall of its own (Hyper-V firewall). Let Unda's ports
through:

```powershell
$wsl = '{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}'
New-NetFirewallHyperVRule -Name Unda-TCP -DisplayName "Unda TCP" -Direction Inbound -VMCreatorId $wsl -Protocol TCP -LocalPorts 1935,1936,8080,8443
New-NetFirewallHyperVRule -Name Unda-UDP -DisplayName "Unda UDP" -Direction Inbound -VMCreatorId $wsl -Protocol UDP -LocalPorts 6000,8189
```

| Port | For |
|---|---|
| 8443/tcp | The dashboard and watch pages (HTTPS) |
| 8080/tcp | Sends browsers on to 8443 |
| 1935/tcp, 1936/tcp | RTMP and RTMPS from encoders |
| 6000/udp | SRT |
| 8189/udp | WebRTC (low-latency viewers, WHIP encoders) |

UDP or RTP inputs from encoders and receivers need their ports opened the
same way (for example `-Protocol UDP -LocalPorts 5000` in a rule of their
own).

### 4. Check that Ubuntu runs systemd

In Ubuntu:

```bash
systemctl is-system-running
```

`running` or `degraded` is right. If it says `offline`, put these two lines
in `/etc/wsl.conf` (`sudo nano /etc/wsl.conf`), run `wsl --shutdown` in
PowerShell and open Ubuntu again:

```ini
[boot]
systemd=true
```

### 5. Install Unda

In Ubuntu:

```bash
curl -fsSL https://get.undamedia.com/install.sh | sudo bash -s -- --docker
```

The installer adds Docker's own engine to Ubuntu (no Docker Desktop
needed), makes an HTTPS certificate for the PC's name and addresses, starts
Unda and prints the link that creates the owner account:
`https://<PC address>:8443/dashboard#setup/…`. Your browser warns once about
the certificate, because Unda made it itself; accept it for this address.

If Docker Desktop is also installed and shares its engine with Ubuntu, the
installer stops with "this Docker is Docker Desktop". Turn that off in
Docker Desktop (**Settings → Resources → WSL integration**, switch off
Ubuntu-24.04), or remove Docker Desktop, then run the command again.

To upgrade later, run the same command again: your settings and data stay.

::: details Installed before step 2?
The certificate then names only WSL's internal address (172.…), and
browsers on your network get a name warning. After step 2, make it again
in Ubuntu (Unda picks it up by itself; the owner account and settings
stay):

```bash
cd /opt/unda && own=$(sudo stat -c '%u:%g' tls/privkey.pem) && h=$(hostname) && ip=$(ip -4 route get 1.1.1.1 | sed -n 's/.* src \([0-9.]*\).*/\1/p')
```

```bash
sudo openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -nodes -days 3650 -subj "/CN=Unda on $h" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,DNS:$h,DNS:$h.local,IP:$ip" -keyout tls/privkey.pem -out tls/fullchain.pem
```

```bash
sudo chown $own tls/privkey.pem tls/fullchain.pem && sudo chmod 600 tls/privkey.pem && sudo chmod 644 tls/fullchain.pem
```
:::

### 6. Keep it running after a reboot

WSL stops when nothing is using it, and starts only when someone opens it.
A task in Windows' Task Scheduler starts Ubuntu, and with it Unda, when
Windows starts. Create it in PowerShell **as administrator**, signed in as
the Windows user who installed Ubuntu (Ubuntu belongs to that user). Each
command below is one line: paste it whole.

**A Windows account with a password:** the task runs a minute after
Windows starts, before anyone signs in. It asks for the password, which it
needs for that:

```powershell
$t = New-ScheduledTaskTrigger -AtStartup; $t.Delay = "PT1M"; Register-ScheduledTask -TaskName "Unda (WSL)" -Action (New-ScheduledTaskAction -Execute "C:\Windows\System32\wsl.exe" -Argument "-d Ubuntu-24.04 --cd ~ --exec sleep infinity" -WorkingDirectory $env:USERPROFILE) -Trigger $t -Settings (New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries) -User "$env:USERDOMAIN\$env:USERNAME" -Password (Read-Host "Windows password for $env:USERNAME")
```

**A Windows account without a password:** Windows signs it in by itself
when it starts (if it's the only account), and the task runs 5 seconds
after that sign-in, without opening a window:

```powershell
$t = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"; $t.Delay = "PT5S"; Register-ScheduledTask -TaskName "Unda (WSL)" -Action (New-ScheduledTaskAction -Execute "C:\Windows\System32\conhost.exe" -Argument "--headless C:\Windows\System32\wsl.exe -d Ubuntu-24.04 --cd ~ --exec sleep infinity" -WorkingDirectory $env:USERPROFILE) -Trigger $t -Principal (New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive) -Settings (New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries)
```

Then restart Windows. Without opening Ubuntu, check:

```powershell
wsl -l -v; Get-ScheduledTaskInfo -TaskName "Unda (WSL)" | Select-Object LastRunTime, LastTaskResult
```

Ubuntu should be **Running** and `LastTaskResult` **267009** (the task is
still running, as it should be). Other results:

| Result | Means |
|---|---|
| 2147946720 | You started it again by hand while it was running: nothing wrong |
| 2147942403 | Windows could not find a program or folder: copy the command again, whole |

Then open the dashboard from another machine on your network.

### Where things are

| What | Where |
|---|---|
| Unda's settings | `/opt/unda/unda.yaml` in Ubuntu |
| Its data (channels, accounts, recordings) | The `unda-data` Docker volume |
| Logs | `cd /opt/unda && sudo docker compose logs -f` |
| Stop / start | `cd /opt/unda && sudo docker compose stop` / `start` |

Everything else in the [install guide](/guide/install) applies, from the
owner account on: the commands for Docker there work in Ubuntu with `sudo`
in front.

## Docker Desktop

Install Docker Desktop, then set Unda up with the Docker files in the
[install guide](/guide/install) (section 1, **A. Docker**), as written. On
Windows:

- **Docker Desktop must be running.** It starts when a user signs in to
  Windows, so a PC that should run Unda unattended needs Windows to sign
  in automatically.
- **Publish every port you use** in `docker-compose.yml`, UDP ones with
  `/udp` (for example `"6000:6000/udp"` for SRT), and allow them in Windows
  Firewall. Avoid UDP 500 for inputs: Windows' own VPN service uses it.
- **Multicast doesn't pass** Docker Desktop's virtual machine, in or out.
  Coming in, have senders send unicast to the PC's address and a published
  port, or use WSL. Going out, the helper below does it.
- **Viewers all appear with Docker's own address.** Per-address connection
  limits would count them as one, so leave `limits.max_conns_per_ip` unset.
- **Upgrades on air:** load or pull the new image, then
  `docker compose up -d` (not `down` first). A TV station's picture came
  back about 10 seconds later.

Tested in Docker Desktop on Windows: RTMP from encoders, SRT in and out,
UDP in and out by unicast, and a TV output feeding a TV station's receiver.

### Multicast out: the unda-mcast helper

Docker Desktop can't send multicast onto your network, so every release
comes with **`unda-mcast.exe`**, a small Windows program that does it for
Unda. Unda sends each channel as plain UDP to a port on this PC (that passes
Docker Desktop), and the helper sends every packet on, unchanged, to a
multicast address out of the network card you choose. An IRD, gateway,
modulator or VLC on that network then takes the multicast as usual.

1. **Download it** from your version's folder on the download site, for
   example `https://get.undamedia.com/v0.1.50/unda-mcast.exe` (the version
   is at the bottom of the dashboard's menu). Check it against `SHA256SUMS`
   in the same folder: the line for `unda-mcast.exe` must match
   `Get-FileHash .\unda-mcast.exe`.
2. **Point Unda at it.** For each channel, a TV output (or a restream) with
   **Unda sends it** to `udp://<this PC's address>:9000`; the next channel
   to port 9001, and so on.
3. **Try it.** In PowerShell as administrator, in the folder with the file:

   ```powershell
   .\unda-mcast.exe -map 9000=239.10.10.5:5000
   ```

   It lists the PC's network cards and asks which one to send out of, then
   shows every 5 seconds what arrives from Unda and what goes out. Play it
   in VLC: **Media → Open Network Stream**, `udp://@239.10.10.5:5000` (the
   `@` matters).
4. **Start it with Windows.** The same line with `-install` added (and the
   card chosen with `-iface`, see below):

   ```powershell
   .\unda-mcast.exe -install -map 9000=239.10.10.5:5000 -iface "Ethernet 2"
   ```

   It copies itself to `C:\Program Files\Unda`, adds a start-up task that
   runs before anyone signs in, at high priority so its output stays even on
   a busy PC, and lets its ports through Windows Firewall. Running `-install`
   again replaces the settings. `-uninstall` removes it all. What it does (a
   card unplugged or back, a new address) is written to
   `C:\Program Files\Unda\logs\unda-mcast.log`.

**Its settings:**

| Setting | What it does |
|---|---|
| `-map 9000=239.10.10.5:5000,9001=239.10.10.6:5001` | Each port Unda sends to, and the multicast address and port it goes out as. One port per channel. |
| `-map 9000=239.10.10.5:5000,9000=239.20.20.5:6000` | A port listed again also goes to that address: one channel to several addresses, with no second encoder in Unda. |
| `-listen 9000 -to 239.10.10.5:5000 -channels 3` | Counting up instead: ports 9000 to 9002 go to 239.10.10.5, .6 and .7, all on port 5000. |
| `-iface 2` or `-iface "Ethernet 2"` | The network card to send out of: its number in the list it shows, or its name (`Get-NetAdapter` lists them). |
| `-iface "Ethernet 2,Ethernet 3"` | Several cards: it sends out of each one that has a cable, and starts on a card a few seconds after its cable is plugged in. For a receiver that may go on whichever port is free. |
| `-iface all` | Every card with a cable, including your office network: its devices then get the channels too. |
| `-allow 192.168.1.20` | Also take channels from another machine (addresses or ranges, comma-separated). By default only this PC may send to it. |
| `-ttl 16` | How many routers the multicast may cross (16 by default). |

**Good to know:**

- **A channel with other settings** (another format or bitrate) is another
  TV output in Unda, on its own port, with that port added to `-map`.
- **Choose addresses in 239.x.x.x**, the range for use inside one
  organisation, with a different last number for each channel. Avoid
  224.0.0.x (network control), 232.x.x.x (source-specific: many receivers
  can't join it) and 239.255.255.250 (used by Windows itself).
- **Two cards on the same network** get every packet twice: send out of one.
- **A receiver cabled straight to the PC**, without a router between them,
  works too: Windows gives that port an address of its own (169.254.x.x)
  within about half a minute, and the helper starts on it a few seconds
  later.
- The helper starts before anyone signs in, but has nothing to send until
  Docker Desktop, and Unda in it, are running.

Tested on Windows with Docker Desktop: VLC on another PC and a TV station's
SRT gateway received the multicast, at a steady 1300 kb/s during a live
programme with vMix producing on the same PC.
