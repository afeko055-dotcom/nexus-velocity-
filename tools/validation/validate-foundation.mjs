#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const REQUIRED_ROOT_DOCS = [
  'README.md',
  'PROJECT_RULES.md',
  'ARCHITECTURE.md',
  'AI_HANDOFF.md',
  'STAGE_TRACKER.md',
  'COMPLETED_FEATURES.md',
  'KNOWN_BUGS.md',
  'DECISIONS.md',
  'TEST_PLAN.md',
];

const REQUIRED_DIRECTORIES = [
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

const PRESERVED_WORKSPACE_FILES = [
  '.env.example',
  '.gitignore',
  'index.html',
  'metadata.json',
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'src/App.tsx',
  'src/main.tsx',
  'src/index.css',
];

const STAGE02_ALLOWED_PROTOTYPE_ENGINES = new Set(['three', '@types/three']);

const FORBIDDEN_UNISOLATED_ENGINES = [
  '@react-three/fiber',
  '@react-three/drei',
  'babylonjs',
  '@babylonjs/core',
  'phaser',
  'pixi.js',
  'playcanvas',
  'cannon-es',
];

function parseArgs(argv) {
  let rootDir = process.cwd();
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--root' && argv[i + 1]) {
      rootDir = path.resolve(argv[i + 1]);
      i += 1;
    }
  }
  return { rootDir };
}

function createReporter() {
  const results = [];
  return {
    pass(label, detail = '') {
      results.push({ ok: true, label, detail });
      console.log(`[PASS] ${label}${detail ? ` — ${detail}` : ''}`);
    },
    fail(label, detail = '') {
      results.push({ ok: false, label, detail });
      console.error(`[FAIL] ${label}${detail ? ` — ${detail}` : ''}`);
    },
    summary() {
      const passed = results.filter((r) => r.ok).length;
      const failed = results.filter((r) => !r.ok).length;
      console.log('');
      console.log(`Validation Summary: ${passed} passed, ${failed} failed (${results.length} total checks)`);
      return failed === 0;
    },
  };
}

function readTextSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function scanForSecrets(rootDir) {
  const findings = [];
  const ignoredDirs = new Set(['node_modules', '.git', 'dist', 'build', 'coverage']);
  const secretPatterns = [
    { name: 'Google API Key', regex: new RegExp('AIza' + '[0-9A-Za-z_-]{35}') },
    { name: 'GitHub PAT', regex: new RegExp('ghp_' + '[0-9A-Za-z]{36}') },
    { name: 'AWS Access Key', regex: new RegExp('AKIA' + '[0-9A-Z]{16}') },
    { name: 'Private Key Header', regex: new RegExp('-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----') },
  ];

  function walk(currentDir) {
    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (ignoredDirs.has(entry.name)) {
        continue;
      }
      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.relative(rootDir, fullPath);

      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (entry.name === '.env' || (entry.name.startsWith('.env.') && entry.name !== '.env.example')) {
        findings.push(`Disallowed environment secret file present: ${relPath}`);
        continue;
      }

      if (relPath === path.join('tools', 'validation', 'validate-foundation.mjs')) {
        continue;
      }

      const ext = path.extname(entry.name).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.webp', '.ico', '.woff2', '.apk', '.aab'].includes(ext)) {
        continue;
      }

      const content = readTextSafe(fullPath);
      if (!content) {
        continue;
      }

      for (const pattern of secretPatterns) {
        if (pattern.regex.test(content)) {
          findings.push(`${pattern.name} pattern detected in ${relPath}`);
        }
      }
    }
  }

  walk(rootDir);
  return findings;
}

