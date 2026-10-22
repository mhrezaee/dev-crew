---
description: Undo/redo across many editor operations should lead to Command (with Memento or inverse operations), justified by the forces.
tags: [design, patterns]
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill, Agent]
---

We're building a web-based diagram editor in TypeScript (React + a canvas renderer). Users can add, move, resize, recolour, group and delete shapes, and paste whole selections. Product now wants unlimited undo/redo, plus a history panel listing recent actions ("Moved 3 shapes", "Changed colour to red"). Later we may add collaborative editing.

Today every toolbar button directly mutates the shape objects in the store. Which design pattern(s) should we use for undo/redo, and how would you structure it? Be concrete and keep it as simple as the requirements allow.
