# NEXUS VELOCITY — System Architecture

> **Stage:** 01 (Foundation)  
> **Runtime Decision Status:** **UNDECIDED — DEFERRED TO STAGE 02**

---

## 1. Current Architecture (Stage 01)

In Stage 01, the repository contains **no game engine or gameplay runtime**. The active workspace consists of:

1. **Governance & Handoff Layer (Root Markdown Documents):**
   - Permanent rules, architecture boundaries, stage tracker (Stages 01–36), decisions log, bug tracker, test plan, and AI handoff protocol.
2. **Validation & Diagnostic Tooling (`tools/` & `tests/`):**
   - Dependency-free Node.js (`v22+`) validation CLI (`tools/validation/validate-foundation.mjs`) and built-in `node:test` suites (`tests/`).
3. **Preserved Workspace Diagnostic Shell (`src/`, `index.html`, `vite.config.ts`):**
   - Pre-existing Vite + React + TypeScript workspace preserved intact and repurposed strictly as a **Stage 01 Foundation Manifest** display for cloud IDE previews. It is **not** the game runtime.
4. **Reserved Domain Skeleton (`game/`, `website/`, `builds/`, `docs/`):**
   - Documented directory boundaries prepared for Stage 02+ implementation without premature fake code.

---

## 2. Runtime Decision Status

- **Status:** **UNDECIDED (`UNRESOLVED-01` OPEN — Stage 02B BLOCKED)**
- **Evaluation Record:** `docs/architecture/STAGE_02_TECHNOLOGY_EVALUATION.md` compares Candidate A (**Three.js WebGL2 + Capacitor/WebView**), Candidate B (**Godot 4 Mobile Native**), and Candidate C (**Unity**, excluded for 8 GB RAM constraint) across all 11 criteria.
- **Sandbox Blockers (`ENV-004`):** No Godot binary, OpenJDK, Gradle, Android SDK (`adb`, `sdkmanager`), or physical Android device exists in this container; therefore no `.apk`/`.aab` build or Android GPU benchmark has been executed.
- **Strict Boundary:** `game/runtime/` remains unpopulated (`.gitkeep` only). All browser-side WebGL proof code stays isolated inside `prototypes/candidate-threejs/` until an authoritative decision is approved and Stage 02 passes independent QA.
- **Stage 02 Completion Criteria Remaining:**
  1. Standalone Android `.apk`/`.aab` build & startup verification on real toolchain (`ENV-004`).
  2. Physical Android device GPU / memory / thermal test (or documented CI/device sign-off).
  3. Formal approval locking `UNRESOLVED-01` in `DECISIONS.md` and canonical Git sync (`ENV-005`).

---

## 3. Proposed Module Boundaries

| Directory | Responsibility & Boundary |
| :--- | :--- |
| `game/runtime/` | Engine entry point, platform bootstrap, lifecycle hooks, Android/Windows wrappers (Stage 02+). |
| `game/core/` | Frame loop abstractions, dependency container, event bus, deterministic clock, local save/load serialization interfaces. |
| `game/systems/` | Cross-cutting game systems: physics/collision adapters, input mapping (touch/gamepad/keyboard), optional provider-agnostic AI mission/world adapter. |
| `game/player/` | Kai Veyron controller, third-person camera rig, locomotion states, Velocity Core ability integration. |
| `game/world/` | Nexus City district streaming, terrain/urban geometry partitions, points of interest, ambient world state. |
| `game/missions/` | Mission state machine, objective tracking, rewards, deterministic fallback mission definitions. |
| `game/vehicles/` | Futuristic vehicle physics, entry/exit transitions, handling profiles, Velocity Core boost coupling. |
| `game/characters/` | Original NPCs, factions, dialogue triggers, crowd/traffic behavior abstractions. |
| `game/assets/` | Original 3D models, PBR textures, animations, shaders, LOD variants (mobile-budgeted). |
| `game/ui/` | In-game HUD, Velocity Core meter, pause/map/inventory screens, touch control overlays. |
| `game/audio/` | Spatial sound effects, adaptive music stems, ambient Nexus City audio banks. |
| `game/data/` | Declarative JSON/config definitions for districts, vehicles, missions, progression curves, and balancing tables. |
| `website/` | **Strictly reserved** for future optional companion web portals or admin tools (Base44 / web). Never hosts the game runtime. |
| `builds/development/` | Local development artifacts and test APKs (gitignored binaries). |
| `builds/releases/` | Signed release candidate artifacts and release manifests. |

See `docs/architecture/MODULE_BOUNDARIES.md` for dependency direction rules.

---

## 4. Intended Data Flow (Target Architecture)

```text
[Touch / Gamepad Input]
         │
         ▼
  [game/systems (Input)] ──▶ [game/player (Kai Veyron + Velocity Core)]
         │                                    │
         ▼                                    ▼
  [game/core (Event Bus & State)] ◀──▶ [game/world / game/vehicles / game/missions]
         │
         ├──▶ [Local Offline Save Storage (Device Disk)]   (Mandatory: 100% Offline)
         │
         └──▶ [Optional AI Adapter Interface] ──▶ (Local Deterministic Fallback)
                                              └──▶ (Optional Cloud AI Provider when online)
```

---

## 5. Android Packaging Considerations

- **Standalone Binary Requirement:** Final output must install and launch as a native Android package (`.apk` for testing, `.aab` for store distribution) without requiring Chrome/WebView internet access.
- **Asset Size & Streaming:** District assets under `game/world/` and `game/assets/` must support LODs, compressed mobile textures (ASTC/ETC2), and chunked loading to fit mid-tier Android RAM (4–6 GB devices).
- **Thermal & Battery:** Target stable frame pacing (30/60 FPS configurable) with scalable shadow/draw-distance profiles.
- Detailed requirements are tracked in `docs/android/ANDROID_TARGET_REQUIREMENTS.md`.

---

## 6. Offline Requirements

- Zero network calls are permitted on the critical path of app launch, main menu, Nexus City loading, Kai Veyron movement, Velocity Core mechanics, missions, vehicles, or save/load.
- Optional AI-driven dynamic content must fail gracefully to local deterministic mission/world generators whenever offline or unconfigured.
