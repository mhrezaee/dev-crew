---
description: Prepare a release - SemVer bump, changelog, release notes, readiness checklist
argument-hint: "[version override, e.g. 2.3.0]"
allowed-tools: Bash(git describe:*), Bash(git log:*), Bash(git tag:*), Bash(git status:*), Read, Write, Edit, Grep, Glob
---

## Context
- Last tag: !`git describe --tags --abbrev=0 2>/dev/null || echo "none"`
- Commits since last tag: !`git log $(git describe --tags --abbrev=0 2>/dev/null || git rev-list --max-parents=0 HEAD)..HEAD --pretty=format:'%h %s' 2>/dev/null | head -200`

## Task
Delegate to the `release-manager` subagent. Version override: $ARGUMENTS (empty = derive from commits via SemVer).

Deliver: the proposed version and why, a Keep-a-Changelog entry prepended to `CHANGELOG.md` (create it if missing), user-facing release notes, the pre-release checklist with status, and the exact tag/publish commands. Edit version numbers in manifests only after the user confirms the version. Never create or push tags without explicit approval.
