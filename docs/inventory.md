# Inventory

The harness this record describes, with the reasoning behind each piece. Paths use
placeholders; the last section says what each placeholder stands for.

## Profile `web`

Location: `$DSH_HOME/profiles/web/`

| File | Tracked | Notes |
|---|---|---|
| `cordis.yml` | no | Generated stub, an empty entry list. Do not edit. |
| `cordis.patch.yml` | yes | The patch layer, applied after every bundle layer. Holds the overrides and both local presets. |
| `package.json` | yes, templated | Dependencies plus `dsh.profile.bundles`; the `link:` target is rewritten to `__SETUP_ROOT__`. |
| `pnpm-lock.yaml` | no | Regenerated with the dependencies. |
| `node_modules/` | no | Reinstalled. |

## Bundles, in load order

| # | Bundle | Why |
|---|---|---|
| 1 | `@deepseek-ai/dsh-base` | Harness core: loader, sessions, tools, permissions. |
| 2 | `@deepseek-ai/dsh-web-app` | The Web GUI, and the shipped presets. |
| 3 | `@local/dsh-chat-preset` | The `chat` preset bundle. Contributes a preset, not tools. |
| 4 | `@local/dsh-mcp-auto-permission` | Adds the `workspace-write-mcp` permission preset and its approval predicate. |
| 5 | `@local/dsh-kde-notify` | Human approval and question notifications, with auto-approved MCP suppression. |
| 6 | `dsh-codex` | The openai-codex provider. |
| 7 | `@deepseek-ai/dsh-experimental-auto-review` | Review pass; kept on. |
| 8 | `dsh-pocket` | Tunnel proxy. |
| 9 | `@linxin666/dsh-client-ui-skill-explorer` | Skill Center. |
| 10 | `@linxin666/dsh-usage` | Token and cost card. |
| 11 | `dsh-better-sidebar` | Client UI with agentOpenTools. |
| 12 | `dsh-preset-switcher` | Switch the preset after a conversation started. |
| 13 | `dsh-prompt-enhance` | Prompt rewriting. |
| 14 | `@deepseek-ai/dsh-experimental-session-titles-bundle` | Session titles. |
| 15 | `@perrylink/dsh-github` | GitHub tools. |

Third-party bundles are credited with repository links, licenses, and pins in [`../THIRD_PARTY.md`](../THIRD_PARTY.md).

Rule of thumb: a package that adds tool schemas belongs in a preset; a package
that adds UI or a preset may go in `bundles`. `patchReload: live` is on, so
`cordis.patch.yml` edits reload without a restart.

## Loader overrides

From `profiles/web/cordis.patch.yml`:

| Target | Setting | Why |
|---|---|---|
| `image-offload` | disabled | Off; the image model is a separate lifecycle. |
| `agent-preset-registry` | `default: general`, `selectedDefault: matlab` | New conversations fall back to `general`; the picker opens on `matlab`. |
| `agent-default-model` | `deepseek-official`, `deepseek-flash`, `reasoningEffort: max` | Default model for new conversations. |
| `llm-openai-codex` | models `gpt-6-astra`, `gpt-6-luna`, `gpt-6.1-sol`, no automatic fallback | Codex provider wiring for dsh-codex. |
| `llm-pi-ai` | llama.cpp provider at `http://127.0.0.1:8080/v1`, three local models | Local inference catalogue: Gemma-4-31B QAT 64K, Swift 1.5 212K, Swift 1.5 Vision 176K. Bearer is the local placeholder `local-llama`. |
| `ui-settings-general` | `welcomeNoticeVersion: 2026-09-28.1` | Dismissed notice stays dismissed. |
| `ui-theme` | `preference: system`, `fontSize: 20` | Readability. |
| `ui-chat` | `transcriptView: detailed` | Verbose transcript. |
| `ui-conversation` | `busyEnter: steer` | Enter while busy steers instead of queueing. |
| `session-log-deepseek` | `enabled: false` | Transcripts stay local. |
| `web-ui-pet`, `remote-web-ui`, `task-board`, `task-board-github`, `remote-bridge`, `liangshen` | disabled | Not used. |
| `web-ui-skill-explorer` | enabled | Skill Center on. |
| `better-sidebar` | `agentOpenTools: true` | The sidebar opens agent tools. |
| `subagent-model-selection-settings` | enabled, five allowed models | Restricts what a subagent may be pointed at. |

## Presets

Three local presets, plus the shipped `standard`, `minimal`, `ptc`, and `cordis`.

| Preset | Order | Source | Contents |
|---|---|---|---|
| `general` | 0 | `preset-general` row | policy, persona, `AGENTS.md`, bash, pwsh, fs, fs-search, jobs, skill, planning, compaction, ask-user, todo; MCP: web gateway, Playwright, Office, Android Studio |
| `matlab` | 1 | `preset-matlab` row | the same, plus goals, MATLAB MCP, and `matlab-reference`; skill roots are the on-request dir and the toolkit's `matlab-core` |
| `chat` | 5 | `@local/dsh-chat-preset` | persona (`complete`), guard, `AGENTS.md`, skill, web tools, compaction; no filesystem, no shell |

