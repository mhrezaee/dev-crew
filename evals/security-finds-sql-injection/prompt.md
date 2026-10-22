---
description: The security review must flag SQL injection in a search filter and recommend parameterised queries.
tags: [security]
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill, Agent]
---

Is this search endpoint safe to expose publicly?

```python
@app.get("/events", response_model=list[Event])
def list_events(search: str = ""):
    sql = "SELECT * FROM events"
    if search:
        sql += " WHERE name LIKE '%" + search + "%'"
    rows = conn.execute(sql).fetchall()
    return [dict(r) for r in rows]
```
