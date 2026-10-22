---
name: architecture-selection
description: "Score 11 project drivers and choose topology, code architecture, DDD, CQRS, patterns and testing approach; output a blueprint. Use for 'which architecture should we use'."
---

# Architecture selection

> There is no best architecture, only the best fit for this project's drivers right now, plus a clear path to evolve.
> Default to the **simplest architecture that satisfies the drivers**. Complexity must be earned.

## Step 1 - Gather evidence
**Existing codebase**: identify the current style before proposing anything (folder structure, project references/imports, DI wiring, where business rules live, how data is accessed, deployables in CI/Docker/k8s, message brokers, number of databases). Use `codebase-onboarding` if needed.
**New project**: read the requirements/vision; ask the user only for drivers you cannot infer.

## Step 2 - Score the drivers (1 = low, 3 = medium, 5 = high)
| # | Driver | 1 | 3 | 5 |
|---|---|---|---|---|
| D1 | **Domain complexity** | CRUD, forms over data | moderate rules, some workflows | rich rules, invariants, many states, experts needed to explain it |
| D2 | **Team scale** | 1 team (<= 8 devs) | 2-4 teams | 5+ autonomous teams |
| D3 | **Independent deployability need** | one release cadence is fine | some parts change much faster | teams must ship independently daily |
| D4 | **Scale heterogeneity** | uniform load | a few hot spots | parts with radically different scale/availability needs |
| D5 | **Operational maturity** | manual deploys, little monitoring | CI/CD, basic monitoring | platform team, k8s/cloud-native, tracing, on-call |
| D6 | **Consistency needs** | eventual is fine everywhere | mixed | strong consistency across most operations |
| D7 | **Integration / event intensity** | few integrations | several external systems | event streams, many producers/consumers, async workflows |
| D8 | **Read/write asymmetry** | similar | reads dominate somewhat | very different read models/scale, complex queries, reporting |
| D9 | **Audit / temporal needs** | none | audit log | must reconstruct any past state (finance, compliance) |
| D10 | **Lifecycle & uncertainty** | stable, well-understood | evolving | MVP/prototype, high uncertainty, speed to market |
| D11 | **Workload shape** | steady | daily peaks | spiky/bursty or event-triggered, idle most of the time |

Also record hard constraints: existing stack and team skills, cloud/on-prem, compliance (GDPR, PCI, HIPAA), latency/offline needs, budget, deadline.

## Step 3 - Apply the decision rules

### 3a. System topology (how many deployables)
| Choose | When | Avoid when |
|---|---|---|
| **Modular monolith** (DEFAULT) | D2 <= 3, or D5 <= 3, or D10 = 5, or boundaries still unclear | D2 = 5 with D3 = 5 and real pain from coordination |
| **Classic layered monolith** | small app, D1 <= 2, D2 = 1, short lifetime | expected to grow significantly |
| **Microservices** | D2 >= 4 **and** D3 >= 4 **and** D5 >= 4, boundaries proven (stable bounded contexts), or D4 = 5 for specific parts | small team, low ops maturity, unclear domain, strong cross-service consistency (D6 = 5) |
| **Extract a few services from a modular monolith** | one or two modules have distinct scale (D4), security or release needs | as a reflex "because microservices" |
| **Serverless / FaaS** | D11 = 5, event-triggered glue, small independent functions, cost-sensitive idle workloads | long-running, latency-critical, chatty or stateful workloads; heavy vendor lock-in concerns |
| **Event-driven architecture** (as integration style) | D7 >= 4, need for decoupled reactions, audit streams | simple request/response domains; team new to async debugging |

Rule of thumb: **monolith first, modular always**. Microservices are an organisational scaling tool, not a code-quality tool. "If you can't build a well-structured monolith, microservices won't help."

