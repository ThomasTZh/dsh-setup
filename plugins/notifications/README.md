# notifications

The delivery layer behind the notification bundle: it reads the notification config, finds available KDE Connect devices, sends the message to each, and logs failures. It is a module rather than a harness plugin, so it is imported by name and never mounted on its own.

| | |
|---|---|
| File | [`notifications.mjs`](notifications.mjs) |
| Installs to | `$LOCAL_AI/notifications.mjs` |
| Imported by | [`../dsh-kde-notify/lib/index.js`](../dsh-kde-notify/lib/index.js) |

Root [`notifications.mjs`](../../notifications.mjs) is a symlink to this file. The notification bundle imports `../../../notifications.mjs`, which resolves to that root link in the release tree and to `$LOCAL_AI/notifications.mjs` at the live install.

## Exports

| Export | Behaviour |
|---|---|
| `notify` | The default notifier, configured with the real paths and the real command runner. |
| `createNotifier({configPath, run, log})` | Builds a notifier with injectable config path, command runner, and failure log, which is how it is tested. |
| `notificationMessage({app, kind, reason, workspace, sessionID})` | Formats the message and strips control characters and newlines. |
| `remember(limit = 2048)` | Returns a dedupe predicate with a bounded key set; the oldest key is dropped first. |
| `deliver(sender, notification)` | Calls the sender without awaiting it and swallows errors, so desktop delivery can never fail a task. |
| `runCommand`, `CONFIG_PATH` | The `execFile` wrapper and the config location, exposed for reuse and tests. |

## Delivery

1. Read `~/.config/local-ai/notifications.json`. A missing file means enabled; any other read or parse error is reported to the log and nothing is sent.
2. If `enabled` is not `true`, return `{skipped: true}`.
3. Run `kdeconnect-cli --list-available --id-only`, deduplicate the device ids.
4. Run `kdeconnect-cli -d <id> --ping-msg <message>` for each device, with a 5 s timeout, `SIGKILL` on expiry, and a 64 KiB output buffer.
5. Return `{sent, failed, skipped}` and log each failure with a timestamp.

## Files

| Path | Purpose |
|---|---|
| `~/.config/local-ai/notifications.json` | `{"enabled": true}` or `{"enabled": false}`; a non-boolean is an error. |
| `~/.local/state/local-ai/notifications.log` | Append-only failure log, created with mode `0600`. |

## Test a notification by hand

```sh
node plugins/notifications/notifications.mjs --test DSH
```

Without `--test` the module prints usage and exits 2, so it is safe to import and safe to run accidentally.
