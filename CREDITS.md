# Credits

Third-party work this setup mounts, installs, or reads. Nothing in this list is copied into the repository: each row links to its own project, and [`upstreams.yml`](upstreams.yml) carries the machine-readable pins.

## Harness

| Component | Role here | Project | License |
|---|---|---|---|
| DeepSeek Harness | The host: loader, sessions, tools, Web GUI, shipped bundles and presets | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) | MIT |

## Plugins in the `web` profile

| Package | Role here | Project | License | Pin |
|---|---|---|---|---|
| `dsh-codex` | The openai-codex provider | [Yan-Zero/dsh-codex](https://github.com/Yan-Zero/dsh-codex) | Apache-2.0 | 0.3.2 |
| `dsh-pocket` | Tunnel proxy for the Web UI | [shaobeichen/dsh-pocket](https://github.com/shaobeichen/dsh-pocket) | GPL-2.0 | 2.12.0 |
| `dsh-better-sidebar` | Client sidebar with agent open-tools | [omdsh-dev/DSH-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) | MIT | 0.28.0 |
| `dsh-preset-switcher` | Switches the session preset after a conversation started | [neutronslime/dsh-preset-switcher-fork](https://github.com/neutronslime/dsh-preset-switcher-fork), a fork of [jeffcwj/dsh-preset-switcher](https://github.com/jeffcwj/dsh-preset-switcher) | MIT | 0.1.3 |
| `dsh-prompt-enhance` | Prompt rewriting | [rongxingda/dsh-prompt-enhance](https://github.com/rongxingda/dsh-prompt-enhance) | Apache-2.0 | 0.3.2 |
| `@linxin666/dsh-client-ui-skill-explorer` | Skill Center panel | [zhu1090093659/dsh-web](https://github.com/zhu1090093659/dsh-web) | BSD-3-Clause | 0.4.8 |
| `@linxin666/dsh-usage` | Token and cost card | [zhu1090093659/dsh-web](https://github.com/zhu1090093659/dsh-web) | Apache-2.0 | 0.4.8 |
| `@perrylink/dsh-github` | GitHub tools | [PerryLink/dsh-github](https://github.com/PerryLink/dsh-github) | Apache-2.0 | 0.7.27 |

## Skills and toolkits

| Component | Role here | Project | License | Pin |
|---|---|---|---|---|
| `ub-mode` | Skill installed at `~/.agents/skills/ub-mode` and symlinked into the on-request root | [unclebob/ub-mode](https://github.com/unclebob/ub-mode) | None declared upstream | `57a8bdd` (2026-10-25) |
| MATLAB Agentic Toolkit | 120 skills symlinked into `~/.agents/skills`, the `matlab-core` root the `matlab` preset scans, and the catalogue `matlab-reference` searches | [matlab/matlab-agentic-toolkit](https://github.com/matlab/matlab-agentic-toolkit) | MathWorks BSD-3-Clause, use restricted to MathWorks products | Local install, 2026 snapshot |
| Playwright MCP | Browser tools, mounted as the `playwright-mcp` MCP server in both presets | [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) | Apache-2.0 | Local install |
| `js-yaml` | YAML parsing in `matlab-reference`, loaded from the harness bundle | [nodeca/js-yaml](https://github.com/nodeca/js-yaml) | MIT | As bundled by the harness |

## Not third-party

The rest of this repository is original to the setup: `plugins/dsh-chat-preset`, `local-ai/policy.mjs`, `local-ai/plugins/matlab-reference.mjs`, `local-ai/plugins/kde-notify.mjs`, `local-ai/notifications.mjs`, `skills/brainstorm`, the two presets in `profiles/web/cordis.patch.yml`, and `AGENTS.md`.

Three components the presets mount are original but not published here, so they carry no upstream credit: the local web gateway (`__LOCAL_AI__/web-gateway.py`), `__LOCAL_AI__/matlab-server`, and the Office MCP project at `__HOME__/Documents/__WORKSPACE__/officeProjects/setup/office`.
