import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signIn, signUp, signInWithGoogle } from "../services/authService";
import "../styles/profile.css";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode]       = useState("login"); // "login" | "signup"
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm]       = useState({ fullName: "", email: "", password: "" });

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

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
      navigate("/profile");
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

  return (
    <section className="profile-section">
      <div className="auth-card">
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
      </div>
    </section>
  );
};

export default Auth;