---
description: For a small team and a simple domain, the architect must recommend a (modular) monolith and explicitly advise against microservices.
tags: [architecture]
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill, Agent]
---

We're starting a new internal tool for booking meeting rooms and desks at our company (about 400 employees, peak maybe 50 concurrent users). The team is 3 developers; we deploy with a simple CI pipeline to one cloud VM today. Features: room/desk catalogue, bookings with conflict checks, recurring bookings, Outlook calendar sync, and a small admin area.

Our CTO likes microservices with Kafka and event sourcing because "that's how modern systems are built". Which architecture should we use? Give a clear recommendation.
