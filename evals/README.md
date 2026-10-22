# dev-crew evals

Behavioural tests for the plugin, run with [`claude plugin eval`](https://code.claude.com/docs/en/plugin-evals). By default every case runs **twice**: with dev-crew loaded and without any plugin. The report shows both scores and **Δ**, which is how much dev-crew actually helps.

| Case | What it checks |
|---|---|
| `review-finds-overbooking` | The reviewer finds a capacity bug where the requested seat count is ignored, and explains a failure scenario |
| `security-finds-sql-injection` | SQL injection is named, exploited conceptually and fixed with parameters |
| `architecture-small-team` | 3 devs and a simple domain lead to a modular monolith, with microservices, Kafka and event sourcing rejected |
| `architecture-large-org` | 6 teams and a complex regulated domain lead to bounded contexts, a justified split, a scoped audit design and a migration path |
| `patterns-avoid-overengineering` | Pushes back on an interface + factory + strategy for a single implementation (YAGNI) |
| `refine-vague-ticket` | Gherkin with failure paths, and open questions instead of invented rules |
| `evidence-no-unverified-claims` | Never claims tests pass without running them |
| `commit-message-conventional` | Conventional Commits subject plus the ticket reference |

All cases are **read-only** and carry their fixtures inline, so they need no `--scaffold`, no shell access and no WSL2 on Windows.

## Running
Each run is a real Claude session on **your** account and counts toward your usage. Start small:

```bash
# from the repo root
claude plugin eval . --case review-finds-overbooking --runs 1     # one case, quick check
claude plugin eval . --runs 1 --max-cost-usd 5                     # whole suite, one run per arm, capped
claude plugin eval . --judge-model sonnet --json results.json      # full run (3 runs per arm), stable judge
```

Results and an HTML report are written to `evals/results/` (git-ignored).

## Grading
- `regex` and `tool_used` graders are free and deterministic. `llm` graders use a judge model with PASS/FAIL rubrics.
- "Did dev-crew's skill or agent fire?" graders are reported as **indicators** only, so they don't inflate Δ.
- Add a case for every bug report where dev-crew gave bad advice. That's how the suite gets stronger.
