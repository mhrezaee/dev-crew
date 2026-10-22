# Gang of Four catalogue: all 23 patterns

Each entry covers: **Intent** · **Use when** (the forces that justify it) · **Avoid when** · **Trade-offs** · **Modern / idiomatic form** · **Related**.
Rule: pick a pattern only when a *use-when* force is present in the code **today**.

---

## Creational

### Abstract Factory
- **Intent**: create *families* of related objects without naming concrete classes.
- **Use when**: several products must vary together and stay consistent, e.g. UI widgets per platform theme, or a cloud provider's storage + queue + secret clients per environment.
- **Avoid when**: only one product varies (use Factory Method), or there is only one family.
- **Trade-offs**: adding a new *product type* changes every factory; adding a new *family* is cheap.
- **Modern form**: a DI module or composition root that registers one family per environment (`services.AddAwsAdapters()` vs `AddAzureAdapters()`).
- **Related**: Factory Method (each method of an abstract factory), Singleton (one factory per family), Bridge.

### Builder
- **Intent**: construct a complex object step by step, separating construction from representation.
- **Use when**: many optional parameters, validation across fields, immutable results, readable test data (`aBooking().withStatus(...)`), or the same steps producing different representations (SQL or HTTP request builders).
- **Avoid when**: few fields. Named or optional arguments and record `with` expressions are enough.
- **Trade-offs**: more code; validation must happen in `build()`.
- **Modern form**: fluent builders, Kotlin/C# named args, `record with {}`, Lombok `@Builder`, test data builders.
- **Related**: Composite (builders often build trees), Abstract Factory.

### Factory Method
- **Intent**: let subclasses or callers decide which concrete class to instantiate.
- **Use when**: creation depends on input or config, or a framework needs a hook for the app to supply objects (e.g. `createParser(format)`).
- **Avoid when**: a constructor call is fine and the concrete type never varies.
- **Trade-offs**: indirection; with subclassing it can multiply classes.
- **Modern form**: a static factory function, a dictionary of constructors, or DI keyed services (`IServiceProvider.GetKeyedService<IParser>("csv")`).
- **Related**: Abstract Factory, Template Method (factory methods are often called from templates), Prototype.

