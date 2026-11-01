# Third-party software, attribution, and modifications

Components this setup mounts, installs, or reads. None of them is copied into this repository: every row links to the project that owns it, and [`upstreams.yml`](upstreams.yml) carries the machine-readable pins, licences, and install locations. The root [`LICENSE`](LICENSE) covers only the original files named under [Copyright and licence compliance](#copyright-and-licence-compliance).

## Harness

| Component | Role here | Project | Licence |
|---|---|---|---|
| DeepSeek Harness | The host: loader, sessions, tools, Web GUI, shipped bundles and presets | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) | MIT |

## Plugins in the `web` profile

| Package | Role here | Project | Licence | Pin |
|---|---|---|---|---|
| `dsh-codex` | The openai-codex provider | [Yan-Zero/dsh-codex](https://github.com/Yan-Zero/dsh-codex) | Apache-2.0 | `^0.3.2` |
| `dsh-pocket` | Tunnel proxy for the Web UI | [shaobeichen/dsh-pocket](https://github.com/shaobeichen/dsh-pocket) | GPL-2.0 | `^2.12.0` |
| `dsh-better-sidebar` | Client sidebar with agent open-tools | [omdsh-dev/DSH-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) | MIT | `^0.28.0` |
| `dsh-preset-switcher` | Switches the session preset after a conversation started | [neutronslime/dsh-preset-switcher-fork](https://github.com/neutronslime/dsh-preset-switcher-fork), a fork of [jeffcwj/dsh-preset-switcher](https://github.com/jeffcwj/dsh-preset-switcher) | MIT | fork head |
| `dsh-prompt-enhance` | Prompt rewriting | [rongxingda/dsh-prompt-enhance](https://github.com/rongxingda/dsh-prompt-enhance) | Apache-2.0 | `^0.3.2` |
| `@linxin666/dsh-client-ui-skill-explorer` | Skill Center panel | [zhu1090093659/dsh-web](https://github.com/zhu1090093659/dsh-web) | BSD-3-Clause | `^0.4.8` |
| `@linxin666/dsh-usage` | Token and cost card | [zhu1090093659/dsh-web](https://github.com/zhu1090093659/dsh-web) | Apache-2.0 | `^0.4.8` |
| `@perrylink/dsh-github` | GitHub tools | [PerryLink/dsh-github](https://github.com/PerryLink/dsh-github) | Apache-2.0 | `^0.7.27` |

## Skills and toolkits

| Component | Role here | Project | Licence | Pin |
|---|---|---|---|---|
| `ub-mode` | Skill installed at `~/.agents/skills/ub-mode` and symlinked into the on-request root | [unclebob/ub-mode](https://github.com/unclebob/ub-mode) | None declared upstream; installed separately and not distributed here | `57a8bdd28e45ed41900ace0bafa2ff76dd9ed70f` |
| `directing-image-prompts` | Skill installed at `~/.agents/skills/directing-image-prompts` and symlinked into the on-request root; that shared root is what the harness default and Pi both scan | [Nanoleava/directing-image-prompts](https://github.com/Nanoleava/directing-image-prompts) | None declared upstream; installed separately and not distributed here | `78e605fcb64293cc70516a5c522bc4dc1763e90f` |
| MATLAB Agentic Toolkit | 120 skills symlinked into `~/.agents/skills`, the `matlab-core` root the `matlab` preset scans, and the catalogue `matlab-reference` searches | [matlab/matlab-agentic-toolkit](https://github.com/matlab/matlab-agentic-toolkit) | MathWorks BSD-3-Clause, use restricted to MathWorks products; local install, not distributed here | local install under `~/.matlab/agentic-toolkits/matlab` |
| Playwright MCP | Browser tools, mounted as the `playwright-mcp` MCP server in both presets | [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) | Apache-2.0 | local install |
| `js-yaml` | YAML parsing in `matlab-reference`, loaded from the harness bundle | [nodeca/js-yaml](https://github.com/nodeca/js-yaml) | MIT | as bundled with the harness |

## Modified upstream components

None. No upstream file is patched, vendored, or redistributed here. `dsh-preset-switcher` is a fork, but it is the fork maintainer's published package: this setup only pins it and installs it from npm, so there is nothing to reconstruct from patches.

## Unmodified dependencies

Install each component from its own project or package manager at the pin in [`upstreams.yml`](upstreams.yml). Completed packages, compiled binaries, and upstream skill text are deliberately absent, so restoring this setup means installing them, not copying them.

## Copyright and licence compliance

- **Original files:** the MIT [`LICENSE`](LICENSE) covers `plugins/dsh-chat-preset`, `plugins/local-ai-policy`, `plugins/notifications`, `plugins/dsh-kde-notify`, `plugins/dsh-mcp-auto-permission`, `plugins/matlab-reference`, `skills/brainstorm`, `skills/pub-gh`, the two presets in `profiles/web/cordis.patch.yml`, `AGENTS.md`, and the documentation files in this repository.
- **Upstream notices:** they stay with their own projects, because no upstream file is present here. No third-party licence text needs to be redistributed for that reason.
- **Restricted components:** the MathWorks toolkit is licensed for use with MathWorks products; `ub-mode` and `directing-image-prompts` declare no licence upstream. All three are installed separately and are neither copied nor relicensed here.
- **Unresolved:** none. If a future change copies an upstream file, its project, exact revision, retained notice, and licence must be added to this file before the change is published.

## Not third-party

Original to this setup: the two presets in `profiles/web/cordis.patch.yml`, the chat preset bundle and its guard, the three local plugin modules, the two skills, and the global instructions. The local web gateway, `matlab-server`, and the Office MCP project are also original, but they are not published here, so they carry no upstream credit.
