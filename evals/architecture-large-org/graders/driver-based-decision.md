---
type: llm
weight: 3
---

PASS if ALL of these hold:
1. It identifies bounded contexts or modules that roughly match the business capabilities (for example policy, claims, fraud, payments, documents).
2. Any recommendation to split into separately deployed services is justified by concrete drivers from the prompt: multiple teams, independent deployment, fraud's spiky scaling, an existing platform team or Kubernetes.
3. It addresses the 10-year audit requirement explicitly (for example an append-only audit log or event sourcing for claim decisions) and keeps any event sourcing scoped rather than system-wide.
4. It mentions how to handle cross-service consistency (sagas, outbox or similar) or an incremental migration strategy from the legacy system (for example strangler fig).

FAIL if it gives a generic answer with no link to the drivers, recommends a single undifferentiated monolith while ignoring the 6-team setup, or applies event sourcing everywhere without justification.
