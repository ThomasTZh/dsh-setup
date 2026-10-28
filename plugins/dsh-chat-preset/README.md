# dsh-chat-preset

A DeepSeek Harness bundle that registers a `chat` agent preset: a plain helpful assistant with web access and local skills, and no way to touch the filesystem or run a command.

## What it registers

One preset, mounted from [`cordis.patch.yml`](cordis.patch.yml):

| Field | Value |
|---|---|
| `id` | `chat` |
| `name` | Chat |
| `order` | 5 |
| persona | helpful assistant, cites sources, marks uncertainty, never claims to have run something it did not |
| tools | `web_search`, `web_fetch`, `skill` |
| compaction | basic compaction plus `/compact` |

The persona is `complete: true`, so it replaces rather than extends the host prompt, and `includeRuntimeContext` is off: chat mode does not get the workspace facts injected.

## Why a guard instead of a config flag

The preset's own tools are registered in the shared preset scope, and the host also registers a few global tools such as `working_directory`. A restriction applied at the preset scope would filter the preset's own tools too, and would miss the globals. So the restriction is applied per agent, once the agent exists.

[`lib/guard.js`](lib/guard.js) listens for `agent/created`, reads the tools that agent can actually see, keeps `web_search` and `web_fetch`, adds `skill` when it is present, and calls `agent.ctx.tools.restrict({ allow })`.

Reading the allow list from the visible tools rather than hard-coding it means a search-only or fetch-only web configuration still produces the right restriction instead of an empty one. If no web tool is registered at all, the guard logs a warning and leaves the inherited tools unrestricted, which is a deliberate failure mode: it prefers a visible configuration error over silently removing a tool the user asked for.

## Why the skill tool survives

`skill` reads only the skill files that the discovery provider exposes. It never resolves a workspace path, so keeping it does not widen filesystem access. Dropping it would make user-level skills unreachable in the one mode that most needs them.

## Install

```powershell
dsh plugin --profile web add "<path-to-this-directory>"
```

Or record it in a profile's `package.json` as a `link:` dependency and list `@local/dsh-chat-preset` in `dsh.profile.bundles`. The second form is what [`../../profiles/web/package.json`](../../profiles/web/package.json) does.

## Notes

- `private: true` and unversioned: this is a local bundle, not a published package.
- The export map deliberately exposes only `./guard`. The bundle patch is resolved through `dsh.bundle.patch`, not through an export.
