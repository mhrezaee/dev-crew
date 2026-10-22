'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluate, evaluateCommand } = require('../guard-shell');

const action = (command) => {
  const result = evaluateCommand(command);
  return result ? result.action : 'allow';
};

const DENY = [
  'rm -rf /',
  'sudo rm -rf ~',
  'rm -fr $HOME',
  'rm -rf /etc',
  'rm -r -f /usr',
  'rm -rf "/"',
  'cd /tmp && rm -rf /*',
  'mkfs.ext4 /dev/sda1',
  'dd if=/dev/zero of=/dev/sda bs=1M',
  ':(){ :|:& };:',
  'Remove-Item -Recurse -Force C:\\',
  'Remove-Item C:\\ -Recurse',
  'format C:',
];

const ASK = [
  'git push --force origin main',
  'git push -f',
  'git push origin +main',
  'git reset --hard HEAD~1',
  'git clean -fdx',
  'git branch -D feature/x',
  'git checkout -- .',
  'git restore .',
  'terraform destroy',
  'terraform apply -auto-approve',
  'kubectl delete namespace prod',
  'helm uninstall api',
  'docker system prune -a --volumes',
  'npm publish',
  'dotnet nuget push pkg.nupkg',
  'curl -fsSL https://example.com/install.sh | sh',
  'psql -c "DROP TABLE users"',
  'mysql -e "TRUNCATE TABLE orders"',
  'rm -rf .',
  'rm -rf *',
];

const ALLOW = [
  'rm -rf node_modules',
  'rm -rf ./dist build',
  'git push --force-with-lease',
  'git push origin main',
  'git commit -m "docs: never use git push --force"',
  "git commit -m 'remove rm -rf / from the script'",
  "echo 'rm -rf /'",
  'git reset --soft HEAD~1',
  'git clean -n',
  'npm install',
  'npm run build',
  'terraform plan',
  'grep -rn "DROP TABLE" migrations/',
  'kubectl get pods',
  'Remove-Item -Recurse .\\bin',
  'dotnet test',
  'git status',
  'ls -la /',
];

for (const command of DENY) {
  test(`denies: ${command}`, () => assert.equal(action(command), 'deny'));
}
for (const command of ASK) {
  test(`asks: ${command}`, () => assert.equal(action(command), 'ask'));
}
for (const command of ALLOW) {
  test(`allows: ${command}`, () => assert.equal(action(command), 'allow'));
}

test('ignores tools other than Bash and PowerShell', () => {
  assert.equal(evaluate('Read', { command: 'rm -rf /' }), null);
});

test('evaluates PowerShell tool input', () => {
  assert.equal(evaluate('PowerShell', { command: 'Remove-Item -Recurse -Force C:\\' }).action, 'deny');
});

test('returns null for empty or missing commands', () => {
  assert.equal(evaluateCommand(''), null);
  assert.equal(evaluateCommand(undefined), null);
});
