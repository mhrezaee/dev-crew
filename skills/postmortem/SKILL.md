---
name: postmortem
description: "Write a blameless incident postmortem with timeline, 5-whys root cause and action items"
argument-hint: <incident summary, notes, logs or chat export path>
disable-model-invocation: true
---

Using the `incident-response` skill, write a blameless postmortem for:

$ARGUMENTS

1. Build the timeline from the provided notes/logs (and from `git log` around the incident window if a deploy is involved). Use UTC.
2. Quantify the impact as precisely as the data allows; mark estimates as such.
3. Run a 5-whys analysis to a systemic root cause; list contributing factors.
4. If the root cause is in this codebase, delegate to `debugger` to confirm it with file:line evidence.
5. Propose action items classified as prevent / detect / mitigate, each with a suggested owner role and priority.

Save to `docs/postmortems/YYYY-MM-DD-<slug>.md` after showing the draft to the user. Use neutral, blameless language throughout - no individual names as causes.
