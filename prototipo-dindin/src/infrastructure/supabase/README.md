# Supabase integration

Keep client configuration and Supabase-specific adapters here. The auth session uses Expo SecureStore and refreshes while the app is active. The account adapter supports email/password sign-in, verified user lookup, and sign-out for this device only. The account screen does not bind the local ledger to a user or start synchronization. Add schema only through reviewed migrations after the product data model is approved. The mobile client must use a publishable key; never add a service-role key or commit real credentials. See `docs/API.md` for the local-first synchronization boundary.

