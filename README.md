# dsh-setup

The [DeepSeek Harness](https://github.com/deepseek-ai) configuration this machine runs: the `web` profile, two local presets, a chat preset bundle, four plugins, and the global instructions.

Snapshot: 2026-10-28, DeepSeek Harness `0.2.1-rc.2`, Linux.

## Scope

Only original work is published here. Every file in this repository was written for this setup. Anything obtainable from upstream is referenced by name, pin, and source in [`upstreams.yml`](upstreams.yml) and never copied, so restoring this setup means installing the harness, its bundles, and the public plugins from their own projects.

## Layout

| Path | Installs to | Contents |
|---|---|---|
| [`profiles/web/cordis.patch.yml`](profiles/web/cordis.patch.yml) | `$DSH_HOME/profiles/web/` | Loader overrides and both local presets |
| [`profiles/web/package.json`](profiles/web/package.json) | `$DSH_HOME/profiles/web/` | Dependencies and the bundle list |
| [`plugins/dsh-chat-preset/`](plugins/dsh-chat-preset) | `$DSH_HOME/local-plugins/` | The `chat` preset bundle and its tool guard |
| [`local-ai/policy.mjs`](local-ai/policy.mjs) | `$LOCAL_AI/` | Per-call tool policy for both presets |
| [`local-ai/plugins/matlab-reference.mjs`](local-ai/plugins/matlab-reference.mjs) | `$LOCAL_AI/plugins/` | MATLAB skill search and read tools |
| [`local-ai/plugins/kde-notify.mjs`](local-ai/plugins/kde-notify.mjs) | `$LOCAL_AI/plugins/` | Desktop notifications |
| [`local-ai/notifications.mjs`](local-ai/notifications.mjs) | `$LOCAL_AI/` | Delivery, throttling, and logging for the above |
| [`skills/brainstorm/`](skills/brainstorm) | `$HOME/.agents/skills/` | One skill, symlinked into the on-request root |
| [`AGENTS.md`](AGENTS.md) | `$DSH_HOME/` | Global instructions |
| [`upstreams.yml`](upstreams.yml) | not installed | Source registry: pins, licenses, what is not here |
| [`docs/inventory.md`](docs/inventory.md) | not installed | The live composition and the reasoning behind it |
| [`CREDITS.md`](CREDITS.md) | not installed | Every third-party project, with its repository link |

## The profile

Thirteen bundles load in the `web` profile: four shipped with the harness, one local (`@local/dsh-chat-preset`), and eight third-party packages. Pins live in [`profiles/web/package.json`](profiles/web/package.json).

The patch layer carries the decisions: `deepseek-flash` at `reasoningEffort: max` as the default model, three permission presets, the local llama.cpp provider, theme and transcript settings, session logging off, the unused UI panels disabled, and the two presets described below. [`docs/inventory.md`](docs/inventory.md) tabulates every override.

## The three pieces worth reading

**1. A policy layer per preset.** [`policy.mjs`](local-ai/policy.mjs) hooks `tools/execute` and decides per call: web tools always allowed, MATLAB tools and official Toolkit skills only in the `matlab` preset, Playwright asks for approval, Toolkit reads from any other preset denied. It is one file, injected as `local-ai-policy` at the top of both presets, and it is why `general` cannot quietly fall back to MATLAB.

**2. A chat preset that cannot touch the disk.** [`plugins/dsh-chat-preset`](plugins/dsh-chat-preset) registers a `chat` preset holding a persona, `AGENTS.md`, web tools, skill loading, and compaction, and nothing else. [`lib/guard.js`](plugins/dsh-chat-preset/lib/guard.js) narrows each joining agent to `web_search`, `web_fetch`, and `skill`, reading the allow list from the agent's own visible tools so a search-only configuration still works.

**3. MATLAB skills without a catalogue dump.** [`matlab-reference.mjs`](local-ai/plugins/matlab-reference.mjs) indexes the official MathWorks Toolkit catalogue and exposes `search_matlab_skills` and `read_matlab_skill` with bounded pages and continuation offsets. The `matlab` preset mounts it instead of a 120-entry skill root; `general` never sees it.

Notifications run through [`kde-notify.mjs`](local-ai/plugins/kde-notify.mjs) and [`notifications.mjs`](local-ai/notifications.mjs): KDE Connect on turn end, failure, approval request, and question request.

## Not in this repository

| Item | Why |
|---|---|
| Harness, its bundles, and its shipped presets | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness), pinned in `upstreams.yml` |
| Eight third-party plugins | npm packages, each credited with its repository in `CREDITS.md` |
| `ub-mode` | Upstream text from [`unclebob/ub-mode`](https://github.com/unclebob/ub-mode); installed separately and recorded as a reference |
| MathWorks Toolkit skills | [matlab/matlab-agentic-toolkit](https://github.com/matlab/matlab-agentic-toolkit), 120 symlinks from a local install |
| Playwright MCP | [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp), local install |
| MCP servers (web gateway, MATLAB, Office) | Original programs outside this repository |
| `~/.dsh/.agent-presets/` | Generated from the shipped `standard` preset by local tooling; derived, not authored |
| Sessions, credentials, `node_modules`, lockfile | Runtime state and resolved dependencies |

## Credits

Third-party projects are credited in [`CREDITS.md`](CREDITS.md): one row per component with its repository link, license, and pin. [`upstreams.yml`](upstreams.yml) is the machine-readable copy of the same list. Nothing on that list is copied here.

## Restoring it

No installer is included. The files are copies plus five placeholders, so restoration is a copy and a substitution:

```sh
DSH_HOME=${DSH_HOME:-$HOME/.dsh}
LOCAL_AI=${LOCAL_AI:-$HOME/.config/local-ai}

cp profiles/web/cordis.patch.yml profiles/web/package.json "$DSH_HOME/profiles/web/"
cp local-ai/policy.mjs local-ai/notifications.mjs "$LOCAL_AI/"
cp local-ai/plugins/kde-notify.mjs local-ai/plugins/matlab-reference.mjs "$LOCAL_AI/plugins/"
cp -r plugins/dsh-chat-preset "$DSH_HOME/local-plugins/"
cp -r skills/brainstorm "$HOME/.agents/skills/"
ln -sfn "$HOME/.agents/skills/brainstorm" "$LOCAL_AI/skills/on-request/brainstorm"
cp AGENTS.md "$DSH_HOME/AGENTS.md"
```

Then replace the placeholders in `cordis.patch.yml` and `package.json` before starting the harness: `__SETUP_ROOT__` with the clone path, `__LOCAL_AI__` with `$LOCAL_AI`, `__MATLAB_HOME__` with the toolkit root, `__HOME__` with `$HOME`, and `__WORKSPACE__` with the directory holding the Office MCP project. Finish with:

```sh
cd "$DSH_HOME/profiles/web" && pnpm install
dsh --profile web --dump-config | grep preset-chat   # composition check
dsh web                                              # restart to load the bundle
```

## Checks

There is no CI. Before publishing a change:

- every `.yml` parses (`python3 -c 'import yaml,sys; yaml.safe_load(open(sys.argv[1]))' <file>`)
- every `.mjs` passes `node --check`
- `node --test local-ai/policy.test.mjs` passes, and `node --test local-ai/plugins/matlab-reference.test.mjs` passes with `DSH_PACKAGE_JSON` pointing at the installed harness
- no absolute home paths and no secret-shaped strings appear in tracked files

## Known gaps

- Dependencies are installed separately; the profile resolves its own `node_modules`.
- [`matlab-reference.mjs`](local-ai/plugins/matlab-reference.mjs) loads the harness-bundled `js-yaml`, locating the package from the launcher path and honouring `DSH_PACKAGE_JSON`. A moved installation needs that variable.
- The MCP server paths (`__LOCAL_AI__/web-gateway.py`, `__LOCAL_AI__/matlab-server`, the Office project) belong to programs outside this repository.
- No license.
