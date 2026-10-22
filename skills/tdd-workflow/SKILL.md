---
name: tdd-workflow
description: Implement features or fixes with strict Test-Driven Development (red-green-refactor), one behaviour at a time. Use when the user asks for TDD, "test first", or when implementing well-specified business logic, algorithms, parsers, validators or bug fixes.
---

# TDD workflow

## The loop
1. **List behaviours.** From the acceptance criteria, write a checklist of small behaviours (test list), simplest first.
2. **RED** - write ONE test for the next behaviour. Run it. It must fail **for the right reason** (assertion failure, not a compile error or typo). Show the failure output.
3. **GREEN** - write the minimum production code to pass. Hard-coding is allowed at first; the next test will force generalisation. Run all tests in the module.
4. **REFACTOR** - remove duplication, improve names, extract functions - in both test and production code. Tests stay green.
5. Tick the behaviour off; add any new behaviours you discovered to the list. Repeat.

## Rules
- Never write production code without a failing test that demands it.
- Never write more than one failing test at a time.
- Keep each cycle short (minutes). If GREEN takes long, the step was too big - revert and write a smaller test.
- Test behaviour through the public interface, not private methods.
- Bug fix = first a failing test reproducing the bug, then the fix.

## Test list example (password policy)
- [ ] rejects empty password
- [ ] rejects password shorter than 12 chars
- [ ] accepts 12-char password with letters and digits
- [ ] rejects password without a digit
- [ ] rejects password equal to username (case-insensitive)
- [ ] rejects password in breached list

## Reporting
After each cycle print a compact status line, e.g.:
`RED  rejects password without a digit -> FAILED (expected false, got true)`
`GREEN 5 passed`
`REFACTOR extracted HasDigit(); 5 passed`
