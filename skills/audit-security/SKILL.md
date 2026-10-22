---
name: audit-security
description: "Security audit of the repo, a path, or the current changes (OWASP, secrets, dependencies, infra)"
argument-hint: "[path | 'changes']  (default: whole repository)"
disable-model-invocation: true
---

Scope: $ARGUMENTS (empty = whole repository; "changes" = `git diff HEAD` plus untracked files).

Delegate to the `security-auditor` subagent with the `secure-coding` skill. It must cover: secrets (including git history for the scope), injection, authN/authZ and IDOR, input/output handling, SSRF, deserialisation, crypto, configuration/headers/CORS, dependency vulnerabilities (run the ecosystem audit tool), Dockerfiles and CI workflows.

Present a findings table sorted by severity with file:line and fix, followed by the top 3 priorities and quick wins. Ask the user before applying any fixes. Never print discovered secret values in full - show only the first 4 characters.
