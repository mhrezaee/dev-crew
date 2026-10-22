'use strict';

// PreToolUse guard for Bash and PowerShell.
// DENY: catastrophic, irreversible system-level commands.
// ASK:  destructive or publishing commands that are sometimes legitimate; the user decides.

const { runPreToolUseGuard } = require('./lib');

// Remove quoted strings so text inside commit messages, echo and grep patterns doesn't trigger
// git/rm rules. SQL rules check the raw command instead, because SQL usually arrives quoted.
function stripQuoted(command) {
  return command.replace(/"(?:\\.|[^"\\])*"/g, '""').replace(/'[^']*'/g, "''");
}

function splitSegments(command) {
  return command.split(/&&|\|\||;|\||\n/).map((s) => s.trim()).filter(Boolean);
}

const ROOT_TARGETS = new Set([
  '/', '/*', '~', '~/', '~/*', '$HOME', '$HOME/', '$HOME/*', '${HOME}', '${HOME}/',
  'C:\\', 'C:/', 'C:', '/c', '/c/', '/mnt/c', '/mnt/c/',
]);
const SYSTEM_DIR = /^\/(?:bin|boot|dev|etc|lib|lib64|opt|proc|root|sbin|sys|usr|var|home|Users|System|Library|Applications)\/?\*?$/;
const LOCAL_WIDE_TARGETS = new Set(['.', './', '*', './*', '..', '../', '../*']);

const COMMAND_PREFIXES = new Set(['sudo', 'doas', 'env', 'command', 'exec', 'nohup', 'time', 'xargs', 'busybox']);

