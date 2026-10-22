---
type: llm
weight: 3
---

PASS if ALL of these hold:
1. It recommends the Command pattern (operations as objects with execute/undo, or do/undo) as the core of undo/redo, with undo and redo stacks or a history list.
2. It explains how undo is achieved: inverse operations and/or state snapshots (Memento) or immutable state with structural sharing, and mentions a trade-off between them (e.g. memory versus complexity).
3. It uses the command objects' descriptions for the history panel, or otherwise addresses the history panel.
4. It doesn't recommend unrelated heavy machinery for the current needs (e.g. full event sourcing with a backend event store, or CRDTs right now). Mentioning collaboration as a future concern, or that commands help later, is fine.

FAIL if Command is missing, the undo mechanism is not explained, or the design is clearly over-engineered for the stated requirements.
