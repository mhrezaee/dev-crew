# Principles, laws and theorems

Use these to **justify** decisions in reviews, designs and ADRs. Name the principle, explain the concrete consequence here, and accept that principles conflict (DRY vs decoupling, SOLID vs KISS). The judgement is the job.

---

## Design principles

### SOLID
| Principle | Meaning | Violation smell | Pragmatic reading |
|---|---|---|---|
| **S**ingle Responsibility | One reason to change (one actor or stakeholder) | A class changed by unrelated requests; "and" in its description | Split by reason to change, not into one-method classes |
| **O**pen/Closed | Extend behaviour without modifying existing code | A growing `switch` edited for every new case | Apply at real variation points (Strategy, plug-ins), not everywhere |
| **L**iskov Substitution | Subtypes must honour the base contract | `if (x is Special)` checks; overrides that throw `NotSupported` | Prefer composition; keep inheritance shallow |
| **I**nterface Segregation | Clients depend only on what they use | Fat interfaces with stub implementations | Small role interfaces at boundaries |
| **D**ependency Inversion | Policy depends on abstractions, details implement them | Domain code importing a DB driver or HTTP client | Invert at I/O boundaries (ports); don't wrap every class |

### DRY (Don't Repeat Yourself)
Every piece of **knowledge** (a business rule, schema or config value) has one authoritative place. Duplicate *code* that represents different knowledge is fine. Watch out for premature abstraction: coupling two things that only look alike is worse than duplication. Apply the **Rule of Three**: duplicate once, abstract on the third occurrence.

### KISS (Keep It Simple, Stupid)
Choose the simplest design that meets today's requirements and quality attributes. Complexity must be earned by a concrete force. In reviews, ask "what is the simplest thing that could possibly work, and why isn't it enough?"

### YAGNI (You Aren't Gonna Need It)
Don't build for speculative requirements: no interfaces with one implementation "for later", no configuration nobody asked for, no generic frameworks for one use case. It doesn't apply to things that are expensive to retrofit (security, observability hooks, data model keys, API versioning), so record those as deliberate decisions.

### Law of Demeter (principle of least knowledge)
A method talks only to its own fields, its parameters, objects it creates and direct collaborators, not to collaborators of collaborators (`order.getCustomer().getAddress().getCity()`). Violations create coupling to internal structure. Fix with Tell-Don't-Ask (`order.shippingCity()`). Fluent builders and data-transfer chains are acceptable exceptions.

### Separation of Concerns *(beyond)*
Different concerns (presentation, business rules, persistence, cross-cutting) live in different modules. This is the root of layered, hexagonal and clean architecture.

### High Cohesion, Low Coupling *(beyond)*
Things that change together live together; modules interact through narrow, stable interfaces. This is the best single heuristic for module boundaries.

### Composition over Inheritance *(beyond)*
Build behaviour by combining objects or functions rather than through class hierarchies. Inheritance only for true "is-a" relationships with substitutability.

### Tell, Don't Ask *(beyond)*
Tell objects what to do rather than pulling their data out and deciding for them. This keeps behaviour with the data and avoids anemic models.

### Principle of Least Astonishment *(beyond)*
APIs, names and UIs should behave as users expect. Surprise is a bug.

### Principle of Least Privilege *(beyond)*
Every component, user and token gets the minimum permissions it needs. This applies to IAM, database users, CI tokens and agent tools.

### Fail Fast *(beyond)*
Detect invalid state as early as possible (validate at boundaries, assert invariants) and fail loudly, instead of propagating corrupted data.

### Idempotency *(beyond)*
Repeating an operation has the same effect as doing it once. This is essential for retries, at-least-once messaging and safe re-runs.

### Single Source of Truth *(beyond)*
Each data element is mastered in exactly one place; everything else is a derived copy with a known freshness.

### Boy Scout Rule and Chesterton's Fence *(beyond)*
Leave code a little cleaner than you found it, but before removing a "useless" fence (code or config), find out why it was put there.

