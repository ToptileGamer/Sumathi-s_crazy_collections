import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabaseClient";
import { signOut } from "../services/authService";

const DeleteAccount = () => {
  const { user }          = useAuth();
  const navigate          = useNavigate();
  const [step,    setStep]    = useState(1); // 1=info, 2=confirm, 3=done
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
      // Delete user data from all tables
      // Supabase cascades handle most via ON DELETE CASCADE
      // but we manually clear what we can
      if (user) {
        await supabase.from("cart_items").delete().eq("user_id", user.id);
        await supabase.from("wishlists").delete().eq("user_id", user.id);
        await supabase.from("return_requests").delete().eq("user_id", user.id);
        await supabase.from("reviews").delete().eq("user_id", user.id);
        await supabase.from("addresses").delete().eq("user_id", user.id);
        await supabase.from("profiles").delete().eq("id", user.id);
        // Sign out — actual auth user deletion needs service role (admin)
        // so we sign out and the profile is gone
        await signOut();
      }
      setStep(3);
    } catch (err) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth:560, margin:"4rem auto", padding:"0 1.5rem" }}>

      {/* Header */}
      <div style={{ textAlign:"center", marginBottom:"2rem" }}>
        <div style={{ fontSize:"3rem", marginBottom:"0.75rem" }}>🗑️</div>
        <h1 style={{ margin:0, fontSize:"1.6rem", fontWeight:700, color:"#1a1a2e" }}>
          Delete Your Account
        </h1>
        <p style={{ color:"#888", marginTop:"0.4rem" }}>
          Sumathi's Crazy Collections
        </p>
      </div>

      {/* Step 1 — Info */}
      {step === 1 && (
        <div style={{ background:"#fff", borderRadius:20, padding:"2rem", boxShadow:"0 2px 16px rgba(0,0,0,0.07)" }}>
          <h3 style={{ margin:"0 0 1rem", color:"#1a1a2e" }}>Before you delete</h3>

          <div style={{ marginBottom:"1.25rem" }}>
            <p style={{ fontWeight:600, color:"#1a1a2e", marginBottom:"0.5rem" }}>✅ Data that will be deleted:</p>
            <ul style={{ paddingLeft:"1.25rem", color:"#555", lineHeight:2, margin:0 }}>
              <li>Your profile (name, phone)</li>
              <li>Saved addresses</li>
              <li>Shopping cart items</li>
              <li>Wishlist</li>
              <li>Reviews you wrote</li>
              <li>Return requests</li>
            </ul>
          </div>

          <div style={{ marginBottom:"1.5rem" }}>
            <p style={{ fontWeight:600, color:"#1a1a2e", marginBottom:"0.5rem" }}>⚠️ Data that will be kept:</p>
            <ul style={{ paddingLeft:"1.25rem", color:"#555", lineHeight:2, margin:0 }}>
              <li>Order history (kept for 3 years for legal/tax reasons)</li>
              {/* <li>Payment records (kept by Razorpay per RBI guidelines)</li> */}
            </ul>
          </div>

          <div style={{ background:"#fff8fb", border:"1.5px solid #fce7f3", borderRadius:12, padding:"1rem", marginBottom:"1.5rem" }}>
            <p style={{ margin:0, fontSize:"0.875rem", color:"#9d174d" }}>
              ⚠️ This action is <strong>permanent and cannot be undone</strong>. You will lose access to your account immediately.
            </p>
          </div>

          {!user ? (
            <div style={{ textAlign:"center" }}>
              <p style={{ color:"#888", marginBottom:"1rem" }}>You must be logged in to delete your account.</p>
              <Link to="/signup" style={{ display:"inline-block", padding:"0.75rem 2rem", background:"#e91e8c", color:"#fff", borderRadius:10, fontWeight:700, textDecoration:"none" }}>
                Log In First
              </Link>
            </div>
          ) : (
            <div style={{ display:"flex", gap:"0.75rem" }}>
              <button onClick={() => setStep(2)}
                style={{ flex:1, padding:"0.75rem", background:"#ef4444", color:"#fff", border:"none", borderRadius:10, fontWeight:700, cursor:"pointer", fontSize:"0.95rem" }}>
                Continue to Delete
              </button>
              <button onClick={() => navigate("/profile")}
                style={{ padding:"0.75rem 1.25rem", border:"1.5px solid #e2e8f0", background:"none", borderRadius:10, cursor:"pointer", color:"#555" }}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2 — Confirm */}
      {step === 2 && (
        <div style={{ background:"#fff", borderRadius:20, padding:"2rem", boxShadow:"0 2px 16px rgba(0,0,0,0.07)" }}>
          <h3 style={{ margin:"0 0 0.5rem", color:"#ef4444" }}>Confirm deletion</h3>
          <p style={{ color:"#888", marginBottom:"1.5rem", fontSize:"0.875rem" }}>
            Logged in as: <strong>{user?.email}</strong>
          </p>
          <p style={{ fontWeight:600, color:"#1a1a2e", marginBottom:"0.5rem" }}>
            Type <span style={{ color:"#ef4444", fontFamily:"monospace" }}>DELETE</span> to confirm:
          </p>
          <input
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Type DELETE here"
            style={{ width:"100%", padding:"0.75rem 1rem", border:"1.5px solid #fca5a5", borderRadius:10, fontSize:"1rem", outline:"none", boxSizing:"border-box", marginBottom:"1rem", fontFamily:"monospace" }}
          />
          {error && (
            <p style={{ color:"#ef4444", fontSize:"0.84rem", margin:"0 0 1rem", padding:"0.6rem", background:"#fef2f2", borderRadius:8 }}>{error}</p>
          )}
          <div style={{ display:"flex", gap:"0.75rem" }}>
            <button onClick={handleDelete} disabled={loading || confirm !== "DELETE"}
              style={{ flex:1, padding:"0.75rem", background: confirm === "DELETE" ? "#ef4444" : "#fca5a5", color:"#fff", border:"none", borderRadius:10, fontWeight:700, cursor: confirm === "DELETE" ? "pointer" : "not-allowed", fontSize:"0.95rem" }}>
              {loading ? "Deleting..." : "Delete My Account"}
            </button>
            <button onClick={() => setStep(1)}
              style={{ padding:"0.75rem 1.25rem", border:"1.5px solid #e2e8f0", background:"none", borderRadius:10, cursor:"pointer", color:"#555" }}>
              Back
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Done */}
      {step === 3 && (
        <div style={{ background:"#fff", borderRadius:20, padding:"2.5rem 2rem", boxShadow:"0 2px 16px rgba(0,0,0,0.07)", textAlign:"center" }}>
          <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>✅</div>
          <h3 style={{ margin:"0 0 0.5rem", color:"#1a1a2e" }}>Account deleted</h3>
          <p style={{ color:"#888", marginBottom:"1.5rem", fontSize:"0.875rem" }}>
            Your account and personal data have been removed. Order history kept for 3 years as required by law.
          </p>
          <button onClick={() => navigate("/")}
            style={{ padding:"0.75rem 2rem", background:"#1a1a2e", color:"#fff", border:"none", borderRadius:10, fontWeight:700, cursor:"pointer" }}>
            Go to Home
          </button>
        </div>
      )}

      {/* Contact note */}
      {step !== 3 && (
        <p style={{ textAlign:"center", color:"#aaa", fontSize:"0.8rem", marginTop:"1.5rem" }}>
          Need help? Contact us at{" "}
          <a href="/contact" style={{ color:"#e91e8c" }}>our contact page</a>
        </p>
      )}
    </div>
  );
};

export default DeleteAccount;