# Contributing

Thanks for helping make Claude a better engineering teammate! 🎉

## What we're looking for
- New **skills** for common engineering tasks (e.g. GraphQL design, Kubernetes troubleshooting, accessibility audits, mobile release, data pipelines)
- Language/framework-specific improvements to existing skills
- Better **agent prompts**: clearer process, fewer false positives, better output formats
- New **workflow commands** that chain agents for a real daily task
- New **eval cases**, especially for every bug report where dev-crew gave wrong or unsafe advice
- New **guardrail rules**, with tests for both what they block and what they must allow
- Bug reports where an agent or skill produced wrong or unsafe guidance

## Conventions
- **Agents** (`agents/<name>.md`): `name` (= file name), a quoted `description` saying *when* to use it, least-privilege `tools`, `model`, `effort`, `maxTurns`, and `skills` (a list that **must include `evidence-protocol`**). Body: role, process, rules, output format.
- **Knowledge skills** (`skills/<name>/SKILL.md`): `name` (= folder name, kebab-case) and a quoted, **short** `description` (what + when, ideally under 200 characters, since every word is paid in every session). Keep `SKILL.md` under 500 lines; put long references in `references/` next to it.
- **Workflow commands** are skills with `disable-model-invocation: true`, plus optional `argument-hint`, `allowed-tools`, `model`, `effort`. Use `$ARGUMENTS`. Workflows orchestrate; knowledge belongs in knowledge skills.
- **Hooks** (`hooks/*.js`): Node built-ins only, fail open on unexpected input, and come with tests in `hooks/test/`.
- Stack-agnostic first: tell the agent to follow the project's conventions, then give defaults.
- Safety: nothing may commit, push, tag, publish, delete or deploy without explicit user confirmation.

## Before opening a PR
```bash
python scripts/validate.py              # structure, frontmatter typos, collisions, token budget
node --test "hooks/test/*.test.js"      # guardrail tests
claude plugin validate .                # Claude Code's own manifest checks
claude plugin eval . --case <your-case> --runs 1   # if you changed agent/skill behaviour (uses your account)
```
Test your change in a real repository with Claude Code and describe what you tried in the PR.

## Commit messages
[Conventional Commits](https://www.conventionalcommits.org/): `feat(skills): add graphql-design skill`.
