---
name: architecture-review
description: "Architecture health check - boundary violations, dependency cycles, misplaced logic, over/under-engineering, with an incremental remediation roadmap"
argument-hint: "[path or module to focus on]"
disable-model-invocation: true
---

Delegate to the `architecture-reviewer` subagent. Focus: $ARGUMENTS (empty = whole repository).

For large repositories, the reviewer may first use parallel `Explore` subagents to map separate areas (e.g. each top-level module or service) and then perform the review on the merged map.

Present the verdict, dependency map, prioritised findings, fit-to-drivers assessment, remediation roadmap and fitness functions.

Then offer:
1. To record the inferred architecture as `docs/architecture/blueprint.md` if none exists (via `solution-architect`).
2. To implement the proposed fitness functions as architecture tests.
3. To turn the top roadmap items into a `/plan`.
