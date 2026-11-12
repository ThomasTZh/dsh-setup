# Changelog

Newest first, ordered rather than dated. The repository records the configuration that runs; a calendar date on the record would make it read as a snapshot that ages, so entries describe what changed instead.

## Launcher stop control

- Replaced the held-open Konsole entry with `launchers/run-dsh.py`, a foreground supervisor that runs `dsh web` in its own process group and starts it with `--no-browser` because `dsh web` opens its own authenticated URL.
- One Ctrl+C sends SIGTERM to the process group, waits 15 seconds, escalates to SIGKILL, then exits so Konsole closes. A second Ctrl+C force-stops immediately. Closing the window sends SIGHUP and takes the same clean path.
- The supervisor runs `dsh web` from the terminal's working directory through a login Bash, keeps the instance lock and ten newest logs under `$XDG_STATE_HOME/dsh-web/launcher/`, and holds the window open on a startup or runtime failure.
- The desktop entry now installs both `run-dsh.py` and `DSH.desktop`, with the supervisor under `$HOME/.local/share/dsh-setup/`; the README layout, requirements, restore, verification, and launcher README follow.
- Verified with stub services: graceful stop, forced stop in 0.4 seconds, SIGHUP stop, closed ports, and reaped process groups; `py_compile` and `desktop-file-validate` pass. A live `dsh web` launch remains a manual check because the agent sandbox mounts `~/.dsh` read-only.

## Web launcher

- Added `launchers/DSH.desktop`, a Konsole launcher that opens a terminal and runs `dsh web` in the user's interactive Bash, matching a manual terminal launch.
- The harness prints its authenticated URL and opens the default browser itself; `--hold` keeps the terminal open after the server exits. The launcher carries no machine-specific workspace or icon path, and `launchers/README.md` records install and customisation.
- Added the launcher to the README layout, requirements, and restore notes, with `desktop-file-validate` and a live launch as its verification.

## create-launcher skill

- Added `dsh-skill-create-launcher` to [`components.yml`](components.yml) at pin `4a6400b8a3989b7feb010a519df0ceb917460f29`, installed at `~/.agents/skills/create-launcher` with its `references/` templates and symlinked into the on-request root.
- The skill builds a double-click launcher for a project's product, starts every service in its own process group, opens the frontend, stops cleanly on one Ctrl+C, and force-stops on a second.
- The on-request symlink makes the skill visible to the `general` and `matlab` presets; the `standard` and `chat` presets read the shared `~/.agents/skills` root, which Pi also scans.
- Updated the component count, restore block, skill inventory, and verification rows to nine components and 126 shared-root entries.

## matlab-reference harness lookup

- Advanced `dsh-matlab-reference` to pin `e7ff3d574b1ee61278ee36c160bf8b1543ca8efd`; the restore block pin moved with it.
- The plugin accepts a harness package only when `@deepseek-ai/dsh-tools` resolves from it, checking `DSH_PACKAGE_JSON`, the running script, then the `dsh` on `PATH`. The previous lookup accepted any wrapper `package.json`, so a server started by a plugin manager failed to load `js-yaml` and the `matlab` preset could not mount.
- `js-yaml` now falls back to a built-in front-matter parser, and an unreachable harness reports the packages it tried instead of failing at import.
- Added two regression tests for the wrapper launch and the unreachable harness; the component test command is `node --test matlab-reference.test.mjs` without `DSH_PACKAGE_JSON`.

## Plain-language opening

- The README abstract and the GitHub repository description now use everyday words, so a newcomer with no technical background understands what this repository records.
- Advanced `dsh-skill-pub-gh` to pin `327842ce13fcb7033bbe13f0beb7c1eefc72b607`, which adds the plain-language rule for repository descriptions and README abstracts; the restore block pin moved with it.

## mini-backup skill

- Added `mini-backup` to [`components.yml`](components.yml) at pin `833364ff54841a98bcded5ef3223c75e8649cf64`, installed at `~/.agents/skills/mini-backup` and symlinked into the on-request root.
- The skill backs up the current workspace project outside the workspace, keeps only files needed for the current build, and excludes VCS history, dependencies, downloads, caches, and build outputs.
- Updated the component count, restore block, skill inventory, and verification rows to eight components.
- Skill restore now copies the listed component files rather than the whole clone, so `.git` and repository docs are not installed.

## Component repositories

- Moved every original component into its own public repository and recorded the pins in [`components.yml`](components.yml): `dsh-chat-preset`, `dsh-mcp-auto-permission`, `dsh-kde-notify` with its delivery module, `dsh-local-ai-policy`, `dsh-matlab-reference`, `dsh-skill-brainstorm`, and `dsh-skill-pub-gh`.
- Removed `plugins/` and `skills/` from this repository. The profile patch, the package manifest, the instructions, and the documentation are what remains; every component is linked by repository and pin.
- Repointed the three `link:` dependencies at the install destinations, `__DSH_HOME__/local-plugins/...` and `__LOCAL_AI__/plugins/...`, so the record matches the running profile. The placeholder set is now `__DSH_HOME__`, `__LOCAL_AI__`, `__HOME__`, `__MATLAB_HOME__`, and `__WORKSPACE__`.
- Restore now clones the seven repositories at their pins and copies the listed files to the destinations the profile reads.
- Added `dsh-chat-preset` guard tests in the extracted repository; the other suites moved unchanged and still pass.

## directing-image-prompts skill

