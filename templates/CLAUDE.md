# CLAUDE.md

> Project memory for AI coding assistants. Keep it short, true and current.
> Copy this file to the root of your repository and fill in the blanks.

## Project
<One paragraph: what this system does, for whom, and its main components.>

## Commands
```bash
# install / restore
<command>
# build
<command>
# run locally
<command>
# test (all / single)
<command>
<command for a single test, e.g. dotnet test --filter "FullyQualifiedName~BookingTests">
# lint / format
<command>
```

## Architecture
- `<folder>/` - <responsibility>
- `<folder>/` - <responsibility>
- Request flow: <controller> -> <service> -> <repository> -> <db>
- Reference feature to copy when adding new ones: `<path>`

## Conventions
- Language/framework versions: <...>
- Naming: <...>
- Error handling: <...>
- Dependency injection: <where services are registered>
- Tests: <framework, location, naming, builders/fixtures>
- Commits: Conventional Commits; branches `<type>/<ticket>-<slug>`

## Do / Don't
- DO <...>
- DON'T <add new libraries without approval / touch generated files in X / ...>

## Gotchas
- <non-obvious things that waste time: env vars, local certs, seed data, flaky areas>

## Crew workflow (dev-crew)
- New feature: `/feature <ticket>`
- Bug: `/fix-bug <error>`
- Before committing: `/review-code` then `/ship`
