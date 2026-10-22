# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · Versioning: [SemVer](https://semver.org/).

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
