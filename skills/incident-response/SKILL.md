---
name: incident-response
description: "Incident triage, mitigation-first response, status updates and blameless postmortems. Use during or after outages."
---

# Incident response

## During the incident - mitigate first, investigate later
1. **Assess severity**
   | Sev | Definition | Response |
   |---|---|---|
   | SEV1 | Core service down / data loss / security breach | all hands, updates every 30 min |
   | SEV2 | Major feature degraded for many users | on-call + owner, updates hourly |
   | SEV3 | Minor feature degraded, workaround exists | business hours |
2. **Assign roles**: incident commander, investigator(s), communicator.
3. **Stop the bleeding** - fastest safe mitigation: rollback the last deploy, toggle the feature flag off, scale out, fail over, block the abusive client, restore from backup.
4. **Investigate** with evidence: dashboards, error rates by version/region, recent deploys/config changes, logs by traceId, dependency status pages.
5. **Communicate** using the template below. Timestamp every action in the incident log.

### Status update template
```
[SEV2][Investigating] Checkout payments failing for ~30% of users
Impact: Card payments fail with error PAY-500 since 14:05 UTC. PayPal unaffected.
Current action: Rolling back release 4.12.0 (started 14:22).
Next update: 14:50 UTC or sooner.
```

## After the incident - blameless postmortem (within 5 working days)
```markdown
# Postmortem: <title>
- Date / duration: 2026-10-22 14:05 - 15:10 UTC (65 min)
- Severity: SEV2
- Authors:
- Status: Draft | Reviewed

## Summary
2-3 sentences: what happened, impact, how it was resolved.

## Impact
Users affected, requests failed, revenue/SLA impact, data impact.

## Timeline (UTC)
| Time | Event |
| 14:05 | Release 4.12.0 deployed |
| 14:09 | Alert: payment error rate > 5% |
| ... | ... |

## Root cause
Technical explanation. Use 5 whys to reach the systemic cause.

## Contributing factors
Detection gaps, missing tests, process issues, documentation.

## What went well / what went poorly / where we got lucky

## Action items
| Action | Type (prevent/detect/mitigate) | Owner | Due | Ticket |
```

## Principles
- Blameless: focus on systems and processes, not individuals. "Why did the system allow this?"
- Every action item has an owner, due date and ticket. Prefer automated safeguards over "be more careful".
