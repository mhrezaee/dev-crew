---
name: onboard
description: "Map an unfamiliar codebase - stack, run/test commands, architecture, key flows - and optionally write CLAUDE.md"
argument-hint: "[area of interest]"
disable-model-invocation: true
---

Using the `codebase-onboarding` skill, investigate this repository (focus area: $ARGUMENTS - if empty, the whole repo).

For large repositories, use parallel `Explore` subagents for independent areas (e.g. backend, frontend, infrastructure) and merge their findings.

Verify the build/test commands by running them when it is safe and fast (no deploys, no destructive commands, no network-heavy installs without asking).

Produce the onboarding map. Then offer to:
1. Write/update `CLAUDE.md` using `${CLAUDE_PLUGIN_ROOT}/templates/CLAUDE.md` (or `~/.claude/templates/dev-crew/CLAUDE.md` for script installs) as the structure (concise, AI-oriented), and/or
2. Write `docs/ONBOARDING.md` for humans (delegate to `docs-writer`).
