# dsh-setup

The [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) configuration this machine runs: the `web` profile, two local presets, a chat preset bundle, five plugins, two skills, and the global instructions. Recorded against harness `0.2.1-rc.2` on Linux.

## Abstract

**Problem.** The harness composes its behaviour from layered bundles, a profile patch, and plugins and skills written locally. Reinstalling the harness reproduces none of the decisions taken on top of it, so the working setup exists only on the machine that made them.

**Contribution.** This repository is that authored layer: the profile patch with its two preset rows, a `chat` preset bundle that cannot touch the disk, a per-call tool policy, the MATLAB catalogue tools, an MCP auto-approval permission bundle, a KDE notification bundle, two skills, and the global instructions. The novel parts are the policy layer, the chat guard, the MATLAB reference plugin, the `workspace-write-mcp` approval predicate, and the notifier's suppression of auto-approved calls; the rest records loader overrides that would otherwise be rediscovered by reading a live profile.

**Approach.** Every file is a copy of what runs, grouped by owner. The tree does not mirror the install targets, so restoring copies each file to its destination and substitutes five placeholders ([Restore](#restore)). Anything obtainable from upstream is referenced by pin in [`upstreams.yml`](upstreams.yml) and [`THIRD_PARTY.md`](THIRD_PARTY.md); no upstream code is copied.

**Evidence.** The composition dump succeeds and contains all three local presets, the policy, MATLAB reference, MCP auto-approval, and notification plugin tests pass, and the privacy and link checks are clean. The notifier and permission mode were also confirmed on the live harness after a restart. Commands and outcomes are in [Verification](#verification).

## Composition

### Layout

Original files first, then the records for third-party work. Install destinations are in [Restore](#restore).

**Original**

| Name | Path | Contents |
|---|---|---|
| Profile patch | [`profiles/web/cordis.patch.yml`](profiles/web/cordis.patch.yml) | Loader overrides and both local presets |
| Profile dependencies | [`profiles/web/package.json`](profiles/web/package.json) | Dependencies and the bundle list |
| Chat preset | [`plugins/dsh-chat-preset/`](plugins/dsh-chat-preset) | The `chat` preset and its tool guard |
| Tool policy | [`plugins/local-ai-policy/policy.mjs`](plugins/local-ai-policy/policy.mjs) | Per-call policy for both presets |
| MATLAB reference | [`plugins/matlab-reference/matlab-reference.mjs`](plugins/matlab-reference/matlab-reference.mjs) | Skill search and read tools |
| MCP permission | [`plugins/dsh-mcp-auto-permission/`](plugins/dsh-mcp-auto-permission) | The `workspace-write-mcp` preset and its approval predicate |
| Desktop notifications | [`plugins/dsh-kde-notify/`](plugins/dsh-kde-notify) | Approval and question alerts, with auto-approved MCP suppression |
| Notification core | [`plugins/notifications/notifications.mjs`](plugins/notifications/notifications.mjs) | KDE Connect delivery, throttling, and logging. Root `notifications.mjs` links here for the notification bundle's installed-path import |
| Brainstorm | [`skills/brainstorm/`](skills/brainstorm) | One skill |
| pub-gh | [`skills/pub-gh/`](skills/pub-gh) | Release skill and two templates |
| Global instructions | [`AGENTS.md`](AGENTS.md) | Instructions for every session |
| Inventory | [`docs/inventory.md`](docs/inventory.md) | Override table and reasoning |
| Licence | [`LICENSE`](LICENSE) | MIT, original files only |
| Changelog | [`CHANGELOG.md`](CHANGELOG.md) | What changed, newest first |

**Third-party records**

| Name | Path | Contents |
|---|---|---|
| Source registry | [`upstreams.yml`](upstreams.yml) | Pins, licences, what is not here |
| Attribution | [`THIRD_PARTY.md`](THIRD_PARTY.md) | Per-project credit and compliance |

### The profile

Fifteen bundles load in the `web` profile: four shipped with the harness, three local (`@local/dsh-chat-preset`, `@local/dsh-mcp-auto-permission`, `@local/dsh-kde-notify`), and eight third-party packages ([2]–[8]). Pins live in [`profiles/web/package.json`](profiles/web/package.json).

The patch layer carries the decisions: `deepseek-flash` at `reasoningEffort: max` as the default model, the local llama.cpp provider, theme and transcript settings, session logging off, the unused UI panels disabled, and the presets below. The `@local/dsh-mcp-auto-permission` bundle adds the four permission presets: `read-only`, `workspace-write`, `workspace-write-mcp`, and `danger-full-access`; the experimental `auto` preset is registered at runtime by the auto-review bundle. [`docs/inventory.md`](docs/inventory.md) tabulates every override.

### Presets

| Preset | Order | Source | Contents |
|---|---|---|---|
| `general` | 0 | `preset-general` row | policy, persona, `AGENTS.md`, bash, pwsh, fs, fs-search, jobs, skill, planning, compaction, ask-user, todo; MCP: web gateway, Playwright, Office, Android Studio |
| `matlab` | 1 | `preset-matlab` row | the same, plus goals, MATLAB MCP, and `matlab-reference`; skill roots are the on-request directory and the toolkit's `matlab-core` |
| `chat` | 5 | `@local/dsh-chat-preset` | persona, guard, `AGENTS.md`, skill, web tools, compaction; no filesystem, no shell |

`general` and `matlab` both mount `skill-filesystem` with `includeDefaultRoots: false` and an explicit `customSkillDirs` list, so their catalogue is exactly what those roots contain. `chat` uses the default roots, which is how `brainstorm` and `pub-gh` reach it.

### Five pieces worth reading

**1. A policy layer per preset.** [`policy.mjs`](plugins/local-ai-policy/policy.mjs) hooks `tools/execute` and decides per call: web tools always allowed, MATLAB tools and official Toolkit skills only in the `matlab` preset, Playwright asks for approval, Toolkit reads denied from any other preset. It is one file, injected as `local-ai-policy` at the top of both presets, and it is why `general` cannot quietly fall back to MATLAB.

**2. A chat preset that cannot touch the disk.** [`plugins/dsh-chat-preset`](plugins/dsh-chat-preset) registers a `chat` preset holding a persona, `AGENTS.md`, web tools, skill loading, and compaction, and nothing else. [`lib/guard.js`](plugins/dsh-chat-preset/lib/guard.js) narrows each joining agent to `web_search`, `web_fetch`, and `skill`, reading the allow list from the agent's own visible tools so a search-only configuration still works.

**3. MATLAB skills without a catalogue dump.** [`matlab-reference.mjs`](plugins/matlab-reference/matlab-reference.mjs) indexes the official MathWorks Toolkit catalogue and exposes `search_matlab_skills` and `read_matlab_skill` with bounded pages and continuation offsets. The `matlab` preset mounts it instead of a 120-entry skill root; `general` never sees it.

**4. MCP auto-approval as a permission preset.** [`plugins/dsh-mcp-auto-permission`](plugins/dsh-mcp-auto-permission) adds `workspace-write-mcp` with the same sandbox and approval knobs as `workspace-write`, claims `mcp__*` approval requests as `allowed-once`, and exposes `mcpAutoPermission.autoApproves(session, toolName)` so another plugin can tell an auto-approved call from a real prompt.

**5. Notifications only for real human input.** [`plugins/dsh-kde-notify`](plugins/dsh-kde-notify) alerts on approval and question requests. It asks `mcpAutoPermission` before an approval alert and suppresses the alert when the MCP plugin will claim the request. Turn completion, failure, blocked, and output-limit events no longer notify.

### Requirements

| Component | Requirement |
|---|---|
| Operating system | Linux with a desktop session; notifications are delivered through KDE Connect |
| Harness | DeepSeek Harness `0.2.1-rc.2`, installed globally from npm [1] |
| Runtime | Node `v22.22.2` for the tests and the local plugins |
| Package manager | pnpm `12.15.0` for the profile dependencies |
| Python | Python 3 with PyYAML, for the YAML check below |
| Network | Needed once to install the pinned packages; no credential is stored here |

### Restore

No installer is included. The files are copies plus five placeholders, so restoring is a copy and a substitution:

```sh
DSH_HOME=${DSH_HOME:-$HOME/.dsh}
LOCAL_AI=${LOCAL_AI:-$HOME/.config/local-ai}

mkdir -p "$DSH_HOME/profiles/web" "$DSH_HOME/local-plugins" \
         "$LOCAL_AI/plugins" "$LOCAL_AI/skills/on-request" "$HOME/.agents/skills"
cp profiles/web/cordis.patch.yml profiles/web/package.json "$DSH_HOME/profiles/web/"
cp plugins/local-ai-policy/policy.mjs plugins/notifications/notifications.mjs "$LOCAL_AI/"
cp plugins/matlab-reference/matlab-reference.mjs "$LOCAL_AI/plugins/"
cp -r plugins/dsh-chat-preset plugins/dsh-mcp-auto-permission "$DSH_HOME/local-plugins/"
cp -r plugins/dsh-kde-notify "$LOCAL_AI/plugins/"
cp -r skills/brainstorm skills/pub-gh "$HOME/.agents/skills/"
ln -sfn "$HOME/.agents/skills/brainstorm" "$LOCAL_AI/skills/on-request/brainstorm"
ln -sfn "$HOME/.agents/skills/pub-gh" "$LOCAL_AI/skills/on-request/pub-gh"
cp AGENTS.md "$DSH_HOME/AGENTS.md"
```

Then replace the placeholders in `cordis.patch.yml` and `package.json` before starting the harness: `__SETUP_ROOT__` with the clone path, `__LOCAL_AI__` with `$LOCAL_AI`, `__MATLAB_HOME__` with the toolkit root, `__HOME__` with `$HOME`, and `__WORKSPACE__` with the directory holding the Office MCP project. Finish with:

```sh
cd "$DSH_HOME/profiles/web" && pnpm install
dsh --profile web --dump-config | grep -q "id: preset-chat"       # chat preset present
dsh --profile web --dump-config | grep -q "workspace-write-mcp"  # permission preset present
dsh web                                                           # restart to load the bundle
```

## Verification

Run against this tree and the live harness on the recorded machine:

| Check | Command | Result |
|---|---|---|
| YAML parses | `python3 -c 'import yaml,sys; yaml.safe_load(open(sys.argv[1]))'` on every tracked `.yml` file | pass |
| JavaScript parses | `node --check` on every tracked `.mjs` module and `lib/guard.js` | pass |
| Tool policy | `node --test plugins/local-ai-policy/policy.test.mjs` | pass, 5 tests |
| MATLAB reference | `DSH_PACKAGE_JSON=… node --test plugins/matlab-reference/matlab-reference.test.mjs` | pass, 2 tests |
| MCP auto-approval | `node --test plugins/dsh-mcp-auto-permission/test/index.test.mjs` | pass, 6 tests |
| KDE notification | `node --test plugins/dsh-kde-notify/test/index.test.mjs` | pass, 5 tests |
| Restore layout | copy block with temporary `HOME`, `DSH_HOME`, and `LOCAL_AI` | pass: every copied file and package tree arrived; the root `notifications.mjs` link exists in the release tree; `pnpm install` and `dsh` not run in the temporary tree |
| Composition | `dsh --profile web --dump-config` on the live harness | exit 0, `preset-chat`, `preset-general`, `preset-matlab`, and `workspace-write-mcp` present |
| Live mode | user check after restart | pass: `workspace-write-mcp` MCP calls run; non-MCP approvals still ask |
| Live notification | user check after restart | pass: no alert for auto-approved MCP, alert for a non-MCP approval and a user question, no completion alert |
| Links | every relative link in `README.md` resolved | pass |
| Privacy | `grep` for absolute home paths and secret-shaped strings across tracked files | clean |

**Not tested:** `pnpm install` from an empty `node_modules`, a full `dsh web` restart from the restored tree, and the four external MCP servers, which are not in this repository.

**Observed warning.** The composition dump reports `patch: entry "web-ui-…" not found` for seven UI rows (`web-ui-pet`, `web-ui-liangshen`, `web-ui-remote-bridge`, `web-ui-remote-web-ui`, `web-ui-task-board`, `web-ui-task-board-github`, `web-ui-skill-explorer`). Those ids are absent from the composed tree, so the six disables and the one enable have no effect; the Skill Center is delivered by the `@linxin666/dsh-client-ui-skill-explorer` bundle listed in the profile. The patch is left as recorded rather than changed to match, because the restore target is the configuration that runs.

## Conclusion

The repository supports restoring this exact harness composition on a comparable Linux host with the harness and the pinned packages installed. It does not restore the external MCP servers, the generated agent presets, or the third-party skill roots. The tests cover the policy, the MATLAB reference tools, the MCP auto-approval predicate, and the notifier's approval handling rather than the whole loader. The live checks confirm the two new behaviours on this machine.

## Acknowledgements

The harness, its bundles, and its shipped presets are the work of the DeepSeek Harness project [1]. The eight profile plugins are the work of their own maintainers ([2]–[8]). `ub-mode` is Robert C. Martin's [9], the MATLAB Toolkit is MathWorks' [10], Playwright MCP is Microsoft's [11], and `js-yaml` is the work of its contributors [12]. Every project, licence, and pin is listed in [`THIRD_PARTY.md`](THIRD_PARTY.md) and [`upstreams.yml`](upstreams.yml).

## References

1. DeepSeek Harness. <https://github.com/deepseek-ai/deepseek-harness>. MIT.
2. `dsh-codex`. <https://github.com/Yan-Zero/dsh-codex>. Apache-2.0.
3. `dsh-pocket`. <https://github.com/shaobeichen/dsh-pocket>. GPL-2.0.
4. `dsh-better-sidebar`. <https://github.com/omdsh-dev/DSH-better-sidebar>. MIT.
5. `dsh-preset-switcher`, fork by neutronslime of the original by jeffcwj. <https://github.com/neutronslime/dsh-preset-switcher-fork>, <https://github.com/jeffcwj/dsh-preset-switcher>. MIT.
6. `dsh-prompt-enhance`. <https://github.com/rongxingda/dsh-prompt-enhance>. Apache-2.0.
7. `dsh-client-ui-skill-explorer` and `dsh-usage`, from the dsh-web plugin ecosystem. <https://github.com/zhu1090093659/dsh-web>. BSD-3-Clause and Apache-2.0.
8. `dsh-github`. <https://github.com/PerryLink/dsh-github>. Apache-2.0.
9. `ub-mode`. <https://github.com/unclebob/ub-mode>. No licence declared upstream; installed separately.
10. MATLAB Agentic Toolkit. <https://github.com/matlab/matlab-agentic-toolkit>. MathWorks BSD-3-Clause, use restricted to MathWorks products.
11. Playwright MCP. <https://github.com/microsoft/playwright-mcp>. Apache-2.0.
12. `js-yaml`. <https://github.com/nodeca/js-yaml>. MIT.