### Prototype
- **Intent**: create new objects by copying an existing instance.
- **Use when**: construction is expensive (loaded config, parsed templates), objects are configured at runtime and need clones, or you must copy without knowing the concrete class.
- **Avoid when**: construction is cheap, or deep-copy semantics are unclear (shared mutable references).
- **Trade-offs**: deep vs shallow copy bugs; circular references.
- **Modern form**: immutable objects + `with`/`copy()` (Kotlin data classes, C# records, JS spread `{...obj}`), `structuredClone`.
- **Related**: Memento (snapshots), Flyweight, Abstract Factory (can store prototypes).

### Singleton
- **Intent**: ensure one instance with a global access point.
- **Use when**: exactly one instance is truly required *and* it is stateless or thread-safe (connection pool, clock, configuration).
- **Avoid when**: almost always as a hand-rolled static. It hides dependencies, breaks tests and couples everything.
- **Trade-offs**: global state, hidden coupling, test isolation problems, concurrency issues.
- **Modern form**: **a DI container lifetime** (`AddSingleton`, `@Singleton`, a module-level instance injected explicitly), never `Instance` statics.
- **Related**: Abstract Factory, Facade, Flyweight factory.

## Structural

### Adapter
- **Intent**: convert one interface into another that clients expect.
- **Use when**: integrating third-party SDKs, legacy code or external APIs behind your own port (hexagonal driven adapters), or in an anti-corruption layer.
- **Avoid when**: you own both sides and can just change the interface.
- **Trade-offs**: one more layer; leaky adapters that expose vendor types defeat the purpose.
- **Modern form**: a port interface in the application layer plus an `XxxAdapter` in infrastructure; mapping functions.
- **Related**: Facade (simplifies), Decorator (same interface, adds behaviour), Proxy, Bridge, Anti-Corruption Layer.

### Bridge
- **Intent**: decouple an abstraction from its implementation so both can vary independently.
- **Use when**: two dimensions of variation would otherwise cause a class explosion, e.g. `Notification` (alert, reminder, digest) × `Channel` (email, SMS, push), or `Shape` × `Renderer`.
- **Avoid when**: only one dimension varies.
- **Trade-offs**: more upfront design; can look over-engineered if the second dimension never appears.
- **Modern form**: composition, i.e. the abstraction holds an injected implementation interface (`Notification(channel: Channel)`).
- **Related**: Adapter (applied after the fact; Bridge is designed up front), Strategy, Abstract Factory (creates bridged pairs).

### Composite
- **Intent**: treat individual objects and compositions uniformly in a tree.
- **Use when**: hierarchical structures such as menus, org charts, file systems, UI component trees, rule trees and pricing bundles containing products.
- **Avoid when**: the structure is flat, or leaves and containers need very different APIs.
- **Trade-offs**: an overly general interface; type safety issues for leaf-only operations.
- **Modern form**: recursive sealed types / discriminated unions with recursive functions.
- **Related**: Iterator and Visitor (traverse composites), Decorator, Interpreter (grammars are composites), Builder.

### Decorator
- **Intent**: attach responsibilities to an object dynamically while keeping its interface.
- **Use when**: cross-cutting behaviour such as caching, retry, logging, metrics, authorisation or validation around an interface you don't want to modify; combinable at runtime.
- **Avoid when**: the behaviour is core to the object, or one fixed combination never changes.
- **Trade-offs**: many small wrappers; order matters; debugging stacks.
- **Modern form**: middleware pipelines, MediatR/handler pipeline behaviours, Python decorators, Spring AOP, `HttpMessageHandler` chains, Scrutor `Decorate<>`.
- **Related**: Proxy (controls access, same interface), Chain of Responsibility, Composite, Strategy (changes the guts; Decorator changes the skin).

### Facade
- **Intent**: provide a simple interface to a complex subsystem.
- **Use when**: callers need a few common operations on a complex library or module, or you are defining a module's public API in a modular monolith.
- **Avoid when**: it becomes a god object that does everything; split by use case.
- **Trade-offs**: can hide useful capabilities; can grow too large.
- **Modern form**: a module's public `api`/`contracts` package; application service; SDK client.
- **Related**: Adapter, Mediator, Singleton, API Gateway (the architectural equivalent).

### Flyweight
- **Intent**: share fine-grained objects to save memory by separating intrinsic (shared) from extrinsic (contextual) state.
- **Use when**: huge numbers of similar objects, such as glyphs in an editor, map tiles, particles or game sprites, where measured memory pressure exists.
- **Avoid when**: object counts are modest. That's premature optimisation.
- **Trade-offs**: complexity; extrinsic state must be passed around; thread-safety of shared state.
- **Modern form**: interning, caches/pools, value types, `string.Intern`, enum-like shared instances.
- **Related**: Factory (manages the pool), Composite (shared leaves), Singleton.

### Proxy
- **Intent**: provide a surrogate that controls access to another object.
- **Use when**: lazy loading (virtual proxy), remote calls (remote proxy / generated clients), access control (protection proxy), or caching and rate limiting at an object boundary.
- **Avoid when**: there's no access control or lifecycle concern; it's just indirection.
- **Trade-offs**: hidden latency (a remote proxy looks local; see the Fallacies of Distributed Computing); ORM lazy-loading N+1 surprises.
- **Modern form**: generated gRPC/OpenAPI clients, ORM lazy proxies, JS `Proxy`, dynamic proxies.
- **Related**: Decorator (adds behaviour), Adapter (changes interface), Ambassador and Sidecar (the infrastructure equivalents).

## Behavioural

### Chain of Responsibility
- **Intent**: pass a request along a chain of handlers until one handles it, or let all of them process it in turn.
- **Use when**: an ordered pipeline of checks or handlers, such as HTTP middleware, validation rules, approval workflows, pre-trade risk checks or exception handling.
- **Avoid when**: the order and handlers are fixed and few; a plain sequence of calls is clearer.
- **Trade-offs**: requests can fall through unhandled; flow is harder to trace.
- **Modern form**: middleware pipelines (ASP.NET Core, Express, Koa), a list of validators/rules evaluated in order.
- **Related**: Decorator, Command, Composite, Pipes and Filters (the architectural equivalent).

### Command
- **Intent**: encapsulate a request as an object.
- **Use when**: you need queuing, scheduling, logging/auditing, retries, undo/redo, macros, or to send the request across a boundary (CQRS commands, messages, jobs).
- **Avoid when**: a direct method call suffices and none of those needs exist.
- **Trade-offs**: many small classes; indirection.
- **Modern form**: command records + handlers (CQRS / MediatR / Axon), serialisable messages, closures/lambdas for simple cases, background job payloads.
- **Related**: Memento (undo state), Chain of Responsibility, Strategy, Event Sourcing (events are past-tense; commands are imperative).

### Interpreter
- **Intent**: define a grammar and an interpreter for sentences in a small language.
- **Use when**: you have a small, stable DSL, such as search/filter queries (`status:open AND priority>2`), rule expressions, pricing formulas, feature-flag targeting or config expressions.
- **Avoid when**: the grammar is large or changes often (use a parser generator such as ANTLR or an existing expression engine), or when a JSON rule format would do.
- **Trade-offs**: grows unmanageable for complex grammars; performance; security if user-supplied (sandboxing, limits).
- **Modern form**: AST as sealed types + pattern-matching evaluator; parser combinators; existing engines (CEL, JSONLogic, SpEL, NCalc).
- **Related**: Composite (the AST), Visitor (operations over the AST), Iterator, Flyweight (shared terminals).

### Iterator
- **Intent**: access elements of a collection sequentially without exposing its representation.
- **Use when**: custom data structures, paginated APIs or streams, lazy or infinite sequences, or traversing composites.
- **Avoid when**: the language's built-in collections already do it, which is almost always.
- **Trade-offs**: concurrent modification; lazy evaluation surprises (multiple enumeration).
- **Modern form**: language-level: `IEnumerable`/`yield return`, Python generators, JS iterators and `for...of`, Java streams, async iterators for paginated APIs (`for await (const page of client.list())`).
- **Related**: Composite, Visitor, Factory Method (creating iterators).

### Mediator
- **Intent**: centralise complex communication between objects so they don't refer to each other directly.
- **Use when**: many components interact in tangled ways, e.g. form fields that enable or disable each other, a chat room, or air-traffic-style coordination; in-process decoupling of modules via a dispatcher.
- **Avoid when**: used for every call "just because". In-process mediator libraries can hide the flow and make navigation hard.
- **Trade-offs**: the mediator can become a god object; indirection.
- **Modern form**: an in-process event bus or dispatcher, a UI state container, an orchestrator in sagas.
- **Related**: Observer (the usual implementation mechanism), Facade, Publish-Subscribe, Saga orchestrator.

### Memento
- **Intent**: capture and restore an object's internal state without breaking encapsulation.
- **Use when**: undo/redo, snapshots, checkpoints in long processes, "cancel" in edit dialogs, or optimistic UI rollback.
- **Avoid when**: state is large and snapshots are frequent (memory), or you need full history and audit (use Event Sourcing or an audit log).
- **Trade-offs**: memory cost; consistency of snapshots with external resources.
- **Modern form**: immutable state + a history stack (Redux time travel), structural sharing (Immer, persistent data structures).
- **Related**: Command (undo), Prototype, Event Sourcing.

### Observer
- **Intent**: notify dependants automatically when a subject's state changes.
- **Use when**: one-to-many reactions such as UI updates, domain events inside a process, or caches invalidated on change.
- **Avoid when**: reactions need guaranteed delivery across processes (use a broker + outbox), or the chain of reactions becomes impossible to follow.
- **Trade-offs**: memory leaks from unremoved listeners; unexpected cascade order; hard debugging.
- **Modern form**: events/delegates, signals, RxJS/Reactor streams, domain events dispatched after commit.
- **Related**: Mediator, Publish-Subscribe (the distributed equivalent), Reactive Programming, MVC/MVVM bindings.

### State
- **Intent**: let an object change behaviour when its internal state changes.
- **Use when**: an entity has a real lifecycle with state-specific rules, such as orders, bookings, documents and payment flows, and `if (status == ...)` checks are spreading.
- **Avoid when**: there are only two or three states with trivial transitions; an enum plus a transition table is enough.
- **Trade-offs**: a class per state; transitions spread across classes unless centralised.
- **Modern form**: an explicit transition table or state machine library (XState, Stateless, Spring Statemachine), sealed types per state.
- **Related**: Strategy (similar structure, but chosen by the client rather than by the state itself), Flyweight (stateless state objects), Memento.

### Strategy
- **Intent**: define a family of interchangeable algorithms.
- **Use when**: a `switch`/`if` on mode or type selects an algorithm and keeps growing (pricing rules, tax by country, shipping cost, retry policies, sorting); the algorithm is selected by config or A/B test.
- **Avoid when**: there are two stable branches. An `if` is clearer.
- **Trade-offs**: clients must know the strategies to choose one; more types.
- **Modern form**: a function type or lambda; a dictionary of functions keyed by enum; DI keyed services.
- **Related**: State, Template Method (inheritance-based alternative), Bridge, Decorator, Factory (to select the strategy).

### Template Method
- **Intent**: define an algorithm's skeleton in a base class and let subclasses override steps.
- **Use when**: frameworks with hooks (test fixtures, import pipelines with fixed steps and custom parsing), where invariant ordering must be enforced.
- **Avoid when**: you can pass functions or strategies instead. Composition is usually preferable to inheritance.
- **Trade-offs**: tight coupling to the base class; fragile base class problem; Liskov violations.
- **Modern form**: higher-order functions (pass the varying steps), Strategy objects, hook methods with defaults.
- **Related**: Strategy (composition alternative), Factory Method (often a step).

### Visitor
- **Intent**: add operations to a stable class hierarchy without modifying it.
- **Use when**: the element types are stable but operations grow, e.g. ASTs (pretty-print, evaluate, type-check), document export to many formats, or compilers and linters.
- **Avoid when**: element types change often (every visitor must change); in languages with exhaustive pattern matching.
- **Trade-offs**: double dispatch is verbose; it breaks encapsulation of the elements.
- **Modern form**: sealed types / discriminated unions + exhaustive `switch`/`match` (C# 9+, Java 21, Kotlin, TypeScript, Rust, F#).
- **Related**: Composite, Interpreter, Iterator.

---

## Choosing among similar patterns
| Confusable | Difference |
|---|---|
| Strategy vs State | The client picks a Strategy; a State changes itself as the object transitions |
| Decorator vs Proxy | Decorator adds behaviour (often stacked); Proxy controls access or lifecycle |
| Adapter vs Facade vs Bridge | Adapter converts one interface; Facade simplifies many; Bridge separates two dimensions by design |
| Factory Method vs Abstract Factory | One product vs a consistent family of products |
| Command vs Strategy | Command = *what* to do (a request object you can queue); Strategy = *how* to do it |
| Observer vs Mediator vs Pub/Sub | Observer = direct subscribers; Mediator = central coordinator; Pub/Sub = via a broker, often cross-process |
| Template Method vs Strategy | Inheritance vs composition for the varying step; prefer Strategy |
| Memento vs Event Sourcing | Snapshot of state vs the full sequence of changes |
