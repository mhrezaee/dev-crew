# Architecture styles and patterns catalogue

Each entry covers: **What** · **Use when** · **Avoid when** · **Quality attributes** (＋ strengths / － costs) · **Related / evolves into**.
Driver codes (D1–D11) refer to the scoring table in `SKILL.md`. Styles combine: a system usually has one **deployment topology**, one or more **code organisation** styles, and several **interaction** styles.

---

## A. Deployment topology

### Monolithic Architecture
- **What**: one deployable unit containing all features, usually one database.
- **Use when**: early product (D10 high), small team (D2 = 1), simple domain, low ops maturity (D5 ≤ 2).
- **Avoid when**: many teams block each other on releases; parts need very different scaling.
- **Quality**: ＋ simplicity, performance (in-process calls), easy transactions and debugging. － weak boundaries decay into a "big ball of mud"; scaling is all-or-nothing.
- **Related**: becomes a Modular Monolith once boundaries are enforced.

### Modular Monolith (default for most systems)
- **What**: one deployable, split into modules aligned with bounded contexts. Each module has a public API, private internals and its own schema; boundaries are enforced by architecture tests.
- **Use when**: D2 ≤ 3, D5 ≤ 3, boundaries still being discovered, strong consistency needed (D6 high).
- **Avoid when**: teams truly need independent deployment daily (D3 = 5) *and* have platform maturity.
- **Quality**: ＋ most modularity benefits with none of the distributed-system costs; cheap to move boundaries; easy path to extract services. － one scaling unit; needs discipline and fitness functions.
- **Related**: Microservices (extract modules when drivers demand), Hexagonal or Clean inside modules, Spring Modulith, .NET modular monolith templates.

### Microservices Architecture
- **What**: independently deployable services organised around business capabilities, each owning its data and owned by one team.
- **Use when**: D2 ≥ 4 **and** D3 ≥ 4 **and** D5 ≥ 4, stable bounded contexts, or parts with radically different scale or availability needs (D4 = 5).
- **Avoid when**: one team, unclear domain, shared database, strong cross-service consistency, no tracing or on-call.
- **Quality**: ＋ team autonomy, independent deploy and scale, fault isolation, tech freedom. － network failures, eventual consistency, sagas, versioning, observability cost, harder local dev and e2e tests.
- **Related**: API Gateway, Saga, Outbox, Service Mesh / Sidecar, Strangler Fig (migration), Conway's Law.

### Service-Oriented Architecture (SOA)
- **What**: coarse-grained enterprise services exposing business functions through standard contracts, often integrated through an Enterprise Service Bus (ESB) that handles routing, transformation and orchestration.
- **Use when**: enterprise integration of many heterogeneous systems (ERP, CRM, mainframe, partners), shared enterprise services, or existing ESB investment and governance.
- **Avoid when**: greenfield product development by autonomous teams; a "smart pipes" ESB becomes a central bottleneck and coupling point.
- **Quality**: ＋ reuse across the enterprise, interoperability, central governance. － the ESB as a single point of change and failure; slow delivery; heavyweight contracts (SOAP/WSDL).
- **Related**: Microservices (smart endpoints, dumb pipes: the reaction to the ESB), Broker, API Gateway, Enterprise Integration Patterns.

### Serverless Architecture
- **What**: functions (FaaS) plus managed services (queues, storage, databases, auth) that scale to zero and are billed per use.
- **Use when**: spiky or event-triggered workloads (D11 = 5), glue and automation, scheduled jobs, low-ops teams, cost-sensitive idle workloads.
- **Avoid when**: long-running or latency-critical work, steady high load (cost), heavy local state, or strict vendor-neutrality requirements.
- **Quality**: ＋ no servers, elastic, pay-per-use, fast to ship small features. － cold starts, execution limits, lock-in, distributed debugging, local testing.
- **Related**: Event-Driven Architecture, Pub/Sub, Backends for Frontends, Queue-based load levelling.

### Client-Server Model
- **What**: clients request services from centralised servers (web, mobile, desktop clients ↔ API or database server).
- **Use when**: the default for almost every networked application: central data, authority, security and updates.
- **Avoid when**: there's no reliable central authority or connectivity (consider P2P or offline-first sync).
- **Quality**: ＋ central control, security and consistency. － the server is a bottleneck and single point of failure unless scaled out.
- **Related**: Layered / N-Tier, BFF, offline-first sync (local-first with conflict resolution: CRDTs).

