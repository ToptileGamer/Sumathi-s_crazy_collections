// src/hooks/useAuth.js
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getProfile } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Deterministic gender from name (no external API call) ─
  function getDeterministicGender(name) {
    const hash = name.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
    return hash % 2 === 0 ? 'girl' : 'boy';
  }

  async function fetchProfile(userId) {
    try {
      let p = await getProfile(userId);

      if (p && !p.avatar_url && p.full_name) {
        const gender = getDeterministicGender(p.full_name);
        const avatar_url = `https://avatar.iran.liara.run/public/${gender}?username=${encodeURIComponent(p.full_name)}`;
        
        const { updateProfile } = await import('../services/authService');
        p = await updateProfile(userId, { avatar_url });
      }

      setProfile(p);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, refreshProfile: () => fetchProfile(user?.id) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
