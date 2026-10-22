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
| **Service-Oriented Architecture (SOA) / ESB** | enterprise integration of many heterogeneous systems (ERP, CRM, mainframe, partners) with existing ESB governance | greenfield product teams that need autonomy (prefer API-led integration + events) |
| **Space-based architecture** | extreme, spiky concurrency where the DB is the proven bottleneck (flash sales, auctions) | anything without load-test evidence; cost and complexity are high |
| **Cell-based / deployment stamps** | large SaaS needing blast-radius isolation, tenant isolation or data residency | a single deployment can serve everyone |
| **Peer-to-peer** | no central authority wanted (file distribution, WebRTC media, local-first collaboration) | business rules, moderation or compliance need a central authority (use client-server) |

Interaction styles combine with any topology: **client-server** (default for networked apps), **pub/sub** and a **broker** (one-to-many, decoupling), **pipes and filters** (data or processing pipelines), **primary-replica** (read scaling and failover). Choose them per integration, not system-wide.

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
| **Microkernel (plug-in)** | the product must be extended without touching the core: customer- or country-specific rules, third-party extensions, white-label variants |
| **Pipes and filters** | the module is mainly a processing pipeline (ETL, document or media processing, rule pipelines, ML features) |

Different modules may use different code architectures: core domain = Hexagonal + DDD; admin CRUD module = layered/vertical slice. **Mixing by subdomain is a feature, not inconsistency** - document it.

### 3c. Data architecture
- Modular monolith: one database, **schema per module**, no cross-module joins or foreign keys; modules talk via public interfaces or in-process events.
- Microservices: database per service; consistency via sagas + transactional outbox; read models via events.
- Choose storage by access pattern: relational by default; document store for aggregate-shaped data; key-value for cache/session; search engine for full-text; time-series/columnar for analytics.

### 3d. Frontend architecture
- Follow the framework's native pattern first: MVC (server-rendered), MVVM (binding frameworks), MVI or unidirectional flow (React, Compose, Flutter BLoC), MVP (only for binding-less toolkits).
- Web SPA/SSR: feature-sliced folders, server state via a query library, minimal global state; choose the rendering strategy (CSR, SSR, SSG/ISR, islands, server components) by SEO and interactivity needs.
- BFF when clients need very different API shapes or tokens must stay server-side.
- Micro-frontends only when D2 >= 4 frontend teams need independent deployment.
- Details: `references/ui-patterns.md`.

### 3d+. Cross-cutting distributed concerns
For every remote call or integration, decide on timeout, retry, circuit breaker and idempotency; for every state change that must produce a message, use an outbox; for cross-service workflows, a saga; for identity, federated identity; for edge concerns, an API gateway or BFF. See `microservices-patterns` and its `references/cloud-patterns.md`.

### 3e. Engineering approach
| Practice | When |
|---|---|
| **BDD** (Gherkin, three amigos, living documentation) | business stakeholders actively involved, D1 >= 3, regulated/rule-heavy domains, acceptance criteria are disputed |
| **TDD** | domain logic, algorithms, bug fixes - default for D1 >= 3 core code |
| **Contract testing** (Pact, schema) | multiple deployables or external consumers |
| **Architecture fitness functions** | always - enforce the chosen boundaries in CI |
| **Event storming** | D1 >= 3, before defining bounded contexts |
| **Twelve-Factor, DevOps, GitOps** | any containerised or cloud service (Twelve-Factor); always as delivery culture (DevOps); declarative platforms or Kubernetes with several environments (GitOps) |
| **Paradigm mix** | OOP for entities with lifecycle; FP (functional core, imperative shell) for rules and calculations; reactive for streams |

Details: `references/paradigms-and-practices.md`.

### 3f. Design patterns
Select patterns from the `design-patterns` skill **only when a concrete force in the code calls for them** (variation, lifecycle, integration, cross-cutting concern). List for each: the problem it solves here and where it applies. Also list patterns deliberately NOT used.

### 3g. Trade-off check (quality attributes, theorems, laws)
Before finalising, test each decision against:
- **Top quality attributes** (ranked in step 2). Name the attribute each decision favours and the one it sacrifices.
- **CAP / PACELC**: for each data store and each cross-service flow, state the choice (consistency vs availability under partition; latency vs consistency otherwise) per use case.
- **Fallacies of distributed computing**: every new network boundary must justify its eight hidden costs.
- **Conway's law**: do module or service boundaries match team boundaries? If not, change one of them deliberately.
- **KISS / YAGNI / Gall's law**: is there a simpler option that meets the drivers today, with a documented trigger to evolve?
Principles and laws reference: `clean-code` → `references/principles-and-laws.md`.

### Decision record format (for every style or pattern you choose)
`Force (evidence) → Candidates considered → Chosen → Quality attributes gained / sacrificed → Rejected because → Revisit when`

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

## Reference catalogues (read the relevant one before deciding)
| File | Covers |
|---|---|
| `references/architecture-styles.md` | 28 styles: monolith, modular monolith, microservices, SOA, serverless, client-server, P2P, primary-replica, space-based, layered, hexagonal, onion, clean, vertical slice, microkernel, EDA, pub/sub, CQRS, event sourcing, pipes and filters, broker, cell-based, actor model, micro-frontends, blackboard, Lambda/Kappa, data mesh, multi-tenancy |
| `references/ui-patterns.md` | MVC, MVP, MVVM, MVI, BFF, Flux/Redux, BLoC, Elm/TCA, rendering strategies, offline-first |
| `references/paradigms-and-practices.md` | DDD, TDD, BDD, DevOps, GitOps, Twelve-Factor, CD, DevSecOps, SRE, OOP, FP, reactive |
| `references/blueprint-template.md` | Blueprint output format |
| `microservices-patterns` → `references/cloud-patterns.md` | Gateway, circuit breaker, bulkhead, sidecar, ambassador, saga, outbox, retry, throttling, cache-aside, federated identity, strangler fig and 20 more |
| `design-patterns` → `references/gof-catalog.md` | All 23 GoF patterns |
| `clean-code` → `references/principles-and-laws.md` | SOLID, DRY, KISS, YAGNI, Demeter, CAP, PACELC, Conway, fallacies and more |
