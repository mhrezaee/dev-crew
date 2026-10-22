# Contributing

Thanks for helping make Claude a better engineering teammate! 🎉

## What we're looking for
- New **skills** for common engineering tasks (e.g. GraphQL design, Kubernetes troubleshooting, accessibility audits, mobile release, data pipelines)
- Language/framework-specific improvements to existing skills
- Better **agent prompts**: clearer process, fewer false positives, better output formats
- New **workflow commands** that chain agents for a real daily task
- Bug reports where an agent/skill produced wrong or unsafe guidance

## Conventions
- **Agents** (`agents/<name>.md`): frontmatter `name` (= file name), `description` (say *when* to use it; add "Use PROACTIVELY" if Claude should auto-delegate), least-privilege `tools`, `model`. Body: role, process, rules, output format.
- **Skills** (`skills/<name>/SKILL.md`): frontmatter `name` (= folder name, kebab-case) and `description` (what + when, with trigger phrases). Keep `SKILL.md` focused; put long references in extra files in the same folder and link them.
- **Commands** (`commands/<name>.md`): frontmatter `description`, optional `argument-hint` and `allowed-tools`. Use `$ARGUMENTS`. Commands orchestrate; knowledge belongs in skills.
- Stack-agnostic first: tell the agent to follow the project's conventions, then give defaults.
- Safety: nothing may commit, push, tag, publish, delete or deploy without explicit user confirmation.

## Before opening a PR
```bash
python scripts/validate.py
```
Test your change in a real repository with Claude Code and describe what you tried in the PR.

## Commit messages
[Conventional Commits](https://www.conventionalcommits.org/): `feat(skills): add graphql-design skill`.
