---
description: Senior-level review of staged changes, a branch, or a set of files
argument-hint: "[base branch | file paths]  (default: staged + unstaged changes)"
allowed-tools: Bash(git diff:*), Bash(git log:*), Bash(git status:*), Bash(git merge-base:*), Read, Grep, Glob
---

## Context
- Status: !`git status --short`
- Current branch: !`git branch --show-current`

## Task
Determine the review scope from: $ARGUMENTS
- Empty -> `git diff HEAD` (staged + unstaged).
- A branch name -> `git diff <branch>...HEAD`.
- File paths -> those files.

Delegate to the `code-reviewer` subagent with the `code-review-checklist` skill. If the diff touches authentication, authorisation, payments, PII, file uploads, deserialisation, SQL or shell commands, also delegate to `security-auditor` in parallel.

Merge both reports, de-duplicate, sort by severity, and present them. Then ask the user whether to apply fixes for the BLOCKER and MAJOR findings.
