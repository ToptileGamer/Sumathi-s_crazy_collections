// src/services/authService.js
import { supabase } from '../lib/supabaseClient';
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { App } from "@capacitor/app";


// ── Sign Up ───────────────────────────────────────────────
export async function signUp({ email, password, fullName }) {
  // Generate a local SVG data-URI avatar — no external API calls
  const initials = (fullName.split(' ').map(n => n[0]).join('') || 'U').toUpperCase();
  const avatarColors = ['e91e8c','a855f7','6366f1','0ea5e9','10b981','f59e0b','ef4444'];
  const bgColor = avatarColors[fullName.length % avatarColors.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">` +
    `<rect width="128" height="128" rx="64" fill="#${bgColor}"/>` +
    `<text x="64" y="82" text-anchor="middle" font-family="system-ui,sans-serif" font-size="48" font-weight="bold" fill="white">${initials}</text></svg>`;
  const avatar_url = `data:image/svg+xml,${encodeURIComponent(svg)}`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, avatar_url } },
  });
  if (error) throw error;
  return data;
}

// ── Sign In ───────────────────────────────────────────────
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}


// ── Sign Out ──────────────────────────────────────────────
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ── Get current session ───────────────────────────────────
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

// ── Get profile ───────────────────────────────────────────
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

// ── Update profile ────────────────────────────────────────
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Upload avatar ─────────────────────────────────────────
export async function uploadAvatar(userId, file) {
  const ext      = file.name.split('.').pop();
  const filePath = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  await updateProfile(userId, { avatar_url: data.publicUrl });
  return data.publicUrl;
}

// ── Forgot password ───────────────────────────────────────
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  if (error) throw error;
}

export async function signInWithGoogle() {
  const isNative = Capacitor.isNativePlatform();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: isNative
        ? "com.hayzentech.solutions.sumathiscrazycollections://login-callback"
        : `${window.location.origin}/`,
      skipBrowserRedirect: isNative,
    },
  });

  if (error) throw error;

  if (isNative && data?.url) {
    await Browser.open({ url: data.url, windowName: "_self" });
  }
}

// ── Handle Auth Redirect for Native Apps ──────────────────
if (Capacitor.isNativePlatform()) {
  App.addListener('appUrlOpen', async (event) => {
    const url = new URL(event.url);
    const code = url.searchParams.get('code');

    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
      await Browser.close();
    } else if (url.hash && url.hash.includes('access_token')) {
      const hashParams = new URLSearchParams(url.hash.substring(1));
      const access_token = hashParams.get('access_token');
      const refresh_token = hashParams.get('refresh_token');
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
        await Browser.close();
      }
    }
  });
}
