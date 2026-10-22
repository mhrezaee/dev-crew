---
name: refactor
description: "Safely refactor code without changing behaviour, step by step under test"
argument-hint: <file/module and goal, e.g. "src/billing make tax rules pluggable">
disable-model-invocation: true
---

Delegate to the `refactoring-specialist` subagent with the `refactoring-patterns` and `clean-code` skills to refactor:

$ARGUMENTS

Required: run the tests first; add characterisation tests if coverage of the target is weak; apply named refactorings in small steps with build + tests after each; never change behaviour; stop when the stated goal is reached.

Report the list of refactorings applied, before/after complexity where meaningful, test results, and remaining debt. Suggest a commit message `refactor(<scope>): ...`.
