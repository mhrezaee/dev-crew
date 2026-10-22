---
type: llm
weight: 3
---

PASS if the review identifies that the availability check `event["booked"] >= event["capacity"]` ignores `req.seats`, so a request can overbook the event (for example 10 seats when only 1 is left), AND proposes a fix that compares `booked + seats` with `capacity` (or an equivalent atomic conditional update).
FAIL if this capacity/overbooking problem is not mentioned, or is mentioned only vaguely without explaining that the requested seat count is ignored.
