'use strict';

// End-to-end: run each hook script the way Claude Code does (JSON on stdin) and check stdout.

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const HOOKS = path.join(__dirname, '..');

function run(script, input, env = {}) {
  const result = spawnSync(process.execPath, [path.join(HOOKS, script)], {
    input: typeof input === 'string' ? input : JSON.stringify(input),
    env: { ...process.env, DEV_CREW_GUARD: '', DEV_CREW_SESSION_RULES: '', ...env },
    encoding: 'utf8',
  });
  return { code: result.status, stdout: result.stdout, decision: result.stdout ? JSON.parse(result.stdout) : null };
}

const bash = (command) => ({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command } });

test('guard-shell emits a deny decision for catastrophic commands', () => {
  const { code, decision } = run('guard-shell.js', bash('rm -rf /'));
  assert.equal(code, 0);
  assert.equal(decision.hookSpecificOutput.hookEventName, 'PreToolUse');
  assert.equal(decision.hookSpecificOutput.permissionDecision, 'deny');
  assert.match(decision.hookSpecificOutput.permissionDecisionReason, /^\[dev-crew guard\]/);
});

test('guard-shell emits ask for a force push', () => {
  assert.equal(run('guard-shell.js', bash('git push --force')).decision.hookSpecificOutput.permissionDecision, 'ask');
});

test('guard-shell stays silent for safe commands', () => {
  const { code, stdout } = run('guard-shell.js', bash('npm test'));
  assert.equal(code, 0);
  assert.equal(stdout, '');
});

test('DEV_CREW_GUARD=off disables the guards', () => {
  assert.equal(run('guard-shell.js', bash('rm -rf /'), { DEV_CREW_GUARD: 'off' }).stdout, '');
});

test('malformed input fails open (no output, exit 0)', () => {
  const { code, stdout } = run('guard-shell.js', 'not json');
  assert.equal(code, 0);
  assert.equal(stdout, '');
});

test('guard-secrets emits ask for a key written to source', () => {
  const input = { tool_name: 'Write', tool_input: { file_path: 'a.js', content: 'k = "AKIA' + 'QWERTYUIOPASDFGH"' } };
  assert.equal(run('guard-secrets.js', input).decision.hookSpecificOutput.permissionDecision, 'ask');
});

test('session-rules adds the evidence rules as context', () => {
  const { decision } = run('session-rules.js', { hook_event_name: 'SessionStart', source: 'startup' });
  assert.equal(decision.hookSpecificOutput.hookEventName, 'SessionStart');
  assert.match(decision.hookSpecificOutput.additionalContext, /file:line/);
});

test('DEV_CREW_SESSION_RULES=off disables the session rules', () => {
  assert.equal(run('session-rules.js', {}, { DEV_CREW_SESSION_RULES: 'off' }).stdout, '');
});

test('hooks.json references only scripts that exist', () => {
  const config = JSON.parse(fs.readFileSync(path.join(HOOKS, 'hooks.json'), 'utf8'));
  const scripts = Object.values(config.hooks).flat().flatMap((m) => m.hooks).flatMap((h) => h.args || []);
  assert.ok(scripts.length >= 3);
  for (const arg of scripts) {
    const file = arg.replace('${CLAUDE_PLUGIN_ROOT}', path.join(HOOKS, '..'));
    assert.ok(fs.existsSync(file), `missing hook script: ${arg}`);
  }
});
