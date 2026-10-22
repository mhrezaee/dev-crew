---
name: design
description: "Produce a technical design with options, trade-offs, diagrams and an ADR"
argument-hint: <what to design>
disable-model-invocation: true
---

Delegate to the `solution-architect` subagent to design a solution for:

$ARGUMENTS

Require 2-3 options with pros/cons, a recommendation, Mermaid diagrams, API/data-model changes, failure modes, security, observability and rollout. Then, using the `architecture-decision-records` skill, draft an ADR for the recommended option in the repo's ADR folder (create `docs/adr/` if none exists). Show the user the summary and the ADR path; mark the ADR `Proposed` until the user accepts it.