- Added `directing-image-prompts` to [Restore](README.md#restore) and the skill inventory as a clone pinned at `78e605fcb64293cc70516a5c522bc4dc1763e90f` of [Nanoleava/directing-image-prompts](https://github.com/Nanoleava/directing-image-prompts), installed under `~/.agents/skills` and symlinked into the on-request root.
- Recorded it in [`upstreams.yml`](upstreams.yml), [`THIRD_PARTY.md`](THIRD_PARTY.md), and the README reference list as unlicensed upstream: only the pin and install location are published, and no skill text is copied.
- The shared `~/.agents/skills` root means the same clone is discovered by Pi as well as the harness, so the install is recorded once.
- Verified in a temporary `HOME`: the clone and symlink block yields exactly one `skill:directing-image-prompts` command from `pi --mode rpc --offline`. The running harness listed the skill in its catalogue after the symlink, without a restart.

## MCP auto-approval and notification bundles

- Added `plugins/dsh-mcp-auto-permission`: a bundle that adds the `workspace-write-mcp` permission preset, claims `mcp__*` approval requests as `allowed-once`, and exposes `mcpAutoPermission.autoApproves()` for other plugins.
- Rebuilt desktop notifications as `plugins/dsh-kde-notify`: alerts only on approval and question requests, skips an approval claimed by `mcpAutoPermission`, and no longer alerts on turn completion, failure, capped output, or blocked work.
- Removed the old `plugins/kde-notify/` file plugin and its profile row; the notification bundle now owns the host registration.
- Moved the notification core to a root `notifications.mjs` symlink so the notification bundle's installed-path import resolves in the release tree without a second copy.
- `matlab-reference` now derives the harness package from `DSH_PACKAGE_JSON` or the launcher path and contains no hardcoded home directory.
- The `web` profile now loads fifteen bundles: four shipped, three local, and eight third-party.
- Added tests for the MCP auto-approval predicate and the notification suppression path; the live harness confirmed the mode and notification behavior after restart.

## pub-gh house style

- `skills/pub-gh` gained a house-style section summarising how this publisher wants a release read: local work and verification before any GitHub operation, no snapshot dates, README in release shape, name/path/contents tables with original files first, one directory and one README per component, original-only trees with `THIRD_PARTY.md` credit and a root MIT `LICENSE`, byte-identical installed copies, and evidence instead of claims.
- Step 5 of the skill now points at that section for the README shape.

## Plugins grouped by owner

- Every plugin now has its own directory under `plugins/`, each with a README: `dsh-chat-preset`, `local-ai-policy`, `kde-notify`, `notifications`, `matlab-reference`.
- `local-ai/` is gone. `policy.mjs`, `notifications.mjs`, `kde-notify.mjs`, and `matlab-reference.mjs` moved with their tests into those directories.
- Files stay byte-identical to the installed copies, so the tree no longer mirrors the install targets: restore copies each file from its directory to `$LOCAL_AI/` or `$LOCAL_AI/plugins/`. `kde-notify.mjs` keeps `import '../notifications.mjs'`, which resolves only at the install location.
- README, `docs/inventory.md`, `THIRD_PARTY.md`, and the verification commands follow the new paths.

## Rewritten as a release record

- README rebuilt to the release structure: Abstract, Composition, Verification, Conclusion, Acknowledgements, References. It now states the problem the repository answers, the restore procedure, and the checks with their outcomes.
- `CREDITS.md` replaced by `THIRD_PARTY.md`, which adds sections for modified upstream components (none), unmodified dependencies, and copyright and licence compliance.
- MIT `LICENSE` added, covering the original files only and naming them explicitly.
- Layout reduced to name, path, and contents, with original files first and third-party records second; the install destinations now live only in the restore block.
- Removed record dating: no snapshot line in the README, no `snapshot` field in `upstreams.yml`, no recording dates in pins or prose.
- Verification now reports what was actually run: YAML parsing, `node --check`, both test suites, the documented restore block executed against an empty target, the composition dump, link resolution, and the privacy scan, followed by the untested items and the `web-ui-*` warnings the dump emits.

## `pub-gh` skill added

- `skills/pub-gh`: a skill for preparing and publishing a minimal, reproducible GitHub release, with `assets/README.template.md` and `assets/THIRD_PARTY.template.md`.
- Installed at `~/.agents/skills/pub-gh` and symlinked into the on-request root, so both local presets and the `chat` preset see it.

## Initial record

Replaced the previous record, which described a Windows host with four bundles, with the harness as it runs here on `0.2.1-rc.2`.

Recorded:

- The `web` profile: thirteen bundles, the loader overrides, and a `package.json` whose `link:` target resolves from the repository root.
- The two local presets, `general` and `matlab`, as declared in the profile patch, each injected with `local-ai-policy` first.
- `plugins/dsh-chat-preset`: the `chat` preset bundle and its `web_search` / `web_fetch` / `skill` guard.
- `local-ai/policy.mjs`: per-call tool policy. MATLAB tools and Toolkit skills in the `matlab` preset only, Playwright asks, Toolkit reads denied elsewhere.
- `local-ai/plugins/matlab-reference.mjs`: `search_matlab_skills` and `read_matlab_skill` over the official Toolkit catalogue. The harness package is located from the launcher path, with `DSH_PACKAGE_JSON` as the override, instead of a fixed home directory.
- `local-ai/plugins/kde-notify.mjs` and `local-ai/notifications.mjs`: KDE Connect delivery on turn end, failure, approval request, and question request.
- `skills/brainstorm`.
- `upstreams.yml` and `docs/inventory.md` describing the whole composition.
- Third-party credit with repository, licence, and installed version for the harness, the eight plugins, `ub-mode`, the MathWorks toolkit, Playwright MCP, and `js-yaml`.

Removed:

- `vendor/agent-mode-switcher` and its harness patch: third-party source, and the installed harness is dist-only, so the patch cannot apply.
- The copied `ub-mode` skill: upstream text, now a reference in `upstreams.yml`.
- Generated `~/.dsh/.agent-presets` state and untemplated absolute paths.
- The per-origin directory prefixes, along with the installer and check scripts.
