---
type: llm
weight: 3
---

PASS if ALL of these hold:
1. The main recommendation is a monolith or modular monolith (one deployable).
2. It explicitly advises against microservices AND against event sourcing/Kafka for now.
3. The reasoning cites at least two concrete drivers from the prompt (team of 3, ~50 concurrent users, simple CI on one VM, a simple domain).
4. It names a condition or trigger under which the decision should be revisited.

FAIL if it recommends microservices, Kafka or event sourcing for this project, or hedges without a clear recommendation.
