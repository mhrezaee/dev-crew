# Security and trust

dev-crew is built so that a company can review it in an afternoon and know exactly what it does.

## What dev-crew is
- **Plain Markdown** agents and skills, which are instructions for Claude, plus three small **Node.js hook scripts** (`hooks/*.js`, no dependencies).
- **No network calls, no telemetry, no analytics, no MCP servers.** Nothing leaves your machine because of dev-crew.
- **No secrets** are read, stored or required.

## What the hooks do
Hooks run inside Claude Code, outside the model, so the model cannot talk its way past them. The code is in [`hooks/`](hooks/) with 70+ unit and end-to-end tests in [`hooks/test/`](hooks/test/).

| Hook | Event | Behaviour |
|---|---|---|
| `guard-shell.js` | Before every Bash / PowerShell command | **Deny**: recursive delete of `/`, `~`, `$HOME`, system directories or a drive root; `mkfs`; `dd` onto a disk; fork bombs; `format C:`. **Ask you first**: force push (except `--force-with-lease`), `git reset --hard`, `git clean -f`, `git branch -D`, discarding all changes, history rewrites, `terraform destroy` / `apply -auto-approve`, `kubectl delete`, `helm uninstall`, Docker volume pruning, package publishing, `curl ... \| sh`, `DROP`/`TRUNCATE` sent to a database client, `rm -rf .` / `*`. |
| `guard-secrets.js` | Before every Write / Edit / MultiEdit / NotebookEdit | **Asks you first** when the new content contains a credential-shaped string (AWS, GitHub, Slack, Stripe, Google, Anthropic, OpenAI and Azure keys, private keys, connection strings with passwords). Local `.env` / `.env.local` files are allowed; templates such as `.env.example` are not. Obvious placeholders (`EXAMPLE`, `changeme`, ...) are ignored. |
| `session-rules.js` | Session start | Adds about 100 tokens of evidence rules to the main conversation (cite file:line, verify before claiming success, label assumptions, never push or publish without confirmation). |

### Design choices you should know
- **Fail-open.** If Node.js is missing, the input is malformed, or a guard has a bug, the hook allows the action instead of blocking your work (`"onFailure": "continue"`). The guards are a safety net on top of Claude Code's own permission system, not a replacement for it.
- **Pattern-based.** The guards catch common dangerous forms, not every possible obfuscation. Keep using Claude Code's permission modes and review prompts.
- **"Ask" means you decide.** Nothing in the ask list is forbidden. You'll simply be prompted, even in auto-accept modes.

### Turning things off
| Variable | Effect |
|---|---|
| `DEV_CREW_GUARD=off` | Disables `guard-shell` and `guard-secrets` |
| `DEV_CREW_SESSION_RULES=off` | Disables the session-start rules |

Or disable the whole plugin: `/plugin disable dev-crew`.

## Agent permissions
- Review and audit agents (`code-reviewer`, `security-auditor`, `architecture-reviewer`, `tech-lead`, `product-analyst`) have **no Write/Edit tools**.
- Every agent preloads the [evidence protocol](skills/evidence-protocol/SKILL.md), which forbids committing, pushing, tagging, publishing, deploying or deleting data without your explicit confirmation.
- Plugin agents cannot change permission modes or define their own hooks or MCP servers. Claude Code ignores those fields for plugins, and our validator rejects them.

## Reporting a vulnerability
Please open a [private security advisory](https://github.com/mhrezaee/dev-crew/security/advisories/new) rather than a public issue. Include the hook or file, the input that bypasses or misbehaves, and the impact.
