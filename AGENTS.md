# AGENTS.md — Movisun frontend

## Stack
- React 18 + TypeScript + Vite 6 + Tailwind CSS v4
- MUI v7, Radix UI, shadcn/ui components, motion (framer-motion)
- **Package manager: pnpm** (has `pnpm-workspace.yaml`)

## Commands
| Purpose | Command |
|---------|---------|
| Dev server | `npm run dev` |
| Build | `npm run build` |

No tests, linter, or typechecker configured.

## Architecture
- **Single-page app** — all application code lives in `src/app/App.tsx` (one massive file)
- **Entrypoint**: `src/main.tsx` → `src/app/App.tsx`
- **UI components** (shadcn): `src/app/components/ui/`
- **Custom components**: `src/app/components/figma/`
- **Theme**: `src/styles/theme.css` — CSS custom properties, primary brand color `#1A2F5F`
- **Tailwind v4 CSS entry**: `src/styles/tailwind.css` (uses `@tailwindcss/vite` plugin)
- **Font**: Plus Jakarta Sans (Google Fonts, loaded in `fonts.css`)
- **Static images**: `src/imports/` (PNGs)
- **Path alias**: `@` → `./src` (configured in `vite.config.ts`)

## Quirks
- Special import resolver for `figma:asset/...` paths (maps to `src/assets/`)
- Raw imports allowed for `*.svg` and `*.csv` files only (never add `.css`, `.tsx`, or `.ts`)
- PostCSS config is intentionally empty (Tailwind v4 `@tailwindcss/vite` handles everything)
- `guidelines/Guidelines.md` contains design system conventions
- `plans/` contains project plans

## Generated code
Project was exported from Figma (via Figma's "Make" feature). The original design is at https://www.figma.com/design/m7mU3wO5b4qSuoOxAcEMQ1/Website-mockup-for-Movisun.
