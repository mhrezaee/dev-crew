# UI and presentation patterns

Rule zero: **use the pattern your framework is built around**. Fighting the framework costs more than any pattern gains.

| Framework | Native pattern |
|---|---|
| ASP.NET MVC, Rails, Django, Spring MVC, Laravel | MVC |
| WPF, .NET MAUI, Android Jetpack (ViewModel), SwiftUI (ObservableObject), Angular (component + service) | MVVM |
| React, Vue, Svelte | Component-based + unidirectional data flow (Flux/Redux-style or signals) |
| Flutter | BLoC / Riverpod / Provider (MVVM-like or MVI-like) |
| Elm, The Composable Architecture (Swift), Jetpack Compose with MVI libraries | MVI / Elm Architecture |
| WinForms, legacy Android, GWT | MVP |

---

### MVC (Model-View-Controller)
- **What**: the Controller handles input and updates the Model; the View renders the Model. On the server, the controller picks a model and view per request.
- **Use when**: server-rendered web apps and request/response UIs; frameworks built on it.
- **Avoid when**: rich client state with complex interactions (controllers bloat into "Massive View Controller" on iOS).
- **Trade-offs**: ＋ simple and well known. － fat controllers; on the client the view and controller often blur.
- **Related**: MVP, MVVM, Front Controller.

### MVP (Model-View-Presenter)
- **What**: a passive View behind an interface; the Presenter holds all presentation logic and talks to the View through that interface.
- **Use when**: UI toolkits without data binding where you want unit-testable presentation logic (WinForms, legacy Android).
- **Avoid when**: the framework has data binding (use MVVM).
- **Trade-offs**: ＋ highly testable. － view interfaces boilerplate; presenter-to-view chatter.
- **Related**: MVVM (binding replaces the view interface), Humble Object.

### MVVM (Model-View-ViewModel)
- **What**: the View binds to observable state and commands exposed by a ViewModel; the ViewModel has no reference to the View.
- **Use when**: frameworks with data binding (WPF, MAUI, Jetpack, SwiftUI, Angular); forms-heavy business apps.
- **Avoid when**: there's no binding support; very simple screens.
- **Trade-offs**: ＋ testable ViewModels, designer and developer separation. － binding magic is hard to debug; ViewModels can bloat; two-way binding can create update loops.
- **Related**: Observer, Command (GoF), MVI (stricter one-way flow).

### MVI (Model-View-Intent)
- **What**: unidirectional loop: the user's **Intent** goes to a reducer, which produces a new immutable **Model** (state), which the **View** renders. Side effects are handled explicitly.
- **Use when**: complex screens with many async events where state consistency matters, or when you want predictable, time-travel-debuggable state (Compose, Flutter BLoC, TCA, Elm).
- **Avoid when**: simple forms; reducers and intents add boilerplate.
- **Trade-offs**: ＋ a single source of truth, predictable, easy to test (pure reducers). － boilerplate; performance care for large immutable states.
- **Related**: Redux/Flux, Elm Architecture, Memento (state history), Reactive Programming.

### Backends for Frontends (BFF)
- **What**: a dedicated backend per client experience (web, mobile, partner) that aggregates and shapes downstream APIs for that client, often owned by the frontend team.
- **Use when**: clients need very different payloads or flows, mobile needs fewer round-trips, many downstream services must be aggregated, or you want to keep tokens and secrets server-side (the BFF auth pattern for SPAs).
- **Avoid when**: one client, or clients with nearly identical needs (a single API or GraphQL may be enough).
- **Trade-offs**: ＋ client-optimised APIs, team autonomy. － duplicated logic across BFFs (keep business rules downstream); more deployables.
- **Related**: API Gateway (generic edge), Gateway Aggregation, GraphQL, Micro-frontends.

---

## Beyond

### Flux / Redux (unidirectional data flow)
Actions → dispatcher or store → reducers → new state → views. Use it for shared client state that many components read and write. Prefer **server-state libraries** (TanStack Query, SWR, Apollo) for remote data, and keep global client state minimal.

### BLoC (Business Logic Component)
Flutter's stream-based pattern: events in, states out, which makes it MVI-like. It suits medium and large Flutter apps that need testable business logic separated from widgets. Riverpod or Provider are lighter alternatives for smaller apps.

### Elm Architecture / The Composable Architecture
Model + Update (a pure function) + View, with effects as data. It gives the strongest guarantees of predictability and testability, at the cost of a steeper learning curve and more boilerplate.

### Container / Presentational components
Containers fetch data and hold state; presentational components are pure props in, UI out. Use it to keep components reusable and testable. With hooks it often becomes "custom hook + presentational component".

### Feature-Sliced Design (frontend structure)
Layers `app → pages → widgets → features → entities → shared`, with imports allowed only downward. This is the vertical-slice equivalent for large SPAs; enforce it with eslint-plugin-boundaries.

### Rendering strategies
| Strategy | Use when |
|---|---|
| CSR (client-side rendering) | Highly interactive apps behind login; SEO irrelevant |
| SSR (server-side rendering) | SEO plus personalised content, fast first paint |
| SSG / ISR (static generation, incremental regeneration) | Mostly-static content, marketing, docs, catalogues |
| Islands architecture (Astro, Fresh) | Content sites with small interactive parts; minimal JS |
| React Server Components / streaming | Data-heavy React apps wanting less client JS and colocated data fetching |

### Offline-first / local-first
A local database is the source of truth for the UI, synchronised in the background, with conflict resolution (last-write-wins, merge rules or CRDTs). Use it for field work, mobile in poor connectivity, or collaborative editing.

### Atomic Design and design systems
Atoms → molecules → organisms → templates → pages, shared through a design system with tokens. Use it for consistency across teams and products; pair with Storybook and visual regression tests.

### Micro-frontends
See `architecture-styles.md`. Use only with four or more independent frontend teams.
