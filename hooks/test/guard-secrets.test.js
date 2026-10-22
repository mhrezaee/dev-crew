'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluate } = require('../guard-secrets');

// Built by concatenation so this test file itself never contains a complete credential-shaped string.
const AWS_KEY = 'AKIA' + 'QWERTYUIOPASDFGH';
const GITHUB_TOKEN = 'ghp_' + 'a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8';
const PRIVATE_KEY = '-----BEGIN ' + 'RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...';
const DB_URL = 'postgres://admin:' + 'S3cretPassw0rd@db.internal:5432/app';

const write = (file_path, content) => evaluate('Write', { file_path, content });

test('asks before writing an AWS key into source', () => {
  assert.equal(write('src/config.ts', `const key = "${AWS_KEY}";`).action, 'ask');
});

test('asks before writing a GitHub token', () => {
  assert.equal(write('scripts/deploy.sh', `TOKEN=${GITHUB_TOKEN}`).action, 'ask');
});

test('asks before writing a private key', () => {
  assert.equal(write('certs/key.txt', PRIVATE_KEY).action, 'ask');
});

test('asks before writing a connection string with a password', () => {
  assert.equal(write('appsettings.json', `{"db": "${DB_URL}"}`).action, 'ask');
});

test('checks Edit new_string', () => {
  assert.equal(evaluate('Edit', { file_path: 'a.py', old_string: 'x', new_string: AWS_KEY }).action, 'ask');
});

test('checks every MultiEdit edit', () => {
  const edits = [{ old_string: 'a', new_string: 'fine' }, { old_string: 'b', new_string: GITHUB_TOKEN }];
  assert.equal(evaluate('MultiEdit', { file_path: 'a.js', edits }).action, 'ask');
});

test('allows secrets in local .env files', () => {
  assert.equal(write('.env', `AWS_ACCESS_KEY_ID=${AWS_KEY}`), null);
  assert.equal(write('/repo/.env.local', `GITHUB_TOKEN=${GITHUB_TOKEN}`), null);
});

test('still asks for committed templates such as .env.example', () => {
  assert.equal(write('.env.example', `AWS_ACCESS_KEY_ID=${AWS_KEY}`).action, 'ask');
});

test('allows documented placeholders', () => {
  assert.equal(write('README.md', 'AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE'), null);
  assert.equal(write('docker-compose.yml', 'postgres://user:changeme_password@db:5432/app'), null);
});

test('allows ordinary code', () => {
  assert.equal(write('src/app.ts', 'export const add = (a: number, b: number) => a + b;'), null);
  assert.equal(evaluate('Edit', { file_path: 'a.py', old_string: 'x', new_string: 'y = os.environ["API_KEY"]' }), null);
});
