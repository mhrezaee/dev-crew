# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · Versioning: [SemVer](https://semver.org/).

## [1.3.0] - 2026-10-22: complete pattern knowledge, better decisions

### Added
- **Reference catalogues (145 entries)**, loaded only on demand, so always-on context doesn't grow:
  - `design-patterns/references/gof-catalog.md`: all 23 GoF patterns, plus confusable pairs
  - `architecture-selection/references/architecture-styles.md`: 20 required styles + 8 more
  - `architecture-selection/references/ui-patterns.md`: MVC, MVP, MVVM, MVI, BFF and modern UI patterns
  - `architecture-selection/references/paradigms-and-practices.md`: DDD, TDD, BDD, DevOps, GitOps, Twelve-Factor, OOP, FP, Reactive and more
  - `microservices-patterns/references/cloud-patterns.md`: 12 required cloud and resilience patterns + 20 more
  - `clean-code/references/principles-and-laws.md`: SOLID, DRY, KISS, YAGNI, CAP, PACELC, Conway, Demeter, fallacies and more
- `scripts/check_coverage.py` (runs in CI): all 78 required items must keep a substantive entry.
- 4 decision-quality eval cases: undo/redo → Command, class explosion → Bridge, partner rule packs → Microkernel, lost events → Outbox.

### Changed
- `solution-architect`: a "decision quality" procedure that consults the catalogues, compares at least two alternatives plus the simplest option, runs a trade-off check (quality attributes, CAP/PACELC, fallacies, Conway, KISS/YAGNI), a pre-mortem and a confidence statement.
- `tech-lead` is now the lead developer. It makes code-level design calls (patterns, paradigms, principles) recorded in a decision table, preloads `design-patterns` and `clean-code`, and runs at `effort: high`.
- `architecture-selection`: decision rules for SOA, space-based, cell-based, P2P, microkernel, pipes and filters, interaction styles, UI patterns and practices, plus a trade-off step and a decision record format.
- `design-patterns`: the problem → pattern table covers all 23 GoF patterns; added a 4-step decision procedure.
- `frontend-engineer`: follows the framework's native presentation pattern and consults the UI catalogue.

## [1.2.0] - 2026-10-22: trustable and lean

### Added
- **Guardrail hooks** (`hooks/`, Node, no dependencies, 70+ tests). They deny catastrophic shell commands; ask before force pushes, hard resets, infrastructure destroys, destructive SQL, package publishing and `curl | sh`; and ask before credential-shaped strings are written into files. Opt out with `DEV_CREW_GUARD=off`.
- **Evidence protocol** skill, preloaded into every agent: cite `file:line`, verify before claiming success, and label VERIFIED / ASSUMPTION / UNKNOWN. A SessionStart hook adds the same rules (~100 tokens) to the main session (`DEV_CREW_SESSION_RULES=off` to disable).
- **Eval suite** (`evals/`, 8 read-only cases) for `claude plugin eval`, comparing results with and without dev-crew.
- `SECURITY.md` describing exactly what runs, the fail-open design and the opt-outs.

### Changed
- **Always-on context cut from ~5,970 to ~2,700 tokens per session (−55%).**
  - Workflow commands are now manual-only skills (`disable-model-invocation: true`), so they add no context until you invoke them.
  - All descriptions were shortened.
- Every agent now sets `model`, `effort` and `maxTurns`, and preloads its key skills via `skills:`. `release-manager` and `/standup` run on Haiku.
- `code-reviewer` and `security-auditor` do a mandatory second look and attach evidence and a failure scenario to every finding.
- The validator now catches unknown frontmatter keys, unquoted YAML, invalid model or effort values, invalid preloads, command/skill name collisions, missing hook scripts, version mismatches and always-on budget overruns. CI also runs the hook tests.

### Fixed
- `bdd` existed as both a skill and a command, so the command was shadowed. The command is now `/bdd-spec`.
- Descriptions containing `: ` are now quoted, so they are valid YAML.

### Removed
- `commands/` directory (moved into `skills/`). The install scripts no longer copy it.

## [1.1.0] - 2026-10-22

### Added
- **Architecture decision framework**: `architecture-selection` skill that scores 11 project drivers and selects system topology, code architecture, data, integration, frontend, testing approach and patterns, with red-flag checks, a blueprint template and an architecture-styles catalogue.
- Skills: `domain-driven-design`, `clean-architecture` (clean/hexagonal/onion/vertical slice), `microservices-patterns` (sagas, outbox, event-driven), `design-patterns` (problem-to-pattern guide + examples), `bdd`.
- Agent: `architecture-reviewer`.
- Commands: `/architect`, `/architecture-review`, `/domain-model`, `/bdd`.

### Changed
- `solution-architect` now works in two modes (architecture decision / feature design) and writes `docs/architecture/blueprint.md`.
- `/feature`, `tech-lead`, `test-engineer` and `code-reviewer` follow the blueprint, ADRs and BDD setup when present.

## [1.0.0] - 2026-10-22

### Added
- 15 subagents: product-analyst, solution-architect, tech-lead, backend-engineer, frontend-engineer, database-engineer, devops-engineer, test-engineer, code-reviewer, security-auditor, debugger, performance-engineer, refactoring-specialist, docs-writer, release-manager.
- 21 skills covering requirements, design, coding, testing, review, security, delivery and operations.
- 14 workflow commands: feature, refine, design, plan, fix-bug, test, review-code, audit-security, refactor, onboard, ship, release, postmortem, standup.
- Claude Code plugin + marketplace manifests, install scripts, CLAUDE.md template, CI validation.
