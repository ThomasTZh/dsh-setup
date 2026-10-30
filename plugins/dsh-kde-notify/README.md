# dsh-kde-notify

A local DeepSeek Harness bundle that sends KDE Connect notifications when a DSH session actually needs a human decision.

## Behaviour

The plugin notifies only for:

- an approval request that reaches the human answerers;
- a user question that needs an answer.

It does not notify for turn completion, task failure, blocked work, or output-limit stops.

When the current session uses the `workspace-write-mcp` permission preset, the `mcp-auto-permission` plugin claims MCP approval requests before the human answerers. This plugin asks that plugin through its `mcpAutoPermission.autoApproves(session, toolName)` service and skips the notification for those calls. The approval is still audited and the tool still runs; only the false "approval required" alert is removed.

If the mcp-auto plugin is absent, or its lookup fails, the notification is sent as before.

## Why the service lookup

The approval service appends `approval/asked` before dispatching `approval/request`, so event order alone cannot distinguish an auto-approved call. The mcp-auto plugin owns the exact predicate. Asking it through a small service keeps the preset name and MCP prefix in one place instead of duplicating them in the notifier.

## Files

- `package.json` declares `dsh.bundle.patch` and the module entry.
- `cordis.patch.yml` inserts the `kde-notify` plugin at the profile root.
- `lib/index.js` registers the approval and question handlers, performs the auto-approval lookup, and delegates delivery to `notifications.mjs`.
- `test/index.test.mjs` covers notifications, deduplication, child and aborted requests, auto-approval suppression, fallback on lookup errors, and sender failures.

## Install

The package is installed at `~/.config/local-ai/plugins/dsh-kde-notify`, linked from this release tree as `__SETUP_ROOT__/plugins/dsh-kde-notify`, and registered in the web profile as a bundle and dependency. The plugin imports `notifications.mjs` through `../../../notifications.mjs`, which resolves to the root link in this tree and to `~/.config/local-ai/notifications.mjs` at the live install.

The old profile-patch insertion of `kde-notify` is removed; the bundle owns the DSH plugin composition.

## Limitations

- Notifications are still best-effort and never block or change a decision.
- KDE Connect device discovery and delivery use the existing `notifications.mjs` helper, including its enable/disable file at `~/.config/local-ai/notifications.json`.
- The plugin does not try to infer auto-approval from event order or timing. If another plugin auto-approves approvals without exposing a predicate, this plugin cannot know and will still notify.
