# Cat Track

TanStack Start app for tracking cat feeding times.

## Stack

- **Package manager**: Bun
- **Framework**: TanStack Start (React 19, TanStack Router, React Query)
- **Build**: Vite 7, Nitro
- **Styling**: Tailwind v4, shadcn (radix-mira style), Geist font
- **Icons**: Lucide

## Key paths

- `src/routes/` — file-based routing
- `src/components/` — UI (shadcn in `ui/`)
- `src/server/` — server functions (e.g. `theme.ts`)
- `src/lib/utils.ts` — `cn()` for class merging

## Patterns

- **Server functions**: `createServerFn()` from `@tanstack/react-start`
- **Theme**: `light` / `dark` / `system` via cookie `_cat_track_theme`
- **Path aliases**: `@/components`, `@/lib`, `@/hooks`
- **Styles**: `src/styles.css` — shadcn CSS vars, `@custom-variant dark (&:is(.dark *))`

## Commands

- `bun dev` — dev server on :3000
- `bun run check` — format + lint
- `bun run typecheck` - validate types and errors
