# Changelog

Newest first, ordered rather than dated. The repository records the configuration that runs; a calendar date on the record would make it read as a snapshot that ages, so entries describe what changed instead.

## Rewritten as a release record

- README rebuilt to the release structure: Abstract, Composition, Verification, Conclusion, Acknowledgements, References. It now states the problem the repository answers, the restore procedure, and the checks with their outcomes.
- `CREDITS.md` replaced by `THIRD_PARTY.md`, which adds sections for modified upstream components (none), unmodified dependencies, and copyright and licence compliance.
- MIT `LICENSE` added, covering the original files only and naming them explicitly.
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
