---
description: DDD modelling session - event storming, subdomains, bounded contexts, context map, aggregates and ubiquitous language
argument-hint: <business domain or process to model, e.g. "flight booking and cancellation">
---

Delegate to the `solution-architect` subagent, using the `domain-driven-design` skill, to model:

$ARGUMENTS

Run a text-based event storming session with the user:
1. Propose the domain events on a timeline from the description and existing code (grep for existing entities, events, statuses). Ask the user to correct and add missing events; mark hot spots as questions.
2. Add commands, actors, policies, external systems and read models.
3. Classify subdomains (core / supporting / generic) and recommend investment level for each.
4. Propose bounded contexts and a context map (Mermaid) with relationship patterns (ACL, customer/supplier, open host...).
5. For the **core** subdomain only: design aggregates with their invariants, commands and emitted events, following the aggregate design rules.
6. Build the ubiquitous-language glossary.

Show the result and, after the user confirms, save to `docs/domain/model.md` and `docs/domain/glossary.md`. If code already exists, list where the code's names or boundaries diverge from the model and suggest refactorings.
