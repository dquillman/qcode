# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: App Router entrypoints (`page.tsx`, `layout.tsx`) and global styles (`globals.css`).
- `src/components`: Reusable React components (PascalCase `.tsx` files, e.g., `ProjectCard.tsx`).
- `src/data`: Typed content/config modules (e.g., `projects.ts`).
- `public`: Static assets served at the root.
- `.next`: Build output (ignored in VCS).

## Build, Test, and Development Commands
- `npm install`: Install dependencies.
- `npm run dev`: Start local dev server with Turbopack at `http://localhost:3000`.
- `npm run build`: Create a production build (Turbopack).
- `npm start`: Serve the production build.
- `npm run lint`: Run ESLint with Next.js/TypeScript config.

## Coding Style & Naming Conventions
- **Language**: TypeScript + React 19 + Next.js 15 (App Router).
- **Linting**: ESLint extends `next/core-web-vitals` and `next/typescript` (`eslint.config.mjs`). Fix or justify rule suppressions.
- **Components**: PascalCase filenames in `src/components` (e.g., `ProjectsSection.tsx`). Prefer functional components and typed props.
- **App routes**: Use Next reserved filenames (`page.tsx`, `layout.tsx`). Keep server/client boundaries explicit (`"use client"` when needed).
- **Styles**: Tailwind CSS v4 via PostCSS. Favor utility-first classes; keep global CSS minimal.

## Testing Guidelines
- **Current state**: No test harness is configured.
- **Additions**: Prefer Vitest + React Testing Library for unit tests; Playwright for e2e.
- **Conventions**: Name tests `*.test.ts`/`*.test.tsx`; colocate with source or use `src/__tests__`.
- **Commands**: When introducing tests, add `npm test` and optional `test:watch`, and document usage in PRs.

## Commit & Pull Request Guidelines
- **Commits**: Imperative, concise subjects (e.g., `Add ProjectsSection loading state`). Conventional Commits are welcomed (`feat:`, `fix:`, `chore:`).
- **PRs**: Include purpose, linked issues, approach, and testing notes. For UI changes, add screenshots/GIFs. Ensure `npm run lint` and `npm run build` pass.
- **Scope**: Keep PRs focused; prefer incremental changes over large refactors.

## Security & Configuration Tips
- Use environment files (`.env.local`) for secrets; never commit secrets.
- Avoid committing large binaries; place static assets under `public/`.
- Update `.eslint` ignores only when necessary; do not mask real issues.

## Admin & Data Persistence
- Set `ADMIN_TOKEN` in `.env.local` to enable authenticated project creation.
- Admin UI at `/admin` lets you submit new projects; the API writes to `src/data/projects.json`.
- API: `GET /api/projects` (list), `POST /api/projects` (add; requires `Authorization: Bearer <ADMIN_TOKEN>`).
- Note: JSON file persistence is for local/dev. Serverless hosts may be read-only; use a database in production.
