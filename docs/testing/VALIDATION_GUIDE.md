# Foundation Validation Guide

## Running the Validator
```bash
npm run validate
```
Or invoke directly with an optional custom root (used for automated negative tests):
```bash
node tools/validation/validate-foundation.mjs --root /path/to/workspace
```

## Checks Performed
1. **Required Root Documentation (9 files):** Confirms existence, non-empty content, and essential structural markers (all 36 stages in `STAGE_TRACKER.md`, 6 Multi-AI roles + 9 handoff fields in `AI_HANDOFF.md`, undecided runtime marker in `ARCHITECTURE.md` / `DECISIONS.md`).
2. **Reserved Companion Boundary:** Confirms `website/README.md` exists and explicitly documents that `website/` is not the game runtime.
3. **Directory Structure:** Confirms all 25 required directories exist (`docs/*`, `tools/*`, `tests/*`, `game/*`, `website/`, `builds/*`).
4. **Runtime Neutrality:** Inspects `package.json` to ensure no game engine (`three`, `@react-three/fiber`, `babylonjs`, `phaser`, `pixi.js`, `playcanvas`, etc.) was prematurely added in Stage 01.
5. **Security / No-Secrets Scan:** Scans repository files for common credential/API-key signatures and rejects committed `.env` files.
6. **Preserved Workspace Integrity:** Confirms core preserved files (`package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `metadata.json`, `src/App.tsx`, `src/main.tsx`, `src/index.css`) exist.

## Exit Codes
- `0`: All checks passed.
- `1`: One or more checks failed; inspect `[FAIL]` output lines.
