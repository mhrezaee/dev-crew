---
name: clean-architecture
description: "Clean, hexagonal, onion and vertical-slice structures per stack, the dependency rule and architecture tests. Use when structuring or fixing layers."
---

# Clean / Hexagonal / Vertical Slice architecture

## The one rule
**Source code dependencies point inward.** Domain knows nothing about application, application knows nothing about infrastructure or UI. Outer layers implement interfaces (ports) declared by inner layers.

## Layer responsibilities
| Layer | Contains | Must NOT contain |
|---|---|---|
| **Domain** | entities, value objects, domain events, domain services, domain exceptions, repository interfaces (optional) | framework attributes, ORM, HTTP, logging frameworks, DTOs |
| **Application** | use cases (command/query handlers or interactors), ports (interfaces for repositories, clock, email, external APIs), DTOs, validation, transaction boundaries, authorisation policies | DB/HTTP implementations, controllers |
| **Infrastructure** (driven adapters) | ORM/DbContext, repository implementations, message bus, HTTP clients, file storage, email, clock | business rules |
| **Presentation** (driving adapters) | controllers/endpoints, gRPC, CLI, message consumers, UI | business rules, direct DB access |
| **Composition root** | DI registration, configuration, startup | logic |

## Structures per stack

**.NET**
```
src/
  Booking.Domain/            (no project references)
  Booking.Application/       -> Domain
  Booking.Infrastructure/    -> Application
  Booking.Api/               -> Application, Infrastructure (composition root only)
tests/
  Booking.Domain.Tests/ Booking.Application.Tests/ Booking.Api.IntegrationTests/ Booking.ArchitectureTests/
```

**Java / Spring (hexagonal, package-by-feature)**
```
com.acme.booking
  domain/          model, events, ports/out (BookingRepository)
  application/     ports/in (CancelBookingUseCase), services
  adapter/in/web/  BookingController
  adapter/out/persistence/  BookingJpaAdapter, BookingJpaEntity
```

**TypeScript / Node (NestJS or Express)**
```
src/modules/booking/
  domain/  application/  infrastructure/  presentation/
  booking.module.ts
```

**Python (FastAPI)**
```
app/booking/
  domain/  application/  infrastructure/  api/
```

**Go**
```
internal/booking/
  domain/ app/ adapters/postgres/ adapters/http/
cmd/api/main.go   (wiring)
```

**Flutter**
```
lib/features/booking/
  domain/ (entities, repositories abstract, use_cases)
  data/   (models/DTOs, data sources, repository impl)
  presentation/ (pages, widgets, bloc/controller)
```

## Vertical slice variant
Organise by use case instead of technical layer; each slice may be thin (query straight to DB) or call a rich domain model. Good default for apps with many simple use cases. Keep a shared `Domain/` folder for real business rules.
```
Features/Bookings/CancelBooking/
  CancelBookingEndpoint  CancelBookingCommand  CancelBookingHandler  CancelBookingValidator
```

## Mapping strategy
- Domain <-> persistence: map in infrastructure (or configure ORM mapping externally - Fluent API / XML / separate JPA entities) so the domain stays clean.
- Domain <-> API: request/response DTOs in presentation/application. Never return domain entities from controllers.
- Avoid pointless 1:1 mappers when a layer adds nothing - that's the signal to use vertical slices instead.

## Cross-cutting concerns
Handle via pipeline behaviours/middleware/decorators/interceptors: validation, logging, transactions, authorisation, caching, retries.

## Architecture tests (example NetArchTest)
```csharp
[Fact]
public void Domain_should_not_depend_on_other_layers() =>
    Types.InAssembly(typeof(Booking).Assembly)
        .ShouldNot().HaveDependencyOnAny("Booking.Application", "Booking.Infrastructure", "Microsoft.EntityFrameworkCore")
        .GetResult().IsSuccessful.Should().BeTrue();
```
Equivalent: ArchUnit `layeredArchitecture()` (Java), dependency-cruiser `forbidden` rules (TS), import-linter `layers` contract (Python).

## Common violations to fix
- Controllers calling repositories/DbContext directly
- Domain entities with ORM/JSON attributes (acceptable pragmatic exception - document it in an ADR if chosen)
- Application layer referencing infrastructure types (`HttpClient`, `DbContext`, SDK clients)
- Business rules in controllers, validators or SQL
- "Shared" project that everything references and that grows into a dumping ground
