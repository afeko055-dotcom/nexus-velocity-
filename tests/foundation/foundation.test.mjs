import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { validateFoundation } from '../../tools/validation/validate-foundation.mjs';

const WORKSPACE_ROOT = path.resolve(import.meta.dirname, '..', '..');

test('validateFoundation passes on the NEXUS VELOCITY Stage 01 workspace', () => {
  const result = validateFoundation(WORKSPACE_ROOT);
  assert.equal(result, true);
});

test('STAGE_TRACKER.md contains all 36 stages and Stage 01 entry', () => {
  const content = fs.readFileSync(path.join(WORKSPACE_ROOT, 'STAGE_TRACKER.md'), 'utf8');
  for (let i = 1; i <= 36; i += 1) {
    const label = `Stage ${String(i).padStart(2, '0')}`;
    assert.match(content, new RegExp(`\\b${label}\\b`), `Missing ${label} in STAGE_TRACKER.md`);
  }
});

test('package.json keeps Stage 02 candidate prototype isolated from game/runtime', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'package.json'), 'utf8'));
  const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
  assert.ok(deps.react, 'Preserved react dependency missing');
  assert.ok(deps.vite, 'Preserved vite dependency missing');
  assert.equal(deps.phaser, undefined, 'Unapproved engine dependency phaser should not be installed');
  const runtimeEntries = fs.readdirSync(path.join(WORKSPACE_ROOT, 'game', 'runtime'));
  assert.deepEqual(runtimeEntries, ['.gitkeep'], 'game/runtime/ must stay empty except .gitkeep until Stage 02 decision');
});
