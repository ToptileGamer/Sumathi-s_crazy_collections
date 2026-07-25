import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { deleteAccount } from "../services/authService";
import "../styles/policies.css";

const fadeUp = { hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

const DeleteAccount = () => {
  const { user }          = useAuth();
  const navigate          = useNavigate();
  const [step,    setStep]    = useState(1);
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleDelete = async () => {
    if (confirm !== "DELETE") {
      setError("Type DELETE exactly to confirm.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (user) await deleteAccount();
      setStep(3);
    } catch (err) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delete-page">
      {/* Header */}
      <motion.div className="delete-header" variants={fadeUp} initial="hidden" animate="visible">
        <div className="delete-icon">🗑️</div>
        <h1>Delete Your Account</h1>
        <p>Sumathi's Crazy Collections</p>
      </motion.div>

      {/* Step 1 — Info */}
      {step === 1 && (
        <motion.div className="delete-card" variants={fadeUp} initial="hidden" animate="visible">
          <h3>Before you delete</h3>

          <div className="delete-section">
            <p className="delete-section-title">✅ Data that will be deleted:</p>
            <ul>
              <li>Your profile (name, phone)</li>
              <li>Saved addresses</li>
              <li>Shopping cart items</li>
              <li>Wishlist</li>
              <li>Reviews you wrote</li>
              <li>Return requests</li>
            </ul>
          </div>

          <div className="delete-section">
            <p className="delete-section-title">⚠️ Data that will be kept:</p>
            <ul>
              <li>Order history (kept for 3 years for legal/tax reasons)</li>
            </ul>
          </div>

          <div className="delete-warning">
            <p>⚠️ This action is <strong>permanent and cannot be undone</strong>. You will lose access to your account immediately.</p>
          </div>

          {!user ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#888", marginBottom: "1rem", fontFamily: "DM Sans" }}>You must be logged in to delete your account.</p>
              <Link to="/signup" className="hero-btn" style={{ display: "inline-flex", padding: "0.75rem 2rem", background: "#1a1a1a", color: "#fff", borderRadius: "10px", fontWeight: 700, textDecoration: "none" }}>
                Log In First
              </Link>
            </div>
          ) : (
            <div className="delete-actions">
              <button onClick={() => setStep(2)} className="delete-btn">Continue to Delete</button>
              <button onClick={() => navigate("/profile")} className="delete-cancel-btn">Cancel</button>
            </div>
          )}
        </motion.div>
      )}

      {/* Step 2 — Confirm */}
      {step === 2 && (
        <motion.div className="delete-card" variants={fadeUp} initial="hidden" animate="visible">
          <h3 style={{ color: "#ef4444" }}>Confirm deletion</h3>
          <p className="delete-section-title" style={{ fontWeight: 400, color: "#888" }}>
            Logged in as: <strong>{user?.email}</strong>
          </p>
          <p className="delete-section-title" style={{ marginTop: "1rem" }}>
            Type <span style={{ color: "#ef4444", fontFamily: "monospace" }}>DELETE</span> to confirm:
          </p>
          <input className="delete-input" value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Type DELETE here" />
          {error && <p className="delete-error">{error}</p>}
          <div className="delete-actions">
            <button onClick={handleDelete} disabled={loading || confirm !== "DELETE"}
              className="delete-btn" style={{ opacity: confirm === "DELETE" ? 1 : 0.5 }}>
              {loading ? "Deleting..." : "Delete My Account"}
            </button>
            <button onClick={() => setStep(1)} className="delete-cancel-btn">Back</button>
          </div>
        </motion.div>
      )}

      {/* Step 3 — Done */}
      {step === 3 && (
        <motion.div className="delete-card delete-success" variants={fadeUp} initial="hidden" animate="visible">
          <div className="success-icon">✅</div>
          <h3>Account deleted</h3>
          <p>Your account and personal data have been removed. Order history kept for 3 years as required by law.</p>
          <button onClick={() => navigate("/")} className="hero-btn" style={{ padding: "0.75rem 2rem", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>
            Go to Home
          </button>
        </motion.div>
      )}

      {step !== 3 && (
        <p className="delete-contact">
          Need help? Contact us at{" "}
          <a href="/contact">our contact page</a>
        </p>
      )}
    </div>
  );
};

export default DeleteAccount;
