#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function runSafe(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    return `unavailable (${err instanceof Error ? err.message.split('\n')[0] : 'error'})`;
  }
}

const rootDir = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));

console.log('=== NEXUS VELOCITY — Workspace Diagnostics ===');
console.log(`Workspace Root : ${rootDir}`);
console.log(`Node Version   : ${process.version}`);
console.log(`Package Name   : ${pkg.name} (${pkg.version})`);
console.log(`Git Branch     : ${runSafe('git rev-parse --abbrev-ref HEAD')}`);
console.log(`Git Commit     : ${runSafe('git rev-parse --short HEAD')}`);
console.log(`Git Remotes    : ${runSafe('git remote -v') || '(none configured)'}`);
console.log(`Stage 01 Docs  : ${['README.md', 'PROJECT_RULES.md', 'ARCHITECTURE.md', 'AI_HANDOFF.md', 'STAGE_TRACKER.md', 'COMPLETED_FEATURES.md', 'KNOWN_BUGS.md', 'DECISIONS.md', 'TEST_PLAN.md'].filter((f) => fs.existsSync(path.join(rootDir, f))).length}/9 present`);
