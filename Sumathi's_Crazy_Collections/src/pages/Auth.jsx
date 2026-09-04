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
  // DPDP Act 2023: consent + age confirmation required before signup
  const [consent, setConsent] = useState({ agree: false, age: false });

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
        // DPDP Act 2023 — no personal data may be processed without clear,
        // specific, informed and unambiguous consent (and no minors without
        // verifiable parental consent).
        if (!consent.agree) {
          setError("You must consent to the Privacy Policy and data processing to create an account.");
          setLoading(false);
          return;
        }
        if (!consent.age) {
          setError("You must confirm you are 18 or older, or have verifiable parental consent.");
          setLoading(false);
          return;
        }
        await signUp({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          consentGiven: consent.agree,
          ageConfirmed: consent.age,
        });
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

              {mode === "signup" && (
                <div className="auth-consent" style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "0.25rem", textAlign: "left" }}>
                  {/* ── Plain-language privacy notice (DPDP Act 2023) ── */}
                  <div style={{ background: "#fdf6f0", border: "1.5px solid rgba(184,149,58,0.25)", borderRadius: 10, padding: "0.7rem 0.85rem", fontSize: "0.78rem", color: "#555", lineHeight: 1.6, fontFamily: "DM Sans" }}>
                    <strong style={{ color: "#1a1a1a" }}>🔒 Privacy Notice:</strong> We collect your name, email, phone
                    and delivery address only to process and deliver your orders and to support you. We never sell your
                    data and never send marketing messages unless you separately opt in.
                    <br />
                    <span style={{ color: "#B8953A" }}>हम आपका नाम, ईमेल, फ़ोन और पता केवल ऑर्डर डिलीवरी और सहायता के लिए लेते हैं। हम आपका डेटा कभी नहीं बेचते।</span>
                  </div>
                  <label className="auth-check" style={{ display: "flex", gap: "0.55rem", alignItems: "flex-start", fontSize: "0.8rem", color: "#666", lineHeight: 1.5, cursor: "pointer", fontFamily: "DM Sans" }}>
                    <input type="checkbox" checked={consent.agree}
                      onChange={(e) => setConsent((c) => ({ ...c, agree: e.target.checked }))}
                      style={{ marginTop: "0.2rem", accentColor: "#e91e8c", cursor: "pointer" }} />
                    <span>
                      I consent to Sumathi's Crazy Collections processing my personal data (name, email, phone, address) as described in the{" "}
                      <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#e91e8c", fontWeight: 600 }}>Privacy Policy</a>,
                      for order processing, delivery and support. I can withdraw consent at any time.
                    </span>
                  </label>
                  <label className="auth-check" style={{ display: "flex", gap: "0.55rem", alignItems: "flex-start", fontSize: "0.8rem", color: "#666", lineHeight: 1.5, cursor: "pointer", fontFamily: "DM Sans" }}>
                    <input type="checkbox" checked={consent.age}
                      onChange={(e) => setConsent((c) => ({ ...c, age: e.target.checked }))}
                      style={{ marginTop: "0.2rem", accentColor: "#e91e8c", cursor: "pointer" }} />
                    <span>
                      I confirm I am 18 years or older, or have verifiable consent from my parent or legal guardian (Digital Personal Data Protection Act, 2023).
                    </span>
                  </label>
                </div>
              )}

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