### 3b. Code architecture (inside each deployable/module)
| Choose | When |
|---|---|
| **Layered (N-tier)** | D1 = 1-2, CRUD, small scope |
| **Vertical slice** (feature folders, request/handler per use case) | D1 = 2-3, many independent use cases, team values low ceremony; combines well with CQRS-lite |
| **Clean / Hexagonal (ports & adapters) / Onion** | D1 >= 3, long-lived system, need to swap/isolate infrastructure, high testability required |
| **DDD tactical patterns** (aggregates, value objects, domain events) | D1 >= 4 - **only in the core domain**; supporting/generic subdomains stay simple |
| **DDD strategic design** (bounded contexts, context map) | D1 >= 3 or D2 >= 2 - almost always valuable, even in a monolith (modules = bounded contexts) |
| **CQRS** (separate read/write models) | D8 >= 4, or complex domain writes + simple fast reads; start with same DB, separate models |
| **Event sourcing** | D9 = 5 and team experienced - rarely; never as a default |

Different modules may use different code architectures: core domain = Hexagonal + DDD; admin CRUD module = layered/vertical slice. **Mixing by subdomain is a feature, not inconsistency** - document it.

### 3c. Data architecture
- Modular monolith: one database, **schema per module**, no cross-module joins or foreign keys; modules talk via public interfaces or in-process events.
- Microservices: database per service; consistency via sagas + transactional outbox; read models via events.
- Choose storage by access pattern: relational by default; document store for aggregate-shaped data; key-value for cache/session; search engine for full-text; time-series/columnar for analytics.

### 3d. Frontend architecture
- Web SPA/SSR: feature-based folders (feature-sliced design), server state via a query library, minimal global state.
- Mobile: MVVM / BLoC / MVI per platform conventions; repository layer for data.
- Micro-frontends: only when D2 >= 4 frontend teams need independent deployment.
- BFF (backend-for-frontend) when clients need very different API shapes.

### 3e. Engineering approach
| Practice | When |
|---|---|
| **BDD** (Gherkin, three amigos, living documentation) | business stakeholders actively involved, D1 >= 3, regulated/rule-heavy domains, acceptance criteria are disputed |
| **TDD** | domain logic, algorithms, bug fixes - default for D1 >= 3 core code |
| **Contract testing** (Pact, schema) | multiple deployables or external consumers |
| **Architecture fitness functions** | always - enforce the chosen boundaries in CI |
| **Event storming** | D1 >= 3, before defining bounded contexts |

### 3f. Design patterns
Select patterns from the `design-patterns` skill **only when a concrete force in the code calls for them** (variation, lifecycle, integration, cross-cutting concern). List for each: the problem it solves here and where it applies. Also list patterns deliberately NOT used.

## Step 4 - Sanity checks (red flags)
- Microservices with one team, shared database, or synchronous call chains > 3 deep -> distributed monolith. Reject.
- DDD aggregates in a CRUD app -> ceremony without benefit. Reject.
- Clean architecture with 1:1 pass-through layers and mappers everywhere for a 10-endpoint app -> over-engineered. Simplify to vertical slice.
- Event sourcing chosen for "flexibility" -> reject unless D9 = 5.
- Choice contradicts team skills with no learning plan -> add plan or simplify.
- Existing system: proposing a big-bang rewrite -> replace with incremental evolution (strangler fig, branch by abstraction, modularise first).

## Step 5 - Produce the Architecture Blueprint
Save to `docs/architecture/blueprint.md` (create the folder if missing) using `references/blueprint-template.md`, and write one ADR per major decision (`architecture-decision-records` skill). The blueprint becomes the reference every later design and review is checked against.

## Step 6 - Enforce with fitness functions
| Stack | Tool |
|---|---|
| .NET | NetArchTest.Rules / ArchUnitNET, project-reference rules |
| Java/Kotlin | ArchUnit, Konsist (Kotlin), Spring Modulith (module boundaries) |
| TypeScript/JS | dependency-cruiser, eslint-plugin-boundaries, Nx module boundaries |
| Python | import-linter |
| Go | depguard / go-arch-lint, internal packages |
| Dart/Flutter | dart_code_metrics / custom lint rules on imports |

Example rules: domain must not depend on infrastructure; modules only access each other's `api`/`contracts` package; no cyclic module dependencies; controllers must not use repositories directly.

See `references/architecture-styles.md` for a deeper catalogue of each style with structure examples.
