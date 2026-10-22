---
name: requirements-refinement
description: Refine a raw feature request, ticket or idea into a ready-to-build requirement with user stories, Gherkin acceptance criteria, NFRs and a Definition-of-Ready score. Use when the user pastes a ticket, says "refine this", "write user stories", "acceptance criteria", "is this ready", or describes a feature vaguely.
---

# Requirements refinement

## Goal
Produce a requirement that a developer can implement and a tester can verify **without asking anyone a question**.

## Steps
1. **Restate** the request: "As <actor>, I need <capability> so that <outcome>."
2. **Interrogate** with the checklist below. Ask the user the questions you cannot answer from the code; propose defaults for the rest and mark them `ASSUMPTION`.
3. **Split** into INVEST stories (Independent, Negotiable, Valuable, Estimable, Small, Testable). Split by workflow step, business rule, data variation, or happy/unhappy path - never by technical layer.
4. **Write acceptance criteria** in Gherkin. At least one happy path and one failure path per story.
5. **Score** against the Definition of Ready.

## Interrogation checklist
- **Actors & permissions**: who can do it? who must not?
- **Triggers & entry points**: UI, API, scheduled, event?
- **Data**: inputs, validation rules, limits, formats, defaults, source of truth.
- **States**: empty, loading, error, partial, concurrent edits.
- **Business rules**: calculations, rounding, time zones, currencies, localisation.
- **Integrations**: external systems, their failure behaviour, SLAs.
- **NFRs**: performance target, availability, security/privacy (PII? GDPR?), accessibility, audit logging, analytics events.
- **Migration / compatibility**: existing data, old clients, API versions.
- **Out of scope**: what explicitly will NOT be done.
- **Success metric**: how will we know it worked in production?

## Definition of Ready (score 0-100)
| Criterion | Points |
|---|---|
| Clear goal and business value | 15 |
| Actors and permissions defined | 10 |
| Acceptance criteria testable, incl. failure paths | 20 |
| Data and validation rules specified | 15 |
| NFRs stated | 10 |
| Dependencies / integrations identified | 10 |
| Scope boundaries (out of scope) explicit | 10 |
| Small enough for one sprint | 10 |

< 60: not ready, needs a refinement session. 60-79: ready with listed risks. >= 80: ready.

## Gherkin example
```gherkin
Scenario: Customer cancels a booking within the free cancellation window
  Given a confirmed booking created 2 hours ago
  And the free cancellation window is 24 hours
  When the customer cancels the booking
  Then the booking status is "Cancelled"
  And a full refund is issued to the original payment method
  And a cancellation email is sent within 5 minutes
```
