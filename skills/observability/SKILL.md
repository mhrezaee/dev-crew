---
name: observability
description: "Structured logs, RED/USE metrics, OpenTelemetry tracing, SLO burn-rate alerts. Use for new services or hard-to-diagnose issues."
---

# Observability

## Logging
- **Structured** (JSON) with consistent fields: `timestamp, level, message, service, env, version, traceId, spanId, userId (pseudonymised), correlationId`.
- Message templates, not string concatenation: `log.Info("Booking {BookingId} cancelled by {UserId}", ...)`.
- Levels: `Error` = needs a human; `Warning` = degraded but handled; `Information` = business events; `Debug` = diagnostics (off in prod).
- Log at boundaries and decisions, not every line. Log an exception once, where it is handled.
- Never log secrets, tokens, passwords, full card numbers, or unnecessary PII.

## Metrics
- **RED** for request-driven services: Rate, Errors, Duration (histogram) per endpoint.
- **USE** for resources: Utilisation, Saturation, Errors (CPU, memory, pools, queues).
- Business metrics: orders placed, payments failed, sign-ups.
- Keep label cardinality low - never user IDs or raw URLs as labels.

## Tracing
- Use OpenTelemetry SDK + auto-instrumentation for HTTP, DB, messaging.
- Propagate W3C `traceparent` across services and through message headers.
- Add custom spans around significant business operations; add attributes, not logs, for context.

## Health checks
- `liveness`: process is alive (no dependency checks).
- `readiness`: can serve traffic (critical dependencies reachable).
- `startup`: for slow boots.

## SLOs & alerts
- Define SLIs from the user's perspective (availability = good requests / total; latency = % under threshold).
- Set SLOs (e.g. 99.9 % monthly) and alert on **error-budget burn rate** (fast: 14.4x over 1 h; slow: 6x over 6 h), not on CPU spikes.
- Every alert must be actionable and link to a runbook and dashboard.

## Dashboards
One per service: golden signals at the top, dependencies next, then resources. Same time window and units everywhere.

## Definition of done for a new feature
- [ ] Key business event logged/metric emitted
- [ ] Errors logged with context and traceId
- [ ] Endpoint covered by RED metrics and traces
- [ ] Alert/runbook updated if it affects an SLO
