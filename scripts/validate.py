#!/usr/bin/env python3
"""Validate the structure and frontmatter of agents, skills and commands.

Run: python scripts/validate.py
Exits non-zero if any problem is found. Standard library only.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NAME_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
VALID_TOOLS = {
    "Read", "Write", "Edit", "MultiEdit", "Grep", "Glob", "Bash", "WebFetch",
    "WebSearch", "NotebookEdit", "TodoWrite", "Task", "Agent",
}
VALID_MODELS = {"sonnet", "opus", "haiku", "inherit"}

errors: list[str] = []


def frontmatter(path: Path) -> dict[str, str] | None:
    text = path.read_text(encoding="utf-8")
    match = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n", text, re.DOTALL)
    if not match:
        errors.append(f"{path.relative_to(ROOT)}: missing YAML frontmatter")
        return None
    fields = {}
    for line in match.group(1).splitlines():
        if ":" in line and not line.startswith(" "):
            key, value = line.split(":", 1)
            fields[key.strip()] = value.strip().strip('"')
    if not text[match.end():].strip():
        errors.append(f"{path.relative_to(ROOT)}: empty body")
    return fields


def require(path: Path, fields: dict[str, str], *keys: str) -> None:
    for key in keys:
        if not fields.get(key):
            errors.append(f"{path.relative_to(ROOT)}: missing '{key}'")


def check_agents() -> int:
    files = sorted((ROOT / "agents").glob("*.md"))
    for path in files:
        fm = frontmatter(path)
        if fm is None:
            continue
        require(path, fm, "name", "description")
        if fm.get("name") != path.stem:
            errors.append(f"{path.relative_to(ROOT)}: name '{fm.get('name')}' != file name")
        if fm.get("model") and fm["model"] not in VALID_MODELS:
            errors.append(f"{path.relative_to(ROOT)}: unknown model '{fm['model']}'")
        for tool in filter(None, (t.strip() for t in fm.get("tools", "").split(","))):
            if tool not in VALID_TOOLS:
                errors.append(f"{path.relative_to(ROOT)}: unknown tool '{tool}'")
    return len(files)


def check_skills() -> int:
    dirs = sorted(p for p in (ROOT / "skills").iterdir() if p.is_dir())
    for skill_dir in dirs:
        path = skill_dir / "SKILL.md"
        if not path.exists():
            errors.append(f"{skill_dir.relative_to(ROOT)}: missing SKILL.md")
            continue
        fm = frontmatter(path)
        if fm is None:
            continue
        require(path, fm, "name", "description")
        name = fm.get("name", "")
        if name != skill_dir.name:
            errors.append(f"{path.relative_to(ROOT)}: name '{name}' != folder name")
        if not NAME_RE.match(name) or len(name) > 64:
            errors.append(f"{path.relative_to(ROOT)}: name must be kebab-case, <= 64 chars")
        if len(fm.get("description", "")) > 1024:
            errors.append(f"{path.relative_to(ROOT)}: description > 1024 chars")
    return len(dirs)


def check_commands() -> int:
    files = sorted((ROOT / "commands").glob("*.md"))
    for path in files:
        fm = frontmatter(path)
        if fm is not None:
            require(path, fm, "description")
    return len(files)


def check_manifests() -> None:
    for name in ("plugin.json", "marketplace.json"):
        path = ROOT / ".claude-plugin" / name
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            errors.append(f".claude-plugin/{name}: {exc}")


def check_references() -> None:
    """Every agent/skill named in backticks in commands and agents must exist."""
    agents = {p.stem for p in (ROOT / "agents").glob("*.md")}
    skills = {p.name for p in (ROOT / "skills").iterdir() if p.is_dir()}
    pattern = re.compile(r"`([a-z]+(?:-[a-z]+)+)` (?:subagent|agent|skill)")
    for path in list((ROOT / "commands").glob("*.md")) + list((ROOT / "agents").glob("*.md")):
        for ref in pattern.findall(path.read_text(encoding="utf-8")):
            if ref not in agents | skills:
                errors.append(f"{path.relative_to(ROOT)}: unknown reference '{ref}'")


def main() -> int:
    counts = (check_agents(), check_skills(), check_commands())
    check_manifests()
    check_references()
    if errors:
        print("\n".join(f"ERROR {e}" for e in errors))
        return 1
    print(f"OK: {counts[0]} agents, {counts[1]} skills, {counts[2]} commands")
    return 0


if __name__ == "__main__":
    sys.exit(main())
