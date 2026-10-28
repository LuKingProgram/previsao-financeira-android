# Architecture proposal

Product decisions are recorded in `PRODUCT_DECISIONS.md`. The offline requirement in `API.md` supersedes the earlier online-first proposal.

## Current foundation

The repository uses Expo Router, React Native, and strict TypeScript. `src/app/` owns route files and layout composition. The current routes compose a clearly labeled, fictional in-memory prototype; its state is not written to a database or local storage.

## Proposed module boundaries

```text
src/
  app/                         Expo Router routes and layouts
  features/<approved-domain>/  feature UI, application logic, types, and repository contracts
  shared/                      reusable UI and cross-feature utilities
  infrastructure/
    supabase/                  client setup, generated database types, and repository adapters
supabase/
  migrations/                  reviewed schema and RLS migrations
__tests__/                     unit and component tests, outside the route directory
docs/                          requirements, decisions, architecture, and roadmap
```

Feature modules own their domain rules. Route files compose feature screens. Feature logic depends on repository contracts; Supabase adapters implement those contracts. This keeps screens independent of database details and makes business rules testable without a live service.

## Supabase approach

- Keep the client configuration in one infrastructure module and read configuration from local environment variables.
- The mobile client may use only the Supabase publishable key. Never bundle the service-role key or another secret.
- Add schema and access policies as source-controlled migrations after the product data model is approved.
- Require Row Level Security for user-owned data and test policies against a non-production project before relying on them.
- Use the backend from the first financial release, with a local read/write path and durable pending-change queue for offline use. The approved boundary and remaining decisions are in `API.md`.
- Decide authentication, the persisted data model, conflict/deletion behavior, retention, and backup expectations before implementing the relevant flows.

## Test layers

- Jest with `jest-expo` and React Native Testing Library for unit and component behavior.
- Supabase integration tests against a local or isolated non-production project once schema and policies exist.
- End-to-end device flows only after the primary workflows and target platforms are agreed.

## Current product boundary and deferred decisions

The financial metrics behavior is approved and recorded in `FINANCIAL_METRICS.md`; its pure calculation module does not depend on Expo, Supabase, or the UI. Summary, movement-list, manual-entry, and settings prototype screens are in place. A financial repository and durable queue remain to be implemented and verified.

The first release is for one person's finances and will use a backend from the start. A shared household remains a later phase. Supabase is the selected initial backend; its Auth, generated data API, Postgres, and RLS avoid operating a separate custom server. Financial data synchronization still requires the product decisions listed in `API.md` before implementation.
