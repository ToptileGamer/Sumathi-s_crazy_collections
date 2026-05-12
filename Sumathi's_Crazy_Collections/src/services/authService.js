// src/services/authService.js
import { supabase } from '../lib/supabaseClient';
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { App } from "@capacitor/app";


// ── Sign Up ───────────────────────────────────────────────
export async function signUp({ email, password, fullName }) {
  const firstName = fullName.split(' ')[0];
  let gender = 'boy';
  try {
    const res = await fetch(`https://api.genderize.io?name=${firstName}`);
    const gData = await res.json();
    if (gData.gender === 'female') {
      gender = 'girl';
    }
  } catch (err) {
    // fallback
  }

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
    }
  });
}
