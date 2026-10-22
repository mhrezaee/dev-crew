'use strict';

// Shared helpers for dev-crew hook scripts. No dependencies: Node built-ins only.

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(''));
  });
}

function guardsDisabled() {
  return String(process.env.DEV_CREW_GUARD || '').toLowerCase() === 'off';
}

// decision: { action: 'deny' | 'ask', reason: string } or null (no opinion).
function emitPreToolUse(decision) {
  if (!decision) return;
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: decision.action,
      permissionDecisionReason: `[dev-crew guard] ${decision.reason}`,
    },
  }));
}

// Runs a PreToolUse guard. Any unexpected input or error means "no opinion" (exit 0, no output),
// so a guard bug can never block normal work; it can only miss a case.
async function runPreToolUseGuard(evaluate) {
  try {
    if (guardsDisabled()) return;
    const input = JSON.parse(await readStdin());
    emitPreToolUse(evaluate(input.tool_name, input.tool_input || {}));
  } catch {
    // fail open
  }
}

module.exports = { readStdin, guardsDisabled, emitPreToolUse, runPreToolUseGuard };
