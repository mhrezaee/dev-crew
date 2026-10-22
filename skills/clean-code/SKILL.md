---
name: clean-code
description: Practical clean-code and design principles - naming, function design, SOLID applied pragmatically, coupling/cohesion, immutability, and when NOT to abstract. Use when writing new code, reviewing readability, or deciding on class/module structure.
---

# Clean code (pragmatic edition)

## Naming
- Names reveal intent and domain: `cancellationDeadline`, not `date2`; `isEligibleForRefund()`, not `check()`.
- Booleans read as questions: `isActive`, `hasPermission`, `canRetry`.
- Functions are verbs, classes are nouns. Avoid `Manager`, `Helper`, `Util`, `Data`, `Info` - they hide missing concepts.
- Use the ubiquitous language of the business, consistently.

## Functions
- Do one thing at one level of abstraction. If you need "and" to describe it, split it.
- Prefer <= 3 parameters; group related ones into an object.
- Return early (guard clauses) instead of deep nesting.
- No hidden side effects; separate commands (change state) from queries (return data).
- No boolean flag parameters that switch behaviour - write two functions.

## Design
- **High cohesion, low coupling**: things that change together live together.
- **SOLID, pragmatically**:
  - S: one reason to change per module.
  - O: extend via composition/strategies when variation is real, not hypothetical.
  - L: subtypes must honour the base contract.
  - I: small, client-specific interfaces.
  - D: depend on abstractions at architectural boundaries (I/O), not everywhere.
- Prefer composition over inheritance.
- Prefer immutability and pure functions for domain logic.
- Make illegal states unrepresentable (value objects, enums, non-nullable types).

## When NOT to abstract
- Rule of three: duplicate once, abstract on the third occurrence.
- No interface with a single implementation unless it is an I/O boundary or needed for testing.
- No generic framework for one use case. YAGNI.
- Readable duplication beats the wrong abstraction.

## Comments
Code says *what*; comments say *why*. Delete commented-out code. Keep comments true or delete them.

## Consistency beats preference
Follow the existing conventions of the codebase even if you'd do it differently; propose changes separately.