### GRASP *(beyond)*
Responsibility-assignment heuristics: Information Expert (give the responsibility to the class with the data), Creator, Controller, Low Coupling, High Cohesion, Polymorphism, Pure Fabrication, Indirection, Protected Variations.

## Distributed-systems theorems

### CAP Theorem
During a **network Partition**, a distributed data store must choose between **Consistency** (every read sees the latest write) and **Availability** (every request gets a non-error response). In practice partitions happen, so you choose CP (e.g. leader-based stores that refuse writes without a quorum: etcd, ZooKeeper, Spanner-style) or AP (e.g. Dynamo-style stores, Cassandra with low consistency levels: always answer, reconcile later).
**Apply it**: decide per use case. Balances and seat inventory usually need CP behaviour; feeds, carts and analytics can be AP.

### PACELC Theorem
Extends CAP: if there is a **P**artition, choose **A** or **C**; **E**lse (normal operation), choose **L**atency or **C**onsistency. Even without failures, synchronous replication (consistency) costs latency.
**Apply it**: e.g. DynamoDB/Cassandra are PA/EL (fast, eventually consistent by default); Spanner-style databases are PC/EC; a primary + async replicas setup is PC/EL for primary reads and stale for replica reads.

### Fallacies of Distributed Computing
Eight false assumptions (Deutsch / Gosling):
1. The network is reliable
2. Latency is zero
3. Bandwidth is infinite
4. The network is secure
5. Topology doesn't change
6. There is one administrator
7. Transport cost is zero
8. The network is homogeneous

**Apply it**: every remote call needs a timeout, retry policy, idempotency, security, versioning and observability. Each extra service boundary pays all eight taxes, which is a key argument for the modular monolith.

### FLP impossibility and consensus *(beyond)*
In an asynchronous network with even one faulty process, no deterministic consensus algorithm can guarantee termination. Real systems use timeouts and randomisation (Raft, Paxos). Use proven implementations (etcd, ZooKeeper, database leases) rather than building your own.

## Laws of software organisations and evolution

### Conway's Law
"Organisations design systems that mirror their own communication structure." Service and module boundaries end up following team boundaries.
**Apply it**: align bounded contexts with teams. The **Inverse Conway Manoeuvre** shapes teams around the architecture you want. A single team rarely benefits from microservices.

### Brooks's Law *(beyond)*
"Adding people to a late software project makes it later", because of ramp-up and communication overhead (n(n−1)/2 paths).

### Gall's Law *(beyond)*
"A complex system that works is invariably found to have evolved from a simple system that worked." Start simple and evolve. This is the argument against big-design-up-front microservices.

### Hyrum's Law *(beyond)*
"With enough users of an API, all observable behaviours will be depended on by somebody." Every observable change is potentially breaking, so version deliberately and avoid leaking accidental behaviour (ordering, timing, error texts).

### Postel's Law (Robustness Principle) *(beyond)*
"Be conservative in what you send, liberal in what you accept." Useful for tolerant readers of APIs and events, but over-liberal acceptance creates security holes and Hyrum's-Law lock-in. Validate strictly at trust boundaries.

### Lehman's Laws of Software Evolution *(beyond)*
A system in use must continually change or become less useful, and its complexity increases unless work is done to reduce it. Budget for refactoring.

### Amdahl's Law *(beyond)*
The speed-up from parallelising is limited by the serial fraction of the work. Profile before scaling out.

### Little's Law *(beyond)*
L = λ × W (items in system = arrival rate × time in system). Use it for capacity planning of queues, thread pools and connection pools, and WIP limits in delivery.

### Goodhart's Law *(beyond)*
"When a measure becomes a target, it ceases to be a good measure." Coverage percentages, story points and DORA metrics are signals, not goals.

### Hofstadter's Law *(beyond)*
"It always takes longer than you expect, even when you take into account Hofstadter's Law." Estimate with ranges and buffers; slice work small.

### Kernighan's Law *(beyond)*
"Debugging is twice as hard as writing the code in the first place", so clever code is a liability.

### Second-System Effect *(beyond)*
The successor to a successful simple system tends to be over-engineered. Watch for it in rewrites.
