---
name: error-handling
description: Patterns for robust error handling and resilience - exception vs result types, error boundaries, retries with backoff and jitter, timeouts, circuit breakers, idempotency, graceful degradation and user-facing error messages. Use when writing code that calls external systems, designing error flows, or fixing swallowed/unclear errors.
---

# Error handling & resilience

## Classify errors
| Type | Example | Handling |
|---|---|---|
| Validation / user error | invalid email | return 400/422 with field details; no error log |
| Business rule | insufficient balance | domain error / result type; 409/422 |
| Not found / forbidden | missing resource | 404/403 |
| Transient infrastructure | timeout, 503, deadlock | retry with backoff, then fail gracefully |
| Programming bug | null reference | let it surface to the global handler; log as error; alert |

## Rules
- Never swallow exceptions (`catch {}`). Either handle meaningfully, add context and rethrow, or let it propagate.
- Catch the most specific type you can handle.
- Preserve the original cause when wrapping (`throw new X("context", ex)`, `raise X from e`, `fmt.Errorf("...: %w", err)`).
- One global error handler/middleware converts unhandled errors to a safe response + log + traceId.
- Errors are part of the API: document them, test them.
- Prefer result/either types for **expected** failures in domains that use them; exceptions for exceptional cases. Follow the codebase's existing style.

## Resilience for outbound calls
- **Timeout** on every call (connect + total). No timeout = eventual outage.
- **Retry** only idempotent operations and only transient errors; exponential backoff + jitter; cap attempts (e.g. 3); respect `Retry-After`.
- **Circuit breaker** for dependencies that can be down for a while; fail fast while open.
- **Bulkhead**: separate pools/limits so one slow dependency can't exhaust everything.
- **Fallback**: cached value, default, degraded feature - decide explicitly per use case.
- **Idempotency keys** for operations with side effects (payments, emails, orders) so retries don't duplicate.
- Libraries: Polly / Microsoft.Extensions.Http.Resilience (.NET), Resilience4j (Java), `tenacity` (Python), `cockatiel`/`p-retry` (Node), `failsafe-go`.

## Messaging
At-least-once delivery means handlers must be idempotent; use dead-letter queues with alerts; poison messages must not block the queue.

## User-facing messages
Say what happened, what the user can do, and include a reference ID. Never show stack traces or internal details.
> "We couldn't complete your payment. Your card was not charged. Please try again or use another payment method. (Ref: 7F3A-21)"
