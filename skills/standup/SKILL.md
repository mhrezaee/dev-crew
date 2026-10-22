---
name: standup
description: "Generate your daily stand-up update from git activity (yesterday / today / blockers)"
argument-hint: "[since, e.g. 'yesterday' or '3 days ago' (default: last working day)]"
allowed-tools: Bash(git log:*), Bash(git status:*), Bash(git branch:*), Bash(git config:*), Bash(git diff:*)
model: haiku
effort: low
disable-model-invocation: true
---

## Context
- Me: !`git config user.email`
- Current branch: !`git branch --show-current`
- Uncommitted work: !`git status --short`
- Local branches by recent activity: !`git branch --sort=-committerdate --format='%(refname:short) %(committerdate:relative)' | head -8`

## Task
Since: $ARGUMENTS (if empty, use the last working day - on Monday that means Friday).

Collect my commits with `git log --all --author="$(git config user.email)" --since="<since>" --pretty=format:'%h %ad %s' --date=short`. Group them by branch/ticket and translate commit messages into outcomes a non-engineer understands.

Output exactly:
```
**Yesterday**
- ...
**Today**
- ... (inferred from current branch, uncommitted changes and unfinished work - mark as "likely")
**Blockers**
- None / ...
```
Keep it under 8 bullets total. Do not invent work that is not in the git data.
