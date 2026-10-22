---
name: architecture-decision-records
description: Write or update Architecture Decision Records (ADRs) capturing context, options, decision and consequences. Use when choosing a framework, library, database, pattern, API style, or any decision that is expensive to reverse, or when the user says "ADR", "document this decision", or "why did we choose".
---

# Architecture Decision Records

## Where
Look for an existing ADR folder (`docs/adr`, `docs/decisions`, `adr/`, `architecture/decisions`). If none exists, create `docs/adr/`. File name: `NNNN-kebab-case-title.md`, numbered sequentially after the highest existing number.

## When to write one
- New dependency, framework, datastore, cloud service or communication style
- Change to a public API contract or cross-team interface
- Security, compliance or data-retention decision
- Deliberately deviating from an existing convention
- Anything someone will ask "why on earth did we do this?" about in a year

## Template
```markdown
# NNNN. <Decision title in active voice, e.g. "Use PostgreSQL for the booking service">

- Status: Proposed | Accepted | Deprecated | Superseded by [NNNN](NNNN-....md)
- Date: YYYY-MM-DD
- Deciders: <names / roles>
- Tags: <area>

## Context
What problem are we solving? What forces are at play (requirements, constraints, team skills, deadlines, costs)? Facts, not opinions.

## Options considered
### Option A - <name>
- Pros: ...
- Cons: ...
### Option B - <name>
...

## Decision
We will <decision>, because <primary reasons tied to the forces above>.

## Consequences
- Positive: ...
- Negative / trade-offs accepted: ...
- Follow-up actions: ...

## References
Links to tickets, spikes, benchmarks, docs.
```

## Rules
- ADRs are immutable once accepted: to change a decision, write a new ADR that supersedes the old one and update the old one's status only.
- Keep it to one page. Link to longer design docs instead of embedding them.
- Record the options you rejected - that's the most valuable part for future readers.
