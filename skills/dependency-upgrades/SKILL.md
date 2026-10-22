---
name: dependency-upgrades
description: Safely upgrade dependencies, frameworks and runtimes (e.g. .NET 8->9, Node 20->22, Spring Boot 2->3, React 18->19, Angular, Flutter, Python) - audit outdated/vulnerable packages, read changelogs for breaking changes, upgrade incrementally and verify. Use when updating packages, fixing vulnerable dependencies, or migrating major framework versions.
---

# Dependency upgrades

## 1. Inventory
| Ecosystem | Outdated | Vulnerable |
|---|---|---|
| npm/pnpm/yarn | `npm outdated` | `npm audit` |
| .NET | `dotnet list package --outdated` | `dotnet list package --vulnerable --include-transitive` |
| Python | `pip list --outdated` / `uv pip list --outdated` | `pip-audit` |
| Java (Gradle/Maven) | `gradle dependencyUpdates` / `mvn versions:display-dependency-updates` | OWASP dependency-check |
| Go | `go list -u -m all` | `govulncheck ./...` |
| Flutter/Dart | `flutter pub outdated` | - |
| Rust | `cargo outdated` | `cargo audit` |

## 2. Prioritise
1. Known vulnerabilities (by severity and reachability)
2. Runtime/framework end-of-life dates
3. Packages blocking other upgrades
4. Everything else, batched

## 3. Research breaking changes
For each **major** bump: read the CHANGELOG / release notes / official migration guide between current and target version. List breaking changes that affect this codebase (grep for the affected APIs). Check for official codemods/upgrade assistants (e.g. `dotnet upgrade-assistant`, `ng update`, `npx @next/codemod`, OpenRewrite for Java).

## 4. Upgrade incrementally
- One major upgrade per commit/PR; patches/minors can be batched.
- For multi-major jumps, step through each major version.
- Update lock files with the package manager - never by hand.
- Fix compile errors, then deprecation warnings, then behavioural changes.

## 5. Verify
- [ ] Clean build with no new warnings
- [ ] Full test suite green
- [ ] App starts; smoke-test key flows
- [ ] Transitive dependency conflicts resolved (no duplicate major versions where it matters)
- [ ] Bundle size / startup time not regressed
- [ ] Docker base images and CI toolchain versions updated consistently

## Report
Table of `package | from | to | breaking changes handled | notes`, plus anything deferred and why.
