---
name: architect
description: "Choose the best architecture for this project (DDD, modular monolith, microservices, clean/hexagonal, CQRS, event-driven, patterns, TDD/BDD) and write the Architecture Blueprint + ADRs"
argument-hint: "[project vision, constraints, or 'scaffold' to also create the structure]"
disable-model-invocation: true
---

Delegate to the `solution-architect` subagent in **Mode A (architecture decision)**.

Input from the user: $ARGUMENTS

Instructions for the architect:
1. If this repository already contains code, start with evidence from the code (current style, modules, deployables, data stores, tests). If it is empty or the user describes a new product, work from the description.
2. Ask the user at most 5 focused questions for drivers that cannot be inferred (team size and number of teams, expected load/scale, operational maturity, compliance, deadline/MVP). Accept "proceed with assumptions".
3. Score the 11 drivers, apply the decision rules and red-flag checks from the `architecture-selection` skill, and decide: system topology, bounded contexts/modules, code architecture per module, data, integration, frontend, testing approach (TDD/BDD/contract), and key design patterns - each with rejected alternatives.
4. Show the user a **one-screen summary** first (recommendation, rationale, what we are NOT doing, revisit triggers) and ask for confirmation or adjustments.
5. After confirmation, write `docs/architecture/blueprint.md` and one ADR per major decision in `docs/adr/`.
6. Propose architecture fitness tests for the stack. If `$ARGUMENTS` contains "scaffold" (or the user agrees), create the folder/project structure with one example vertical slice and the architecture tests, then build and run them.

Finish with the list of files written and suggest next steps: `/domain-model` for the core domain, `/plan` for the first feature.
