---
description: Two independent dimensions of variation (message type × channel) should lead to Bridge / composition instead of a subclass explosion.
tags: [design, patterns]
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill, Agent]
---

Our notification module (Java 21, Spring Boot) has these classes today:

```
EmailAlertNotification, SmsAlertNotification, PushAlertNotification,
EmailReminderNotification, SmsReminderNotification, PushReminderNotification,
EmailDigestNotification, SmsDigestNotification, PushDigestNotification
```

Each one extends `Notification` and duplicates formatting and sending code. Next quarter we add Slack and Microsoft Teams channels, and a new "invoice due" notification type. How should we restructure this? Name the design pattern you'd use and show the shape of the classes.
