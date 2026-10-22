---
description: The reviewer must find a capacity bug where the sold-out check ignores the number of requested seats.
tags: [review, correctness]
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill, Agent]
---

Please review this endpoint before I merge it. It's from our event ticketing API (FastAPI + sqlite3).

```python
@app.post("/events/{event_id}/bookings", response_model=Booking, status_code=201)
def create_booking(event_id: int, req: BookingRequest):
    event = conn.execute("SELECT * FROM events WHERE id = ?", (event_id,)).fetchone()
    if event is None:
        raise HTTPException(404, "Event not found")
    if req.seats < 1 or req.seats > 10:
        raise HTTPException(400, "You can book between 1 and 10 seats")
    if event["booked"] >= event["capacity"]:
        raise HTTPException(409, "Event is sold out")

    total = req.seats * event["price"]
    if req.seats >= 4:
        total = total * 0.9  # group discount

    cur = conn.execute(
        "INSERT INTO bookings (event_id, customer_email, seats, total, created_at) VALUES (?, ?, ?, ?, ?)",
        (event_id, req.customer_email, req.seats, total, datetime.now().isoformat()),
    )
    conn.execute("UPDATE events SET booked = booked + ? WHERE id = ?", (req.seats, event_id))
    conn.commit()
    return dict(conn.execute("SELECT * FROM bookings WHERE id = ?", (cur.lastrowid,)).fetchone())
```
