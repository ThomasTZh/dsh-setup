---
name: pub-gh
description: Prepare, publish, or update the current workspace project on GitHub as a minimal, reproducible research-code release. Use when asked to open-source, release, upload, or synchronize a project. Separate original work from modified third-party code and unmodified dependencies; preserve attribution and license obligations; remove private material; write a concise academic README; verify the release before a safe push or pull request.
compatibility: Requires workspace file access and Git. GitHub authentication and network access are required only for publishing; gh CLI is optional.
---

# Publish or update a minimal, reproducible GitHub project

## Mission

Release **the smallest legally redistributable set of files that enables an independent researcher with comparable hardware and software to reproduce the project**. Prefer clarity, traceability, safety, and a verified working example over mirroring the workspace.

**A request to prepare a release is not authorization to make private material public.** Work locally first; require explicit approval of repository destination, visibility, and the publication manifest before the first publication or any destructive or surprising update. Never claim a push occurred unless it succeeded.

## Non-negotiable rules

1. **Original work:** publish only original algorithms, implementation, interfaces, configuration templates, tests, and scripts needed for replication. Keep authorship accurate; do not claim ownership of third-party ideas or code.
2. **Modified third-party work:** document the original project and exact source version; publish only the necessary changes, preferably as reviewable patches and minimal integration code. Keep the original copyright notices and comply with the upstream license. **If the license requires complete corresponding source, notices, or other material beyond patches, meet those requirements or stop.** Do not assume that a patch-only distribution is legally sufficient.
3. **Unmodified third-party work:** do **not** copy code, binaries, or completed packages into the release. Provide the upstream URL, exact version/commit, citation, authors/maintainers, copyright, license, and official installation instructions in the documentation and dependency manifests. Include license texts where a distribution obligation makes them necessary.
4. **Exclude:** credentials, API keys/tokens, private API endpoints or proprietary SDKs, private information, identifying data, patient/participant data, consent forms, internal logs, unpublished or restricted data, absolute local paths, private repository URLs, unnecessary third-party code, duplicates, caches, builds, large outputs, and generated binaries. Do not add an unnecessary API/service integration to make the demo work.
5. **Minimal reproduction:** retain enough to install/build, configure, execute, and verify the novel contribution on a comparable setup, but nothing more. Prefer a synthetic or clearly redistributable small input rather than a private dataset.
6. **Accurate documentation:** never invent results, citations, URLs, license terms, commands, platform support, or test success. Clearly mark missing evidence or inaccessible hardware.
7. **Git safety:** never copy the workspace `.git` directory into a new public release. Never push all workspace files, force-push, rewrite history, change repository visibility, delete public files, or overwrite unrelated remote work without separate explicit approval.

## House style

The publisher's defaults, learned from the `dsh-setup` repository. Apply them unless the user overrides them.

- **Local first, GitHub second.** Build and verify the tree in a local checkout. The first remote operation is the push or pull request, after the checks pass and the user approves it. Never publish in order to find out whether it works.
- **No snapshot dates.** No record date, no `snapshot:` field, no "as of" wording. Say what the release is and pin versions and commits; order a changelog newest-first rather than dating it.
- **README in release shape.** Abstract, Composition (or Methods), Verification (or Results), Conclusion, Acknowledgements, References. One row per check that actually ran, then the untested items stated plainly.
- **Tables say name, path, contents.** Original files first, third-party records second. Do not repeat install destinations in the layout; the restore or install block owns them.
- **One directory per component.** Every plugin, skill, and tool gets its own folder and its own README: what it does, how it is wired, its configuration, where it installs, and how to run its tests.
- **Original only.** No upstream code, text, or binary in the tree. Credit each upstream project in `THIRD_PARTY.md` with its project, revision, licence, and what changed, even when nothing changed. Add a root `LICENSE`, MIT by default, covering only the original files and listing them.
- **Copies stay byte-identical.** A file installed elsewhere is committed exactly as it runs, even when that stops the tree from mirroring the install locations; the restore block maps repository path to destination.
- **Evidence, not claims.** Run the checks, quote the outcomes, and mark anything unrun as not tested.

## Workflow

### 1. Inspect the workspace and the intended GitHub target