`general` and `matlab` both mount `skill-filesystem` with
`includeDefaultRoots: false` and an explicit `customSkillDirs` list, so the skill
catalog is exactly what those roots contain. `chat` uses the default roots,
which is how `ub-mode` and `brainstorm` reach it.

## Local plugins

| Plugin | File | Mounted | Behaviour |
|---|---|---|---|
| `dsh-chat-preset` | `plugins/dsh-chat-preset/` | bundle | Registers the `chat` preset; `lib/guard.js` narrows each joining agent to `web_search`, `web_fetch`, `skill`. |
| `local-ai-policy` | `plugins/local-ai-policy/policy.mjs` | first row of both presets | Per-call decision: web allowed, MATLAB tools only in `matlab`, Playwright asks, Toolkit reads denied outside `matlab`. |
| `matlab-reference` | `plugins/matlab-reference/matlab-reference.mjs` | `matlab` only | `search_matlab_skills` and `read_matlab_skill` over the Toolkit catalogue, bounded pages, continuation offsets. |
| `mcp-auto-permission` | `plugins/dsh-mcp-auto-permission/` | bundle | Adds the `workspace-write-mcp` preset and claims `mcp__*` approval requests as `allowed-once`; exposes `mcpAutoPermission.autoApproves()`. |
| `kde-notify` | `plugins/dsh-kde-notify/` | bundle | KDE Connect notification on an approval or question request; skips an approval claimed by `mcpAutoPermission`; no turn-completion or failure alerts. |
| notification delivery | `plugins/notifications/notifications.mjs` | imported by `kde-notify` | Throttling, log at `~/.local/state/local-ai/notifications.log`, config at `~/.config/local-ai/notifications.json`. |

The two file-path plugins are mounted by absolute path, so the profile patch
carries `__LOCAL_AI__` placeholders rather than package names.

## Permission presets

The `@local/dsh-mcp-auto-permission` bundle overrides the `permission` entry with
four presets: `read-only`, `workspace-write`, `workspace-write-mcp`, and
`danger-full-access`. `workspace-write-mcp` keeps the `workspace-write` sandbox
and `ask` approval policy but gives MCP tools no approval prompt. The experimental
`auto` preset is registered at runtime by the auto-review bundle. The notifier
asks `mcpAutoPermission` before alerting, because the approval service logs
`approval/asked` before the auto-approval plugin claims the request.

## Skills

| Skill | Owner | Where it lives |
|---|---|---|
| `brainstorm` | this repository | `~/.agents/skills/brainstorm`, symlinked into `~/.config/local-ai/skills/on-request` |
| `pub-gh` | this repository | `~/.agents/skills/pub-gh` with two templates under `assets/`, symlinked into `~/.config/local-ai/skills/on-request` |
| `ub-mode` | [unclebob/ub-mode](https://github.com/unclebob/ub-mode) | installed under `~/.agents/skills`, not copied here |
| MATLAB Toolkit skills | MathWorks | 120 symlinks from `__MATLAB_HOME__/agentic-toolkits/matlab/skills-catalog` into `~/.agents/skills`; `matlab-core` is also scanned directly by the `matlab` preset |

Global skill roots exist at `~/.dsh/skills` (absent on this machine) and
`~/.agents/skills` (present, 123 entries). The `chat` preset reads the defaults;
the two local presets read only their explicit roots.

## Not tracked, on purpose

| Thing | Where it comes from |
|---|---|
| `~/.dsh/.agent-presets/general|matlab/` | Generated by the local `ai-mode` tooling from the shipped `standard` preset. Derived, not authored. |
| `~/.dsh/sessions/`, `~/.dsh/storages/` | Runtime state. |
| `~/.dsh/.credentials.yaml` | Secrets. |
| Profile `node_modules/`, `pnpm-lock.yaml` | Resolved by `pnpm install`. |

## Placeholders

| Placeholder | Resolves to | Why |
|---|---|---|
| `__SETUP_ROOT__` | wherever this repository is cloned | The `link:` target for `dsh-chat-preset`, `dsh-mcp-auto-permission`, and `dsh-kde-notify`. |
| `__LOCAL_AI__` | `$HOME/.config/local-ai` | Policy, notification core, and MATLAB reference plugins. |
| `__MATLAB_HOME__` | `$HOME/.matlab` | The MathWorks Agentic Toolkit catalogue. |
| `__HOME__` | `$HOME` | Playwright MCP binary path. |
| `__WORKSPACE__` | a directory outside this repository | The Office MCP server project. `install.sh` asks for it. |

Root `notifications.mjs` is a symlink to `plugins/notifications/notifications.mjs`.
The notification bundle imports `../../../notifications.mjs`, which resolves to
that root link in the release tree and to `$LOCAL_AI/notifications.mjs` at the
live install. It is a path shim, not a second copy.
