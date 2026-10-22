---
description: Write missing tests for a file, module, or the current changes
argument-hint: "[file/module path]  (default: files changed vs main)"
---

Target: $ARGUMENTS
If empty, target the source files changed relative to the default branch (`git diff --name-only $(git merge-base HEAD origin/main 2>/dev/null || echo HEAD~1)`), excluding test files.

Delegate to the `test-engineer` subagent with the `writing-tests` skill:
1. Discover the test stack and how to run a single test.
2. List the untested behaviours (happy, boundaries, errors, authorisation, concurrency).
3. Write the tests following the project's conventions.
4. Run them and make sure they pass - and would fail if the behaviour broke.

Report: behaviours covered, tests added, command to run them, remaining gaps.
