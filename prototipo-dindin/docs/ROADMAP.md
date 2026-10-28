# Roadmap

This roadmap separates foundation work from product features. A feature moves forward only after its behavior and acceptance criteria are agreed. The reference app is inspiration for capabilities; its code, branding, and proprietary resources are not project inputs.

## Discovery questions

- Product decisions from the discovery conversation are recorded in `PRODUCT_DECISIONS.md`, including the reference, first-release scope, Android priority, individual account, locale, navigation and later phases.
- Implement the confirmed offline requirement in `API.md`.
- Select the non-production Supabase project, verify operational backup and recovery before real data, and define retention and account-deletion mechanics.
- Determine the exact Android minimum after checking the owner's device and the selected SDK.
- Design the persisted schema, cancelled-movement restoration and remaining acceptance criteria. Accessibility is deferred as a product feature; continue to avoid introducing unnecessary barriers.
- Replace the Expo starter license in a separate repository task after confirming the appropriate private-project notice.

## Incremental plan

### 0. Product discovery

- [x] 0.1 Record the reference app identity and approved feature list in `PRODUCT_DECISIONS.md`.
- [ ] 0.2 Map each approved reference workflow into original user stories and acceptance criteria.
- [ ] 0.3 Record decisions for platforms, authentication, data rules, privacy, offline behavior, visual identity, and release target.

**Exit check:** no feature is scheduled without a testable, user-approved outcome and unresolved dependencies are visible.

### 1. Technical foundation

- [x] 1.1 Create an Expo Router and strict TypeScript shell on a task branch.
- [x] 1.2 Add Jest/React Native Testing Library and a placeholder-screen smoke test.
- [x] 1.3 Add a lazy Supabase client and local environment boundary without adding live credentials.
- [x] 1.4 Add Jest, React Native Testing Library, lint, and typecheck commands with a smoke test.
- [x] 1.6 Record the decision to use Supabase's API from the first financial release and secure the client session storage.
- [ ] 1.5 Agree formatting and CI conventions, then add repeatable automation.

**Exit check:** clean install, app shell starts, and automated checks pass on the chosen development environment.

### 2. Data and security design

- [ ] 2.1 Draft the schema from approved user stories; review ownership, money precision, time handling, and deletion behavior.
- [ ] 2.2 Write migrations and Row Level Security policies for an isolated Supabase project.
- [ ] 2.3 Verify authorization boundaries with positive and negative tests before app features depend on the tables.
- [ ] 2.4 Approve the local data model, durable pending-change queue, retry/idempotency protocol, and conflict/deletion recovery described in `API.md`.

**Exit check:** migration and policy behavior is repeatable and tested; no production secret is present in the app.

### 3. Feature delivery, one capability at a time

- [ ] 3.1 Select one approved workflow and split it into UI, domain, persistence, and test tasks.
- [ ] 3.2 Implement and verify that workflow before starting the next capability.
- [ ] 3.3 Review accessibility, error states, loading states, and empty states against its acceptance criteria.

**Exit check:** each shipped capability has a documented outcome, tests, and no unresolved scope decision.

### 3.1 Financial metrics and savings view

- [x] 3.1.1 Review the supplied metric screenshots and record the described behavior and candidate formulas in `FINANCIAL_METRICS.md`.
- [x] 3.1.2 Confirm realized/planned treatment, savings classification, yearly savings aggregation, and daily-average scope.
- [x] 3.1.3 Implement pure metric calculations with boundary-case tests after those decisions are recorded.
- [x] 3.1.4 Build an original year/month savings progress component with callbacks for year changes and monthly movement navigation.
- [x] 3.1.5 Integrate the metrics into the monthly summary route and connect each indicator to its movement list. Dedicated “how it works” screens and expandable explanations are out of scope.

**Exit check:** every displayed value has a documented formula, visibly distinguishes realized from planned data, opens its source movements, and has tests for empty, zero-income, negative, and month/year boundary cases. The savings component uses an original design and supports year and month periods.

### 3.2 Manual-entry and navigation prototype

- [x] 3.2.1 Add a demo-only in-memory ledger seeded with clearly labeled fictional movements.
- [x] 3.2.2 Add current-month summary, month navigation, annual savings view, and exact metric movement lists.
- [x] 3.2.3 Add manual entry with amount/date/category/status validation and a recent-first movement list.
- [x] 3.2.4 Add session-only dark/light theme selection in settings.
- [ ] 3.2.5 Replace demo state with a financial repository after the persisted data model is reviewed.

**Exit check:** users can exercise the approved entry, summary, and movement-navigation flows with fictional data; no financial state is persisted or synced in this prototype.

