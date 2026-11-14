import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const WORKSPACE_ROOT = path.resolve(import.meta.dirname, '..', '..');
const VALIDATOR_PATH = path.join(WORKSPACE_ROOT, 'tools', 'validation', 'validate-foundation.mjs');

test('validate-foundation CLI exits 0 on valid workspace', () => {
  const res = spawnSync(process.execPath, [VALIDATOR_PATH, '--root', WORKSPACE_ROOT], {
    encoding: 'utf8',
  });
  assert.equal(res.status, 0, `Expected exit code 0, got ${res.status}\n${res.stdout}\n${res.stderr}`);
  assert.match(res.stdout, /Validation Summary:/);
});

test('validate-foundation CLI exits non-zero when required docs and directories are missing', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-velocity-invalid-'));
  try {
    fs.writeFileSync(path.join(tempDir, 'README.md'), 'incomplete stub', 'utf8');
    const res = spawnSync(process.execPath, [VALIDATOR_PATH, '--root', tempDir], {
      encoding: 'utf8',
    });
    assert.notEqual(res.status, 0, 'Expected non-zero exit code for invalid workspace');
    assert.match(res.stderr, /\[FAIL\]/);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
