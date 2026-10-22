---
name: plan
description: "Break a task into a small, ordered, test-backed implementation plan"
argument-hint: <task, ticket or design doc path>
disable-model-invocation: true
---

Delegate to the `tech-lead` subagent to create an implementation plan for:

$ARGUMENTS

The plan must list each task with files to change, tests to add, a "done when" check, size (S/M/L) and the recommended agent. Include risks and rollout. Present the plan and ask the user whether to execute it; if yes, execute task by task with the recommended agents, building and testing after each one.
