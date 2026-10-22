#!/usr/bin/env python3
"""Validate dev-crew's agents, skills, hooks and manifests.

Claude Code silently ignores unknown frontmatter keys, so a typo such as `maxturns` or `efort`
would quietly disable a setting. This script turns those mistakes into CI failures, and also
enforces an always-on context budget.

Run: python scripts/validate.py     (standard library only)
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Approximate tokens that dev-crew may add to every session (model-visible descriptions plus
# the SessionStart rules). Raise deliberately, never accidentally.
ALWAYS_ON_BUDGET_TOKENS = 3000
CHARS_PER_TOKEN = 4
PER_ENTRY_OVERHEAD_TOKENS = 20  # calibrated against `claude plugin details` (listing formatting per entry)
MAX_LISTING_CHARS = 1536  # description + when_to_use are truncated beyond this in the skill listing

AGENT_FIELDS = {
    "name", "description", "tools", "disallowedTools", "model", "maxTurns", "skills", "memory",
    "background", "effort", "isolation", "color", "omitClaudeMd", "autoCompactWindow", "experimental",
}
AGENT_FIELDS_IGNORED_IN_PLUGINS = {"permissionMode", "mcpServers", "hooks", "initialPrompt"}
SKILL_FIELDS = {
    "name", "description", "when_to_use", "argument-hint", "arguments", "disable-model-invocation",
    "user-invocable", "allowed-tools", "disallowed-tools", "model", "effort", "context", "agent",
    "background", "hooks", "paths", "shell", "metadata", "license", "compatibility",
}
MODELS = {"sonnet", "opus", "haiku", "fable", "inherit"}
EFFORTS = {"low", "medium", "high", "xhigh", "max"}
TOOLS = {
    "Read", "Write", "Edit", "MultiEdit", "Grep", "Glob", "Bash", "PowerShell", "WebFetch",
    "WebSearch", "NotebookEdit", "TodoWrite", "Agent", "Task", "Skill",
}
HOOK_EVENTS = {
    "SessionStart", "Setup", "UserPromptSubmit", "UserPromptExpansion", "PreToolUse",
    "PermissionRequest", "PermissionDenied", "PostToolUse", "PostToolUseFailure", "PostToolBatch",
    "Notification", "MessageDisplay", "SubagentStart", "SubagentStop", "TaskCreated", "TaskCompleted",
    "Stop", "StopFailure", "TeammateIdle", "InstructionsLoaded", "ConfigChange", "CwdChanged",
    "DirectoryAdded", "FileChanged", "WorktreeCreate", "WorktreeRemove", "PreCompact", "PostCompact",
    "PreModelSwitch", "PostModelSwitch", "Elicitation", "ElicitationResult", "SessionEnd",
}
NAME_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")

errors: list[str] = []


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def parse_frontmatter(path: Path) -> tuple[dict, str] | None:
    """Parse the subset of YAML used here: `key: value` scalars and `key:` + `  - item` lists."""
    text = path.read_text(encoding="utf-8")
    match = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n", text, re.DOTALL)
    if not match:
        errors.append(f"{rel(path)}: missing YAML frontmatter")
        return None
    fields: dict = {}
    current_list = None
    for line in match.group(1).splitlines():
        if not line.strip():
            continue
        item = re.match(r"^\s+-\s+(.*)$", line)
        if item and current_list is not None:
            current_list.append(item.group(1).strip())
            continue
        pair = re.match(r"^([A-Za-z_][\w-]*):\s*(.*)$", line)
        if not pair:
            errors.append(f"{rel(path)}: unparseable frontmatter line: {line!r}")
            continue
        key, raw = pair.group(1), pair.group(2).strip()
        if raw == "":
            current_list = fields[key] = []
            continue
        current_list = None
        if raw.startswith('"'):
            if not raw.endswith('"') or len(raw) < 2:
                errors.append(f"{rel(path)}: unterminated quoted value for '{key}'")
            value = raw[1:-1].replace('\\"', '"').replace("\\\\", "\\")
        else:
            if ": " in raw or raw.endswith(":"):
                errors.append(f"{rel(path)}: value of '{key}' contains ': ' and must be quoted (invalid YAML)")
            value = raw
        fields[key] = value
    body = text[match.end():]
    if not body.strip():
        errors.append(f"{rel(path)}: empty body")
    return fields, body


def check_fields(path: Path, fields: dict, allowed: set[str], ignored: set[str] = frozenset()) -> None:
    for key in fields:
        if key in ignored:
            errors.append(f"{rel(path)}: '{key}' is ignored for plugin agents; remove it")
        elif key not in allowed:
            errors.append(f"{rel(path)}: unknown frontmatter key '{key}' (typo?)")


def check_common(path: Path, fields: dict, expected_name: str) -> None:
    for key in ("name", "description"):
        if not fields.get(key):
            errors.append(f"{rel(path)}: missing '{key}'")
    name = fields.get("name", "")
    if name != expected_name:
        errors.append(f"{rel(path)}: name '{name}' must match '{expected_name}'")
    if not NAME_RE.match(name) or len(name) > 64:
        errors.append(f"{rel(path)}: name must be kebab-case, <= 64 chars")
    if "model" in fields and fields["model"] not in MODELS:
        errors.append(f"{rel(path)}: unknown model '{fields['model']}'")
    if "effort" in fields and fields["effort"] not in EFFORTS:
        errors.append(f"{rel(path)}: unknown effort '{fields['effort']}'")


def load_skills() -> dict[str, dict]:
    skills = {}
    for skill_dir in sorted(p for p in (ROOT / "skills").iterdir() if p.is_dir()):
        path = skill_dir / "SKILL.md"
        if not path.exists():
            errors.append(f"{rel(skill_dir)}: missing SKILL.md")
            continue
        parsed = parse_frontmatter(path)
        if parsed is None:
            continue
        fields, _ = parsed
        check_fields(path, fields, SKILL_FIELDS)
        check_common(path, fields, skill_dir.name)
        for flag in ("disable-model-invocation", "user-invocable"):
            if flag in fields and fields[flag] not in ("true", "false"):
                errors.append(f"{rel(path)}: '{flag}' must be true or false")
        listing = len(fields.get("description", "")) + len(fields.get("when_to_use", ""))
        if listing > MAX_LISTING_CHARS:
            errors.append(f"{rel(path)}: description + when_to_use is {listing} chars (> {MAX_LISTING_CHARS})")
        lines = path.read_text(encoding="utf-8").count("\n")
        if lines > 500:
            errors.append(f"{rel(path)}: {lines} lines; keep SKILL.md under 500 and move detail to references/")
        skills[skill_dir.name] = fields
    return skills


def load_agents(skills: dict[str, dict]) -> dict[str, dict]:
    agents = {}
    for path in sorted((ROOT / "agents").glob("*.md")):
        parsed = parse_frontmatter(path)
        if parsed is None:
            continue
        fields, _ = parsed
        check_fields(path, fields, AGENT_FIELDS, AGENT_FIELDS_IGNORED_IN_PLUGINS)
        check_common(path, fields, path.stem)
        for tool in filter(None, (t.strip() for t in str(fields.get("tools", "")).split(","))):
            if tool not in TOOLS:
                errors.append(f"{rel(path)}: unknown tool '{tool}'")
        if "maxTurns" in fields and not str(fields["maxTurns"]).isdigit():
            errors.append(f"{rel(path)}: maxTurns must be a positive integer")
        preload = fields.get("skills", [])
        if not isinstance(preload, list):
            errors.append(f"{rel(path)}: 'skills' must be a YAML list")
            preload = []
        if len(preload) > 32:
            errors.append(f"{rel(path)}: at most 32 preloaded skills")
        for skill in preload:
            if skill not in skills:
                errors.append(f"{rel(path)}: preloads unknown skill '{skill}'")
            elif skills[skill].get("disable-model-invocation") == "true":
                errors.append(f"{rel(path)}: cannot preload '{skill}' (disable-model-invocation blocks preloading)")
        if "evidence-protocol" not in preload:
            errors.append(f"{rel(path)}: every agent must preload 'evidence-protocol'")
        agents[path.stem] = fields
    return agents


def check_collisions(skills: dict) -> None:
    commands_dir = ROOT / "commands"
    if commands_dir.exists():
        for command in commands_dir.glob("*.md"):
            if command.stem in skills:
                errors.append(f"{rel(command)}: collides with skill '{command.stem}' (the skill wins)")


def check_references(agents: dict, skills: dict) -> None:
    """Backticked names followed by 'agent'/'subagent'/'skill' must exist."""
    pattern = re.compile(r"`([a-z]+(?:-[a-z]+)+)` (?:subagent|agent|skill)")
    known = set(agents) | set(skills)
    for path in list((ROOT / "agents").glob("*.md")) + list((ROOT / "skills").glob("*/SKILL.md")):
        for ref in pattern.findall(path.read_text(encoding="utf-8")):
            if ref not in known:
                errors.append(f"{rel(path)}: unknown reference '{ref}'")


def check_hooks() -> int:
    path = ROOT / "hooks" / "hooks.json"
    if not path.exists():
        return 0
    try:
        config = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        errors.append(f"hooks/hooks.json: {exc}")
        return 0
    count = 0
    for event, matchers in config.get("hooks", {}).items():
        if event not in HOOK_EVENTS:
            errors.append(f"hooks/hooks.json: unknown event '{event}'")
        for matcher in matchers:
            for hook in matcher.get("hooks", []):
                count += 1
                for arg in hook.get("args", []):
                    if "${CLAUDE_PLUGIN_ROOT}" in arg:
                        script = ROOT / arg.replace("${CLAUDE_PLUGIN_ROOT}/", "")
                        if not script.exists():
                            errors.append(f"hooks/hooks.json: script not found: {arg}")
    return count


def check_manifests() -> None:
    manifests = {}
    for name in ("plugin.json", "marketplace.json"):
        path = ROOT / ".claude-plugin" / name
        try:
            manifests[name] = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            errors.append(f".claude-plugin/{name}: {exc}")
    if len(manifests) == 2:
        version = manifests["plugin.json"].get("version")
        market = manifests["marketplace.json"]
        versions = {market.get("metadata", {}).get("version")} | {p.get("version") for p in market.get("plugins", [])}
        if versions != {version}:
            errors.append(f"version mismatch: plugin.json {version} vs marketplace.json {sorted(map(str, versions))}")


def always_on_tokens(agents: dict, skills: dict) -> int:
    chars = 0
    entries = 0
    for name, fields in skills.items():
        if fields.get("disable-model-invocation") != "true":
            chars += len(name) + len(fields.get("description", "")) + len(fields.get("when_to_use", ""))
            entries += 1
    for name, fields in agents.items():
        chars += len(name) + len(fields.get("description", ""))
        entries += 1
    rules = ROOT / "hooks" / "session-rules.js"
    if rules.exists():
        rules_text = re.findall(r"'([^']*)'", rules.read_text(encoding="utf-8").split("RULES = [", 1)[-1].split("]", 1)[0])
        chars += sum(len(line) for line in rules_text)
    return chars // CHARS_PER_TOKEN + entries * PER_ENTRY_OVERHEAD_TOKENS


def main() -> int:
    skills = load_skills()
    agents = load_agents(skills)
    check_collisions(skills)
    check_references(agents, skills)
    hook_count = check_hooks()
    check_manifests()
    tokens = always_on_tokens(agents, skills)
    if tokens > ALWAYS_ON_BUDGET_TOKENS:
        errors.append(f"always-on context ~{tokens} tokens exceeds budget {ALWAYS_ON_BUDGET_TOKENS}")
    if errors:
        print("\n".join(f"ERROR {e}" for e in errors))
        return 1
    workflows = sum(1 for f in skills.values() if f.get("disable-model-invocation") == "true")
    print(
        f"OK: {len(agents)} agents, {len(skills) - workflows} skills, {workflows} workflow commands, "
        f"{hook_count} hooks; always-on ~{tokens}/{ALWAYS_ON_BUDGET_TOKENS} tokens"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
