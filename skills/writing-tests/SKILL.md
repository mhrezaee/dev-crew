---
name: writing-tests
description: "Test design: pyramid, AAA, naming, builders, mocking boundaries, Testcontainers, flakiness. Use when writing or fixing tests."
---

# Writing good tests

## Choose the level
| Level | What | Speed | Share |
|---|---|---|---|
| Unit | pure logic, one unit of behaviour | ms | most |
| Integration | your code + real DB/queue/HTTP stub (Testcontainers, WireMock, in-memory server) | seconds | some |
| Contract | API producer/consumer agreement (Pact, schema tests) | seconds | at service boundaries |
| E2E | full user journey through UI/API | slow | few critical paths |

## Structure
- **Arrange / Act / Assert**, separated by blank lines. One Act per test.
- Name describes behaviour: `CancelBooking_WithinFreeWindow_IssuesFullRefund`, `it('returns 404 when the booking belongs to another user')`.
- Assert on outcomes (return value, state, emitted event, HTTP response), not on implementation details (which private method was called).
- One logical assertion per test; multiple `assert` lines fine if they check one concept.

## Test data
- Use builders/factories with sensible defaults; override only what matters for the test: `aBooking().withStatus(Confirmed).build()`.
- No shared mutable fixtures between tests. Each test creates its own data.
- Fixed, injected clock and seeded randomness.

## Mocking
- Mock what you don't own and what is slow/non-deterministic: network, clock, filesystem, randomness, message brokers.
- Don't mock your own domain objects or value objects.
- Prefer fakes (in-memory repository) over deep mock chains.
- Verify interactions only when the interaction *is* the behaviour (e.g. "email was sent").

## Must-cover cases
Happy path, each validation rule, boundaries (0/1/many/max), null/empty, unauthorised access, not found, conflict/concurrency, external dependency failure/timeout, idempotent retry.

## Avoid flakiness
No `sleep` - await conditions with timeouts. No dependence on test order, wall clock, time zone, locale or network. Isolate DB state per test (transactions rolled back, unique schemas, or containers).

## Language quick reference
- .NET: xUnit/NUnit + FluentAssertions/Shouldly + NSubstitute/Moq + Testcontainers + `WebApplicationFactory`
- Java/Kotlin: JUnit 5 + AssertJ + Mockito/MockK + Testcontainers + Spring Boot Test
- JS/TS: Vitest/Jest + Testing Library + MSW + Playwright
- Python: pytest + fixtures + `unittest.mock`/pytest-mock + Testcontainers + Hypothesis
- Go: `testing` + testify + httptest + Testcontainers-go
- Flutter/Dart: `flutter_test` + mocktail + integration_test
