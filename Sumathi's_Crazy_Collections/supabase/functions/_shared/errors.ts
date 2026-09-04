// supabase/functions/_shared/errors.ts
// Safely extract a readable message from an unknown thrown value.
// (Deno 2 types catch-clause variables as `unknown`, so `err.message` is not
// safe to access directly.)
export function errorMessage(err: unknown, fallback = 'Internal error'): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string' && err.length > 0) return err;
  return fallback;
}