### Peer-to-Peer (P2P)
- **What**: nodes act as both clients and servers and communicate directly without a central server.
- **Use when**: file distribution (BitTorrent), real-time media (WebRTC), local-network collaboration, blockchains, resilience against central failure or censorship, or edge or offline sync.
- **Avoid when**: you need central authority, moderation, consistent business rules, or simple security and compliance.
- **Quality**: ＋ no central bottleneck, scales with participants, resilient. － NAT traversal, trust and security, discovery, consistency (CRDTs or consensus), hard debugging.
- **Related**: Gossip protocols, CRDTs, hybrid P2P (central signalling + P2P media).

### Primary-Replica (Master-Slave)
- **What**: one primary node accepts writes and replicas copy its state and serve reads, or a primary coordinates workers. The modern terms are primary/replica and leader/follower.
- **Use when**: scaling reads (database read replicas), high availability with failover, or distributing work from a coordinator (job scheduler → workers).
- **Avoid when**: writes are the bottleneck (shard instead), or replica lag is unacceptable for the reads in question.
- **Quality**: ＋ simple read scaling, failover. － replication lag means stale reads (read-your-writes issues); failover complexity; split brain without proper leader election.
- **Related**: Leader Election, Sharding, CQRS (read models), CAP/PACELC.

### Space-Based Architecture
- **What**: processing units with in-memory data grids replicated across nodes. The database is updated asynchronously, removing it as the bottleneck.
- **Use when**: extreme and unpredictable concurrent load (ticketing flash sales, auctions, trading) where the database can't keep up.
- **Avoid when**: you need large datasets with strict consistency, or the team lacks experience with data grids; it's expensive and complex.
- **Quality**: ＋ near-linear elastic scalability, low latency. － data consistency and collisions, cost, testing complexity.
- **Related**: Cache-Aside, CQRS, Event Sourcing, Cell-based architecture.

## B. Code organisation (inside a deployable)

### Layered (N-Tier) Architecture
- **What**: horizontal layers (presentation → application/business → data access → database), each depending only on the one below. "Tiers" are physical, "layers" are logical.
- **Use when**: CRUD-heavy apps with simple rules (D1 ≤ 2), teams new to architecture, small scope.
- **Avoid when**: rich business rules (logic leaks into services, giving an anemic model), or when features change independently (every change touches every layer).
- **Quality**: ＋ familiar, quick to start, separation of concerns. － database-centric design, the sinkhole anti-pattern (pass-through layers), change amplification.
- **Related**: Clean, Hexagonal or Onion (invert the database dependency), Vertical Slice.

### Hexagonal (Ports and Adapters) Architecture
- **What**: the application core defines **ports** (interfaces); **driving adapters** (HTTP, CLI, tests, consumers) call in and **driven adapters** (database, broker, external APIs) implement outbound ports.
- **Use when**: the core must run against several environments (test fakes, multiple databases or brokers, backtest vs live, multiple UIs), or integrations are volatile; long-lived systems with D1 ≥ 3.
- **Avoid when**: thin CRUD; ports with one adapter forever add ceremony.
- **Quality**: ＋ testability, technology independence, explicit boundaries. － more interfaces and mapping.
- **Related**: Clean and Onion (the same dependency rule), Adapter (GoF), DDD.

### Onion Architecture
- **What**: concentric rings (domain model → domain services → application services → infrastructure and UI on the outside). Dependencies point inward.
- **Use when**: a domain-centric system with a rich model (often with DDD) where you want the domain model physically central.
- **Avoid when**: the domain is thin.
- **Quality**: like Hexagonal; it emphasises the layering *inside* the core.
- **Related**: Hexagonal, Clean, DDD.

### Clean Architecture
- **What**: Entities → Use Cases (interactors) → Interface Adapters → Frameworks and Drivers, with the dependency rule pointing inward and use cases as first-class units.
- **Use when**: complex business rules, many use cases, long lifetime, high testability needs, or framework independence matters.
- **Avoid when**: small apps or prototypes; 1:1 mappers and pass-through use cases mean you should use Vertical Slice.
- **Quality**: ＋ maintainability, testability, explicit use cases. － ceremony, boilerplate, learning curve.
- **Related**: Hexagonal, Onion, CQRS (use cases split into commands and queries).

