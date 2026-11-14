#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const RESERVED_DIRECTORIES = [
  'docs/architecture',
  'docs/development',
  'docs/ai-handoffs',
  'docs/testing',
  'docs/android',
  'tools/validation',
  'tools/development-scripts',
  'tests/foundation',
  'tests/integration',
  'game/runtime',
  'game/core',
  'game/systems',
  'game/player',
  'game/world',
  'game/missions',
  'game/vehicles',
  'game/characters',
  'game/assets',
  'game/ui',
  'game/audio',
  'game/data',
  'website',
  'builds/development',
  'builds/releases',
];

const KEEP_MARKER_DIRS = new Set([
  'game/runtime',
  'game/core',
  'game/systems',
  'game/player',
  'game/world',
  'game/missions',
  'game/vehicles',
  'game/characters',
  'game/assets',
  'game/ui',
  'game/audio',
  'game/data',
  'builds/development',
  'builds/releases',
]);

const rootDir = process.cwd();
let createdCount = 0;

for (const relDir of RESERVED_DIRECTORIES) {
  const absDir = path.join(rootDir, relDir);
  if (!fs.existsSync(absDir)) {
    fs.mkdirSync(absDir, { recursive: true });
    console.log(`[CREATED] ${relDir}`);
    createdCount += 1;
  }
  if (KEEP_MARKER_DIRS.has(relDir)) {
    const keepPath = path.join(absDir, '.gitkeep');
    if (!fs.existsSync(keepPath)) {
      fs.writeFileSync(keepPath, `# Reserved directory marker for ${relDir}/\n`, 'utf8');
    }
  }
}

console.log(
  createdCount === 0
    ? `All ${RESERVED_DIRECTORIES.length} reserved NEXUS VELOCITY directories already exist.`
    : `Initialized ${createdCount} missing reserved directories (total ${RESERVED_DIRECTORIES.length}).`,
);
