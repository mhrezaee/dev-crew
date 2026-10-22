---
name: domain-driven-design
description: "DDD strategic (bounded contexts, context maps, event storming) and tactical (aggregates, value objects, events). Use when modelling complex domains."
---

# Domain-Driven Design

## Strategic design (do this first - valuable even in a monolith)

### 1. Discover the domain - Event Storming (lightweight, text-based)
1. **Domain events** (past tense, orange): `BookingRequested`, `PaymentAuthorised`, `SeatAssigned`, `BookingCancelled`.
2. Order them on a timeline; mark **hot spots** (questions, conflicts) - these are open questions for the business.
3. Add **commands** (blue) that cause events and **actors** who issue them; **policies** ("whenever X then Y") linking events to commands; **external systems**; **read models** needed to decide.
4. Group by consistency needs -> candidate **aggregates**.
5. Find language boundaries -> candidate **bounded contexts**.

### 2. Classify subdomains
| Type | Meaning | Investment |
|---|---|---|
| **Core** | competitive advantage, complex, changes often | best people, rich domain model, TDD/BDD, DDD tactical patterns |
| **Supporting** | needed, specific to the business, not differentiating | simpler architecture (vertical slice / layered) |
| **Generic** | solved problem (auth, billing, email) | buy/use SaaS or library |

### 3. Bounded contexts
- A boundary within which a model and its **ubiquitous language** are consistent. The same word may mean different things in different contexts (`Customer` in Sales vs Support) - that's fine and expected.
- Align contexts with team ownership where possible.
- In a modular monolith: context = module. In microservices: context = one or a few services (never a service spanning contexts).

### 4. Context map - relationships between contexts
| Pattern | When |
|---|---|
| Partnership | two teams succeed or fail together, coordinate closely |
| Shared Kernel | small shared model owned jointly - keep tiny |
| Customer/Supplier | upstream serves downstream's needs |
| Conformist | downstream adopts upstream model as-is |
| **Anti-Corruption Layer (ACL)** | protect your model from a legacy/external model by translating |
| Open Host Service + Published Language | upstream offers a stable public API/schema for many consumers |
| Separate Ways | no integration; duplicate if cheaper |

### 5. Ubiquitous language
Maintain a glossary (`docs/domain/glossary.md`). Code names = business names. If the business says "rebook", don't call it `UpdateReservation`.

## Tactical design (core domain only)

### Building blocks
| Block | Definition | Rules |
|---|---|---|
| **Entity** | identity that persists through change | equality by ID; behaviour-rich methods, not public setters |
| **Value object** | defined by its attributes, immutable | equality by value; validates itself on creation (`Money`, `EmailAddress`, `DateRange`, `FlightNumber`) |
| **Aggregate** | cluster of entities/VOs with one **root**, a consistency boundary | external code references the root only; invariants enforced inside; one transaction = one aggregate |
| **Domain event** | something meaningful that happened | past tense, immutable, raised by aggregates, dispatched after commit |
| **Repository** | collection-like access to aggregates | one per aggregate root; interface in domain, implementation in infrastructure |
| **Domain service** | domain logic that doesn't belong to one entity | stateless, named in the ubiquitous language |
| **Factory** | complex creation logic | ensures valid aggregates from birth |
| **Specification** | reusable business rule/predicate | composable (`and`, `or`, `not`) |

### Aggregate design rules (Vaughn Vernon)
1. Model **true invariants** in consistency boundaries - only data that must be consistent immediately belongs together.
2. Design **small aggregates** (prefer root + value objects).
3. Reference other aggregates **by ID only**.
4. Use **eventual consistency** (domain events) between aggregates.
5. Modify **one aggregate per transaction**.

### Example (C#-style; translate to the project language)
```csharp
public sealed class Booking : AggregateRoot<BookingId>
{
    private readonly List<Passenger> _passengers = new();
    public BookingStatus Status { get; private set; }
    public Money TotalPrice { get; private set; }

    public void Cancel(DateTimeOffset now, CancellationPolicy policy)
    {
        if (Status == BookingStatus.Cancelled)
            throw new DomainException("Booking is already cancelled.");

        var refund = policy.CalculateRefund(TotalPrice, now);
        Status = BookingStatus.Cancelled;
        Raise(new BookingCancelled(Id, refund, now));
    }
}
```
No public setters, invariants checked inside, intent-revealing method, event raised.

### Layering with DDD
Domain (no framework deps) <- Application (use cases, transactions, dispatching events) <- Infrastructure (EF/JPA mappings, repositories, message bus). Usually combined with Hexagonal/Clean (see `clean-architecture`).

## Anti-patterns
- **Anemic domain model**: entities with only getters/setters, logic in "services". Acceptable in supporting subdomains, not in the core.
- Giant aggregates loaded for every operation (performance + contention).
- Generic repository `IRepository<T>` exposing `IQueryable` everywhere - leaks persistence.
- One "Customer" model shared across all contexts.
- Applying tactical DDD to CRUD subdomains.

## Output when modelling
Event list -> subdomain classification -> bounded contexts + context map (Mermaid) -> aggregates with invariants, commands and events -> glossary -> folder/module structure.
