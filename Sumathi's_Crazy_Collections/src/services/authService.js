// src/services/authService.js
import { supabase } from '../lib/supabaseClient';
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { App } from "@capacitor/app";


// ── Deterministic gender from name (no external API call) ─
function getDeterministicGender(name) {
  const hash = name.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return hash % 2 === 0 ? 'girl' : 'boy';
}

// ── Sign Up ───────────────────────────────────────────────
export async function signUp({ email, password, fullName }) {
  const gender = getDeterministicGender(fullName);
  const avatar_url = `https://avatar.iran.liara.run/public/${gender}?username=${encodeURIComponent(fullName)}`;

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

// ── Delete account via Edge Function ─────────────────────
export async function deleteAccount() {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error('Not authenticated');

  const { data, error } = await supabase.functions.invoke('delete-account', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (error) throw new Error(error.message || 'Failed to delete account');

  // Sign out locally after successful deletion
  await supabase.auth.signOut();
  return data;
}

// ── Forgot password ───────────────────────────────────────
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  if (error) throw error;
}

// ── Change password (requires current session) ──────────────
export async function changePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
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
