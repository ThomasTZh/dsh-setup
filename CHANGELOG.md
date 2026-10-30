# Changelog

Newest first, ordered rather than dated. The repository records the configuration that runs; a calendar date on the record would make it read as a snapshot that ages, so entries describe what changed instead.

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
