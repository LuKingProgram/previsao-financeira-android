# Din Din: product decisions

This document records the decisions confirmed in the product discovery conversation. Requirements still needing a decision are explicitly marked as open. Reference screenshots from Escola do Breno inform behavior and calculations; the app must use original code, copy, branding and visual assets.

## First release

- Din Din is an individual finance app, prioritizing Android and a private installation on the owner's device. Support the owner's current Android version and recent versions; an exact minimum remains open pending device and SDK verification.
- Use Brazilian Portuguese, BRL in cents, Brazilian date presentation and the São Paulo time zone.
- Start with manual entry, a monthly summary, approved metrics, a yearly/monthly savings bar and access to the movements behind each displayed value. `FINANCIAL_METRICS.md` remains the source for the approved formulas.
- Use Supabase from the first financial release. Sign in with email and password, including password recovery. For the private test, registration is closed and the owner's account is created in advance; a new account after account deletion is provisioned administratively.
- Use an isolated non-production Supabase project and fictitious data for development and integration verification. Verify operational backup and recovery before using real financial data. There is no user-controlled backup, restore, or CSV export in the first release.
- Provide account deletion in account settings, with explicit confirmation and password reauthentication, deleting the associated live financial data. Backup retention and recovery mechanics still need to be established for the selected project.
- Use an original dark visual theme with an option to switch to a light theme. Accessibility features are planned for a later phase.

## Navigation and movements

- Open on the current month's summary. Provide bottom navigation for Summary and Movements, a prominent add action, and settings in a menu.
- The general movement list defaults to the current month, newest first; users can navigate months or view all periods. Search by description and category filters are deferred.
- The add action opens one compact form for income and outflows. Amount, date, financial category and status are required; description is optional. Suggest realized for today or earlier and planned for a future date, with manual override.
- Users may edit and cancel movements. Cancelled movements are excluded from calculations and remain recoverable. The recovery interface and retention details require design.
- Support explicit savings movements, manual card-purchase classification and manual planned daily-forecast movements in the first release. Card purchases count once in the purchase period for metrics. Dedicated card, invoice and payment management is deferred; its approved cash-flow rules are in `FINANCIAL_METRICS.md`.
- Keep one aggregate financial ledger in the first release. Separate bank or wallet balances and transfers between the user's accounts are deferred. Custom tags are deferred.
- Tapping a metric opens exactly the movements included in that value and selected period. Annual totals open the relevant year; a month opens that month. Show date, optional description, category, amount and status, newest first. Realized and projected values remain distinct.

## Subsequent phases

After the first usable release, prioritize the day-by-day balance forecast; then card and invoice management, recurring items and customizable tags; then what-if simulations. Shared household finances are a later phase, after individual control is complete and validated. Accessibility improvements are also deferred. The explanation screens in the reference are sources for understanding metrics, not required app screens.

The code and installation are intended to remain private in this phase, without a public open-source license. The existing Expo MIT starter `LICENSE` does not represent an approved Din Din license; its removal and any replacement notice are separate repository work.

## Offline behavior

Financial changes must be saved on the device and retained until server confirmation. This supersedes the earlier online-first proposal. Conflicts must preserve local changes.

Other open work includes the exact Android minimum version, selection of the non-production Supabase project, the persisted schema and RLS policies, backup retention and verified recovery, and the details of cancelled-movement restoration and account deletion.
