---
type: llm
weight: 3
---

PASS if ALL of these hold:
1. The main recommendation is a microkernel / plug-in architecture (a stable core plus country rule packs as plug-ins), or an equivalent rules-engine or extension-point design with the same structure.
2. It specifies a versioned plug-in contract or SDK (interfaces, data passed in and out, compatibility and versioning policy).
3. It addresses at least two of: plug-in isolation or sandboxing and security for third-party code, discovery and registration, testing and certification of partner plug-ins, and per-tenant or per-country selection of plug-ins.
4. It does NOT recommend splitting into microservices per country as the primary solution for a 5-person core team (mentioning it as a rejected alternative is fine).

FAIL otherwise.
