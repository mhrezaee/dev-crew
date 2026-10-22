#!/usr/bin/env python3
"""Prove the pattern-coverage claims in the README.

Every required pattern, style, practice and principle must have its own heading in one of the
catalogue files, with a substantive entry (not just a mention). Run: python scripts/check_coverage.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATALOGUES = [
    "skills/design-patterns/references/gof-catalog.md",
    "skills/architecture-selection/references/architecture-styles.md",
    "skills/architecture-selection/references/ui-patterns.md",
    "skills/architecture-selection/references/paradigms-and-practices.md",
    "skills/microservices-patterns/references/cloud-patterns.md",
    "skills/clean-code/references/principles-and-laws.md",
]
MIN_ENTRY_CHARS = 150

# group -> required entries; "A|B" means any alias may appear in the heading.
REQUIRED = {
    "GoF design patterns": [
        "Abstract Factory", "Builder", "Factory Method", "Prototype", "Singleton", "Adapter", "Bridge",
        "Composite", "Decorator", "Facade", "Flyweight", "Proxy", "Chain of Responsibility", "Command",
        "Interpreter", "Iterator", "Mediator", "Memento", "Observer", "State", "Strategy", "Template Method",
        "Visitor",
    ],
    "Architecture styles": [
        "Monolithic Architecture", "Modular Monolith", "Microservices Architecture", "Service-Oriented Architecture",
        "Serverless Architecture", "Client-Server", "Peer-to-Peer", "Master-Slave", "Space-Based", "Layered",
        "Hexagonal", "Onion Architecture", "Clean Architecture", "Microkernel", "Event-Driven Architecture",
        "Publish-Subscribe", "CQRS", "Event Sourcing", "Pipes and Filters", "Broker",
    ],
    "UI and presentation": ["MVC", "MVP", "MVVM", "Backends for Frontends", "MVI"],
    "Cloud and resilience": [
        "API Gateway", "Circuit Breaker", "Bulkhead", "Sidecar", "Strangler Fig", "Saga", "Outbox", "Retry",
        "Throttling", "Ambassador", "Cache-Aside", "Federated Identity",
    ],
    "Methodologies and paradigms": [
        "Domain-Driven Design", "Test-Driven Development", "Behavior-Driven Development", "GitOps", "DevOps",
        "Object-Oriented Programming", "Functional Programming", "Reactive Programming", "Twelve-Factor",
    ],
    "Principles, laws and theorems": [
        "SOLID", "DRY", "KISS", "YAGNI", "CAP Theorem", "PACELC", "Conway's Law", "Law of Demeter",
        "Fallacies of Distributed Computing",
    ],
}


def load_entries() -> list[tuple[str, str, str]]:
    """Return (file, heading, body) for every ###-level heading in the catalogues."""
    entries = []
    for rel in CATALOGUES:
        path = ROOT / rel
        if not path.exists():
            print(f"ERROR missing catalogue {rel}")
            sys.exit(1)
        parts = re.split(r"^### +(.+)$", path.read_text(encoding="utf-8"), flags=re.MULTILINE)
        for i in range(1, len(parts), 2):
            body = re.split(r"^## ", parts[i + 1], maxsplit=1, flags=re.MULTILINE)[0]
            entries.append((rel, parts[i].strip(), body.strip()))
    return entries


def find(entries, name: str):
    for rel, heading, body in entries:
        if any(re.search(rf"(^|[\s(/]){re.escape(alias)}\b", heading, re.IGNORECASE) for alias in name.split("|")):
            return rel, heading, body
    return None


def main() -> int:
    entries = load_entries()
    problems = []
    total = 0
    for group, names in REQUIRED.items():
        for name in names:
            total += 1
            hit = find(entries, name)
            if hit is None:
                problems.append(f"{group}: no catalogue entry for '{name}'")
            elif len(hit[2]) < MIN_ENTRY_CHARS:
                problems.append(f"{group}: entry '{hit[1]}' in {hit[0]} is too thin ({len(hit[2])} chars)")
        print(f"{group}: {len(names)} required")
    beyond = sum(1 for _, heading, _ in entries if "(beyond)" in heading)
    if problems:
        print("\n".join(f"ERROR {p}" for p in problems))
        return 1
    print(f"OK: all {total} required entries covered; {len(entries)} catalogue entries in total, {beyond} marked 'beyond'")
    return 0


if __name__ == "__main__":
    sys.exit(main())
