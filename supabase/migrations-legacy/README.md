# Legacy Migrations

These SQL files were previously placed under `supabase/migrations/` but had one or more issues:

- Duplicate migration versions (same timestamp prefix used by multiple files)
- Non-standard version prefixes (e.g. `20260108_...`), which do not match the remote migration history
- Conflicted with the linked Supabase project's applied migration versions

They are kept here for reference only.

Do not move them back into `supabase/migrations/`.
