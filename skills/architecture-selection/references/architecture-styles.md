# Architecture styles catalogue

Each entry: what it is, structure, strengths, costs, signals it's the wrong choice.

---

## Layered (N-tier)
**Structure**: Presentation -> Application/Business -> Data access -> DB. Each layer calls only the one below.
**Strengths**: universally understood, fast to start, great for CRUD.
**Costs**: business logic leaks into services as "anemic" scripts; changes cut across all layers; DB-centric design.
**Wrong when**: business rules grow, many use cases change independently.

## Vertical slice
**Structure**: one folder per feature/use case containing endpoint, request, handler, validation, data access.
```
Features/
  Bookings/
    CreateBooking/  (Endpoint, Command, Handler, Validator)
    CancelBooking/
    GetBooking/
```
**Strengths**: high cohesion, change one feature in one place, low ceremony, easy onboarding.
**Costs**: duplication across slices if shared domain logic isn't extracted; needs discipline to push real rules into a domain model when they grow.
**Wrong when**: many invariants span use cases -> extract a domain model (combine with DDD).

## Clean / Hexagonal (Ports & Adapters) / Onion
All three share the **dependency rule**: dependencies point inward to the domain; infrastructure depends on abstractions defined by the core.
```
Domain          entities, value objects, domain services, domain events  (no framework deps)
Application     use cases, ports (interfaces), DTOs, orchestration
Infrastructure  adapters: DB, messaging, HTTP clients, files (implements ports)
Presentation    controllers/endpoints, UI (driving adapters)
```
- **Hexagonal** emphasises driving (inbound) and driven (outbound) ports.
- **Onion** emphasises concentric rings around the domain model.
- **Clean** adds explicit use-case interactors and boundaries.
**Strengths**: testable core, framework/DB independence, long-term maintainability.
**Costs**: more projects/files, mapping between layers, overkill for CRUD.
**Wrong when**: little business logic - every layer just passes data through.

## Domain-Driven Design (DDD)
Not an architecture by itself - a design approach. **Strategic**: subdomains, bounded contexts, ubiquitous language, context mapping. **Tactical**: aggregates, entities, value objects, domain events, repositories, domain services. See the `domain-driven-design` skill.
**Use tactical DDD only in the core domain.**

## CQRS
Separate the write model (commands, rich domain, consistency) from read models (queries, denormalised, optimised for screens).
Levels: (1) separate command/query handlers, same DB and model -> (2) separate read models/views in same DB -> (3) separate read store updated by events.
**Costs**: more code; eventual consistency at level 3.
**Wrong when**: simple CRUD with similar read/write shapes.

## Event sourcing
Store state as an append-only sequence of events; current state = fold of events; projections build read models.
**Strengths**: full audit/history, temporal queries, natural fit with event-driven integration.
**Costs**: event versioning/upcasting, projections rebuilds, GDPR erasure complexity, steep learning curve.
**Wrong when**: no hard requirement for history reconstruction.

## Modular monolith
One deployable, internally split into modules aligned with bounded contexts. Each module: own folder/project, public API (contracts), private internals, own schema. Communication via in-process interfaces or in-process events (with outbox if reliability needed).
**Strengths**: most of microservices' modularity benefits without distributed-systems costs; easy refactoring of boundaries; a stepping stone to services.
**Costs**: requires enforced boundaries (fitness functions) or it decays into a big ball of mud; single scaling unit.

## Microservices
Independently deployable services, each owning its data, organised around business capabilities, owned by one team.
**Strengths**: independent deploy/scale, team autonomy, fault isolation, technology freedom.
**Costs**: network failures, distributed transactions (sagas), eventual consistency, observability, versioning, platform cost, harder local dev and e2e testing.
**Wrong when**: one team, unclear boundaries, low ops maturity, shared DB, chatty synchronous calls. See `microservices-patterns`.

## Event-driven architecture
Components communicate by publishing/subscribing to events via a broker (Kafka, RabbitMQ, Azure Service Bus, SNS/SQS, EventBridge).
Styles: event notification, event-carried state transfer, event sourcing; choreography vs orchestration.
**Strengths**: decoupling, extensibility, async scalability.
**Costs**: harder to follow flows, debugging, ordering, idempotency, schema evolution.

## Serverless
Functions/managed services triggered by events/HTTP; pay-per-use.
**Strengths**: no servers, scale to zero, fast for glue and spiky workloads.
**Costs**: cold starts, execution limits, vendor lock-in, local testing, distributed debugging, cost at constant high load.

## Space-based / cell-based (advanced)
In-memory data grids or isolated cells per tenant/region for extreme scale or blast-radius reduction. Only with proven need and strong platform capability.

## Micro-frontends
Independently deployed frontend pieces composed at build time, server, or runtime (module federation).
**Wrong when**: fewer than ~4 frontend teams; it mainly adds bundle size and consistency issues.

---

## Common evolution paths
- Layered monolith -> modular monolith (introduce modules + boundaries + fitness functions) -> extract services where drivers demand.
- Anemic services -> vertical slices -> DDD core for complex parts.
- Synchronous integration -> outbox + events where coupling hurts.