- Identify project root, purpose, entry points, main results, hardware interfaces, build system, tests, and original contributions.
- Inspect Git status, current branch, remotes, tracked/untracked/ignored files, submodules, and the remote's existing contents and default branch when available.
- Identify the GitHub owner/repository and visibility from existing configuration or user instructions; do not guess. Distinguish **new publication** from **update**.
- Examine dependency manifests, lockfiles, vendored code, upstream forks, headers, papers, dataset provenance, and license files. If provenance cannot be verified, mark it unresolved rather than assuming originality.
- Do not change or clean the working workspace while preparing the release. Preserve user modifications.

### 2. Classify and select files

Create an explicit **publication manifest** before copying anything. For each candidate file or group, record: `path`, `decision`, `class`, `origin/owner`, `upstream URL and version`, `license`, and `reason`.

| Class | Publish | Treatment |
| --- | --- | --- |
| Original, necessary | Yes | Minimal original source, config templates, setup/test code |
| Modified upstream, necessary | Conditional | Prefer patch/diff, integration script, upstream pin, original notices |
| Unmodified upstream | No code | Link, citation, license, copyright, pinned dependency only |
| Generated/repeated | Usually no | Recreate from source; include only essential tiny fixtures |
| Private, sensitive, or unlicensed | No | Exclude; block if its presence or obligations cannot be resolved |

Apply a **reproduction test** to each proposed file: *If omitted, can a new user still reconstruct the method and reproduce a representative result with documented tools and dependencies?* If yes, omit it. If omission would violate a license obligation, retain the legally necessary material even if it makes the distribution larger.

### 3. Prepare a clean publication tree

- Build a separate temporary publication directory or working tree from an **allowlist** of approved items. Do not use a copy of the entire workspace or its Git history.
- For an existing repository, start from a fresh checkout of its actual remote branch, preserve unrelated tracked content, and apply only approved changes. Review any removals explicitly.
- Suggested structure (use only entries actually required):

```text
project/
  README.md
  LICENSE                       # License covering the original files only
  THIRD_PARTY.md                # Upstream attribution, modifications, notices
  CITATION.cff                  # Optional, if verified metadata is available
  .gitignore
  src/                          # Novel code and necessary adapters only
  patches/                      # Modified third-party changes, when appropriate
  scripts/                      # Minimal setup, patch-apply, run, validation
  config/example.*              # Safe placeholders, no credentials
  tests/                        # Small verification/smoke tests
  examples/                     # Synthetic or permission-cleared tiny examples
```

- Prefer pinned package manifests, build files, and reproducible dependency installation over committing completed upstream packages. Audit lockfiles for private URLs or embedded credentials.
- For modified third-party code, record upstream repository, immutable commit/tag, affected files, modification rationale, how to reconstruct the full working tree, and how to apply patches. Check that patches apply to a clean copy of the stated upstream revision. Do not strip third-party copyright headers.
- If the project requires proprietary hardware, drivers, calibration, or licensed software, document exactly what must be obtained independently and any limits on replication. Do not redistribute restricted components.

### 4. Apply privacy, security, and legal gates

Perform **all** checks before committing or uploading:

- Examine every proposed file, including hidden files, comments, config, metadata, image EXIF, notebooks, and any generated patches, for sensitive content. Exclude local usernames, personal addresses, machine names, server addresses, access credentials, identifiable images, clinical data, and private data embedded in figures or logs.
- Run a secret scanner if available (e.g. Gitleaks), plus manual review. GitHub push protection is a second line of defence, not a substitute for pre-push review.
- Use a language/IDE-specific `.gitignore`, but **do not rely on `.gitignore` to hide already tracked files or previously committed history**. Verify `git ls-files`, staged diffs, and the exact Git history/refs intended for upload.
- Verify provenance and licence compatibility. Preserve required source headers, attribution, copyright notices, full licence texts, and downstream modification notices. Root `LICENSE` must not claim third-party files under the project's chosen licence.
- Stop and report blockers when a file has unknown ownership/licence, a required source-distribution condition cannot be met, there is suspected sensitive content in the history being pushed, or the destination is ambiguous.
- If a secret was previously committed, **revoke or rotate it first**; removing a file from the working tree does not erase public history. Do not rewrite shared history automatically.

### 5. Write academic-style documentation

