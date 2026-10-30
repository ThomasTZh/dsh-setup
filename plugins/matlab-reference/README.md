# matlab-reference

Two tools over the official MathWorks Agentic Toolkit catalogue: search it, and read one skill section on request. The `matlab` preset mounts these instead of adding 120 skills to its catalogue, so the agent sees two tools and nothing else until it asks.

| | |
|---|---|
| Plugin id | `matlab-reference` |
| File | [`matlab-reference.mjs`](matlab-reference.mjs) |
| Injects | `tools` |
| Installs to | `$LOCAL_AI/plugins/matlab-reference.mjs` |
| Tests | [`matlab-reference.test.mjs`](matlab-reference.test.mjs) |

## Tools

| Tool | Parameters | Returns |
|---|---|---|
| `search_matlab_skills` | `query` (string, required), `limit` (integer, 1–4, default 2) | Ranked short results with the skill name and description. |
| `read_matlab_skill` | `name` (required), `section`, `resource`, `offset` | One section or a bounded page, with `next_offset` when more remains. |

Reading starts at offset 0 and returns the first sections; a result with a `next_offset` continues with the same `name`, `section`, and `resource`.

## The index

- Walks `catalogRoot` to depth 5, skipping entries that start with a dot.
- Accepts a `SKILL.md` only if its YAML front matter has a kebab-case `name` and a non-empty `description`; files over 512 KiB are skipped.
- Rejects duplicate skill names and an empty catalogue.
- Expands common aliases (`ecg`, `eeg`, `psd`, `cwt`, `dicom`, ...) and drops stop words before ranking.
- Pages are 6000 bytes and a JSON result is trimmed to stay under 8 KiB, so a tool call cannot return an unbounded catalogue dump.

## Configuration

| Key | Meaning |
|---|---|
| `catalogRoot` | Required. The toolkit's `skills-catalog` directory, `__MATLAB_HOME__/agentic-toolkits/matlab/skills-catalog` in the profile. |

## js-yaml

Front matter is parsed with the `js-yaml` copy bundled with the harness. The module locates that package from `DSH_PACKAGE_JSON` when set, otherwise from the launcher path (`dsh` to `lib/bin.js` to `package.json`). A moved harness needs the variable.

## Test

```sh
DSH_PACKAGE_JSON=/path/to/@deepseek-ai/dsh/package.json \
  node --test plugins/matlab-reference/matlab-reference.test.mjs
```

Two tests: ranking and bounded page reads over a synthetic catalogue, and a search against the installed toolkit, which is skipped when no toolkit is present.
