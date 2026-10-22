---
description: A stable core extended by partner-contributed, country-specific rule packs should lead to a microkernel / plug-in architecture with a versioned contract.
tags: [architecture]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill, Agent]
---

We sell a payroll calculation engine (.NET 9) used by companies in 14 countries. The core calculation flow (gross → deductions → net, payslip generation, audit trail) is stable and owned by our core team of 5 developers. Every country has its own tax and social-security rules that change several times a year. Local partner companies in each country want to build and ship the rules for their country themselves, on their own schedule, without access to our core source code. Customers sometimes need custom rules too.

What architecture should we use for this product? Give a clear recommendation and the key design elements.
