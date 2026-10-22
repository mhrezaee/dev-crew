---
name: microservices-patterns
description: Patterns for distributed and event-driven systems - service decomposition, API gateway/BFF, sync vs async communication, sagas (orchestration/choreography), transactional outbox/inbox, CQRS read models, event sourcing, idempotent consumers, service discovery, resilience, versioning and data ownership. Use when designing or reviewing microservices, extracting a service from a monolith, or building event-driven integrations.
---

# Microservices & event-driven patterns

> First confirm microservices are justified (see `architecture-selection`). Most of these patterns also apply to a modular monolith that publishes events.

## Decomposition
- Decompose by **business capability / bounded context**, never by technical layer (no "database service", "validation service").
- A service owns its data; no other service reads its tables.
- Right size = one team can own it, it can be deployed alone, and most changes touch one service.
- Extracting from a monolith: **Strangler Fig** - route one capability at a time to the new service behind a facade/gateway; use an **Anti-Corruption Layer** against the legacy model.

## Communication
| Style | Use for | Watch out |
|---|---|---|
| Sync REST/gRPC | queries needing immediate answer, user-facing commands | temporal coupling, cascading failures, call chains |
| Async messaging (commands) | work that can be queued, load levelling | idempotency, DLQ |
| Async events (pub/sub) | notifying others something happened, decoupling | ordering, schema evolution, eventual consistency |

Rules: avoid sync chains deeper than 2; prefer events to propagate state; every sync call has timeout + retry with backoff + circuit breaker (`error-handling` skill).

## Edge
- **API Gateway**: routing, auth, rate limiting, TLS - no business logic.
- **BFF**: one backend per client type when needs differ (mobile vs web).

## Data consistency
- **Saga** for business transactions across services:
  - *Orchestration*: a coordinator tells participants what to do - clearer for complex flows, easier to monitor.
  - *Choreography*: participants react to events - good for simple flows with few steps.
  - Each step has a **compensating action** (e.g. `ReleaseSeat` for `ReserveSeat`).
- **Transactional outbox**: write business change + outgoing message in the same DB transaction; a relay publishes the outbox. Prevents "DB updated but event lost" (dual-write problem).
- **Inbox / idempotent consumer**: store processed message IDs; ignore duplicates. Delivery is at-least-once - always.
- **CQRS read models / materialised views**: build query-optimised views from other services' events instead of cross-service joins.
- **Event sourcing**: only when history is a requirement (see `architecture-selection`).

## Events
- Name in past tense with business meaning: `OrderPlaced`, not `OrderTableUpdated`.
- Choose: notification (ID only, consumers call back) vs event-carried state transfer (payload contains needed data).
- Include: `eventId`, `eventType`, `occurredAt`, `aggregateId`, `version`, `correlationId`, `causationId`.
- Schema evolution: additive changes only; version the event type for breaking changes; use a schema registry (Avro/Protobuf/JSON Schema) at scale.
- Ordering: partition by aggregate ID when order matters.

## Operability
- Distributed tracing with propagated context through HTTP and messages (`observability` skill).
- Health checks, readiness, graceful shutdown (finish in-flight messages).
- Correlation IDs in every log line.
- Consumer-driven contract tests (Pact) between services; avoid shared e2e environments as the main safety net.
- Independent CI/CD pipeline per service; backwards-compatible API and event changes (expand/contract).

## Anti-patterns
| Anti-pattern | Symptom | Fix |
|---|---|---|
| Distributed monolith | services must deploy together | redraw boundaries, async events, contract tests |
| Shared database | services join each other's tables | data ownership, events, read models |
| Chatty services | many sync calls per request | merge services or replicate data via events |
| Entity services | `CustomerService`, `OrderService` CRUD wrappers | capability-oriented services |
| Two-phase commit across services | XA transactions | sagas + outbox |
| Mega shared library | all services depend on a "common" lib with domain logic | share only technical utilities; duplicate small models |
| No idempotency | duplicate charges/emails on retry | idempotency keys + inbox |
