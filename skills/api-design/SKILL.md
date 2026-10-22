---
name: api-design
description: "REST/HTTP API conventions: naming, status codes, RFC 9457 errors, pagination, versioning, idempotency, OpenAPI. Use when adding or reviewing endpoints."
---

# API design guidelines

First check for an existing API style in the codebase (routes, error model, pagination, casing). **Consistency with the existing API beats these defaults.**

## Resources & URLs
- Plural nouns, kebab-case: `/v1/flight-bookings/{bookingId}/passengers`
- Nest only for true ownership, max 2 levels deep.
- Actions that aren't CRUD: sub-resource (`POST /orders/{id}/cancellation`) or a verb as last segment (`POST /orders/{id}:cancel`) - pick one style project-wide.

## Methods & status codes
| Method | Use | Success | Idempotent |
|---|---|---|---|
| GET | read | 200 | yes |
| POST | create / action | 201 + `Location` / 200 / 202 | no (use `Idempotency-Key`) |
| PUT | full replace | 200 / 204 | yes |
| PATCH | partial update | 200 | should be |
| DELETE | remove | 204 | yes |

Errors: 400 validation, 401 unauthenticated, 403 forbidden, 404 not found (also for resources the caller may not see), 409 conflict, 412 precondition failed (ETag), 422 business rule violation, 429 rate limited (+`Retry-After`), 500 unexpected, 503 dependency down.

## Error format - RFC 9457 Problem Details
```json
{
  "type": "https://api.example.com/problems/insufficient-seats",
  "title": "Not enough seats available",
  "status": 422,
  "detail": "Requested 4 seats but only 2 are available on OS123.",
  "instance": "/v1/bookings/abc123",
  "traceId": "00-4bf92f...",
  "errors": { "passengers[2].birthDate": ["Must be in the past"] }
}
```
Never leak stack traces, SQL or internal hostnames.

## Collections
- Pagination: cursor/keyset (`?limit=50&cursor=...`, return `nextCursor`) for large or changing data; offset only for small admin lists. Always enforce a max `limit`.
- Filtering: `?status=active&createdAfter=2026-01-01`; sorting: `?sort=-createdAt,name`.
- Sparse fields optional: `?fields=id,name`.

## Data conventions
- JSON camelCase (or match the project); ISO-8601 UTC timestamps; money as `{ "amount": "12.50", "currency": "EUR" }` (string/decimal, never float); IDs as opaque strings; enums as UPPER_SNAKE or camel strings, documented.

## Evolution
- Additive changes are non-breaking; removing/renaming fields, changing types or semantics is breaking.
- Version in the URL (`/v1`) or header - match the project. Deprecate with `Deprecation` and `Sunset` headers and a migration window.
- Tolerant reader: clients must ignore unknown fields.

## Safety
- AuthZ check on every resource access (object-level, not just route-level).
- Rate limits, request size limits, timeouts.
- `Idempotency-Key` header for POSTs that create money/side effects.
- Optimistic concurrency with `ETag` / `If-Match` for updates where lost updates matter.

## Deliverable
Update or create the OpenAPI 3.1 spec alongside the code, with examples for every response.
