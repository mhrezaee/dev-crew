# Methodologies, paradigms and engineering practices

Each entry covers: **What** · **Choose when** · **Watch out** · **Where in dev-crew**.
Paradigms are mixed in practice. Modern codebases are typically *OOP at the boundaries, functional in the core, reactive where streams are natural*.

---

## Design methodologies

### Domain-Driven Design (DDD)
- **What**: model software around the business domain. *Strategic*: subdomains, bounded contexts, ubiquitous language, context maps. *Tactical*: aggregates, entities, value objects, domain events.
- **Choose when**: strategic design whenever D1 ≥ 3 or more than one team; tactical patterns only in the **core** subdomain.
- **Watch out**: tactical ceremony in CRUD areas; one shared model across contexts.
- **Where**: `domain-driven-design` skill, `/domain-model`.

### Test-Driven Development (TDD)
- **What**: red → green → refactor, one behaviour at a time; tests drive the design.
- **Choose when**: domain logic, algorithms, calculations, parsers, bug fixes (a failing test first), anything with clear inputs and outputs.
- **Watch out**: testing implementation details; over-mocking; skipping the refactor step.
- **Where**: `tdd-workflow`, `writing-tests`.

### Behavior-Driven Development (BDD)
- **What**: discovery (three amigos, example mapping) → formulation (Gherkin) → automation (executable specifications).
- **Choose when**: business stakeholders define rules, rules are complex or disputed, regulated domains, living documentation is valuable.
- **Watch out**: imperative UI-level Gherkin; Gherkin that nobody outside engineering reads (then it's overhead).
- **Where**: `bdd` skill, `/bdd-spec`.

### Event Storming *(beyond)*
A collaborative workshop that discovers domain events, commands, policies and aggregates on a timeline. It is the fastest way to find bounded contexts. See `/domain-model`.

### Contract-first / API-first *(beyond)*
Design the OpenAPI, AsyncAPI or Protobuf contract before implementing it; generate clients and servers; run consumer-driven contract tests (Pact). Choose it when several teams or external consumers depend on the interface. See the `api-design` skill.

## Delivery and operations

### DevOps
- **What**: culture and practices uniting development and operations ("you build it, you run it"): automation, CI/CD, monitoring, shared ownership, fast feedback. Measured with the DORA metrics (deployment frequency, lead time, change failure rate, time to restore).
- **Choose when**: always, as a direction. Tooling follows culture, not the other way round.
- **Watch out**: a separate "DevOps team" that becomes a new silo.
- **Where**: `devops-engineer`, `ci-cd-pipelines`, `observability`, `incident-response`.

### GitOps
- **What**: Git is the single source of truth for the desired infrastructure and application state; an agent in the cluster (Argo CD, Flux) **pulls** and reconciles continuously; changes happen only through pull requests.
- **Choose when**: Kubernetes (or other declarative platforms), several environments or clusters, audit and compliance needs, drift detection.
- **Watch out**: secrets (use Sealed Secrets, SOPS or External Secrets); keep app repos and environment-config repos separate; image promotion workflow.
- **Where**: `devops-engineer`, `ci-cd-pipelines`.

### Twelve-Factor App
- **What**: 12 principles for cloud-native services:
  1. One codebase
  2. Explicit dependencies
  3. Config in the environment
  4. Backing services as attached resources
  5. Strict build/release/run separation
  6. Stateless processes
  7. Port binding
  8. Concurrency through processes
  9. Disposability (fast start, graceful shutdown)
  10. Dev/prod parity
  11. Logs as event streams
  12. Admin processes as one-off tasks
- **Choose when**: any service deployed to containers, PaaS or Kubernetes.
- **Watch out**: config in the environment needs a secrets manager for sensitive values; "stateless" means state lives in backing services.
- **Where**: `docker-best-practices`, `devops-engineer`, `observability`.

### Continuous Delivery and trunk-based development *(beyond)*
Small batches merged to trunk at least daily, behind feature flags, always releasable, automated pipeline to production. Choose it to reduce risk and lead time; long-lived branches are the anti-pattern.

### DevSecOps / shift-left security *(beyond)*
Security checks in the pipeline (SAST, dependency audit, secret scanning, container scanning, IaC scanning, SBOM) and threat modelling at design time. See `security-auditor` and `secure-coding`.

### Site Reliability Engineering (SRE) *(beyond)*
SLIs, SLOs and error budgets decide the balance between reliability and feature velocity; blameless postmortems; toil reduction. See `observability` and `incident-response`.

### Infrastructure as Code and Platform Engineering *(beyond)*
Everything declared in code (Terraform, Bicep, Pulumi, CDK); internal developer platforms with golden paths reduce cognitive load for product teams.

## Programming paradigms

### Object-Oriented Programming (OOP)
- **What**: objects bundle state and behaviour; encapsulation, polymorphism, composition (prefer it over inheritance).
- **Choose when**: modelling entities with identity and lifecycle (DDD aggregates), frameworks and plug-in boundaries, stateful UI components, languages built for it (Java, C#, Kotlin).
- **Watch out**: deep inheritance hierarchies, anemic models (getters and setters only), shared mutable state, "everything is a class".

### Functional Programming (FP)
- **What**: pure functions, immutable data, functions as values, composition, explicit effects; algebraic data types and pattern matching.
- **Choose when**: calculations and transformations (pricing, risk, validation, data pipelines), concurrency (immutability removes data races), reproducible research code, parsers and compilers, reducers in UI state.
- **Watch out**: over-abstracting with category-theory vocabulary the team doesn't share; performance of naive immutable copies; I/O still has to happen somewhere (an "imperative shell").
- **Pattern**: **functional core, imperative shell**: pure logic inside, side effects at the edges. This fits hexagonal architecture perfectly.

### Reactive Programming
- **What**: programming with asynchronous data streams and change propagation (RxJS, Reactor, Kotlin Flow, Akka Streams, signals), with backpressure.
- **Choose when**: event streams (UI events, websockets, sensor data, market data), high-concurrency I/O-bound services, combining many async sources.
- **Watch out**: hard debugging and stack traces; it's overkill for simple request/response; mixing blocking calls into reactive pipelines.
- **Related**: *Reactive Systems* (the Reactive Manifesto: responsive, resilient, elastic, message-driven) is the architectural counterpart, e.g. the Actor Model and EDA.

### Data-oriented and procedural code *(beyond)*
Plain functions over plain data structures (structs, records). This often fits scripts, ETL and performance-critical loops best. Don't force classes or monads where a straightforward procedure is clearer.

## Choosing paradigms: a quick guide
| Area of the code | Default |
|---|---|
| Domain model with lifecycle and invariants | OOP (rich aggregates) with immutable value objects |
| Calculations, rules, transformations | FP (pure functions) |
| I/O, frameworks, adapters | OOP / procedural at the shell |
| Streams, UI events, real-time feeds | Reactive |
| UI state | Unidirectional and functional (reducers, MVI) |
