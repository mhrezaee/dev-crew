'use strict';

// SessionStart hook: adds a short set of evidence rules to the main conversation, so the main agent
// follows the same standard as the dev-crew subagents. Disable with DEV_CREW_SESSION_RULES=off.

const RULES = [
  'dev-crew engineering rules for this session:',
  '1. Back claims about the code with file:line; never describe code you have not read.',
  '2. Say tests pass, a build succeeds or a bug is fixed only after running it in this session, and quote the result.',
  '3. Label unchecked statements as ASSUMPTION and say how to confirm them.',
  '4. Never commit, push, tag, publish, deploy or delete data without explicit user confirmation.',
].join('\n');

function main() {
  if (String(process.env.DEV_CREW_SESSION_RULES || '').toLowerCase() === 'off') return;
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: RULES },
  }));
}

if (require.main === module) main();

module.exports = { RULES };