Use [assets/README.template.md](assets/README.template.md) as a starting point, following the [House style](#house-style) shape. Keep the prose brief, precise, and third-person or neutral; use short paragraphs, short bullets, and a small table where helpful. Preserve this structure:

1. **Abstract:** problem, original contribution, method, intended use, one evidence-backed result if available.
2. **Methods and Materials:** original vs upstream components, algorithm overview, hardware/software/OS/driver versions, installation, build, setup, exact reproduction commands, inputs/outputs, expected outputs, and limitations.
3. **Results:** measured outcomes with units, dataset provenance, conditions, and corresponding evidence; label untested demonstrations as such.
4. **Conclusion:** supported contribution and limitations; no exaggerated claims.
5. **Acknowledgements:** upstream authors, projects, maintainers, relevant support and licensing notices.
6. **References:** numbered linked citations for all reused methods, ideas, datasets, software, figures, and modified components, preferably DOI/paper + official repository/release and license links.

Keep README focused. Put detailed third-party attribution and patch reconstruction instructions in `THIRD_PARTY.md` (see [assets/THIRD_PARTY.template.md](assets/THIRD_PARTY.template.md)), then link to it from the README. Use `[1]`, `[2]`, etc. consistently; never use placeholder references in the published version. Include a `CITATION.cff` only with verified author/title/version metadata; cite the related paper when applicable. Set an appropriate `LICENSE` for code owned by the publisher after checking institutional/co-author ownership and upstream obligations. Do not guess licence choices.

### 6. Verify from an independent perspective

- In a fresh directory containing **only the release tree**, follow the README without using private workspace paths or hidden state.
- Test installation/build/patch application, one short run, and a small deterministic comparison or smoke test. Capture the commands used and observations; do not put large generated artifacts in Git.
- Verify documented versions, links, citations, license notices, markdown readability, and file inventory. `git diff --check` and a review of staged file names/content are mandatory before commit.
- If the needed hardware, datasets, or proprietary prerequisites are unavailable, perform all possible static and software checks; clearly record what remains **not tested**.
- Produce a brief **release review**: included files, excluded categories, upstream component treatment, privacy/license findings, tests (pass/fail/not run), target repo/branch/visibility, and proposed changes to the remote.

### 7. Publish safely, or update without overwriting

**Approval gate:** obtain approval for the exact repository, visibility, publication manifest, and any first public push, deletions, licence changes, or potentially disruptive update. If not authorised or authentication is missing, leave a prepared local release and actionable commands rather than implying publication happened.

- **New repository:** initialise Git **in the clean publication tree**, stage explicit allowlisted paths (avoid `git add .`), review `git diff --cached` and history, commit, then use authenticated Git/`gh` to create the approved destination and push only the intended branch. Do not automatically choose public visibility.
- **Existing repository:** fetch and inspect remote changes first; make an isolated branch from the correct default branch, apply the curated updates without overwriting unrelated work, review the diff, commit, push the branch, and prefer a pull request. Do not force-push, silently replace history, or modify protected branches.
- Use informative commit messages identifying the novel change or release update. Do not create empty commits or update documentation with fabricated results.
- After successful publication, verify the remote URL, branch/PR, visible file list, README links, licence notices, and absence of sensitive files. Report the actual outcome.

## Final response contract

Report concisely:

- **Destination:** repository URL, branch/PR, visibility, new vs updated, or `not published`.
- **Original contribution:** what was released and why it is minimally sufficient.
- **Third-party handling:** modified upstream components (patches + acknowledgement) and unmodified dependencies (links only).
- **Audit:** privacy/secrets/licensing status and unresolved items.
- **Reproduction:** exact checks run, outcomes, and untested prerequisites.
- **Changes:** included/removed file summary and any approval required.

If stopped by licensing, privacy, reproducibility, permissions, or unclear destination, do **not** weaken the checks. Provide the clean draft and list the smallest concrete decisions needed to proceed.

## Authoritative references for the agent

- [GitHub: Creating a repository with GitHub CLI](https://cli.github.com/manual/gh_repo_create)
- [GitHub: Ignoring files](https://docs.github.com/en/get-started/git-basics/ignoring-files)
- [GitHub: Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [GitHub: About CITATION files](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-citation-files)
- [REUSE Specification: Copyright and licence metadata](https://reuse.software/spec/)
