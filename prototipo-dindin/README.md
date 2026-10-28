# Din Din

Din Din is an original React Native app built with Expo, TypeScript, and Supabase. Its current development prototype has manual movement entry, a monthly summary, metric drill-down, and a year/month savings bar. The Android preview saves new movements locally in SQLite and queues them, but synchronization and authentication are not yet connected. The local database is not encrypted by the app; use fictional data for testing. See `docs/API.md` for the API boundary and open decisions.

## Setup

Use Node.js supported by the selected Expo SDK and pnpm. Install dependencies and start the Expo development server:

```powershell
pnpm install
pnpm start
```

Copy `.env.example` to `.env` only after a development Supabase project is selected. Fill in the project URL and publishable key locally. Do not place secrets in `EXPO_PUBLIC_` variables or commit `.env`.

## Checks

```powershell
pnpm typecheck
pnpm test
pnpm lint
```

## Project map

- `src/app/` — Expo Router routes and layout composition.
- `src/features/metrics/` — approved monthly/yearly calculations and summary UI.
- `src/features/ledger/` — manual-entry and movement-list UI with a local SQLite provider; the in-memory demo provider remains available for tests.
- `src/shared/theme/` — original dark palette and session-only light-theme switch.
- `src/shared/` — shared UI and cross-feature utilities.
- `src/infrastructure/supabase/` — Supabase client and data adapters.
- `__tests__/` — unit and component tests; route tests stay outside `src/app/`.
- `docs/ARCHITECTURE.md` and `docs/ROADMAP.md` — architecture boundaries, missing decisions, and incremental delivery plan.

Read [AGENTS.md](./AGENTS.md) before changing the project.
