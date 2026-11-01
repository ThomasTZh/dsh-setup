# dsh-setup

The composition of the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) `web` profile this machine runs: the profile patch with its two local presets, the `chat` preset wiring, the global instructions, the pins for seven original component repositories, and the third-party credits. Recorded against harness `0.2.1-rc.2` on Linux.

## Abstract

**Problem.** The harness composes its behaviour from layered bundles, a profile patch, plugins, and skills. Reinstalling the harness reproduces none of the decisions taken on top of it, and a single repository that holds both the wiring and every component mixes two very different things: a host-specific configuration record and reusable code.

**Contribution.** This repository is the wiring only. The plugins and skills the profile mounts are original work, published from their own repositories and pinned here by commit in [`components.yml`](components.yml). What remains is the profile patch, the package manifest, the global instructions, the inventory, and the third-party records. The novel parts are the policy layer, the chat guard, the MATLAB reference tools, the `workspace-write-mcp` approval predicate, and the notifier's suppression of auto-approved calls; each is described and tested in its own repository.

**Approach.** No component source is stored here. Restoring copies the composition files to their destinations and clones each component at its pin ([Restore](#restore)).

**Evidence.** The restore block completes from a temporary `HOME` using only clones of the published repositories, every installed file matches its pinned commit byte for byte, the composition dump names all three local presets, and the privacy and link checks are clean. Commands and outcomes are in [Verification](#verification).

## Composition

### Layout

Original files first, then the records for third-party work. Install destinations are in [Restore](#restore).

**Original**

| Name | Path | Contents |
|---|---|---|
| Profile patch | [`profiles/web/cordis.patch.yml`](profiles/web/cordis.patch.yml) | Loader overrides, both local presets, and the plugin mounts that come from component repositories |
| Profile dependencies | [`profiles/web/package.json`](profiles/web/package.json) | Dependencies, the bundle list, and the three `link:` targets |
| Component pins | [`components.yml`](components.yml) | Every first-party component: repository, pin, install destinations, files, test command |
| Global instructions | [`AGENTS.md`](AGENTS.md) | Instructions for every session |
| Inventory | [`docs/inventory.md`](docs/inventory.md) | Override table, bundle order, and reasoning |
| Licence | [`LICENSE`](LICENSE) | MIT, original files only |
| Changelog | [`CHANGELOG.md`](CHANGELOG.md) | What changed, newest first |

**Third-party records**

| Name | Path | Contents |
|---|---|---|
| Source registry | [`upstreams.yml`](upstreams.yml) | Pins, licences, what is not here, including skills installed separately |
| Attribution | [`THIRD_PARTY.md`](THIRD_PARTY.md) | Per-project credit and compliance |

### Components

Seven original repositories, each with its own README, tests, licence, and verification. The full pins are the commits that were published and verified when the split was recorded; [`components.yml`](components.yml) and [Restore](#restore) carry the SHAs.

| Component | Repository | Installs to |
|---|---|---|
| `dsh-chat-preset` | [ThomasTZh/dsh-chat-preset](https://github.com/ThomasTZh/dsh-chat-preset) | `$DSH_HOME/local-plugins/dsh-chat-preset` |
| `dsh-mcp-auto-permission` | [ThomasTZh/dsh-mcp-auto-permission](https://github.com/ThomasTZh/dsh-mcp-auto-permission) | `$DSH_HOME/local-plugins/dsh-mcp-auto-permission` |
| `dsh-kde-notify` | [ThomasTZh/dsh-kde-notify](https://github.com/ThomasTZh/dsh-kde-notify) | `$LOCAL_AI/plugins/dsh-kde-notify` and `$LOCAL_AI/notifications.mjs` |
| `dsh-local-ai-policy` | [ThomasTZh/dsh-local-ai-policy](https://github.com/ThomasTZh/dsh-local-ai-policy) | `$LOCAL_AI/policy.mjs` |
| `dsh-matlab-reference` | [ThomasTZh/dsh-matlab-reference](https://github.com/ThomasTZh/dsh-matlab-reference) | `$LOCAL_AI/plugins/matlab-reference.mjs` |
| `dsh-skill-brainstorm` | [ThomasTZh/dsh-skill-brainstorm](https://github.com/ThomasTZh/dsh-skill-brainstorm) | `~/.agents/skills/brainstorm` and a symlink in the on-request root |
| `dsh-skill-pub-gh` | [ThomasTZh/dsh-skill-pub-gh](https://github.com/ThomasTZh/dsh-skill-pub-gh) | `~/.agents/skills/pub-gh` and a symlink in the on-request root |

### The profile

Fifteen bundles load in the `web` profile: four shipped with the harness, three local (`@local/dsh-chat-preset`, `@local/dsh-mcp-auto-permission`, `@local/dsh-kde-notify`), and eight third-party packages ([2]-[8]). Pins live in [`profiles/web/package.json`](profiles/web/package.json); the three local bundles are cloned from their repositories at the pins in [`components.yml`](components.yml).

The patch layer carries the decisions: `deepseek-flash` at `reasoningEffort: max` as the default model, the local llama.cpp provider, theme and transcript settings, session logging off, the unused UI panels disabled, and the presets below. The `@local/dsh-mcp-auto-permission` bundle adds the four permission presets: `read-only`, `workspace-write`, `workspace-write-mcp`, and `danger-full-access`; the experimental `auto` preset is registered at runtime by the auto-review bundle. [`docs/inventory.md`](docs/inventory.md) tabulates every override.

### Presets

| Preset | Order | Source | Contents |
|---|---|---|---|
| `general` | 0 | `preset-general` row | policy, persona, `AGENTS.md`, bash, pwsh, fs, fs-search, jobs, skill, planning, compaction, ask-user, todo; MCP: web gateway, Playwright, Office, Android Studio |
| `matlab` | 1 | `preset-matlab` row | the same, plus goals, MATLAB MCP, and `matlab-reference`; skill roots are the on-request directory and the toolkit's `matlab-core` |
| `chat` | 5 | `@local/dsh-chat-preset` | persona, guard, `AGENTS.md`, skill, web tools, compaction; no filesystem, no shell |

`general` and `matlab` both mount `skill-filesystem` with `includeDefaultRoots: false` and an explicit `customSkillDirs` list, so their catalogue is exactly what those roots contain. `chat` uses the default roots. The two skill components are installed into `~/.agents/skills` and symlinked into the on-request root, so they reach all three presets and any other agent that scans the shared root.

### Requirements

| Component | Requirement |
|---|---|
| Operating system | Linux with a desktop session; notifications are delivered through KDE Connect |
| Harness | DeepSeek Harness `0.2.1-rc.2`, installed globally from npm [1] |
| Runtime | Node `v22.22.2` for the component tests |
| Package manager | pnpm `12.15.0` for the profile dependencies |
| Git | Needed once to clone the seven component repositories |
| Python | Python 3 with PyYAML, for the YAML check below |
| Network | Needed once to install the pinned packages and clone the components; no credential is stored here |

### Restore

No installer is included. Restoring is a clone of seven pinned repositories, a copy to the destinations the profile reads, and five placeholder substitutions:

```sh
DSH_HOME=${DSH_HOME:-$HOME/.dsh}
LOCAL_AI=${LOCAL_AI:-$HOME/.config/local-ai}
COMPONENTS=${COMPONENTS:-$HOME/dsh-components}

mkdir -p "$DSH_HOME/profiles/web" "$DSH_HOME/local-plugins/dsh-chat-preset" \
         "$DSH_HOME/local-plugins/dsh-mcp-auto-permission" "$LOCAL_AI/plugins" \
         "$LOCAL_AI/skills/on-request" "$HOME/.agents/skills/brainstorm" \
         "$HOME/.agents/skills/pub-gh" "$COMPONENTS"

clone() {  # clone <repo> <pin>
  git clone "https://github.com/ThomasTZh/$1" "$COMPONENTS/$1"
  git -C "$COMPONENTS/$1" checkout "$2"
}
clone dsh-chat-preset          baaf5755623942f3a33eb7877b777f909794633b
clone dsh-mcp-auto-permission  8b12bf012c4fcd3ae877deefa18376fddf716110
clone dsh-kde-notify           230699f3dc001bae8c55e64ce3e12c832b0a0dc5
clone dsh-local-ai-policy      02dd3c8ba840536a955b1cb355959c401f87912d
clone dsh-matlab-reference     5a2f2b77e20fd4f935d4c87e707a3654cc7f0c19
clone dsh-skill-brainstorm     8133287e181351aee2070dcaf5f651c1a84abbe5
clone dsh-skill-pub-gh         b5968cf5132353f4eb14ddf4cad4fff1b7fb0bb8

cp profiles/web/cordis.patch.yml profiles/web/package.json "$DSH_HOME/profiles/web/"
cp -r "$COMPONENTS/dsh-chat-preset/package.json" \
      "$COMPONENTS/dsh-chat-preset/cordis.patch.yml" \
      "$COMPONENTS/dsh-chat-preset/lib" \
      "$DSH_HOME/local-plugins/dsh-chat-preset/"
cp -r "$COMPONENTS/dsh-mcp-auto-permission/package.json" \
      "$COMPONENTS/dsh-mcp-auto-permission/cordis.patch.yml" \
      "$COMPONENTS/dsh-mcp-auto-permission/lib" \
      "$DSH_HOME/local-plugins/dsh-mcp-auto-permission/"
cp -r "$COMPONENTS/dsh-kde-notify/plugins/dsh-kde-notify" "$LOCAL_AI/plugins/"
cp "$COMPONENTS/dsh-kde-notify/plugins/notifications/notifications.mjs" "$LOCAL_AI/notifications.mjs"
cp "$COMPONENTS/dsh-local-ai-policy/policy.mjs" "$LOCAL_AI/policy.mjs"
cp "$COMPONENTS/dsh-matlab-reference/matlab-reference.mjs" "$LOCAL_AI/plugins/matlab-reference.mjs"
cp -r "$COMPONENTS/dsh-skill-brainstorm/." "$HOME/.agents/skills/brainstorm/"
cp -r "$COMPONENTS/dsh-skill-pub-gh/." "$HOME/.agents/skills/pub-gh/"
ln -sfn "$HOME/.agents/skills/brainstorm" "$LOCAL_AI/skills/on-request/brainstorm"
ln -sfn "$HOME/.agents/skills/pub-gh" "$LOCAL_AI/skills/on-request/pub-gh"
cp AGENTS.md "$DSH_HOME/AGENTS.md"
```

Then replace the placeholders before starting the harness: `__DSH_HOME__` with `$DSH_HOME`, `__LOCAL_AI__` with `$LOCAL_AI`, `__MATLAB_HOME__` with the toolkit root, `__HOME__` with `$HOME`, and `__WORKSPACE__` with the directory holding the Office MCP project. Finish with:

```sh
cd "$DSH_HOME/profiles/web" && pnpm install
dsh --profile web --dump-config | grep -q "id: preset-chat"       # chat preset present
dsh --profile web --dump-config | grep -q "workspace-write-mcp"  # permission preset present
dsh web                                                           # restart to load the bundle
```

## Verification

Run against this tree, the seven published repositories, and the live harness on the recorded machine:

| Check | Command | Result |
|---|---|---|
| Restore from pins | restore block with temporary `HOME`, `DSH_HOME`, `LOCAL_AI`, and `COMPONENTS`, cloning from GitHub | pass: seven clones at their pins, every destination populated |
| Installed files match pins | compare each installed file with its clone | pass: byte-identical |
| Component links | `gh api repos/ThomasTZh/<repo>/commits/<pin>` for each row of [`components.yml`](components.yml) | pass: every repository and pin resolves |
| YAML parses | `python3 -c 'import yaml,sys; yaml.safe_load(open(sys.argv[1]))'` on `profiles/web/cordis.patch.yml`, `components.yml`, and `upstreams.yml` | pass |
| JSON parses | `python3 -m json.tool profiles/web/package.json` | pass |
| No component source | `git ls-files` | pass: only the composition, documentation, and manifests are tracked |
| Composition | `dsh --profile web --dump-config` on the live harness | exit 0, `preset-chat`, `preset-general`, `preset-matlab`, and `workspace-write-mcp` present |
| Links | every relative link in `README.md`, `THIRD_PARTY.md`, `docs/inventory.md`, and `CHANGELOG.md` resolved | pass |
| Privacy | `grep` for absolute home paths and secret-shaped strings across tracked files | clean |

**Not tested:** `pnpm install` from an empty `node_modules`, a full `dsh web` restart from the restored tree, and the four external MCP servers, which are not in this repository. The behaviour of each component is verified in its own repository rather than here.

**Observed warning.** The composition dump reports `patch: entry "<id>" not found` for eight ids: `web-ui-pet`, `web-ui-remote-web-ui`, `web-ui-task-board-github`, `web-ui-task-board`, `web-ui-remote-bridge`, `web-ui-liangshen`, `web-ui-skill-explorer`, and `plugin-market`. None of those ids exists in the composed tree, so the six disables and the one enable in this patch have no effect; the Skill Center is delivered by the `@linxin666/dsh-client-ui-skill-explorer` bundle listed in the profile, and the composed tree carries `tool-plugin-market` instead of `plugin-market`. The dump runs against the live profile, which carries one row more than this record (`plugin-market`), so that single warning is reported here without a matching entry in the recorded patch. The patch is left as recorded rather than changed to match, because the restore target is the configuration that runs.

## Conclusion

The repository supports restoring this harness composition on a comparable Linux host with the harness and the pinned packages installed, and it keeps the wiring separate from the reusable code. It does not restore the external MCP servers, the generated agent presets, or the third-party skill roots; the seven original components are restored by pinned clone, and the one upstream skill by a pinned clone of its own repository. The composition checks confirm that every pin resolves and that the restored tree matches the published commits.

## Acknowledgements

The harness, its bundles, and its shipped presets are the work of the DeepSeek Harness project [1]. The eight profile plugins are the work of their own maintainers ([2]-[8]). `ub-mode` is Robert C. Martin's [9], the MATLAB Toolkit is MathWorks' [10], Playwright MCP is Microsoft's [11], `js-yaml` is the work of its contributors [12], and `directing-image-prompts` is Nanoleava's [13]. The seven components listed under [Components](#components) are original work published from this account. Every project, licence, and pin is listed in [`THIRD_PARTY.md`](THIRD_PARTY.md), [`upstreams.yml`](upstreams.yml), and [`components.yml`](components.yml).

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
13. `directing-image-prompts`. <https://github.com/Nanoleava/directing-image-prompts>. No licence declared upstream; installed separately.
