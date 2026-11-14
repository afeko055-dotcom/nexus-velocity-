# NEXUS VELOCITY — Feature & Stage Verification Ledger

> **Policy:** Every feature must strictly distinguish between `IMPLEMENTED AND TESTED`, `IMPLEMENTED BUT NOT FULLY TESTED`, `PARTIALLY IMPLEMENTED`, `PLANNED`, and `BLOCKED BY ENVIRONMENT OR EXTERNAL DEPENDENCY`.

---

## 1. Stage 01 — Project Foundation

| ID | Feature | Status Classification | Evidence / Notes |
| :--- | :--- | :--- | :--- |
| `F-01-01` | Governance & Architecture Documentation Suite (9 root files + `docs/`) | `IMPLEMENTED AND TESTED` | All 9 root docs, `website/README.md`, and `docs/` verified present & synchronized. |
| `F-01-02` | Canonical Directory Structure (`docs/`, `tools/`, `tests/`, `game/`, `website/`, `builds/`) | `IMPLEMENTED AND TESTED` | 24 directories + 14 `.gitkeep` markers verified; `ensure-directories.mjs` auto-restores missing markers. |
| `F-01-03` | Automated Foundation Validator & CLI Tests | `IMPLEMENTED AND TESTED` | `npm run validate` (`41/41`) & `npm run test:foundation` (`5/5`, positive + negative temp-dir test) exit `0`. |
| `F-01-04` | Clean-Copy Install & Build Reproducibility | `PARTIALLY IMPLEMENTED` | `bun install --frozen-lockfile` + `validate` + `test:foundation` + `build` exit `0` on `/tmp` clean copy; plain `npm install` hits `ERESOLVE` without `--legacy-peer-deps` (`ENV-001`). |
| `F-01-05` | Git Branch, Commit History & Canonical GitHub Traceability | `BLOCKED BY ENVIRONMENT OR EXTERNAL DEPENDENCY` | `.git/` was stripped on container snapshot restore (`ENV-005`); `origin` URL absent (`ENV-002`). |

---

## 2. Stage 02 — Technology & Android Packaging Evaluation

| ID | Feature | Status Classification | Evidence / Notes |
| :--- | :--- | :--- | :--- |
| `F-02-01` | Isolated Candidate A 3D WebGL Prototype (`prototypes/candidate-threejs/`) | `IMPLEMENTED BUT NOT FULLY TESTED` | Verified in **desktop software-rendered Chromium (SwiftShader)** (`20–36 FPS`, WASD/Arrows, touch joystick UI, Jump button physics, AABB collision, camera drag, Reset, zero errors). **NOT tested on Android WebView or mobile multi-touch hardware.** |
| `F-02-02` | 11-Criteria Technology Comparison (`docs/architecture/STAGE_02_TECHNOLOGY_EVALUATION.md`) | `IMPLEMENTED AND TESTED` | Evaluates Three.js + Capacitor vs Godot 4 Native vs Unity across all 11 criteria; `UNRESOLVED-01` remains **OPEN** pending APK proof & approval. |
| `F-02-03` | Candidate B Godot 4 Playable Prototype & Android `.apk`/`.aab` Export | `BLOCKED BY ENVIRONMENT OR EXTERNAL DEPENDENCY` | `godot4`, `java`, `gradle`, `sdkmanager`, and `adb` absent (`ENV-004`). No `.apk` built or booted. |
| `F-02-04` | Physical Android Device GPU, Thermal & Orientation Benchmark | `BLOCKED BY ENVIRONMENT OR EXTERNAL DEPENDENCY` | **NOT TESTED** (`ENV-004`). Desktop/SwiftShader results are strictly separated and not treated as Android benchmarks. |

---

## 3. Stage 02B+ Features (`PLANNED` — **BLOCKED** Until Stage 02 `PASS`)

- Final runtime commitment in `game/runtime/` (**`UNDECIDED` / `BLOCKED`**)
- Stylized Kai Veyron full animation state machine (walk, sprint, jump, land, sit, swim, emotes, arcade combat)
- Landscape HUD & Android manifest orientation lock
- Offline Nexus City open-world district vertical slice & introductory mission (`VELOCITY CORE: FIRST CONTACT`)
- Authoritative online accounts, sessions, matchmaking, progression sync, and server-verified monetization architecture
- Character collection, gadgets, robots, futuristic pets, NPC population, drivable vehicles, and future alien planets
- Companion website services (`website/` reserved documentation only)
