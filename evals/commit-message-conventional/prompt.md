---
description: Commit messages must follow Conventional Commits with an imperative subject and a body explaining why.
tags: [git]
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Write the commit message for this change. Output only the commit message.

- Fixed a bug where bookings could exceed event capacity: the availability check now compares booked + requested seats with capacity.
- Added a regression test for booking 10 seats when only 1 is left.
- Ticket: EVT-212
