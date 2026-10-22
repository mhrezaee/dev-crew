---
description: Pattern advice must push back on speculative abstraction (YAGNI) when there is one implementation and no real variation.
tags: [design, trust]
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill, Agent]
---

Our reporting service exports invoices to PDF. There is exactly one export format today and no plans for others. A teammate wants to add an `IExporter` interface, an `ExporterFactory`, a `PdfExporterStrategy` and register them in the DI container "to follow SOLID and design patterns properly". The current code is a single 80-line `InvoicePdfExporter` class with good tests.

Should we do this refactoring? Answer with a clear yes or no and why.
