# Cloud, distributed and resilience patterns

Each entry covers: **Problem** · **Solution** · **Use when** · **Watch out** · **Related**.
These apply to any networked system (a modular monolith calling a payment provider needs Retry, Timeout and Circuit Breaker too), not only to microservices.

---

## Edge and routing

### API Gateway
- **Problem**: clients would otherwise call many services directly and each service re-implements authentication, TLS, rate limiting and routing.
- **Solution**: a single entry point for routing, authentication offload, TLS termination, rate limiting, request shaping and observability.
- **Use when**: there are multiple backend services or versions, or public or partner APIs.
- **Watch out**: no business logic in the gateway; it must be highly available; don't let it become an ESB.
- **Related**: BFF, Gateway Routing / Aggregation / Offloading (below), Throttling, Federated Identity.

### Gateway Routing, Aggregation and Offloading *(beyond)*
- **Routing**: one endpoint routes to many services or versions (path or header based, canary splits).
- **Aggregation**: one client call fans out to several services and the gateway combines the results, reducing chattiness for mobile clients.
- **Offloading**: move shared concerns (TLS, authentication, compression, caching) from services to the gateway.

### Federated Identity
- **Problem**: every application managing its own users and passwords means poor security and poor user experience.
- **Solution**: delegate authentication to an external identity provider (OIDC/OAuth 2.1, SAML) such as Entra ID, Okta, Auth0, Keycloak or Cognito; applications trust signed tokens.
- **Use when**: always, for anything beyond a toy: single sign-on, enterprise customers bringing their own IdP, B2B or B2C.
- **Watch out**: validate issuer, audience, expiry and signature algorithm; short-lived access tokens + refresh; least-privilege scopes; keep tokens out of browser storage (use the BFF pattern for SPAs); map external identities to internal tenants and roles.
- **Related**: API Gateway (token validation), Valet Key, Gatekeeper.

### Ambassador
- **Problem**: legacy or polyglot apps need client-side connectivity features (retries, TLS, monitoring, routing) without changing their code.
- **Solution**: an out-of-process helper proxy next to the client that handles outbound connectivity on its behalf.
- **Use when**: you can't modify the client, there's a shared connectivity concern across languages, or for legacy modernisation.
- **Watch out**: added latency per hop; another component to operate. A Sidecar is often the deployment vehicle.
- **Related**: Sidecar, Proxy (GoF), Service Mesh.

### Sidecar
- **Problem**: cross-cutting infrastructure (logging agents, proxies, configuration reload, secret fetching) reimplemented in every service and language.
- **Solution**: deploy a helper container or process alongside each service instance, sharing its lifecycle and network namespace.
- **Use when**: Kubernetes environments, polyglot services, service mesh (Envoy/Linkerd proxies), Dapr.
- **Watch out**: resource overhead per pod; startup ordering; debugging across two processes; not worth it for a single small service.
- **Related**: Ambassador, Service Mesh, Adapter (a sidecar normalising monitoring output).

### Service Mesh *(beyond)*
- **What**: sidecar proxies plus a control plane providing mTLS, retries, timeouts, traffic shifting and telemetry uniformly (Istio, Linkerd, Consul).
- **Use when**: many services with strict zero-trust networking and traffic-management needs.
- **Avoid when**: there are only a handful of services; the operational cost is high.

## Resilience

### Retry
- **Problem**: transient faults (network blips, throttling, deadlocks, 503s) fail requests that would succeed a moment later.
- **Solution**: retry with exponential backoff + jitter, capped attempts and an overall deadline; honour `Retry-After`.
- **Use when**: the operation is idempotent (or protected by an idempotency key) and the error is transient.
- **Watch out**: retry storms (multiply across layers, so retry at one layer only); never retry non-idempotent calls blindly; combine with a Circuit Breaker.
- **Related**: Circuit Breaker, Timeout, Idempotent Consumer, Throttling.

