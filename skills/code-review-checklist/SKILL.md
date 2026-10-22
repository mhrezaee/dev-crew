---
name: code-review-checklist
description: A comprehensive, prioritised code review checklist and comment etiquette for reviewing diffs and pull requests. Use when reviewing code, self-reviewing before a commit/PR, or when the user asks "review this", "check my changes", or "is this PR ready".
---

# Code review checklist

Review in priority order. Stop and report BLOCKERs early.

## 1. Intent
- [ ] Does the change do what the ticket/PR description says - nothing more, nothing less?
- [ ] Is the PR small enough to review well (< ~400 lines)? If not, suggest a split.

## 2. Correctness
- [ ] Edge cases: null/empty, boundaries, large inputs, unicode, time zones
- [ ] Error handling: errors are surfaced or handled deliberately, not swallowed
- [ ] Concurrency: shared state, race conditions, async awaited, locks/transactions correct
- [ ] Resources disposed/closed; no leaks
- [ ] Idempotency for retries / message handlers
- [ ] Backwards compatibility of APIs, events, DB schema, config

## 3. Security
- [ ] Input validated; output encoded
- [ ] Authorisation checked at object level
- [ ] No secrets, no PII in logs
- [ ] Parameterised queries; no shell/eval with user input

## 4. Tests
- [ ] New behaviour covered, including failure paths
- [ ] Bug fixes include a regression test
- [ ] Tests are deterministic and readable

## 5. Design & maintainability
- [ ] Follows existing architecture and conventions
- [ ] Right level of abstraction; no premature generalisation; no duplication
- [ ] Clear names; functions do one thing; low nesting
- [ ] Comments explain *why*; no commented-out code; no stray debug output
- [ ] Public API changes documented

## 6. Performance
- [ ] No N+1 queries, unbounded queries, or loading whole tables
- [ ] No blocking calls on async paths; timeouts on external calls
- [ ] Reasonable memory use in hot paths

## 7. Operability
- [ ] Logs/metrics for new behaviour; useful error messages
- [ ] Config via settings, not hard-coded; feature flag if risky
- [ ] Migration and rollout order safe

## Comment etiquette
- Prefix with severity: `[blocker]`, `[major]`, `[minor]`, `[nit]`, `[question]`, `[praise]`.
- Explain *why* and propose a concrete alternative.
- Comment on the code, not the person. Ask questions when unsure ("What happens if `items` is empty here?").
- Acknowledge good work specifically.
