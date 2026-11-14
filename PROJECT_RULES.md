# NEXUS VELOCITY — Permanent Project Rules

These rules govern **all 36 stages** of NEXUS VELOCITY across every AI tool and human contributor. Violations constitute an automatic stage inspection failure.

---

## 1. No Unnecessary Rewrites
- Always inspect the existing workspace before creating, moving, or modifying files.
- Never delete an existing working codebase or template to "start fresh."
- Make targeted, incremental edits; preserve working configurations and validated code.

## 2. No Unverified Feature Claims
- Never claim a file exists unless you created or directly inspected it.
- Never claim a test, build, or check passed unless you actually executed it and observed its output.
- Never represent placeholder UI, mock data, or a browser preview as a completed game feature or standalone Android build.

## 3. No Secrets in Source Code
- Never commit API keys, tokens, passwords, signing keystores, or private credentials to the repository.
- Use environment variables / secret managers (`.env*` is gitignored; only `.env.example` with non-secret placeholder keys may be committed).
- Run `npm run validate` before commits to scan for accidental credential patterns.

## 4. Android-First Engineering Discipline
- **Primary Target:** Standalone downloadable Android application (APK/AAB).
- Every architectural, rendering, asset, memory, and input decision must account for mobile hardware constraints:
  - Strict RAM and VRAM budgets.
  - Thermal throttling and battery sustainability.
  - Touch-first controls with optional controller support.
  - Compact storage and compressed asset pipelines.
- Never confuse a desktop browser preview or SwiftShader software WebGL readout with a verified Android GPU benchmark or standalone `.apk`/`.aab` build. Separate physical Android, emulator, desktop/browser, and `NOT TESTED` metrics explicitly.

## 5. Offline-First Core Gameplay
- Core NEXUS VELOCITY gameplay (exploration in Nexus City, Kai Veyron movement, Velocity Core mechanics, missions, vehicles, progression, and saving) **must function completely offline**.
- Network connectivity may only be required for optional companion services or optional cloud-assisted features—never as a gate to launch or play the core game.

## 6. AI-Provider Independence
- Optional AI-powered world and mission systems must sit behind clean, provider-agnostic interfaces (`game/systems/`).
- Never hard-couple core game logic to a single LLM vendor, SDK, or proprietary cloud endpoint.
- Always support deterministic local fallbacks when offline or when no AI provider is configured.

## 7. Original Intellectual Property Only
- NEXUS VELOCITY is an original creative work (Nexus City, Kai Veyron, Velocity Core).
- Strictly prohibited: copying GTA characters, maps, missions, logos, audio, UI assets, or copyrighted media from any existing franchise.
- All code, documentation, 3D assets, textures, audio, and narrative elements must be original or properly licensed with documented provenance.

## 8. Technology Selection Discipline & Stage Gating
- Do not prematurely lock in a game engine or runtime in Stage 01.
- Stage 02 is explicitly dedicated to evaluating at least two realistic runtime approaches and benchmarking real Android packaging.
- Do not advance to Stage `N + 1` until Stage `N` has undergone independent QA inspection and received a `PASS`.

## 9. Multi-AI Tool Independence & GitHub Source of Truth
- Any AI contributor must be able to pick up work solely from the repository state (`ARCHITECTURE.md`, `AI_HANDOFF.md`, `STAGE_TRACKER.md`, `DECISIONS.md`, `KNOWN_BUGS.md`) without access to prior chat transcripts.
- GitHub is the canonical source of truth. Never assume unpublished changes from another AI session exist.
