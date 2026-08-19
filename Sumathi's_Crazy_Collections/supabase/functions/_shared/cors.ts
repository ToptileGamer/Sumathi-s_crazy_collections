// supabase/functions/_shared/cors.ts
// Shared CORS handling for all edge functions.
// - Reads ALLOWED_ORIGINS env var (comma-separated). Falls back to local dev origins.
// - If a request carries an Origin header that is NOT in the allow-list, it is rejected
//   with `allowed: false` so callers must return 403 instead of processing the request.

export function corsResponse(req: Request): {
  allowed: boolean;
  headers: Record<string, string>;
} {
  // Always include production + local dev origins so the site works even if
  // ALLOWED_ORIGINS on Supabase is out-of-date or only contains localhost.
  const builtIn = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://sumathi-s-crazy-collections.vercel.app',
    'https://sumathiscrazycollections.vercel.app',
  ];
  const envOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  // De-duplicate while preserving order
  const allowedOrigins = [...new Set([...builtIn, ...envOrigins])];

  const origin = req.headers.get('Origin') ?? '';

  // No Origin header (curl, server-to-server, native app) — allow; no CORS header needed.
  if (!origin) {
    return {
      allowed: true,
      headers: {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
      },
    };
  }

  const allowed = allowedOrigins.includes(origin);
  return {
    allowed,
    headers: {
      'Access-Control-Allow-Origin': allowed ? origin : 'null',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
    },
  };
}
