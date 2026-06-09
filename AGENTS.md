# AGENTS.md

## Architecture

- **Front-end**: `Front-end/UISaaS/` — React 19 + TypeScript 6 + Vite 8 SPA
- **Backend**: `Backend/` — Python 3.14 + FastAPI + uvicorn (stub; `main.py` is a deliberately broken `import fast` — `fast` is not a real package, do not try to install or fix it)

No git repo, no CI, no tests, no pre-commit hooks yet.
Dependencies are already installed — `node_modules` (Front-end) and `venv` (Backend) exist and are populated.

## Front-end commands (run from `Front-end/UISaaS/`)

| Command | What it does |
|---------|-------------|
| `npm run dev` | Vite dev server (HMR) |
| `npm run build` | `tsc -b && vite build` — typecheck first, then bundle |
| `npm run lint` | `eslint .` |
| `npm run preview` | Vite preview of production build |

- ESLint config in `eslint.config.js` uses flat config with typescript-eslint, react-hooks, react-refresh.
- tsconfig is a project references setup: root `tsconfig.json` references `tsconfig.app.json` (src) and `tsconfig.node.json` (vite config).
- `tsc -b` builds both referenced projects.
- React Compiler is enabled via `@rolldown/plugin-babel` in `vite.config.ts`, not via the Vite React plugin alone.

## Backend commands (run from `Backend/`)

- Activate venv: `.\venv\Scripts\Activate.ps1`
- Installed packages: fastapi, uvicorn (and transitive deps)
- The backend is a stub — no runnable server yet.   

## Non-obvious TypeScript config

- `erasableSyntaxOnly: true` — forbids enums, namespaces, constructor parameter properties.
- `verbatimModuleSyntax: true` — `import type` must be used for type-only imports; re-exports must use `export type`.
- `noUnusedLocals` and `noUnusedParameters` are both true — the build will fail on unused variables.
