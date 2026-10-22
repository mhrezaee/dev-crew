---
name: refactoring-patterns
description: "Code smells mapped to safe refactorings, plus legacy techniques (seams, strangler fig). Use when cleaning up code."
---

# Refactoring patterns

## Safety protocol
1. Tests green before starting. If coverage is weak, write **characterisation tests** that capture current behaviour.
2. One small refactoring at a time; build + test after each.
3. Never change behaviour while refactoring. Separate commits: `refactor:` vs `feat:`/`fix:`.

## Smell -> refactoring
| Smell | Refactorings |
|---|---|
| Long function (> ~30 lines) | Extract Function, Decompose Conditional, Split Phase |
| Large class / god object | Extract Class, Move Function, split by responsibility |
| Long parameter list | Introduce Parameter Object, Preserve Whole Object |
| Duplicated code | Extract Function, Pull Up Method, Form Template Method |
| Deep nesting | Guard Clauses (early return), Extract Function |
| Switch/if on type | Replace Conditional with Polymorphism, strategy map |
| Primitive obsession | Replace Primitive with Value Object (`Email`, `Money`, `BookingId`) |
| Feature envy | Move Function to the data it uses |
| Data clumps | Extract Class / record |
| Flag argument | Split into two explicit functions |
| Magic numbers/strings | Replace with named constants / enums |
| Shotgun surgery | Move related code together (cohesion) |
| Divergent change | Split by reason to change |
| Temporal coupling | Encapsulate sequence in one method / builder |
| Comments explaining confusing code | Rename / Extract Function so the comment becomes unnecessary |
| Dead code | Delete it (git remembers) |

## Legacy code techniques (Feathers)
- **Seams**: introduce an interface/parameter at the point where you need to substitute a dependency for testing.
- **Sprout Method/Class**: write new logic in a new, tested unit and call it from the legacy code.
- **Wrap Method/Class**: decorate existing behaviour instead of editing inside it.
- **Strangler Fig**: route traffic gradually from the old module to the new one behind a facade; delete the old when unused.
- **Branch by Abstraction**: introduce an abstraction, implement the new version behind it, switch, remove the old.

## Done when
The change you wanted to make is now easy, tests are green, and complexity/duplication went down - stop there.
