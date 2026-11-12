# Web launcher

`DSH.desktop` opens a Konsole window and runs `dsh web` in it, the same as typing
the command in a fresh terminal. The harness opens its own authenticated browser
page, and `--hold` keeps the window open after the server exits.

## Requirements

- Linux with a desktop session and Konsole at `/usr/bin/konsole`.
- `dsh` on the `PATH` seen by an interactive Bash, with the `web` profile
  installed.
- Port 3080 free, unless `--port` is added to the `Exec` line.

## Install

```sh
mkdir -p "$HOME/.local/share/applications"
cp launchers/DSH.desktop "$HOME/.local/share/applications/"
```

On GNOME, mark the installed copy as trusted:

```sh
gio set "$HOME/.local/share/applications/DSH.desktop" metadata::trusted true
```

The repository file is executable. A file manager that requires trust may ask
before running it from the checkout.

## Customise

- **Workspace:** add `--workdir /path/to/project` to the Konsole command so the
  harness starts in that directory. Without it, the harness starts in the home
  directory, as a new terminal does.
- **Icon:** set `Icon=` to an installed icon name or an absolute image path. The
  tracked file uses the stock `utilities-terminal` icon so the repository carries
  no machine-specific path.
- **Terminal:** replace `/usr/bin/konsole --hold -e` with another terminal's
  hold-and-run form.

## Verify

```sh
desktop-file-validate launchers/DSH.desktop
```

A launch shows the harness log in Konsole, opens the authenticated page in the
default browser, and leaves the window open when the server stops. A second
launch while port 3080 is occupied prints the bind error in the held window.
