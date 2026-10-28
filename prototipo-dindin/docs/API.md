# API and synchronization decision

> **Confirmed decision:** Save financial changes locally and retain them until server confirmation, including after closing the app or losing connectivity. This supersedes the earlier online-first proposal.

## Approved direction

The first release serves one person, but its financial data will be designed for a backend from the beginning. Supabase Auth, Postgres, and its generated data API are the initial backend choice. A separate custom HTTP server is not required unless a later operation cannot be safely implemented with authenticated database access, Row Level Security (RLS), and narrowly scoped server functions.

The app must remain usable offline. The server is the durable shared copy after synchronization; the device keeps a local copy and a durable queue of pending changes. Reconnecting must never discard a local change merely because a server response arrived. A change leaves the queue only after the server confirms it. When a conflict cannot be resolved safely, preserve both versions for review rather than silently overwriting or deleting either one.

This decision establishes architecture, not a completed API. No financial table or endpoint is exposed yet.

## Boundaries

```text
Feature screen -> feature use case -> repository contract
                                  -> local repository and pending-change queue
                                  -> synchronization coordinator
                                  -> Supabase adapter -> generated HTTPS API -> Postgres + RLS
```

- Screens do not call Supabase directly. The local repository is the read/write path for offline-capable financial features.
- Supabase authentication sessions are stored using the operating system's secure storage. The publishable key is public configuration, not a secret. Service-role credentials stay off the device.
- Every financial table must have RLS enabled and explicit read/write policies before the app can access it. Authorization is verified in the database, never by a client-supplied owner field alone.
- Mutations need stable client-generated IDs and idempotent retry behavior so network retries do not duplicate entries. The exact table schema and conflict protocol require an approved data model.
- Server functions are reserved for operations requiring privileged checks, such as future invitations. They must validate the authenticated user and membership. No sharing flow is part of the first release.
- Use separate development and production projects. Migrations are versioned and reviewed before application. Never test production policies with real financial data.

## Decisions required before financial persistence

1. Sign-in method and whether an account is mandatory before first use.
2. Approved financial entities and fields, including transaction categories, card behavior, recurring items, currency and timezone.
3. Offline conflict behavior for simultaneous edits, deletions and restoration; export and account-deletion expectations.
4. Backup and recovery policy, including how users recover data after losing a device while changes are still pending locally.
5. Development Supabase project and a way to run migrations and authorization checks there.

Until these are decided, do not create speculative financial tables, enable anonymous financial writes, or call the API from product screens.