### 4. Release readiness

- [ ] 4.1 Confirm target platforms, app identity, privacy copy, and release ownership.
- [ ] 4.2 Validate production Supabase policies and environment separation without exposing credentials.
- [ ] 4.3 Run the agreed device, accessibility, and release checks and prepare a reviewable release candidate.

**Exit check:** the product owner approves the release scope and the candidate passes the agreed checks.

## Current task note

Metric calculations, the savings component, summary and movement routes, and manual-entry demonstration are implemented on `codex/api-foundation`. The user approved the metric calculations in `FINANCIAL_METRICS.md`. The images are functional references only and must not be added to the app's assets.

The user requested an API/backend from the beginning to support later growth. `API.md` records that decision. A Supabase client exists, but financial tables, RLS policies, authentication screens, and synchronization are still pending; do not present them as implemented. The confirmed offline requirement supersedes the earlier online-first proposal; implementation and integration verification remain pending. The Android route now uses a local SQLite ledger; persistence on an actual device and synchronization remain to be verified.


## Local persistence in progress

The Android route now opens the SQLite repository and saves new movements with a pending operation in one transaction. The interface reports save errors. Synchronization, authentication, account isolation, server policies, editing, cancellation, device validation and backup remain incomplete. The local database is not encrypted by the app. The reopen test uses a mock repository and does not verify an Android device. Do not use this prototype for real financial data.


## Android test build

A locally generated test APK was built with the Android SDK using a short, isolated build path and shortened generated CMake directories to avoid Windows path limits. The APK uses the Android debug signing key, contains no configured Supabase project, and is not a production release. Automated typecheck, lint and 36 tests passed; APK signature and package metadata were checked. No Android device was connected, so installation, reopening and offline synchronization have not been verified on a device.


## Queue reliability work

The synchronization coordinator serializes overlapping calls for the same queue instance and leaves operations pending when sending or local acknowledgement fails. Retrying an acknowledged-but-not-recorded operation requires a server adapter that implements idempotency for operation IDs. These are unit-tested coordinator behaviors; the queue is not yet connected to Supabase and encryption, authenticated ownership, conflict resolution, recovery and device verification remain incomplete.


## Development Supabase project status (2026-10-28)

- The isolated `dindin-dev` project exists in the free `Din Din Desenvolvimento` organization, in the São Paulo region. Its project reference is `iizanlsfrxuzrrewoaqq`.
- Email sign-in and email confirmation are enabled. Public sign-up is disabled; anonymous sign-in and manual account linking are disabled. The email provider has secure email and password changes enabled. Default Auth rate limits remain in place.
- The project was created with the Data API enabled, automatic exposure of new tables disabled, and automatic RLS enabled for new public tables. These defaults do not replace reviewed grants, policies, and authorization tests.
- An owner test user was created and marked confirmed in Supabase Auth; no successful app sign-in has been verified. Do not record its email or password in this repository.
- No database migration, redirect URL, or app environment configuration has been completed. The default site URL is still `http://localhost:3000`; do not send an invitation or use password recovery until a verified app callback and suitable email delivery exist.
- The free project currently reports no backups. Use fictitious data only. Before real data, verify backup and restore, account deletion, and migration/RLS tests.

## Supabase operation log draft

A development migration and sender were prepared for owner-scoped, immutable operations and idempotent retries. They have not been applied or tested against PostgreSQL or RLS and are not connected to the app. Authentication, encrypted local storage, migration of existing data, remote download/recovery, conflict handling, account deletion and device validation remain incomplete. Do not use with real financial data.


## Account isolation for queued operations

The draft submit RPC verifies that the authenticated owner matches the expected owner supplied by the adapter before storing an operation. The app must still bind each device queue durably to an authenticated user and stop on account changes; it must not invoke the sender until that binding is implemented. The migration remains unreviewed and untested in Supabase.


## Android test interface

The savings section displays a selected month instead of twelve stacked cards. The month follows the summary period; realized and projected savings rates remain calculated from savings divided by income, and movements remain accessible. The user-approved image is configured as the Android launcher and adaptive foreground icon. This is a test build; synchronization and local encryption are not implemented.

## Account sign-in implementation

The app now has a test-account screen in Settings. It supports email/password sign-in, verified session display, and local-device sign-out through the Supabase adapter. The session uses SecureStore and refreshes while the app is active. The screen is unavailable when the build has no public Supabase URL and publishable key. Sign-in is not yet connected to the local ledger, so it does not protect or synchronize existing movements. Password recovery, an app callback URL, email delivery, account-scoped local data migration, RLS integration tests, and a device build remain pending. Do not label the previous APK as containing this screen.

