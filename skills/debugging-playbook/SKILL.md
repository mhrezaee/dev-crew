---
name: debugging-playbook
description: "Systematic debugging: reproduce, bisect, hypothesise, verify, fix root cause. Use for bugs, exceptions and failing tests."
---

# Debugging playbook

## 1. Reproduce
- Get exact error text, stack trace, input, environment, version/commit and timestamp.
- Turn it into a single command or test that fails reliably. **No reproduction, no fix** - unless you have strong evidence from logs/traces.

## 2. Isolate
- **Stack traces**: find the first frame in project code; read inner exceptions/`Caused by` to the bottom.
- **Regression?** `git bisect start; git bisect bad; git bisect good <tag>; git bisect run <test-cmd>`.
- **What changed?** `git log --since="3 days ago" --stat`, dependency lock file diffs, config/env changes, infra changes, data changes.
- **Binary search** the code path with logs/breakpoints; shrink the input (delta debugging).
- **Compare** working vs failing: environment variables, versions, data, user permissions, feature flags, locale/time zone.

## 3. Hypothesise & test
Write hypotheses down, most likely first. For each, define an experiment whose result would **disprove** it. Run it. Keep a log of what was ruled out.

## 4. Fix the root cause
Ask "why?" until you reach the defect, not the symptom. Write a failing test first, then the minimal fix. Avoid catch-all exception handlers and "retry until it works".

## 5. Prevent
Regression test, grep for the same pattern elsewhere, add validation/assertion/log that would have made this obvious, and consider a lint rule.

## Specialised situations
| Situation | Technique |
|---|---|
| Intermittent / flaky | run 100x in loop, randomise order, check shared state, time, concurrency, external calls |
| Works locally, fails in CI/prod | diff env vars, versions, OS, file paths/case sensitivity, time zone, permissions, network, data volume |
| Deadlock / hang | thread dump (`jstack`, `dotnet-dump`, `py-spy dump`, `kill -QUIT` Go), look for lock ordering and sync-over-async |
| Memory leak | heap snapshots over time; compare retained objects; check event handlers, static caches, closures |
| Performance regression | profile before/after; see `performance-optimization` skill |
| Data corruption | find the first bad record; audit logs; check concurrent writers and missing transactions |
| Third-party API issue | capture raw request/response; reproduce with curl; check their status page and changelog |

## Report template
Symptom -> Root cause (file:line) -> Fix -> Test added -> Related risks.
