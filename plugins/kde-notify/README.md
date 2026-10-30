# kde-notify

Sends a KDE Connect notification when a root agent finishes or needs the user. It is mounted once for the whole profile, not per preset.

| | |
|---|---|
| Plugin id | `kde-notify` |
| File | [`kde-notify.mjs`](kde-notify.mjs) |
| Injects | `agents` |
| Installs to | `$LOCAL_AI/plugins/kde-notify.mjs` |
| Uses | [`../notifications/notifications.mjs`](../notifications/notifications.mjs), installed as `$LOCAL_AI/notifications.mjs` |

## When it fires

| Event | Condition | Message |
|---|---|---|
| `turn/end` | reason `completed` | `DSH task finished — <project> [<session>]` |
| `turn/end` | reason `error`, `blocked`, or `max-tokens` | `DSH needs attention — task failed`, `task blocked`, or `output limit reached` |
| `approval/request` | a root agent asks for approval | `DSH needs attention — approval required` |
| `user-questions/request` | a root agent asks a question | `DSH needs attention — question requires an answer` |

`<project>` is the basename of the session workspace, truncated to 80 characters, and `<session>` is the last eight characters of the agent id.

## Suppression rules

- Only root agents notify. A subagent finishing is silent.
- Events older than the moment the plugin applied are ignored, so mounting mid-session does not announce old turns.
- Each turn notifies once, keyed by session and turn number, through the bounded `remember` set.
- An approval or question request object is notified once, and never after its signal is aborted.

## Requirements

- `kdeconnect-cli` at `/usr/bin/kdeconnect-cli` with at least one device paired and available. Without a device nothing is sent.
- `~/.config/local-ai/notifications.json` with `{"enabled": false}` disables delivery without unloading the plugin.
- Delivery failures are logged to `~/.local/state/local-ai/notifications.log`; they never fail the turn.

## Ordering with the notification module

`kde-notify.mjs` imports `../notifications.mjs`. That relative path is written for the install location (`$LOCAL_AI/plugins/` next to `$LOCAL_AI/notifications.mjs`), so copy both files or the import fails at load time.