### Vertical Slice Architecture *(beyond)*
- **What**: organise by feature or use case; each slice holds its endpoint, request, handler, validation and data access.
- **Use when**: many independent use cases, CRUD-plus apps, teams that want low ceremony; it pairs naturally with CQRS-lite.
- **Avoid when**: rich cross-cutting invariants (extract a domain model, possibly with DDD).
- **Quality**: ＋ high cohesion per feature, changes are local. － duplication across slices if shared rules aren't extracted.
- **Related**: CQRS, Clean (can coexist: slices outside, a domain core inside).

### Microkernel (Plugin) Architecture
- **What**: a minimal core system plus independently developed plug-in modules that extend it through a defined plug-in contract and registry.
- **Use when**: products that third parties or customers extend (IDEs, browsers, CMS, ETL tools, rules engines, tax or country-specific rules, white-label variants); features that must be added without touching the core.
- **Avoid when**: there are no real extension points; plug-in contracts are costly to version.
- **Quality**: ＋ extensibility, isolation of variants, customer-specific customisation. － contract versioning, plug-in isolation and security, discovery and dependency management.
- **Related**: Strategy + Registry (the code-level version), Interpreter (rule plug-ins), Open/Closed Principle.

## C. Interaction and data-flow styles

### Event-Driven Architecture (EDA)
- **What**: components communicate by producing and reacting to events, via event notification, event-carried state transfer or event sourcing; coordinated by choreography or orchestration.
- **Use when**: many reactions to business events (D7 ≥ 4), decoupled extensibility, audit streams, async scalability, integration between bounded contexts.
- **Avoid when**: simple request/response flows; the team is new to async debugging; strong immediate consistency is required.
- **Quality**: ＋ loose coupling, scalability, extensibility. － eventual consistency, ordering, idempotency, flows that are hard to trace, schema evolution.
- **Related**: Pub/Sub, Outbox, Saga, CQRS, Event Sourcing, Broker.

### Publish-Subscribe (Pub/Sub)
- **What**: publishers send messages to topics without knowing the subscribers; a broker delivers to every subscriber.
- **Use when**: one-to-many fan-out (notifications, cache invalidation, analytics, integration events); adding consumers without changing producers.
- **Avoid when**: you need a reply (request/response) or exactly one consumer per message (use a queue with competing consumers).
- **Quality**: ＋ decoupling, extensibility. － delivery guarantees (at-least-once means idempotent consumers), ordering, the cost of operating the broker.
- **Related**: Observer (in-process), EDA, Broker, Competing Consumers.

### CQRS (Command Query Responsibility Segregation)
- **What**: separate the write model (commands, invariants) from read models (queries, denormalised views).
- **Use when**: read and write shapes or scale differ a lot (D8 ≥ 4), complex domain writes with simple fast reads, many different views of the same data.
- **Avoid when**: simple CRUD with similar read and write shapes.
- **Levels**: (1) separate handlers, same model → (2) separate read views, same database → (3) separate read store updated by events (eventually consistent).
- **Quality**: ＋ optimised reads and writes, clear intent. － more code; eventual consistency at level 3.
- **Related**: Event Sourcing, Materialised View, Vertical Slice, Command (GoF).

### Event Sourcing
- **What**: persist state as an append-only sequence of domain events; current state is a fold over them; projections build read models.
- **Use when**: history *is* the requirement (D9 = 5): finance, ledgers, regulated decision audit, temporal queries ("state as of last March"), complex domains needing replay.
- **Avoid when**: you only need an audit log (use an append-only audit table), CRUD domains, or teams without experience. Never as a system-wide default.
- **Quality**: ＋ complete audit, temporal queries, natural event publication. － event versioning and upcasting, projection rebuilds, GDPR erasure (crypto-shredding), learning curve.
- **Related**: CQRS, Memento, Outbox, Snapshotting.

### Pipes and Filters
- **What**: a chain of independent processing steps (filters) connected by pipes; each transforms its input and passes it on.
- **Use when**: data processing and ETL, media and image pipelines, compilers, log processing, ML feature pipelines, CI pipelines, request middleware.
- **Avoid when**: steps need lots of shared state or interactive back-and-forth.
- **Quality**: ＋ reusability, composability, parallelism, easy testing of each filter. － data format coupling between filters; error handling across the chain; per-step overhead.
- **Related**: Chain of Responsibility (GoF), Unix pipes, stream processing (Kafka Streams, Flink), Lambda/Kappa.