export function validateFoundation(rootDir) {
  const report = createReporter();
  console.log(`NEXUS VELOCITY — Stage 01 Foundation Validator`);
  console.log(`Target Workspace: ${rootDir}`);
  console.log('');

  // 1. Required root documents
  for (const docName of REQUIRED_ROOT_DOCS) {
    const docPath = path.join(rootDir, docName);
    const content = readTextSafe(docPath);
    if (content === null) {
      report.fail(`Root document exists: ${docName}`, 'File is missing');
    } else if (content.trim().length < 150) {
      report.fail(`Root document substantive: ${docName}`, `Content too short (${content.trim().length} chars)`);
    } else {
      report.pass(`Root document verified: ${docName}`, `${content.trim().length} chars`);
    }
  }

  // 2. Website reserved README
  const websiteReadmePath = path.join(rootDir, 'website', 'README.md');
  const websiteReadme = readTextSafe(websiteReadmePath);
  if (!websiteReadme) {
    report.fail('Reserved companion doc: website/README.md', 'File is missing');
  } else if (!/companion/i.test(websiteReadme) || !/not the.*game runtime/i.test(websiteReadme)) {
    report.fail('Reserved companion doc: website/README.md', 'Must document companion-only scope and non-runtime status');
  } else {
    report.pass('Reserved companion doc: website/README.md');
  }

  // 3. Required directories
  for (const dirRel of REQUIRED_DIRECTORIES) {
    const dirPath = path.join(rootDir, dirRel);
    try {
      const stat = fs.statSync(dirPath);
      if (stat.isDirectory()) {
        report.pass(`Directory exists: ${dirRel}`);
      } else {
        report.fail(`Directory exists: ${dirRel}`, 'Path exists but is not a directory');
      }
    } catch {
      report.fail(`Directory exists: ${dirRel}`, 'Directory is missing');
    }
  }

  // 4. Essential records in STAGE_TRACKER.md (all 36 stages)
  const stageTracker = readTextSafe(path.join(rootDir, 'STAGE_TRACKER.md')) ?? '';
  const missingStages = [];
  for (let i = 1; i <= 36; i += 1) {
    const num = String(i).padStart(2, '0');
    const stageRegex = new RegExp(`\\bStage\\s+${num}\\b`, 'i');
    if (!stageRegex.test(stageTracker)) {
      missingStages.push(`Stage ${num}`);
    }
  }
  if (missingStages.length > 0) {
    report.fail('STAGE_TRACKER.md completeness (Stages 01–36)', `Missing: ${missingStages.join(', ')}`);
  } else {
    report.pass('STAGE_TRACKER.md completeness', 'All 36 stages recorded');
  }

  // 5. Multi-AI roles & 9 mandatory handoff fields in AI_HANDOFF.md
  const aiHandoff = readTextSafe(path.join(rootDir, 'AI_HANDOFF.md')) ?? '';
  const requiredRoles = ['Claude', 'Replit', 'Google AI Studio', 'Qwen', 'Base44', 'GitHub'];
  const missingRoles = requiredRoles.filter((role) => !aiHandoff.includes(role));
  const requiredHandoffFields = [
    'Repository',
    'Branch',
    'Base Commit',
    'Assigned Task',
    'Files Changed',
    'Tests Performed',
    'Test Results',
    'Limitations',
    'Next Action',
  ];
  const missingHandoffFields = requiredHandoffFields.filter(
    (field) => !new RegExp(field, 'i').test(aiHandoff),
  );
  if (missingRoles.length > 0 || missingHandoffFields.length > 0) {
    report.fail(
      'AI_HANDOFF.md multi-AI protocol',
      `Missing roles: [${missingRoles.join(', ')}]; Missing fields: [${missingHandoffFields.join(', ')}]`,
    );
  } else {
    report.pass('AI_HANDOFF.md multi-AI protocol', 'All 6 roles & 9 handoff fields present');
  }

  // 6. Runtime decision neutrality check
  const architecture = readTextSafe(path.join(rootDir, 'ARCHITECTURE.md')) ?? '';
  const decisions = readTextSafe(path.join(rootDir, 'DECISIONS.md')) ?? '';
  if (!/UNDECIDED/i.test(architecture) || !/Stage 02/i.test(architecture) || !/UNDECIDED/i.test(decisions)) {
    report.fail('Engine decision neutrality', 'ARCHITECTURE.md and DECISIONS.md must explicitly mark runtime UNDECIDED / deferred to Stage 02');
  } else {
    report.pass('Engine decision neutrality', 'Runtime selection explicitly deferred to Stage 02');
  }

  // 7. Stage 02 engine neutrality & candidate prototype isolation
  const runtimeDir = path.join(rootDir, 'game', 'runtime');
  try {
    const runtimeEntries = fs.readdirSync(runtimeDir);
    const nonMarkerEntries = runtimeEntries.filter((name) => name !== '.gitkeep');
    if (nonMarkerEntries.length > 0) {
      report.fail(
        'game/runtime/ remains unchosen & isolated',
        `Unexpected files in game/runtime/: ${nonMarkerEntries.join(', ')}`,
      );
    } else {
      report.pass('game/runtime/ remains unchosen & isolated', 'Contains only .gitkeep');
    }
  } catch (err) {
    report.fail('game/runtime/ readable', err instanceof Error ? err.message : String(err));
  }

  const pkgRaw = readTextSafe(path.join(rootDir, 'package.json'));
  if (!pkgRaw) {
    report.fail('package.json readable', 'Missing package.json');
  } else {
    try {
      const pkg = JSON.parse(pkgRaw);
      const allDeps = {
        ...(pkg.dependencies ?? {}),
        ...(pkg.devDependencies ?? {}),
      };
      const foundForbidden = FORBIDDEN_UNISOLATED_ENGINES.filter((dep) => dep in allDeps);
      const hasThree = 'three' in allDeps || '@types/three' in allDeps;
      const isolatedProtoExists = fs.existsSync(
        path.join(rootDir, 'prototypes', 'candidate-threejs', 'ThreeCandidatePrototype.tsx'),
      );

      if (foundForbidden.length > 0) {
        report.fail('No unapproved engine lock-in', `Found disallowed packages: ${foundForbidden.join(', ')}`);
      } else if (hasThree && !isolatedProtoExists) {
        report.fail(
          'Stage 02 candidate isolation',
          'three/@types/three installed without isolated prototypes/candidate-threejs/ThreeCandidatePrototype.tsx',
        );
      } else {
        const installedCandidates = Object.keys(allDeps).filter((d) =>
          STAGE02_ALLOWED_PROTOTYPE_ENGINES.has(d),
        );
        report.pass(
          'Stage 02 candidate dependency isolation',
          installedCandidates.length > 0
            ? `Isolated Stage 02 prototype deps (${installedCandidates.join(', ')})`
            : 'No engine packages installed',
        );
      }
    } catch (err) {
      report.fail('package.json valid JSON', err instanceof Error ? err.message : String(err));
    }
  }

  // 8. Preserved workspace files check
  const missingPreserved = PRESERVED_WORKSPACE_FILES.filter(
    (rel) => !fs.existsSync(path.join(rootDir, rel)),
  );
  if (missingPreserved.length > 0) {
    report.fail('Preserved workspace integrity', `Missing files: ${missingPreserved.join(', ')}`);
  } else {
    report.pass('Preserved workspace integrity', `${PRESERVED_WORKSPACE_FILES.length} core files intact`);
  }

  // 9. No secrets scan
  const secretFindings = scanForSecrets(rootDir);
  if (secretFindings.length > 0) {
    report.fail('Security / no-secrets hygiene', secretFindings.join('; '));
  } else {
    report.pass('Security / no-secrets hygiene', 'No hardcoded secrets or committed .env files found');
  }

  return report.summary();
}

const isDirectExecution =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);

if (isDirectExecution) {
  const { rootDir } = parseArgs(process.argv.slice(2));
  const ok = validateFoundation(rootDir);
  process.exit(ok ? 0 : 1);
}
