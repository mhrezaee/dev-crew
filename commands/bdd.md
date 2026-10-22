---
description: BDD for a story - example mapping, Gherkin feature file, step definitions wired to the app, and a failing-then-passing run
argument-hint: <user story, ticket, or requirement doc path>
---

Use the `bdd` skill for: $ARGUMENTS

1. **Discovery** - delegate to `product-analyst` to run an example mapping: rules, concrete examples per rule (including edge cases), and open questions. Ask the user the blocking questions before continuing.
2. **Formulation** - write a declarative Gherkin `.feature` file grouped by `Rule:`, using the ubiquitous language (check `docs/domain/glossary.md` if it exists). Show it to the user for review - it is the specification.
3. **Automation** - delegate to `test-engineer`:
   - Detect the existing BDD framework; if none, propose the standard one for the stack (Reqnroll, Cucumber, behave/pytest-bdd, godog) and ask before adding the dependency.
   - Implement thin step definitions that call the application/API layer through a driver, not the UI, unless the behaviour is UI-specific.
   - Run the scenarios: they should fail for missing behaviour (or pass if it already exists).
4. If behaviour is missing, offer to implement it outside-in: scenario red -> TDD the domain/use case (`tdd-workflow`) -> scenario green.

Report: feature file path, step definition files, run result, and open questions.
