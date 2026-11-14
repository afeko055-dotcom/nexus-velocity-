# NEXUS VELOCITY — Master Test & Verification Plan

---

## 1. Automated Repository & Build Checks

All automated checks below run locally with zero external network calls:

| Check | Command | What It Verifies | Latest Verified Status |
| :--- | :--- | :--- | :--- |
| Foundation Validator | `npm run validate` | 9 root docs, `website/README.md`, 24 required directories, Stages 01–36 in `STAGE_TRACKER.md`, 6 Multi-AI roles + 9 handoff fields, `UNDECIDED` neutrality, `game/runtime/` `.gitkeep`-only isolation, secret scan. | **PASS** (`41/41`, exit `0`) |
| Foundation & CLI Tests | `npm run test:foundation` | Positive validator run, negative temp-dir CLI exit `1` when docs/dirs missing, Stage 01–36 coverage, `game/runtime/` isolation. | **PASS** (`5/5`, exit `0`) |
| TypeScript Type Check | `npm run lint` | Strict `tsc --noEmit` across `src/` and `prototypes/`. | **PASS** (exit `0`) |
| Production Bundle Build | `npm run build` | Vite bundle compilation (`dist/`). | **PASS** (exit `0`) |
| Clean-Copy Install Check | `bun install --frozen-lockfile` | Reproducible install on clean `/tmp` copy (`node_modules` excluded) followed by `validate`, `test:foundation`, and `build`. | **PASS** (`bun`); **FAIL** on plain `npm install` (`ERESOLVE` `ENV-001` unless `--legacy-peer-deps`) |

---

## 2. Stage 02 Browser Prototype Verification (Explicitly Non-Android)

| Environment | Scope Tested | Result | Boundary Rule |
| :--- | :--- | :--- | :--- |
| **Desktop / Software-Rendered Browser (`SwiftShader` Headless Chromium)** | Candidate A (`prototypes/candidate-threejs/`): WebGL2 render (`20–36 FPS`, `1280×720`), keyboard `WASD`, touch joystick drag, `JUMP` button impulse/gravity, sliding AABB collision (`Step Platform A`), viewport camera drag look, `Reset`, Candidate B tab, zero console/page/HTTP errors. | **TESTED (Software Browser)** | Must **never** be cited as an Android GPU or mobile thermal benchmark. |

---

## 3. Git & Canonical Traceability Verification

| Check | Command | Latest Result |
| :--- | :--- | :--- |
| Repository Presence & History | `git status --short && git log -n 3` | **FAIL (`exit 128`):** `.git/` stripped across snapshot restore (`ENV-005`). |
| Canonical GitHub Remote & Clean Clone | `git remote -v` + `git clone <url>` | **BLOCKED (`ENV-002`, `ENV-003`):** Canonical repository URL not recoverable in sandbox. |

---

## 4. Physical Android & Emulator Verification (`NOT TESTED — BLOCKED`)

Required before Stage 02 can achieve **`PASSED`** and unblock **Stage 02B** (`docs/android/ANDROID_TARGET_REQUIREMENTS.md`):

| Environment | Required Tests | Current Status |
| :--- | :--- | :--- |
| **Android Emulator** | Clean CLI `.apk` compile (`godot4` or Capacitor/Gradle), Airplane Mode boot, landscape layout lock. | **NOT TESTED** (`ENV-004`: missing Godot 4, JDK, Gradle, Android SDK). |
| **Physical Android Device** | Model/OS/GPU/API log, average FPS + frame pacing, RAM RSS, thermal stability, multi-touch joystick + camera look, orientation lock. | **NOT TESTED** (`ENV-004`: no physical Android hardware or `.apk`). |
