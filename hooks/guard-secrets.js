'use strict';

// PreToolUse guard for Write, Edit, MultiEdit and NotebookEdit.
// ASK before a credential-shaped string is written into a file. Local secret files (.env, .env.local)
// are allowed; templates such as .env.example are not.

const path = require('path');
const { runPreToolUseGuard } = require('./lib');

const SECRET_PATTERNS = [
  ['AWS access key', /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/],
  ['private key', /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP |ENCRYPTED )?PRIVATE KEY-----/],
  ['GitHub token', /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}\b|\bgithub_pat_[A-Za-z0-9_]{60,}\b/],
  ['Slack token', /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  ['Stripe live key', /\b(?:sk|rk)_live_[A-Za-z0-9]{20,}/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['Anthropic API key', /\bsk-ant-[A-Za-z0-9_-]{20,}/],
  ['OpenAI API key', /\bsk-(?:proj-)?[A-Za-z0-9_-]{40,}/],
  ['Azure storage key', /AccountKey=[A-Za-z0-9+/]{80,}={0,2}/],
  ['connection string with password', /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|amqps?):\/\/[^\s:/@]+:[^\s@/]{6,}@/],
];

const PLACEHOLDER = /EXAMPLE|example|XXXX|xxxx|dummy|DUMMY|fake|FAKE|placeholder|PLACEHOLDER|changeme|your[-_]?(?:key|token|password)/;
const LOCAL_SECRET_FILE = /^\.env(?:\.(?!example$|sample$|template$|dist$)[\w.-]+)?$/;

function collectText(toolName, input) {
  switch (toolName) {
    case 'Write': return [input.content];
    case 'Edit': return [input.new_string];
    case 'MultiEdit': return (input.edits || []).map((e) => e && e.new_string);
    case 'NotebookEdit': return [input.new_source];
    default: return [];
  }
}

function findSecret(text) {
  if (typeof text !== 'string') return null;
  for (const [label, pattern] of SECRET_PATTERNS) {
    const match = text.match(pattern);
    if (match && !PLACEHOLDER.test(match[0])) return label;
  }
  return null;
}

function evaluate(toolName, toolInput) {
  const filePath = toolInput.file_path || toolInput.notebook_path || '';
  if (LOCAL_SECRET_FILE.test(path.basename(filePath))) return null;
  for (const text of collectText(toolName, toolInput)) {
    const label = findSecret(text);
    if (label) {
      return {
        action: 'ask',
        reason: `This change writes a possible ${label} into ${filePath || 'a file'}. `
          + 'Secrets belong in environment variables or a secret manager, not in source files.',
      };
    }
  }
  return null;
}

if (require.main === module) runPreToolUseGuard(evaluate);

module.exports = { evaluate, findSecret };
