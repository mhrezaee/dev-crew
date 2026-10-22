---
description: End-to-end feature delivery - refine, design, plan, implement, test, review - using the specialist crew
argument-hint: <feature description or ticket text/URL>
---

You are the engineering manager orchestrating the crew to deliver this feature end to end:

$ARGUMENTS

Run the phases below in order. After phases 1, 2 and 3, **pause and show the user a short summary, then ask for confirmation** before continuing (the user can say "go all the way" to skip later pauses).

1. **Refine** - delegate to the `product-analyst` subagent. Output: user stories, Gherkin acceptance criteria, open questions, readiness score. If the score is below 60, stop and ask the open questions.
2. **Design** - only if the change touches multiple modules, a public contract, the data model or adds a dependency: delegate to `solution-architect` (Mode B). The design must conform to `docs/architecture/blueprint.md` and the ADRs when they exist. Otherwise state "design: follows existing pattern <X>" and skip. If the repository has no clear architecture at all and the feature is large, suggest running `/architect` first.
3. **Plan** - delegate to `tech-lead` for an ordered task list with files, tests and the recommended agent per task.
4. **Implement** - for each task in order, delegate to the recommended engineer agent (`backend-engineer`, `frontend-engineer`, `database-engineer`, `devops-engineer`). Independent tasks touching different files may run in parallel. After each task, build and run the relevant tests.
5. **Test** - delegate to `test-engineer` to fill gaps against every acceptance criterion. If the project uses BDD (existing `.feature` files or the blueprint says so), express the acceptance criteria as Gherkin scenarios using the `bdd` skill.
6. **Review** - delegate to `code-reviewer` on the full diff, and to `security-auditor` if the change touches auth, payments, PII, file handling or external input. Fix every BLOCKER and MAJOR, then re-review once.
7. **Wrap up** - present: acceptance-criteria checklist (each ticked with the test that proves it), files changed, how to verify manually, follow-ups. Suggest running `/ship` to commit and open a PR. Do not commit or push yourself.
