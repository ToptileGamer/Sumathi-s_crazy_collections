import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { signIn, signUp, signInWithGoogle, resetPassword } from "../services/authService";

import "../styles/profile.css";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState(location.pathname === "/login" ? "login" : "signup"); // default to signup
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "login") {
        await signIn({ email: form.email, password: form.password });
      } else {
        await signUp({ email: form.email, password: form.password, fullName: form.fullName });
      }
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  const handleGoogle = async () => {
    try { await signInWithGoogle(); }
    catch (err) { setError(err.message); }
  };
  const handleReset = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  try {
    await resetPassword(form.email);
    setResetSent(true);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

 return (
  <section className="profile-section">
    <div className="auth-card">

      {/* ── Forgot Password Screen ── */}
      {resetMode ? (
        <>
          <h2>Reset Password 🔑</h2>
          <p className="auth-sub">Enter your email and we'll send a reset link</p>

          {resetSent ? (
            <div style={{ background:"#f0fdf4", border:"1.5px solid #86efac", borderRadius:12, padding:"1rem", textAlign:"center" }}>
              <p style={{ color:"#16a34a", fontWeight:600, margin:"0 0 0.25rem" }}>✅ Email sent!</p>
              <p style={{ color:"#166534", fontSize:"0.85rem", margin:0 }}>Check your inbox for the reset link</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="auth-form">
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                required
                value={form.email}
                onChange={handle} />
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="hero-btn" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

          <p className="auth-switch">
            Remember your password?{" "}
            <button onClick={() => { setResetMode(false); setResetSent(false); setError(""); }}>
              Back to Login
            </button>
          </p>
        </>
      ) : (
        <>
          {/* ── Login / Signup Screen ── */}
          <h2>{mode === "login" ? "Welcome Back 🌸" : "Join Us 💖"}</h2>
          <p className="auth-sub">
            {mode === "login" ? "Log in to your account" : "Create your account"}
          </p>

          <button className="google-btn" onClick={handleGoogle}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={18} />
            Continue with Google
          </button>

          <div className="auth-divider"><span>or</span></div>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === "signup" && (
              <input name="fullName" type="text" placeholder="Full Name" required
                value={form.fullName} onChange={handle} />
            )}
            <input name="email" type="email" placeholder="Email Address" required
              value={form.email} onChange={handle} />
            <input name="password" type="password" placeholder="Password" required
              minLength={6} value={form.password} onChange={handle} />

            {/* Forgot password link */}
            {mode === "login" && (
              <div style={{ textAlign:"right", marginTop:"-0.25rem" }}>
                <button type="button"
                  onClick={() => { setResetMode(true); setError(""); }}
                  style={{ background:"none", border:"none", color:"#e91e8c", fontSize:"0.82rem", cursor:"pointer", fontWeight:600 }}>
                  Forgot password?
                </button>
              </div>
            )}

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="hero-btn" disabled={loading}>
              {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            {mode === "login" ? (
              <>Don't have an account?{" "}
                <button onClick={() => { setMode("signup"); setError(""); }}>Sign Up</button></>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => { setMode("login"); setError(""); }}>Log In</button></>
            )}
          </p>
        </>
      )}
    </div>
  </section>
);
    
  
};

export default Auth;