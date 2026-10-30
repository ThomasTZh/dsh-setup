# dsh-mcp-auto-permission

A local DeepSeek Harness bundle that adds the **Workspace Write + MCP** permission preset (`workspace-write-mcp`) and auto-approves MCP approval requests while that preset is current.

## Behaviour

| Item | Value |
| --- | --- |
| Sandbox | `workspace-write` |
| Approval policy | `ask` |
| Non-MCP tools | unchanged, including sandbox-escalation prompts |
| MCP tools | approval requests claimed as `allowed-once` |
| Preset key | `workspace-write-mcp` |
| Display label | Workspace Write + MCP |

The preset keeps the `workspace-write` file and shell boundary. A tool that the policy hard-denies before asking is still denied; this bundle only answers approval requests, it does not override a deny.

## Why an approval hook

The local policy asks for Playwright through `ctx.approval.request`. A profile plugin can claim that request on the `approval/request` waterfall and return `allowed-once`, so the user never sees an approval card. This avoids changing the policy plugin and avoids competing in the `tools/execute` hook, where a later policy listener could still block the call.

The hook is scoped by the session's current permission preset. If the preset is not `workspace-write-mcp`, the plugin calls `next()` and the normal answerers decide. It also returns `cancelled` when the request signal is already aborted, and it falls back to the normal answerers when the permission service or projection is unavailable.

The plugin provides `mcpAutoPermission.autoApproves(session, toolName)`. The KDE notification plugin reads it to skip a false "approval required" alert for a call that this plugin claims. The approval is still logged and the tool still runs.

A short system-prompt note is active only in this mode. It tells the model that `mcp__*` calls are pre-approved, which prevents the persona's generic browser-approval wording from making the model pause.

## Files

- `cordis.patch.yml` declares the permission preset table and inserts the `mcp-auto-permission` plugin at the profile root.
- `lib/index.js` contains the approval hook, the auto-approval service, and the system-prompt note.
- `test/index.test.mjs` covers claiming, fallbacks, cancellation, the auto-approval predicate, and the note.

## Install

From a checkout, link the directory into the profile and add the bundle:

```bash
DSH_HOME=${DSH_HOME:-$HOME/.dsh}
ln -s "$PWD/plugins/dsh-mcp-auto-permission" \
  "$DSH_HOME/local-plugins/dsh-mcp-auto-permission"
```

Add to `$DSH_HOME/profiles/web/package.json`:

```json
"@local/dsh-mcp-auto-permission": "link:__SETUP_ROOT__/plugins/dsh-mcp-auto-permission"
```

and to `dsh.profile.bundles`:

```json
"@local/dsh-mcp-auto-permission"
```

Install the profile dependencies and restart DSH:

```bash
cd "$DSH_HOME/profiles/web" && pnpm install
```

The bundle patch is applied before the profile patch. If the user later selects a new-session default, the settings service writes a complete `permission` entry into the profile patch, which then overrides the bundle's copy with the same preset definitions. That is ordinary DSH settings persistence.

## Limitations

- A hard policy deny for an MCP tool is not overridden. In the current profiles MATLAB MCP is only mounted in MATLAB mode, where it is allowed; General does not mount it.
- Delegated subagents pin approval policy to `never` upstream, so they do not inherit this mode.
- The headless profile does not load this bundle.
