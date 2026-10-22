---
description: For a large organisation with a complex domain, the architect must reason from drivers, identify bounded contexts and justify any service split. No blanket answers.
tags: [architecture]
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill, Agent]
---

We're replacing a 15-year-old insurance claims system. Six product teams (about 45 engineers) will work on it in parallel: policy, claims intake (web + mobile + partner API), fraud detection (ML scoring, very spiky load during storms), payments, and document management. The claims rules are complex and differ per country (AT, DE, CH). We already run Kubernetes with a platform team, tracing and on-call. Regulators require a full audit trail of every claim decision for 10 years.

What architecture should we choose? Give a clear recommendation with the reasoning.
