---
name: refine
description: "Refine a raw ticket or idea into user stories, Gherkin acceptance criteria and a readiness score"
argument-hint: <ticket text, idea or URL>
disable-model-invocation: true
---

Delegate to the `product-analyst` subagent, using the `requirements-refinement` skill, to refine this request:

$ARGUMENTS

Then show the user the refined requirement and the readiness score. If there are open questions, ask them one group at a time (most blocking first) and update the requirement after each answer until the score is at least 80 or the user stops. Finally offer to save it as a Markdown file (e.g. `docs/requirements/<feature>.md`).
