---
name: git-workflow
description: Git conventions for daily work - branch naming, Conventional Commits messages, atomic commits, rebasing, resolving conflicts, and writing great pull request descriptions. Use when committing, naming a branch, writing a commit message or PR description, squashing/rebasing, or resolving merge conflicts.
---

# Git workflow

Check the repo first for its own conventions (CONTRIBUTING.md, commitlint config, PR template, recent `git log`). Those win.

## Branch names
`<type>/<ticket>-<short-description>` e.g. `feat/PAY-142-refund-endpoint`, `fix/APP-88-null-avatar-crash`.
Types: feat, fix, chore, refactor, docs, test, perf, ci, hotfix.

## Commits - Conventional Commits
```
<type>(<optional scope>): <imperative summary, <= 72 chars, no period>

<body: WHAT changed and WHY, wrapped at 72 chars. Not HOW - the diff shows how.>

<footer: BREAKING CHANGE: ..., Refs: PAY-142, Closes #123>
```
Examples:
- `feat(booking): allow free cancellation within 24 hours`
- `fix(auth): reject expired refresh tokens`
- `refactor(pricing): extract tax calculation into TaxCalculator`

Rules:
- One logical change per commit; the build passes at every commit.
- Never mix refactoring with behaviour changes.
- Never commit secrets, generated files, or local config. Check `git diff --staged` before committing.

## Before opening a PR
```bash
git fetch origin
git rebase origin/main        # or merge, if the team prefers merge commits
# run lint, tests, build
git push --force-with-lease   # never plain --force on shared branches
```

## Resolving conflicts
1. Understand both sides: `git log --merge -p <file>`.
2. Keep both intents, not just one side; re-run tests.
3. For lock files, regenerate rather than hand-merge.

## PR description template
```markdown
## What
<1-3 sentences>

## Why
<problem / ticket link>

## How
<key implementation decisions, anything surprising>

## Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manually verified: <steps>

## Screenshots / recordings
<for UI changes>

## Risks & rollout
<migrations, flags, backwards compatibility, rollback>
```

## Safety
Never run `git push --force`, `git reset --hard`, `git clean -fd`, branch deletion or history rewriting on shared branches without explicit user confirmation.
