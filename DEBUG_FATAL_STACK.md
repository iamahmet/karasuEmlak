## Fatal Stack Trace Capture

### First captured fatal error (before fix)

```
apps/web/instrumentation.ts:19:3
process.on('uncaughtException', ...)
A Node.js API is used (process.on at line: 19) which is not supported in the Edge Runtime.
```

```
apps/web/instrumentation.ts:23:3
process.on('unhandledRejection', ...)
A Node.js API is used (process.on at line: 23) which is not supported in the Edge Runtime.
```

**Root cause:** `apps/web/instrumentation.ts` directly invoked `process.on(...)`, which Next treated as an Edge‑runtime usage and crashed all requests.

**Fix:** Moved `process.on(...)` into a Node‑only module (`apps/web/lib/server/fatal-handlers.ts`) and dynamically imported it from `apps/web/instrumentation.ts` only when `NEXT_RUNTIME === 'nodejs'`.

### Current state

Instrumentation remains enabled and will emit `[FATAL ...]` logs with file/line info (source maps enabled in `next.config.mjs`). No new fatal errors were emitted after the fix.
