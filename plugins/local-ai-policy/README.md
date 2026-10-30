# local-ai-policy

Decides, per tool call, what the `general` and `matlab` presets are allowed to do. It is mounted as the first row of both presets and hooks `tools/execute`, so it sees every call before the tool runs.

| | |
|---|---|
| Plugin id | `local-ai-policy` |
| File | [`policy.mjs`](policy.mjs) |
| Injects | `tools`, `approval` |
| Installs to | `$LOCAL_AI/policy.mjs` |
| Tests | [`policy.test.mjs`](policy.test.mjs) |

## Decisions

| Call | `general` | `matlab` |
|---|---|---|
| `mcp__web__web_search`, `mcp__web__web_fetch`, `mcp__web__web_crawl` | allow | allow |
| `mcp__matlab__*`, `search_matlab_skills`, `read_matlab_skill` | deny | allow |
| `mcp__playwright__*` | ask | ask |
| `skill` with a `matlab-*` name | deny | allow for the eight core skills, deny otherwise |
| reads under `~/.matlab/agentic-toolkits/`, `~/.config/local-ai/skills/matlab`, `~/.agents|.codex|.dsh/skills/matlab-*` | deny | allow |
| everything else | allow | allow |

`allow` runs the call. `ask` opens the harness approval request and runs once when the answer is `allowed-once`; any other answer is blocked. `deny` returns an error with code `LOCAL_POLICY_BLOCKED` and the text `Blocked by local AI mode policy (<action>).`

## Configuration

| Key | Meaning |
|---|---|
| `mode` | `general` or `matlab`. The only reason the two presets differ. |
| `workspaceOnly` | When true, a read outside the session workspace root is denied. The default is false. |

## Notes

- The eight allowed MATLAB skills are `matlab-create-live-script`, `matlab-debug-code`, `matlab-install-products`, `matlab-list-products`, `matlab-read-documentation`, `matlab-review-code`, `matlab-run-tests`, and `matlab-write-tests`, listed in `MATLAB_CORE_SKILLS`.
- Read paths are resolved with `realpath` before comparison, so a symlink into the toolkit directory is still recognised as a toolkit read.
- The workspace root comes from the agent's session header, falling back to `process.cwd()`.

## Test

```sh
node --test plugins/local-ai-policy/policy.test.mjs
```

Five tests: MATLAB tools and core skills allowed in `matlab` only, other modes rejecting both, ordinary file edits left unrestricted, bounded web tools allowed in every mode, and browser execution asking for approval.