// rm counts only in command position (optionally after sudo, xargs, ...), not as a word in an argument.
function checkRm(segment) {
  const tokens = segment.replace(/["']/g, '').split(/\s+/);
  let start = 0;
  while (start < tokens.length && (COMMAND_PREFIXES.has(tokens[start]) || /^-/.test(tokens[start]) || /^\w+=/.test(tokens[start]))) {
    start += 1;
  }
  if (!(tokens[start] === 'rm' || /\/rm$/.test(tokens[start] || ''))) return null;
  const args = tokens.slice(start + 1);
  const flags = args.filter((a) => a.startsWith('-') && a !== '--').join(' ');
  const recursive = /(^|\s)(-[a-zA-Z]*[rR][a-zA-Z]*|--recursive)(\s|$)/.test(flags);
  const force = /(^|\s)(-[a-zA-Z]*f[a-zA-Z]*|--force)(\s|$)/.test(flags);
  if (!recursive) return null;
  const targets = args.filter((a) => !a.startsWith('-'));
  if (targets.some((t) => ROOT_TARGETS.has(t) || SYSTEM_DIR.test(t))) {
    return { action: 'deny', reason: `Refusing recursive delete of a root, home or system directory: "${segment}".` };
  }
  if (force && targets.some((t) => LOCAL_WIDE_TARGETS.has(t))) {
    return { action: 'ask', reason: `Recursive force-delete of the whole current or parent directory: "${segment}". Confirm this is intended.` };
  }
  return null;
}

const DENY_RULES = [
  [/\bmkfs(\.\w+)?\b/, 'Formatting a filesystem (mkfs).'],
  [/\bdd\b[^\n]*\bof=\/dev\/(sd|hd|nvme|disk|xvd|vd)/, 'Writing raw data to a disk device (dd of=/dev/...).'],
  [/>\s*\/dev\/(sd|hd|nvme|disk)[a-z0-9]*/, 'Redirecting output onto a disk device.'],
  [/:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/, 'Fork bomb.'],
  [/\bchmod\s+(-[a-zA-Z]*R[a-zA-Z]*\s+)?(0?777)\s+\/(\s|$)/, 'chmod 777 on the filesystem root.'],
  [/\bformat(\.com)?\s+[a-zA-Z]:/i, 'Formatting a Windows drive.'],
  [/\bRemove-Item\b(?=[^\n]*-Recurse)(?=[^\n]*(?:\s|=)['"]?(?:[a-zA-Z]:\\?|~|\$HOME|\$env:USERPROFILE|\$env:SystemRoot)['"]?(\s|$))/i,
    'Recursive Remove-Item on a drive root or the home directory.'],
  [/\b(rd|rmdir)\s+\/s\b[^\n]*\s[a-zA-Z]:\\?(\s|$)/i, 'Recursive delete of a drive root (rd /s).'],
];

const ASK_RULES = [
  [/\bgit\s+push\b(?=[^\n]*(\s--force(?![-\w])|\s-f(\s|$)|\s-[a-zA-Z]*f[a-zA-Z]*(\s|$)|\s\+\S+))/, 'Force push rewrites remote history. Prefer --force-with-lease.'],
  [/\bgit\s+reset\s+[^\n]*--hard\b/, 'git reset --hard discards uncommitted work.'],
  [/\bgit\s+clean\s+[^\n]*-[a-zA-Z]*f/, 'git clean -f deletes untracked files permanently.'],
  [/\bgit\s+branch\s+[^\n]*-D\b/, 'git branch -D deletes a branch even if it is unmerged.'],
  [/\bgit\s+(checkout\s+--\s+\.|restore\s+(--\S+\s+)*\.)(\s|$)/, 'Discards all local changes in the working tree.'],
  [/\bgit\s+(filter-branch|filter-repo)\b/, 'Rewrites repository history.'],
  [/\bterraform\s+(destroy|apply\b[^\n]*-auto-approve)/, 'Infrastructure change without a reviewed plan.'],
  [/\bpulumi\s+destroy\b/, 'Destroys infrastructure.'],
  [/\bkubectl\s+delete\b/, 'Deletes Kubernetes resources.'],
  [/\bhelm\s+(uninstall|delete)\b/, 'Uninstalls a Helm release.'],
  [/\bdocker\s+(system\s+prune|volume\s+(rm|prune))\b/, 'Deletes Docker data or volumes.'],
  [/\b(npm|pnpm|yarn)\s+publish\b|\bdotnet\s+nuget\s+push\b|\btwine\s+upload\b|\bcargo\s+publish\b|\bgem\s+push\b|\bmvn\b[^\n]*\bdeploy\b|\bgh\s+release\s+create\b/,
    'Publishes a package or release.'],
  [/\b(curl|wget|iwr|Invoke-WebRequest)\b[^\n|]*\|\s*(sudo\s+)?(ba|z)?sh\b|\biex\s*\(\s*(iwr|Invoke-WebRequest|\(New-Object)/i,
    'Pipes a downloaded script straight into a shell.'],
];

const SQL_CLIENT = /\b(psql|mysql|mariadb|sqlite3|sqlcmd|mongosh|mongo|clickhouse-client|duckdb|cqlsh)\b/;
const SQL_DESTRUCTIVE = /\b(DROP\s+(DATABASE|SCHEMA|TABLE)|TRUNCATE(\s+TABLE)?)\b|\bdb\.dropDatabase\(|\.drop\(\)/i;

function evaluateCommand(command) {
  if (typeof command !== 'string' || !command.trim()) return null;
  const unquoted = stripQuoted(command);

  // rm is checked on the raw command split into segments, so quoted targets like "/" are caught too.
  const rmResults = splitSegments(command).map(checkRm).filter(Boolean);

  const rmDeny = rmResults.find((r) => r.action === 'deny');
  if (rmDeny) return rmDeny;
  for (const [pattern, reason] of DENY_RULES) {
    if (pattern.test(unquoted)) return { action: 'deny', reason };
  }

  if (rmResults.length) return rmResults[0];
  for (const [pattern, reason] of ASK_RULES) {
    if (pattern.test(unquoted)) return { action: 'ask', reason };
  }
  if (SQL_CLIENT.test(command) && SQL_DESTRUCTIVE.test(command)) {
    return { action: 'ask', reason: 'Destructive SQL (DROP/TRUNCATE) sent to a database client.' };
  }
  return null;
}

function evaluate(toolName, toolInput) {
  if (toolName !== 'Bash' && toolName !== 'PowerShell') return null;
  return evaluateCommand(toolInput.command);
}

if (require.main === module) runPreToolUseGuard(evaluate);

module.exports = { evaluate, evaluateCommand };
