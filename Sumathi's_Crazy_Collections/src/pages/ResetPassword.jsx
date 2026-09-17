import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "framer-motion";
import { changePassword } from "../services/authService";
import "../styles/ResetPassword.css";

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const steps = ["Reset your password", "New password", "All set"];

function PasswordField({
  label,
  placeholder,
  value,
  onChange,
  error,
  secret = false,
}) {
  return (
    <label className="rp-field">
      <span className="rp-label">{label}</span>
      <div className="rp-input-wrap">
        <input
          type={secret ? "password" : "text"}
          className="rp-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={secret ? "new-password" : "off"}
          autoFocus
        />
        {secret && (
          <button
            type="button"
            className="rp-toggle"
            onClick={() => onChange({ target: { value: "" } })}
            aria-label="Reveal password"
          >
            Show
          </button>
        )}
      </div>
      {error && <p className="rp-error" role="alert">{error}</p>}
    </label>
  );
}

export default function ResetPassword() {
  const navigate = useNavigate();

  const [token, setToken] = useState("");
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Recover the token from the Supabase-auth redirect URL on mount.
  // Supabase appends tokens to the redirectTo URL when secure_password_change
  // is enabled (reauth required). Examples:
  //   /auth/reset-password?token=...&type=recovery
  //   /auth/reset-password#access_token=...&refresh_token=...
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const params = url.searchParams;
      if (params.has("token")) {
        setToken(params.get("token"));
        setStep(2);
        return;
      }
      if ((url.hash || "").startsWith("#access_token=")) {
        // Keep the full recovery fragment; changePassword() uses the current
        // session, so we only need to be on this page when the redirect
        // completes - the browser already has the session.
        setStep(2);
        return;
      }
      // No recognised token — not recoverable. Prompt to request a fresh link.
      setError("This reset link is missing or invalid. Request a new reset link.");
    } catch {
      setError("This reset link is missing or invalid. Request a new reset link.");
    }
  }, []);

  const changeErr = useCallback((err) => {
    const msg = err?.message ?? "Something went wrong.";
    if (typeof msg === "string") {
      if (msg.includes("Invalid login credentials")) {
        return "This reset link has expired or been used already. Request a fresh link.";
      }
      if (msg.includes("need to reauthenticate")) {
        return "Please follow the reset link again to set a new password.";
      }
    }
    return msg;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("The new passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await changePassword(password);
      setSuccessMsg("Your password has been changed.");
      setStep(3);
    } catch (err) {
      setError(changeErr(err));
    } finally {
      setLoading(false);
    }
  };

  const requestNewLink = async () => {
    // Small friction + reload to avoid stale-tabs loops.
    setError("");
    navigate("/login");
  };

  return (
    <motion.main
      className="rp-page"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="rp-card"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h1 className="rp-title">
          {step === 1 ? "Forgot your password?" : step === 2 ? "Choose a new password" : "Password changed"}
        </h1>
        <p className="rp-sub">
          {step === 1
            ? "Enter the email address for your account and we'll send you a secure link to create a new password."
            : step === 2
            ? "Use the secure link you received to set a new password."
            : "You can now sign in with your new password."}
        </p>

        {/* ── Step 1: request link ── */}
        {step === 1 && (
          <form className="rp-form" onSubmit={(e) => { e.preventDefault(); }}>
            <p className="rp-help">
              Your Supabase reset link is malformed or expired, so this link
              can't be used here. Head back to login and request a fresh reset.
            </p>
            <p className="rp-error" role="alert">{error}</p>
            <button
              type="button"
              className="hero-btn"
              onClick={requestNewLink}
            >
              Request a new reset link
            </button>
            <p className="rp-switch">
              Remember your password?{" "}
              <button onClick={() => navigate("/login")}>Log in</button>
            </p>
          </form>
        )}

        {/* ── Step 2: set new password ── */}
        {step === 2 && (
          <form className="rp-form" onSubmit={handleSubmit}>
            <PasswordField
              label="New password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordField
              label="Confirm new password"
              placeholder="Re-enter your new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            {error && (
              <motion.p
                className="rp-error"
                role="alert"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              className="hero-btn"
              disabled={loading || !password || !confirm}
            >
              {loading ? "Saving…" : "Change password"}
            </button>
          </form>
        )}

        {/* ── Step 3: done ── */}
        {step === 3 && (
          <motion.div
            className="rp-done"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <div className="rp-success">
              <span className="rp-success-icon" aria-hidden="true">✓</span>
              <p>{successMsg}</p>
            </div>
            <button
              type="button"
              className="hero-btn"
              onClick={() => navigate("/login")}
            >
              Sign in with your new password
            </button>
            <p className="rp-email-hint">
              If needed, use the same email address you used before.
            </p>
          </motion.div>
        )}

        {step !== 1 && (
          <p className="rp-back">
            <Link to="/login" onClick={() => navigate("/login")}>
              Back to login
            </Link>
          </p>
        )}
      </motion.div>
    </motion.main>
  );
}
