---
name: codebase-onboarding
description: Rapidly understand an unfamiliar codebase and produce an onboarding map - tech stack, how to build/run/test, architecture, key flows, conventions, and where to make common changes. Use when joining a project, opening a new repo, before a large change in unknown code, or when the user asks "explain this codebase" or "how does X work".
---

# Codebase onboarding

## Investigation order (cheap -> expensive)
1. **Docs**: README, CLAUDE.md, CONTRIBUTING, `docs/`, ADRs.
2. **Manifests**: package.json, *.csproj/*.sln, pom.xml/build.gradle, pyproject.toml, go.mod, pubspec.yaml, Cargo.toml -> languages, frameworks, versions, scripts.
3. **Tooling**: Dockerfile, docker-compose, CI workflows (they reveal the *real* build/test commands), Makefile, `.editorconfig`, linters.
4. **Structure**: top 2-3 directory levels; identify layers/modules and the entry points (`Program.cs`, `main.*`, `app.*`, `index.*`, router files).
5. **Configuration**: appsettings/env files, feature flags, DI container registration.
6. **Data**: entities/models, migrations, schema files.
7. **One vertical slice**: trace a single representative request end to end (route -> handler -> service -> repository -> DB -> response).
8. **Tests**: how they are organised; they document intended behaviour.
9. **History**: `git log --oneline -30`, `git shortlog -sn | head` (who knows what), hottest files: `git log --format= --name-only | sort | uniq -c | sort -rn | head -20`.

## Output: onboarding map
```markdown
# <Project> onboarding map

## In one paragraph
## Tech stack
## Run it
build / run / test / lint commands (verified)
## Architecture
Mermaid diagram + module responsibilities
## Key flows
1. <flow>: file -> file -> file
## Conventions
naming, error handling, DI, testing, branching, commit style
## Where to change things
| I want to... | Look at |
## Gotchas & tech debt
## Open questions
```

Offer to save the result as `CLAUDE.md` (AI-oriented, concise) and/or `docs/ONBOARDING.md` (human-oriented).
