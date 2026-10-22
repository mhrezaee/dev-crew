---
description: Pre-merge gate - lint, test, self-review, then craft Conventional Commits and a PR description
argument-hint: "[ticket id]"
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git branch:*), Bash(git add:*), Bash(git commit:*), Read, Grep, Glob, Bash
---

## Context
- Branch: !`git branch --show-current`
- Status: !`git status --short`
- Recent commits: !`git log --oneline -10`

## Task (ticket: $ARGUMENTS)
Follow the `git-workflow` skill.

1. **Gate** - detect and run the project's format/lint, build and test commands. If anything fails, stop and report (offer to fix).
2. **Self-review** - delegate the full diff to `code-reviewer`. Any BLOCKER stops the ship; show it to the user.
3. **Hygiene** - check the diff for secrets, debug output, commented-out code, TODOs without tickets, unintended files (lock files, env files, build output).
4. **Branch** - if on `main`/`master`/`develop`, propose a branch name `<type>/<ticket>-<slug>` and create it after the user agrees.
5. **Commits** - group changes into atomic Conventional Commits. Show the proposed commits (files + messages) and **ask for confirmation** before running `git add`/`git commit`.
6. **PR description** - generate it from the template in `git-workflow` (What / Why / How / Testing / Risks), ready to paste. If the `gh` CLI is available, offer the `gh pr create` command - but never push or open the PR without explicit approval.