### Broker Pattern
- **What**: a broker component mediates communication between distributed clients and servers or producers and consumers: location transparency, routing, often protocol translation.
- **Use when**: decoupling distributed components (message brokers such as RabbitMQ, Kafka, Azure Service Bus or SQS; object request brokers; API brokers).
- **Avoid when**: two components with a stable direct interface and no need for decoupling or buffering.
- **Quality**: ＋ location transparency, decoupling, buffering, load levelling. － broker availability and operations, added latency, debugging across hops.
- **Related**: Pub/Sub, EDA, SOA (ESB), API Gateway, Proxy.

## D. Beyond

### Cell-Based Architecture
- **What**: the system is replicated into isolated **cells** (full stacks serving a subset of tenants or regions) behind a thin routing layer.
- **Use when**: very large SaaS needing blast-radius reduction, tenant isolation, regional data residency, or predictable scaling units.
- **Avoid when**: a single deployment can serve all tenants; operations and cost multiply.
- **Related**: Deployment Stamps, Bulkhead, Sharding, multi-tenancy models.

### Actor Model
- **What**: concurrency through isolated actors with private state that communicate only by asynchronous messages (Akka, Orleans, Erlang/Elixir OTP, Dapr actors).
- **Use when**: massive numbers of stateful entities (IoT devices, game sessions, chat rooms, digital twins), high concurrency without locks, or supervision and self-healing.
- **Avoid when**: CRUD over a relational database; the team is unfamiliar with message-driven concurrency.
- **Related**: Reactive systems, EDA, Space-Based.

### Micro-frontends
- **What**: the frontend is split into independently built and deployed pieces owned by different teams, composed at build time, on the server or at runtime (Module Federation).
- **Use when**: four or more frontend teams need independent releases in one product UI.
- **Avoid when**: one or two frontend teams; you pay in bundle size, consistency and complexity.
- **Related**: BFF, Microservices (vertical team slices), design systems.

### Blackboard
- **What**: independent specialist components (knowledge sources) read and write to a shared data space and incrementally build a solution under a controller.
- **Use when**: problems without a deterministic algorithm that combine multiple heuristics (speech or image recognition, sensor fusion, planning, multi-agent AI systems).
- **Avoid when**: there's a known deterministic algorithm.
- **Related**: Pub/Sub, multi-agent orchestration.

### Lambda and Kappa Architectures (data)
- **What**: *Lambda* runs a batch layer (accurate, slow) plus a speed layer (approximate, real-time) merged at serving time. *Kappa* uses a single streaming pipeline and reprocesses by replaying the log.
- **Use when**: analytics needing both real-time and historical views. Prefer Kappa when the stream platform can replay (Kafka + Flink); Lambda when batch and stream tools must differ.
- **Avoid when**: there's no real-time need. A plain batch warehouse or lakehouse is simpler.
- **Related**: Pipes and Filters, Event Sourcing, CQRS read models.

### Data Mesh
- **What**: decentralised data ownership. Domain teams publish **data products** with SLAs on a self-serve platform under federated governance.
- **Use when**: large organisations where a central data team is the bottleneck and domains are mature.
- **Avoid when**: small organisations; it needs platform investment and data-literate domain teams.
- **Related**: DDD bounded contexts, Microservices, Conway's Law.

### Multi-tenancy models
- **What**: how tenants share infrastructure. **Silo** (dedicated stack or database per tenant), **Pool** (shared everything, with tenant ID on every row), or **Bridge** (mixed, e.g. shared app with a database per tenant).
- **Use when**: building SaaS. Choose by isolation and compliance needs, noisy-neighbour risk, cost per tenant and customisation needs.
- **Guidance**: start with Pool plus strict tenant scoping (row-level security, tenant-aware repositories) and offer Silo for enterprise or regulated tenants; Cell-based at very large scale.
- **Related**: Cell-based, Federated Identity, Throttling (per-tenant quotas), Bulkhead.

---

## Common evolution paths
- Monolith → Modular Monolith (introduce modules, boundaries and fitness functions) → extract services only where drivers demand (Strangler Fig).
- Layered → Vertical Slice (feature cohesion) → DDD core with Hexagonal for complex parts.
- Synchronous integration → Outbox + events where coupling or availability hurts.
- Database bottleneck → read replicas (Primary-Replica) → CQRS read models → sharding or Space-Based only with evidence.
- SOA/ESB → API-led integration + event streaming, with smart endpoints and dumb pipes.
