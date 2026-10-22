# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · Versioning: [SemVer](https://semver.org/).

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
