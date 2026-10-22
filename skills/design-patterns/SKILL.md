---
name: design-patterns
description: "Pick GoF/enterprise patterns by concrete problem, with modern alternatives and over-engineering warnings. Use when choosing a pattern."
---

# Design patterns - choose by problem, not by name

## Rules
1. Start from a **concrete force** in the code (duplication, conditional explosion, hard-to-test dependency, varying algorithm). No force -> no pattern.
2. Prefer the language's idiomatic feature first (lambdas/delegates, higher-order functions, sealed types + pattern matching, DI container, middleware) - many GoF patterns are one-liners in modern languages.
3. Name the pattern in the code (class/variable names, short comment) so readers recognise it.
4. Re-evaluate when the force disappears; remove patterns that no longer pay off.

## Problem -> pattern guide
| Problem in the code | Pattern(s) | Modern/simpler alternative |
|---|---|---|
| `switch`/`if` on type or mode selecting an algorithm, growing over time | **Strategy** | dictionary of functions; sealed type + pattern matching |
| Behaviour depends on object state with many transitions | **State** | state machine library; enum + transition table |
| Need to add behaviour (logging, caching, retry, auth) around calls without changing them | **Decorator**, Proxy | middleware/pipeline behaviours, interceptors, AOP |
| Request must pass through a sequence of handlers/checks | **Chain of Responsibility** | middleware pipeline, validators list |
| Complex object construction with many optional parts | **Builder** | named/optional params, records with `with` |
| Which concrete class to create depends on input/config | **Factory Method / Abstract Factory** | DI container + keyed services; factory function |
| Incompatible interface of a third-party/legacy API | **Adapter** | - (essential in hexagonal adapters) |
| Simplify a complex subsystem for callers | **Facade** | - |
| Notify many parties when something happens | **Observer** | events/delegates, reactive streams, domain events + mediator |
| Encapsulate an action to queue, log, undo or retry | **Command** | command objects with handlers (CQRS), message |
| Algorithm skeleton with varying steps | **Template Method** | Strategy/composition (preferred), higher-order functions |
| Tree structures treated uniformly | **Composite** | - |
| Operations over a stable type hierarchy | **Visitor** | pattern matching over sealed types |
| Expensive object shared, one instance needed | **Singleton** via DI lifetime | never a static global with hidden state |
| Many fine-grained objects consume memory | **Flyweight** | interning, caching |
| Decouple many components talking to each other | **Mediator** | in-process message bus (use sparingly; it hides flow) |
| Undo/snapshot | **Memento** | immutable state + history |
| Reusable composable business rules | **Specification** | predicate functions |
| Null checks everywhere | **Null Object** | Option/Maybe, nullable reference types |

## Enterprise / application patterns
| Pattern | Use |
|---|---|
| Repository | collection-like access to aggregates (DDD); avoid generic repositories leaking `IQueryable` |
| Unit of Work | track changes and commit atomically (ORM DbContext/Session already is one) |
| Service Layer / Use Case | application boundary orchestrating domain + infrastructure |
| DTO / Mapper | data crossing process or layer boundaries |
| Options / Configuration object | typed configuration |
| Result / Either | expected failures without exceptions |
| Outbox, Inbox, Saga | reliable distributed workflows (`microservices-patterns`) |
| Circuit Breaker, Retry, Bulkhead, Timeout | resilience (`error-handling`) |
| Anti-Corruption Layer | translate external/legacy models |
| Feature Toggle | decouple deploy from release |
| Strangler Fig, Branch by Abstraction | incremental migration |

## Frontend / UI patterns
MVVM, MVI, BLoC, Redux/Flux (unidirectional data flow), Container/Presentational, Hooks/composables for reuse, Compound Components, Render props (legacy), Repository + DTO mapping on mobile, Observer via streams/signals.

## Over-engineering warnings
- Interface + factory + strategy for a single implementation that has never varied.
- Abstract base classes "for future reuse".
- Mediator used for every in-process call, making navigation impossible.
- Singleton used as a global variable.
- Patterns stacked to look "enterprise" in a 500-line service.

When proposing a pattern, always state: **force -> pattern -> where -> what it costs -> simpler alternative considered**.

See `references/pattern-examples.md` for short before/after examples.
