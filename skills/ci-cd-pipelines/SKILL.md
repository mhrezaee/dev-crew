---
name: ci-cd-pipelines
description: Design, write, debug and harden CI/CD pipelines (GitHub Actions, Azure DevOps, GitLab CI) - stage layout, caching, test reporting, artifact promotion, environment approvals, secrets and supply-chain security. Use when creating or fixing a pipeline, a build fails only in CI, or when speeding up or securing CI.
---

# CI/CD pipelines

## Reference stage layout
```
PR / push:  checkout -> setup toolchain (pinned) -> restore (cached) -> lint/format check
            -> build -> unit tests (+coverage) -> integration tests (containers)
            -> SAST / dependency audit / secret scan -> package artifact
main:       ... -> publish artifact (versioned, immutable) -> deploy dev -> smoke test
            -> deploy staging -> e2e -> [manual approval] -> deploy prod -> smoke test -> notify
```
Build once; promote the **same** artifact through environments with environment-specific config.

## GitHub Actions template
```yaml
name: ci
on:
  pull_request:
  push:
    branches: [main]
permissions:
  contents: read
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
jobs:
  build-test:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test -- --coverage
```
Adapt the setup step: `actions/setup-dotnet` + `dotnet restore/build/test`, `actions/setup-java` + Gradle cache, `actions/setup-python` + `pip`/`uv` cache, `actions/setup-go`.

## Speed
- Cache package managers and build outputs; key on lock-file hash.
- Run independent jobs in parallel; split slow test suites (sharding/matrix).
- Use path filters for monorepos; cancel superseded runs (`concurrency`).
- Fail fast: cheap checks (lint, format) first.

## Security
- Minimal `permissions:` per workflow/job; OIDC to clouds instead of long-lived keys.
- Pin third-party actions to a commit SHA; enable Dependabot/Renovate for them.
- Never run untrusted PR code with secrets (`pull_request_target` caution).
- Secret scanning (gitleaks), dependency audit, SAST (CodeQL/Semgrep), container scan (Trivy), SBOM generation.

## Debugging a red pipeline
1. Read the log from the **first** error, not the last.
2. Same toolchain versions locally? (`.nvmrc`, `global.json`, `.tool-versions`)
3. Differences: clean checkout (no ignored local files), case-sensitive FS, time zone/locale, missing env vars/secrets, parallelism, resource limits.
4. Flaky? Re-run once to confirm, then fix the root cause - don't add blind retries.
