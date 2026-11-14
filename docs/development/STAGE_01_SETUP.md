# Stage 01 Workspace Setup & Preservation Notes

## Preserved Workspace Files
When Stage 01 began, the workspace already contained an active Vite + React + TypeScript + Tailwind scaffold:
- `.env.example`
- `.gitignore`
- `index.html`
- `metadata.json`
- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `src/App.tsx`, `src/main.tsx`, `src/index.css`

Per `PROJECT_RULES.md` ("No Unnecessary Rewrites"), these files were preserved rather than deleted. `src/App.tsx` serves strictly as a lightweight Stage 01 Foundation Diagnostic Manifest on port 3000.

## First-Time Setup After Cloning
1. Run `npm install` (if `node_modules/` is absent).
2. Run `npm run init:dirs` to materialize empty reserved directories (`game/*`, `builds/*`).
3. Run `npm run validate` and `npm run test:foundation` to confirm repository integrity.
4. Run `npm run workspace:info` to inspect branch, commit, and Node environment state.
