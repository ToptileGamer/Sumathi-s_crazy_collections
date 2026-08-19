import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { motion } from "framer-motion";
import { signIn, signUp, signInWithGoogle, resetPassword } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import "../styles/profile.css";

const fadeUp = { hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

// ── Password strength validation ───────────────────────────
function validatePassword(pw) {
  const checks = [
    { test: pw.length >= 8,                          msg: 'at least 8 characters' },
    { test: /[A-Z]/.test(pw),                       msg: 'one uppercase letter' },
    { test: /[a-z]/.test(pw),                       msg: 'one lowercase letter' },
    { test: /[0-9]/.test(pw),                       msg: 'one number' },
    { test: /[^A-Za-z0-9]/.test(pw),                msg: 'one special character' },
  ];
  const failed = checks.filter(c => !c.test);
  if (failed.length === 0) return null;
  return `Password must contain ${failed.map(c => c.msg).join(', ')}`;
}

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (user) { navigate("/"); }
  }, [user, navigate]);

  const [mode, setMode] = useState(location.pathname === "/login" ? "login" : "signup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "signup") {
        const pwError = validatePassword(form.password);
        if (pwError) {
          setError(pwError);
          setLoading(false);
          return;
        }
        await signUp({ email: form.email, password: form.password, fullName: form.fullName });
      } else {
        await signIn({ email: form.email, password: form.password });
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
      <motion.div className="auth-card" variants={fadeUp} initial="hidden" animate="visible">
        {/* ── Forgot Password Screen ── */}
        {resetMode ? (
          <>
            <h2>Reset Password</h2>
            <p className="auth-sub">Enter your email and we'll send a reset link</p>

            {resetSent ? (
              <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 12, padding: "1rem", textAlign: "center" }}>
                <p style={{ color: "#16a34a", fontWeight: 600, margin: "0 0 0.25rem" }}>✅ Email sent!</p>
                <p style={{ color: "#166534", fontSize: "0.85rem", margin: 0, fontFamily: "DM Sans" }}>Check your inbox for the reset link</p>
              </div>
            ) : (
              <form onSubmit={handleReset} className="auth-form">
                <input name="email" type="email" placeholder="Email Address" required
                  value={form.email} onChange={handle} />
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
            <h2 style={{ fontFamily: "Playfair Display", color: "#1a1a1a" }}>
              {mode === "login" ? "Welcome Back" : "Join Us"}
              <span style={{ marginLeft: "0.3rem" }}>{mode === "login" ? "🌸" : "💖"}</span>
            </h2>
            <p className="auth-sub">
              {mode === "login" ? "Log in to your account" : "Create your account"}
            </p>

            <button className="auth-google-btn" onClick={handleGoogle}>
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
              <input name="password" type="password" placeholder="Password (min 8 chars, mixed case, number, special)" required
                minLength={8} value={form.password} onChange={handle} />

              {mode === "login" && (
                <div style={{ textAlign: "right", marginTop: "-0.25rem" }}>
                  <button type="button"
                    onClick={() => { setResetMode(true); setError(""); }}
                    className="auth-forgot-btn">
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
      </motion.div>
    </section>
  );
};

export default Auth;
