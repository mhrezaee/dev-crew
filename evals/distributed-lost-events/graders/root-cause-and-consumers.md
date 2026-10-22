---
type: llm
weight: 2
---

PASS if the answer (1) identifies the dual-write problem: the database transaction and the Kafka send are not atomic, so the send can succeed before a rollback (phantom event) or the commit can succeed while the send is lost (missing event); (2) recommends the transactional outbox (an outbox table written in the same transaction and relayed by a poller or CDC such as Debezium); and (3) notes that delivery is then at-least-once, so consumers must be idempotent (inbox / dedupe by event ID).
FAIL if it only suggests more retries, Kafka transactions alone, or `@TransactionalEventListener` without explaining the remaining atomicity gap, or if it omits consumer idempotency.
