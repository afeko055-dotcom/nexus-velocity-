# NEXUS VELOCITY — Architectural Decisions Record (ADR)

---

## ADR-001: Preserve Existing Workspace Scaffold & Tooling
- **Status:** `ACCEPTED` (Stage 01)
- **Context:** The initial workspace contains an existing Vite + React + TypeScript + Tailwind configuration (`package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `metadata.json`, `src/`).
- **Decision:** Preserve all existing workspace configuration and use `src/App.tsx` strictly as a lightweight Stage 01 diagnostic foundation manifest rather than deleting the project or building a fake game in React.
- **Alternatives Considered:**
  1. Delete all existing files and start with bare Markdown files only (rejected: violates no-unnecessary-rewrite rule and breaks cloud preview server on port 3000).
  2. Install Three.js / WebGL inside React to show a 3D demo (rejected: violates Stage 01 prohibition on premature engine selection and fake 3D previews).
- **Rationale:** Preserves environment stability while keeping the Stage 01 boundary honest.

---

## ADR-002: Defer Game Engine & Runtime Selection to Stage 02
- **Status:** `ACCEPTED — ENGINE UNDECIDED` (Stage 01)
- **Context:** NEXUS VELOCITY targets a genuine standalone downloadable 3D open-world Android game (with future Windows support). Choosing an engine without benchmarking Android packaging and open-world constraints risks costly rewrites.
- **Decision:** **Do not select** Godot, Unity, Unreal, Three.js, or any other runtime in Stage 01. Keep `game/runtime/` empty and evaluate at least two realistic approaches in Stage 02.
- **Alternatives Considered:** Immediately selecting Godot or Unity in Stage 01 (rejected: prohibited by Master Blueprint until comparative Android packaging tests are completed).
- **Rationale:** Ensures evidence-based runtime selection anchored to real Android APK/AAB performance.

---

## ADR-003: Standalone Offline-First Android Target
- **Status:** `ACCEPTED` (Stage 01)
- **Context:** Browser previews cannot satisfy standalone mobile distribution, offline play, or native hardware resource management.
- **Decision:** Enforce standalone downloadable Android packaging (APK/AAB) and 100% offline-capable core gameplay as non-negotiable architectural invariants.
- **Rationale:** Guarantees players can launch and play NEXUS VELOCITY anywhere without internet dependency.

---

## ADR-004: Multi-AI Tool Independence & GitHub Canonical Source of Truth
- **Status:** `ACCEPTED` (Stage 01)
- **Context:** Multiple AI assistants (Claude, Replit, Google AI Studio, Qwen, Base44) collaborate across stages without shared chat memory.
- **Decision:** Require structured repository documentation (`AI_HANDOFF.md`, `STAGE_TRACKER.md`, `DECISIONS.md`) and explicit 9-field handoffs anchored to GitHub commits.
- **Rationale:** Prevents context loss and enables seamless takeover when any single tool is unavailable.

---

## ADR-005: AI-Provider Independence for Optional Systems
- **Status:** `ACCEPTED` (Stage 01)
- **Context:** Future optional world/mission systems may leverage generative AI, but vendor lock-in or mandatory connectivity would break offline play and portability.
- **Decision:** Isolate optional AI capabilities behind provider-agnostic adapters in `game/systems/` with mandatory deterministic local fallbacks. Note: `package.json` currently includes `@google/genai` from the initial workspace template; it is **not** wired into any game runtime and does not lock the future game engine to any AI vendor.
- **Rationale:** Preserves offline integrity and cross-provider flexibility.

---

## ADR-006: Dependency-Free Node.js Validation & Test Harness for Stage 01
- **Status:** `ACCEPTED` (Stage 01)
- **Context:** Stage 01 requires real automated validation scripts in a lightweight cloud environment without installing heavy game engines or extra npm packages.
- **Decision:** Implement `tools/validation/validate-foundation.mjs` and `tests/` using built-in Node.js (`v22+`) standard modules (`node:fs`, `node:path`, `node:test`, `node:assert/strict`).
- **Alternatives Considered:** Installing Jest/Vitest/Python linters (rejected: unnecessary dependencies for Stage 01 filesystem/governance checks).
- **Rationale:** Fast, zero-dependency, deterministic execution on any machine with Node 22+.

---

## ADR-007: Isolated Stage 02 Candidate Prototypes (`prototypes/`)
- **Status:** `ACCEPTED — FINAL ENGINE STILL UNDECIDED` (Stage 02)
- **Context:** Stage 02 requires an actual visible, interactive 3D technical demonstration per realistic candidate without prematurely locking `game/runtime/` to a final engine.
- **Decision:** Keep all Stage 02 candidate demonstrations isolated under `prototypes/` (`prototypes/candidate-threejs/` for WebGL evaluation; `prototypes/candidate-godot4/` documenting Godot 4 Mobile/Forward+ and verified sandbox toolchain absence `ENV-004`). `game/runtime/` must remain untouched (`.gitkeep` only) until independent Stage 02 evaluation completes.
- **Rationale:** Satisfies interactive 3D technical proof requirements while maintaining strict engine neutrality until native Android APK benchmarks run.

---

## ADR-008: Stage 02 Comparative Evaluation, Canonical Git Baseline & Stage 02B Blocking Gate
- **Status:** `ACCEPTED — STAGE 02B BLOCKED / ENGINE UNDECIDED` (Stage 02 Recovery)
- **Context:** A 11-criteria technical comparison (`docs/architecture/STAGE_02_TECHNOLOGY_EVALUATION.md`) evaluated Three.js + Capacitor/WebView vs. Godot 4 Mobile vs. Unity against NEXUS VELOCITY's standalone offline Android + Windows open-world goals and 8 GB RAM workstation constraint. Godot 4 Mobile is provisionally favored technically, while Three.js is the only runtime executable inside this Node sandbox. Additionally, prior Git history was unavailable after container snapshot restore (`ENV-005`), and the user authorized connecting the empty canonical GitHub repo `https://github.com/afeko055-dotcom/nexus-velocity`.
- **Decision:**
  1. Establish a **new, honestly documented Git baseline** on `main` (without claiming previous commit history was recovered) and configure `origin` to `https://github.com/afeko055-dotcom/nexus-velocity.git`.
  2. Keep **`UNRESOLVED-01` OPEN (`UNDECIDED`)**, **`Stage 01 = CONDITIONAL`**, **`Stage 02 = FAIL`**, and **`Stage 02B = BLOCKED`** until real Android `.apk` packaging is verified (`ENV-004`), decision-makers approve the engine, and independent QA passes Stage 02.
- **Rationale:** Establishes canonical GitHub source-of-truth traceability while strictly enforcing evidence-based runtime selection (`ANDROID_TARGET_REQUIREMENTS.md` §5, `PROJECT_RULES.md` §2 & §8).

---

## Explicitly Unresolved Decisions (Scheduled for Later Stages)

| Decision ID | Topic | Target Stage | Notes |
| :--- | :--- | :---: | :--- |
| `UNRESOLVED-01` | Primary 3D Game Engine / Runtime (Godot 4 Mobile provisionally favored vs Three.js + Capacitor fallback) | **Stage 02** | **OPEN / UNDECIDED.** Evaluation matrix recorded (`docs/architecture/STAGE_02_TECHNOLOGY_EVALUATION.md`); blocked on native `.apk` verification (`ENV-004`) and formal approval. |
| `UNRESOLVED-02` | Local Save Serialization Format (SQLite / Binary / Encrypted JSON) | **Stage 12** | Depends on chosen runtime from Stage 02. |
| `UNRESOLVED-03` | Optional AI Provider Adapter Implementations | **Stage 27** | Must remain optional and offline-fallback safe. |
| `UNRESOLVED-04` | Companion Website Stack (`website/`) | **Stage 32** | Reserved for Base44 / optional companion services only. |
