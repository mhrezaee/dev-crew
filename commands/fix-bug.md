---
description: Reproduce, root-cause and fix a bug with a regression test
argument-hint: <bug description, error message, stack trace or ticket>
---

Delegate to the `debugger` subagent, following the `debugging-playbook` skill, to fix:

$ARGUMENTS

Required sequence: reproduce -> isolate -> root cause (with file:line) -> failing regression test -> minimal fix -> full relevant test suite green -> search for the same defect pattern elsewhere.

Then delegate the resulting diff to `code-reviewer`. Fix any BLOCKER/MAJOR findings.

Report to the user: symptom, root cause, fix, regression test, other places at risk. Suggest a Conventional Commit message (`fix(<scope>): ...`). Do not commit.
