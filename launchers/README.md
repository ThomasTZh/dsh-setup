# Web launcher

`DSH.desktop` opens a Konsole window and starts `run-dsh.py`, a foreground
supervisor. The supervisor runs `dsh web` in its own process group, prints the
harness log to the terminal, and waits. `dsh web` prints and opens its own
authenticated URL.

## Stopping

| Action | Result |
|---|---|
| Ctrl+C once | SIGTERM to the `dsh web` process group; waits up to 15 seconds, then SIGKILLs any survivor; the supervisor exits and the terminal closes |
| Ctrl+C twice | SIGKILL to the process group immediately; the supervisor exits and the terminal closes |
| Close the terminal | SIGHUP follows the same clean stop as Ctrl+C |
| `dsh web` exits on its own | the supervisor stops the remaining work, reports the exit code, and holds the window open for diagnosis |

A second launch while the supervisor is running exits at the instance lock. A
launch while another `dsh web` already uses port 3080 fails at preflight and
holds the window open with the port message.

## Logs and state

Logs are appended under `$XDG_STATE_HOME/dsh-web/launcher/logs/` (default
`~/.local/state/dsh-web/launcher/logs/`) and kept to the ten newest files. The
same directory holds the instance lock. Log files are created mode 0600.

## Requirements

- Linux with a desktop session and Konsole at `/usr/bin/konsole`.
- Python 3.9 or newer.
- `dsh` on the `PATH` seen by a login Bash, with the `web` profile installed.
- Port 3080 free.

## Install

The desktop entry starts the supervisor from `~/.local/share/dsh-setup/`,
so install both files:

```sh
mkdir -p "$HOME/.local/share/dsh-setup" "$HOME/.local/share/applications"
cp launchers/run-dsh.py "$HOME/.local/share/dsh-setup/"
cp launchers/DSH.desktop "$HOME/.local/share/applications/"
```

On GNOME, mark the installed copy as trusted:

```sh
gio set "$HOME/.local/share/applications/DSH.desktop" metadata::trusted true
```

The source files are executable. To run from a checkout without installing,
change the supervisor path in the entry's `Exec` line.

## Customise

- **Workspace:** the supervisor runs `dsh web` in the terminal's working
  directory. Add `--workdir /path/to/project` to the Konsole command.
- **Icon:** set `Icon=` to an installed icon name or an absolute image path. The
  tracked file uses `utilities-terminal`.
- **Port:** the supervisor probes `http://127.0.0.1:3080/`; if `dsh web` uses
  another port, change `FRONTEND_URL` in `run-dsh.py` and add `--port` to the
  service command.
- **Terminal:** replace `/usr/bin/konsole -e` with another terminal's
  run-and-close form.

## Verify

```sh
python3 -m py_compile launchers/run-dsh.py
desktop-file-validate launchers/DSH.desktop
```

The supervisor was exercised with stub HTTP services: one Ctrl+C stopped
cleanly, two Ctrl+C killed a SIGTERM-ignoring service in about 0.4 seconds, and
SIGHUP stopped cleanly; each run closed its port and reaped its process group.
A live `dsh web` launch from the entry is not tested in the agent sandbox,
which mounts `~/.dsh` read-only; it remains a manual check on the desktop.
