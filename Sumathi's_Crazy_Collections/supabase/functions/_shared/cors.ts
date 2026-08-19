// supabase/functions/_shared/cors.ts
// Shared CORS handling for all edge functions.
// - Reads ALLOWED_ORIGINS env var (comma-separated). Falls back to local dev origins.
// - If a request carries an Origin header that is NOT in the allow-list, it is rejected
//   with `allowed: false` so callers must return 403 instead of processing the request.

export function corsResponse(req: Request): {
  allowed: boolean;
  headers: Record<string, string>;
} {
  const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? 'http://localhost:3000,http://127.0.0.1:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

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