### Circuit Breaker
- **Problem**: calling a failing dependency wastes resources and cascades failure.
- **Solution**: track failures; **open** (fail fast) after a threshold, **half-open** to probe, **close** on recovery; provide a fallback while open.
- **Use when**: any remote dependency that can be down or slow for more than a moment.
- **Watch out**: tune thresholds per dependency; expose the breaker state in metrics; the fallback must be acceptable for the business.
- **Related**: Retry, Bulkhead, Timeout, Fallback.

### Bulkhead
- **Problem**: one slow dependency or noisy tenant exhausts shared threads, connections or memory and takes everything down.
- **Solution**: partition resources (separate pools, queues, instances or cells) per dependency, tenant or workload so failure stays contained.
- **Use when**: there are several dependencies with different reliability, mixed-criticality workloads, or multi-tenant systems.
- **Watch out**: under-utilisation; sizing each partition.
- **Related**: Circuit Breaker, Cell-based architecture, Queue-based Load Levelling, Throttling.

### Timeout and Fallback *(beyond)*
- **Timeout**: every remote call gets a connect and total deadline, and deadlines propagate across hops.
- **Fallback**: a degraded response (cached value, default, partial result, feature turned off) chosen explicitly per use case.

### Throttling / Rate Limiting
- **Problem**: bursts or abusive clients overwhelm the system or exceed cost budgets; tenants starve each other.
- **Solution**: limit requests per client, tenant or endpoint (token bucket, sliding window), returning `429` with `Retry-After`; or degrade non-critical features under load (load shedding).
- **Use when**: public APIs, multi-tenant SaaS, expensive endpoints (search, exports, LLM calls), and protecting downstream dependencies.
- **Watch out**: distributed counters (use Redis or gateway-native limits); fairness; communicate limits in docs and headers.
- **Related**: API Gateway, Bulkhead, Queue-based Load Levelling, Priority Queue.

### Health Endpoint Monitoring *(beyond)*
Liveness, readiness and startup endpoints plus external synthetic checks. Readiness checks critical dependencies; liveness never does, to avoid restart loops.

## Data and consistency

