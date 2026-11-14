# NEXUS VELOCITY — Known Bugs & Verified Issues

> **Policy:** Record only **actual, observed bugs or verified environment limitations**. Never invent bugs, and never claim "zero bugs" without stating exact verification scope.

---

## Active Issues & Environment Limitations

| ID | Severity | Component | Description & Reproduction | Actual vs Expected | Workaround / Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ENV-005` | **Critical** | Git Repository & History (`.git/` Missing) | `.git/` was stripped when the workspace snapshot restored (`Nov 13 22:05`). `git status`, `git rev-parse`, and `find / -maxdepth 3 -name ".git"` confirm zero local `.git` metadata or backups exist anywhere in the container. | **Expected:** Active `main` branch, commit history (`bfc6ae6`), and canonical `origin` remote.<br>**Actual:** `fatal: not a git repository (or any of the parent directories): .git` (`exit 128`). | **BLOCKED — Recovery Impossible Locally:** Do not fake canonical history. Requires user/maintainer to supply canonical GitHub `origin` URL or approved `.git` recovery source. |
| `ENV-004` | **Critical** | Android Toolchain & Device Hardware (Stage 02 Gate) | `which godot godot4 unity adb gradle sdkmanager java javac keytool android` exits `1` (none installed). No Android SDK, OpenJDK, Gradle, Godot 4, emulator, or physical Android hardware exists here. | **Expected:** Native Godot 4 & Android `.apk`/`.aab` build + physical Android GPU/touch/orientation verification.<br>**Actual:** Toolchain and device hardware unavailable. | **BLOCKED:** Cannot compile `.apk`/`.aab` or run Android GPU tests in sandbox. Must run on external workstation or CI runner with Android SDK 34+ & real Android hardware. |
| `ENV-001` | Medium | `npm install` Peer Dependency Conflict | On a clean copy (`node_modules` removed), `npm install` fails with `ERESOLVE` (`vite@8.3.8` optional peer `esbuild@"^0.27.0 \|\| ^0.28.0"` vs `esbuild@"^0.25.0"`). | **Expected:** Clean install exits `0`.<br>**Actual:** `npm install` exits `1`; `bun install --frozen-lockfile` exits `0`. | **Documented:** Updated `README.md` setup instructions to use `bun install --frozen-lockfile` or `npm install --legacy-peer-deps`. |
| `QA-01-001` | Medium | `builds/*/.gitkeep` Dropped on Snapshot Restore | Upon container restore, `builds/development/` and `builds/releases/` were recreated by `prevalidate`, missing `.gitkeep`. | **Expected:** All 14 `game/*` and `builds/*` directories retain `.gitkeep` markers.<br>**Actual:** `builds/*` markers dropped on snapshot restore. | **Repaired:** Restored `.gitkeep` in `builds/development/` and `builds/releases/` and updated `ensure-directories.mjs` to auto-restore missing `.gitkeep` markers. |
| `ENV-002` | Low | Canonical GitHub Remote (`origin`) | No GitHub `origin` remote URL exists in env vars or workspace files. | **Expected:** Configured `origin` remote.<br>**Actual:** No remote URL recoverable in sandbox. | **Open Limitation:** Requesting canonical GitHub repository URL from project owner. |
| `ENV-003` | Low | Remote Clean-Clone Verification | True remote GitHub `git clone` cannot run until `ENV-005` and `ENV-002` are resolved. | **Expected:** Remote `git clone` test.<br>**Actual:** Tested via local tar clean-copy simulation (`/tmp/nv-clean-test`) using `bun install --frozen-lockfile`. | **Open Limitation:** Perform true remote `git clone` verification after pushing to canonical GitHub repository. |

---

## Verification Scope

- **Executed & Passed Locally:** `npm run validate` (`41/41`), `npm run test:foundation` (`5/5`), `npm run lint` (`tsc --noEmit`), `npm run build` (`vite build`), clean-copy `/tmp/nv-clean-test` with `bun install --frozen-lockfile`, and Stage 02 Three.js prototype in headless Chromium **SwiftShader** (`20–36 FPS`, zero JS/HTTP errors).
- **Failed / Not Tested:** `npm install` without `--legacy-peer-deps` (`ERESOLVE`), `git` commands (`exit 128`, no `.git`), Godot 4 compilation, Android `.apk`/`.aab` packaging, Android emulator, and physical Android device GPU/touch/orientation benchmarks (`NOT TESTED — ENV-004`).
