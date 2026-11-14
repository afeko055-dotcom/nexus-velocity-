# NEXUS VELOCITY

> **Current Stage:** Stage 02 — Recovery & Canonical Git Connection (`Stage 02B BLOCKED`)  
> **Canonical Repository:** `https://github.com/afeko055-dotcom/nexus-velocity` (`branch: main`)  
> **Game Engine Decision:** **UNDECIDED (`UNRESOLVED-01` OPEN — Blocked on `.apk` Proof & Approval)**  
> **Primary Target Platform:** Android (Standalone Offline-Capable Downloadable Game)  
> **Future Target Platforms:** Windows and other practical desktop/mobile platforms

---

## 1. Project Description

**NEXUS VELOCITY** is an original futuristic 3D open-world action-adventure game.

The final product must be a **genuine standalone downloadable game**, not a website or browser toy pretending to be a game.

### Core Game Concept (Planned for Later Stages)
- **Setting:** Nexus City and its interconnected futuristic districts.
- **Protagonist:** Kai Veyron.
- **Signature Mechanic:** The experimental **Velocity Core**.
- **Core Pillars:** Third-person exploration and traversal, vehicles, missions, original characters, progression, and local save persistence.
- **Offline Requirement:** Core gameplay must run fully offline without requiring an active internet connection.
- **Optional AI Systems:** Decoupled, provider-agnostic optional world and mission systems (never required for core offline play).

> **Important Recovery Notice:** All 14 mandatory `game/*` and `builds/*` directories retain `.gitkeep` markers (`game/runtime/` stays untouched). Candidate A's interactive 3D WebGL proof lives in `prototypes/candidate-threejs/` and the 11-criteria evaluation in `docs/architecture/STAGE_02_TECHNOLOGY_EVALUATION.md`. Previous Git history was unavailable after snapshot restoration (`ENV-005`), so local `main` was initialized as a new canonical baseline connected to `https://github.com/afeko055-dotcom/nexus-velocity.git`. **Stage 01 remains `CONDITIONAL`, Stage 02 remains `FAIL`, and Stage 02B remains `BLOCKED`.**

---

## 2. Preserved Workspace & Environment

This workspace preserves the pre-existing Vite + React + TypeScript + Tailwind shell (`src/`, `index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`, `metadata.json`, `.env.example`, `.gitignore`) as the **Stage 02 Isolated Candidate Comparison Shell**, **not** the final chosen `game/runtime/`.

### Development Requirements
- **Node.js:** `v22.x` or higher (verified on `v22.23.2`)
- **Bun / npm:** `bun 1.4+` (`bun install --frozen-lockfile` verified) or `npm 10.x+` with `--legacy-peer-deps` (`ENV-001`)
- **Git:** `2.34+` *(Connected to `origin` `https://github.com/afeko055-dotcom/nexus-velocity.git` on `main`; push requires user GitHub authorization)*
- **Strict Isolation:** Candidate engine code stays inside `prototypes/`; do not populate `game/runtime/` until `DECISIONS.md` (`UNRESOLVED-01`) closes.

---

## 3. Workspace Setup & Verification Order

Follow this exact sequence on a fresh clone or restored workspace:

```bash
# 1. Install dependencies (bun.lock is the active lockfile; plain npm install hits ERESOLVE without --legacy-peer-deps)
bun install --frozen-lockfile
# OR with npm:
# npm install --legacy-peer-deps

# 2. Initialize required reserved directories (safe/idempotent; also restores builds/*/.gitkeep if stripped)
npm run init:dirs

# 3. Run the foundation & isolation validator
npm run validate

# 4. Run automated foundation and CLI integration tests
npm run test:foundation

# 5. Run TypeScript type-check / lint
npm run lint

# 6. Run the production Vite build
npm run build

# 7. Check Git repository status and workspace diagnostics
git status
npm run workspace:info
```

---

## 4. Available Commands

| Command | Purpose |
| :--- | :--- |
| `npm run init:dirs` | Creates any missing reserved project directories (safe/idempotent). |
| `npm run validate` | Automatically runs `prevalidate` (`init:dirs`), then validates all 9 root docs, 25 directories, essential records, no-secrets hygiene, and no premature engine lock-in. Exits non-zero on failure. |
| `npm run test:foundation` | Automatically runs `pretest:foundation` (`init:dirs`), then runs Node built-in unit & integration tests verifying foundation records and validator failure behavior. |
| `npm run lint` | Runs TypeScript type-checking (`tsc --noEmit`). |
| `npm run build` | Builds the preserved diagnostic foundation shell (`vite build`). |
| `npm run dev` | Starts the local diagnostic manifest server on port `3000`. |
| `npm run workspace:info` | Prints repository, Git, Node, and directory diagnostics for AI handoffs. |

---

## 5. Build and Validation Instructions

All checks in Section 3 (`npm run validate`, `npm run test:foundation`, `npm run lint`, and `npm run build`) must exit with status code `0`.

To run the validator directly without `prevalidate` auto-initialization (for example during negative testing against a temporary directory):

```bash
node tools/validation/validate-foundation.mjs --root /path/to/workspace
```

For detailed validation design and negative-test behavior, see `docs/testing/VALIDATION_GUIDE.md` and `TEST_PLAN.md`.

---

## 6. Troubleshooting

- **Missing directories after `git clone` or snapshot restore:** Reserved directories under `game/*` and `builds/*` now include minimal tracked `.gitkeep` markers, and `npm run validate` / `npm run test:foundation` invoke `ensure-directories.mjs` via npm lifecycle hooks. You can also run `npm run init:dirs` manually at any time.
- **Validation exits with code `1`:** Read the `[FAIL]` lines printed by `npm run validate`. Each failure identifies the exact missing file, directory, record, or rule violation.
- **No Git remote configured (`origin: NOT CONFIGURED`):** Local commits work offline, but remote push/pull requires configuring the canonical GitHub repository remote (`git remote add origin <url>`).
- **WebSocket / HMR errors in cloud preview:** HMR is intentionally disabled (`DISABLE_HMR=true` in AI Studio preview). Ignore HMR WebSocket messages; use manual reload or `npm run build`.
- **Android builds fail or are missing:** Android packaging evaluation begins in **Stage 02** and is not part of Stage 01.