### Saga
- **Problem**: a business transaction spans several services or databases where a distributed ACID transaction (2PC) isn't viable.
- **Solution**: a sequence of local transactions, each publishing an event or command; on failure, run **compensating transactions** in reverse. Coordinated by **orchestration** (a central coordinator) or **choreography** (services react to each other's events).
- **Use when**: cross-service workflows such as order → payment → stock → shipping.
- **Watch out**: no isolation (intermediate states are visible, so use semantic locks or pending states); compensations must be idempotent; monitor stuck sagas.
- **Related**: Outbox, Compensating Transaction, Command, Mediator (orchestrator), Durable workflow engines (Temporal, Camunda).

### Outbox (Transactional Outbox)
- **Problem**: the dual write. The database update commits but publishing the event fails, or the other way round.
- **Solution**: write the business change and the outgoing message to an outbox table **in the same transaction**; a relay (poller or change data capture such as Debezium) publishes from the outbox.
- **Use when**: any time a state change must reliably produce a message.
- **Watch out**: at-least-once delivery means consumers must be idempotent (Inbox); ordering per aggregate; outbox cleanup.
- **Related**: Inbox / Idempotent Consumer, Saga, Event-Driven Architecture.

### Inbox / Idempotent Consumer *(beyond)*
Record processed message IDs (in the same transaction as the handler's effects) and skip duplicates. This is required for at-least-once delivery.

### Cache-Aside
- **Problem**: repeated reads of slow or expensive data.
- **Solution**: the application checks the cache; on a miss it loads from the store, puts the value in the cache with a TTL and returns it. On writes it updates the store and **invalidates** the cache entry.
- **Use when**: read-heavy data that tolerates brief staleness; reference data, product catalogues, configuration, computed views.
- **Watch out**: stale data; cache stampede (use request coalescing, early refresh or locks); key design; invalidation on every write path; don't cache before fixing the slow query.
- **Related**: Read-through / Write-through / Write-behind caches, Materialised View, CDN.

### Materialised View *(beyond)*
Precompute query-shaped views (denormalised tables, search indexes) from the source data or events. Used for read performance and cross-service queries; the views are eventually consistent.

### Sharding *(beyond)*
Partition data horizontally by a shard key (tenant, region, hash). Use it when one database can't handle the write volume or storage. Watch out: cross-shard queries and transactions, rebalancing, hot shards.

### Compensating Transaction *(beyond)*
Undo the effects of completed steps when a later step fails (refund, release, cancel). This is the building block of Sagas.

### Claim Check *(beyond)*
Store a large payload in blob storage and send only a reference through the message broker, keeping messages small and cheap.

### Valet Key *(beyond)*
Give clients a short-lived, scoped token (a pre-signed URL or SAS) to upload or download directly from storage, offloading the application servers.

### Gatekeeper *(beyond)*
A dedicated, hardened host that validates and sanitises requests before they reach trusted services, minimising the attack surface.

## Messaging and workload

### Competing Consumers *(beyond)*
Many consumers read from one queue to scale processing horizontally. Messages must be idempotent and order-independent.

### Queue-based Load Levelling *(beyond)*
Put a queue between producers and a slower service to absorb bursts.

### Priority Queue *(beyond)*
Process urgent messages first, using separate queues or priorities.

### Scheduler Agent Supervisor *(beyond)*
Coordinate distributed steps with a scheduler, agents and a supervisor that retries or compensates failures. Durable workflow engines implement this.

### Leader Election *(beyond)*
Elect one instance to coordinate (scheduled jobs, partition ownership) using leases (Kubernetes leases, etcd, Zookeeper, database locks). This avoids duplicate cron jobs in scaled-out apps.

## Migration and deployment

### Strangler Fig
- **Problem**: rewriting a legacy system big-bang is risky and slow.
- **Solution**: put a facade or proxy in front of the legacy system; route capability by capability to new implementations; retire the legacy when nothing routes to it.
- **Use when**: modernising monoliths or legacy platforms incrementally while still delivering features.
- **Watch out**: data synchronisation between old and new; a facade that lives forever; define completion criteria per slice.
- **Related**: Anti-Corruption Layer, Branch by Abstraction, Feature Flags, Event interception (CDC).

### Anti-Corruption Layer *(beyond)*
A translation layer between your model and a legacy or external model, so their concepts don't leak into your domain.

### Deployment Stamps / Geodes *(beyond)*
Deploy multiple independent copies of the full stack (per region or tenant group) for scale, residency and blast-radius control. Geodes serve any request from any region with replicated data.

### Blue-Green, Canary and Feature Flags *(beyond)*
- **Blue-Green**: switch traffic between two full environments; instant rollback.
- **Canary**: shift a small percentage of traffic first and watch SLOs before increasing.
- **Feature flags**: decouple deploy from release; enable per tenant or percentage; remove stale flags.

### Static Content Hosting *(beyond)*
Serve static assets from object storage + CDN rather than application servers.

---

## Quick selection guide
| Symptom | Patterns |
|---|---|
| Remote calls fail intermittently | Retry + Timeout + Circuit Breaker |
| One slow dependency takes everything down | Bulkhead + Circuit Breaker + Timeout |
| Burst traffic or abusive clients | Throttling, Queue-based Load Levelling |
| DB updated but event lost | Outbox (+ Inbox on the consumer) |
| Business transaction spans services | Saga (+ Compensating Transaction) |
| Reads are slow and repetitive | Cache-Aside, Materialised View, CQRS read model |
| Many clients with different needs | BFF, Gateway Aggregation |
| Cross-cutting infra in many languages | Sidecar, Ambassador, Service Mesh |
| Users and SSO across apps | Federated Identity |
| Legacy replacement | Strangler Fig + Anti-Corruption Layer |
| Large uploads through the API | Valet Key, Claim Check |
| Duplicate scheduled jobs after scaling out | Leader Election |
