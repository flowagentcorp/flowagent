# Local setup

To install the Supabase client packages and remove the legacy session dependency:

```bash
npm install @supabase/ssr @supabase/supabase-js
npm uninstall iron-session
```

If your environment is behind a proxy that blocks the npm registry, these commands may fail with HTTP 403 errors. In that case, ensure your npm registry access is allowed or try again from a network without the restriction.
