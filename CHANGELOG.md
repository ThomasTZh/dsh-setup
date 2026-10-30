# Changelog

Dates are the day the change landed on this machine. Newest first.

## 2026-10-30

Added `skills/pub-gh`, a skill for preparing and publishing a minimal, reproducible GitHub release: separate original work from modified and unmodified third-party code, run the privacy and licence gates, write the academic README, verify the tree, then push or open a pull request. It ships with `assets/README.template.md` and `assets/THIRD_PARTY.template.md`, which the workflow asks the agent to fill in.

Installed at `~/.agents/skills/pub-gh` and symlinked into `~/.config/local-ai/skills/on-request/pub-gh`, so both local presets and the `chat` preset see it. Files are byte-identical to the installed copies. Kept the `compatibility` front-matter key even though the DSH skill provider ignores it, so the repository matches what is installed.

## 2026-10-28

Replaced the previous record, which described a Windows host with four bundles, with the harness as it runs here on `0.2.1-rc.2`.

Recorded:

- The `web` profile: thirteen bundles, the loader overrides, and a `package.json` whose `link:` target resolves from the repository root.
- The two local presets, `general` and `matlab`, as declared in the profile patch, each injected with `local-ai-policy` first.
- `plugins/dsh-chat-preset`: the `chat` preset bundle and its `web_search` / `web_fetch` / `skill` guard.
- `local-ai/policy.mjs`: per-call tool policy. MATLAB tools and Toolkit skills in the `matlab` preset only, Playwright asks, Toolkit reads denied elsewhere.
- `local-ai/plugins/matlab-reference.mjs`: `search_matlab_skills` and `read_matlab_skill` over the official Toolkit catalogue. The harness package is now located from the launcher path, with `DSH_PACKAGE_JSON` as the override, instead of a fixed home directory.
- `local-ai/plugins/kde-notify.mjs` and `local-ai/notifications.mjs`: KDE Connect delivery on turn end, failure, approval request, and question request.
- `skills/brainstorm`.
- `upstreams.yml` and `docs/inventory.md` describing the whole composition.
- `CREDITS.md`: every third-party project with its own repository link, license, and installed version. `upstreams.yml` gained `repository` and `installed` fields to match, so credit is explicit for the harness, the eight plugins, `ub-mode`, the MathWorks toolkit, Playwright MCP, and `js-yaml`.

Removed:

- `vendor/agent-mode-switcher` and its harness patch: third-party source, and the installed harness is dist-only, so the patch cannot apply.
- The copied `ub-mode` skill: upstream text, now a reference in `upstreams.yml`.
- Generated `~/.dsh/.agent-presets` state and untemplated absolute paths.
- The per-origin directory prefixes, along with the installer and check scripts. The tree now mirrors the install targets, so restoring is a copy plus five placeholder substitutions, and no part of it needs marking as original.
