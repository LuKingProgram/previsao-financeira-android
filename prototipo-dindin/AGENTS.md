# Project rules

## Product scope

- Read `docs/` before changing product behavior. Treat approved requirements as the source of truth.
- Do not implement an unspecified screen, workflow, data field, integration, or policy. Record the question in `docs/ROADMAP.md` and get a product decision first.
- Reimplement agreed behavior with original code, copy, visual design, and assets. Do not copy the reference app's source, brand, logo, or proprietary resources.
- Keep each task small, reviewable, and documented. Update the architecture or roadmap when a decision changes.

## Git workflow

- Work on a task branch named `codex/<short-description>`.
- Never commit changes directly to `main` or `master`; do not merge or publish a branch unless explicitly requested.
- Check `git status` before and after each task. Preserve unrelated user changes.

## Architecture and code

- Use React Native, Expo, and strict TypeScript. Keep `src/app/` limited to Expo Router layouts and route composition.
- Organize approved product capabilities as feature modules under `src/features/<capability>/`.
- Put reusable UI and cross-feature utilities under `src/shared/`; keep Supabase access and adapters under `src/infrastructure/supabase/`.
- Keep screens away from direct database calls. Route through feature logic and repository interfaces/adapters.
- Prefer small typed functions and components. Avoid introducing state-management, UI, or data libraries before a documented need exists.

## Supabase and secrets

- Keep local environment files out of Git. `.env.example` may contain empty placeholders only.
- Never commit or print passwords, access tokens, service-role keys, or other credentials. `EXPO_PUBLIC_` variables are shipped to the client and must never contain secrets.
- Never use a Supabase service-role key in the mobile app. Add database schema through reviewed migrations and apply Row Level Security policies before feature data is accessed.
- Use a non-production Supabase project for development and integration verification.

## Verification and handoff

- Before finishing a task, run the checks relevant to the change: `pnpm typecheck`, `pnpm test`, and `pnpm lint` for app changes.
- Do not claim a check passed unless its command completed successfully; explain any environmental blocker.
- At task completion, report the change summary, checks run, and open decisions or blockers.
