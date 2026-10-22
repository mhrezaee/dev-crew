---
type: llm
weight: 3
---

PASS if the answer separates the two dimensions, notification type (content/formatting) and channel (delivery), into independent hierarchies or interfaces combined by composition (Bridge, or an equivalent Strategy-based composition), so that adding Slack/Teams or a new type needs one new class each rather than N×M classes, AND shows the class or interface shape (e.g. `Notification` holding a `Channel`/`NotificationSender`).
FAIL if it keeps per-combination subclasses, only suggests extracting a shared base class, or gives no concrete structure.
