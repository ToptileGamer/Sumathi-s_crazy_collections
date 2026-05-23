import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useWishlist } from "../hooks/useWishlist";
import { signOut, updateProfile } from "../services/authService";
import {
  getOrders,
  getAddresses,
  addAddress,
  deleteAddress,
  setDefaultAddress,
  cancelOrder,
} from "../services/orderService";
import { requestReturn, getUserReturns } from "../services/returnService";
import { addReview, getReviews } from "../services/reviewService";
import ScrollReveal from "../components/ScrollReveal";
import "../styles/profile.css";

const formatPrice = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    n,
  );

const STATUS_COLOR = {
  pending: "#f59e0b",
  payment_initiated: "#3b82f6",
  paid: "#10b981",
  processing: "#6366f1",
  shipped: "#0ea5e9",
  delivered: "#22c55e",
  cancelled: "#ef4444",
  refunded: "#8b5cf6",
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile } = useAuth();
  const { items: wishlist, remove: removeWish } = useWishlist();
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [returnModal, setReturnModal] = useState(null); // holds order object
  const [returnReason, setReturnReason] = useState("");
  const [returning, setReturning] = useState(false);
  const [returnMsg, setReturnMsg] = useState("");
  
  const [cancelModal, setCancelModal] = useState(null); // holds order object
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelMsg, setCancelMsg] = useState("");

  const [addresses, setAddresses] = useState([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [addrForm, setAddrForm] = useState({
    label: "Home",
    full_name: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [rateModal, setRateModal] = useState(null); // { orderId, item }
  const [rateForm, setRateForm] = useState({ rating: 5, title: "", body: "" });
  const [rateMsg, setRateMsg] = useState("");
  const [rating, setRating] = useState(false);
  const [rated, setRated] = useState([]); // list of product_ids already rated

  useEffect(() => {
    if (!loading && !user) navigate("/signup");
  }, [user, loading, navigate]);
  useEffect(() => {
    if (profile)
      setForm({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
      });
  }, [profile]);
  useEffect(() => {
    if (!user) return;
    getOrders(user.id).then(setOrders).catch(console.error);
    getAddresses(user.id).then(setAddresses).catch(console.error);
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile(user.id, form);
      await refreshProfile();
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const a = await addAddress(user.id, addrForm);
      setAddresses((prev) => [...prev, a]);
      setShowAddrForm(false);
      setAddrForm({
        label: "Home",
        full_name: "",
        phone: "",
        line1: "",
        city: "",
        state: "",
        pincode: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    if (!returnReason.trim()) return;
    setReturning(true);
    try {
      await requestReturn(returnModal.id, user.id, returnReason);
      setReturnMsg("✅ Return request submitted! We'll contact you soon.");
      setReturnModal(null);
      setReturnReason("");
      getUserReturns(user.id).then(setReturns);
    } catch (err) {
      setReturnMsg("❌ " + err.message);
    } finally {
      setReturning(false);
    }
  };

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    setCancelling(true);
    try {
      await cancelOrder(cancelModal.id, user.id);
      setCancelMsg("✅ Order cancelled successfully.");
      
      // Update local orders list
      setOrders(orders.map(o => o.id === cancelModal.id ? { ...o, status: 'cancelled' } : o));
      
      setTimeout(() => {
        setCancelModal(null);
        setCancelReason("");
        setCancelMsg("");
      }, 1500);
    } catch (err) {
      setCancelMsg("❌ " + err.message);
    } finally {
      setCancelling(false);
    }
  };

  const hasReturn = (orderId) => returns.some((r) => r.order_id === orderId);
  const handleRate = async (e) => {
    e.preventDefault();
    setRating(true);
    try {
      await addReview({
        product_id: rateModal.item.product_id,
        user_id: user.id,
        order_id: rateModal.orderId,
        rating: rateForm.rating,
        title: rateForm.title,
        body: rateForm.body,
      });
      setRated((prev) => [...prev, rateModal.item.product_id]);
      setRateMsg("✅ Thank you for your review!");
      setTimeout(() => {
        setRateModal(null);
        setRateMsg("");
      }, 1500);
    } catch (err) {
      setRateMsg("❌ " + (err.message ?? "Already reviewed this product."));
    } finally {
      setRating(false);
    }
  };

  const StarPicker = ({ value, onChange }) => (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          onClick={() => onChange(s)}
          style={{
            fontSize: "1.75rem",
            cursor: "pointer",
            color: s <= value ? "#f59e0b" : "#e2e8f0",
            transition: "color 0.15s",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );

  if (loading)
    return (
      <div className="profile-section">
        <p>Loading...</p>
      </div>
    );

  return (
    <section className="profile-section">
      <ScrollReveal as="div" className="profile-header">
        <div className="profile-avatar">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" />
          ) : (
            <span>
              {(
                profile?.full_name?.[0] ??
                user?.email?.[0] ??
                "?"
              ).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h2>{profile?.full_name ?? "My Account"}</h2>
          <p>{user?.email}</p>
          {profile?.role === "admin" && (
            <button className="admin-badge" onClick={() => navigate("/admin")}>
              🛠 Admin Dashboard
            </button>
          )}
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      </ScrollReveal>

      <div className="profile-tabs">
        {["orders", "addresses", "wishlist", "settings"].map((t) => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <ScrollReveal as="div" className="tab-content">
          <h3>My Orders</h3>
          {orders.length === 0 ? (
            <p className="empty-note">
              No orders yet. <a href="/products">Start shopping →</a>
            </p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <span className="order-number">#{order.order_number}</span>
                  <span
                    className="order-status"
                    style={{ background: STATUS_COLOR[order.status] }}
                  >
                    {order.status.replace("_", " ")}
                  </span>
                  <span className="order-date">
                    {new Date(order.created_at).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <ul className="order-items-list">
                  
                  {(order.items ?? []).map((item) => (
                    <li key={item.id}>
                      {item.product_name} × {item.quantity}
                      <span>{formatPrice(item.line_total)}</span>
                    </li>
                  ))}
                  {order.status === "delivered" && (
                    <div
                      style={{
                        marginTop: "0.75rem",
                        borderTop: "1px solid #f5f5f5",
                        paddingTop: "0.75rem",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.78rem",
                          color: "#aaa",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Rate your items:
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.5rem",
                        }}
                      >
                        {(order.items ?? []).map((item) => (
                          <button
                            key={item.id}
                            disabled={rated.includes(item.product_id)}
                            onClick={() => {
                              setRateModal({ orderId: order.id, item });
                              setRateForm({ rating: 5, title: "", body: "" });
                              setRateMsg("");
                            }}
                            style={{
                              padding: "0.35rem 0.85rem",
                              borderRadius: 80,
                              border: rated.includes(item.product_id)
                                ? "1.5px solid #10b981"
                                : "1.5px solid #f59e0b",
                              color: rated.includes(item.product_id)
                                ? "#10b981"
                                : "#f59e0b",
                              background: "none",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              cursor: rated.includes(item.product_id)
                                ? "default"
                                : "pointer",
                            }}
                          >
                            {rated.includes(item.product_id)
                              ? "✓ Rated"
                              : `★ Rate: ${item.product_name}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </ul>
                <div className="order-total">
                  <div
                    style={{
                      marginTop: "0.75rem",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    {["delivered"].includes(order.status) &&
                      !hasReturn(order.id) && (
                        <button
                          onClick={() => setReturnModal(order)}
                          style={{
                            padding: "0.4rem 1rem",
                            border: "1.5px solid #f59e0b",
                            color: "#f59e0b",
                            background: "none",
                            borderRadius: 80,
                            cursor: "pointer",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                          }}
                        >
                          ↩ Request Return
                        </button>
                      )}
                    {["pending", "payment_initiated", "processing", "paid"].includes(order.status) && (
                      <button
                        onClick={() => setCancelModal(order)}
                        style={{
                          padding: "0.4rem 1rem",
                          border: "1.5px solid #ef4444",
                          color: "#ef4444",
                          background: "none",
                          borderRadius: 80,
                          cursor: "pointer",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          marginRight: "0.5rem"
                        }}
                      >
                        ✕ Cancel Order
                      </button>
                    )}
                    {hasReturn(order.id) && (
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "#10b981",
                          fontWeight: 600,
                        }}
                      >
                        ✓ Return Requested
                      </span>
                    )}
                  </div>
                  Total: <strong>{formatPrice(order.total_amount)}</strong>
                </div>
              </div>
            ))
          )}
        </ScrollReveal>
      )}

      {tab === "addresses" && (
        <ScrollReveal as="div" className="tab-content">
          <div className="tab-toolbar">
            <h3>Saved Addresses</h3>
            <button
              className="hero-btn small"
              onClick={() => setShowAddrForm((v) => !v)}
            >
              {showAddrForm ? "Cancel" : "+ Add Address"}
            </button>
          </div>
          {showAddrForm && (
            <form className="addr-form" onSubmit={handleAddAddress}>
              <select
                value={addrForm.label}
                onChange={(e) =>
                  setAddrForm((f) => ({ ...f, label: e.target.value }))
                }
              >
                <option>Home</option>
                <option>Work</option>
                <option>Other</option>
              </select>
              {["full_name", "phone", "line1", "city", "state", "pincode"].map(
                (field) => (
                  <input
                    key={field}
                    placeholder={field.replace("_", " ")}
                    required
                    value={addrForm[field]}
                    onChange={(e) =>
                      setAddrForm((f) => ({ ...f, [field]: e.target.value }))
                    }
                  />
                ),
              )}
              <button type="submit" className="hero-btn small">
                Save Address
              </button>
            </form>
          )}
          {addresses.length === 0 ? (
            <p className="empty-note">No addresses saved yet.</p>
          ) : (
            addresses.map((addr) => (
              <div
                key={addr.id}
                className={`address-card ${addr.is_default ? "default" : ""}`}
              >
                <div className="addr-label">
                  {addr.label} {addr.is_default && <span>✓ Default</span>}
                </div>
                <p>
                  {addr.full_name} • {addr.phone}
                </p>
                <p>
                  {addr.line1}, {addr.city}, {addr.state} – {addr.pincode}
                </p>
                <div className="addr-actions">
                  {!addr.is_default && (
                    <button
                      onClick={() =>
                        setDefaultAddress(user.id, addr.id).then(() =>
                          setAddresses((p) =>
                            p.map((a) => ({
                              ...a,
                              is_default: a.id === addr.id,
                            })),
                          ),
                        )
                      }
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() =>
                      deleteAddress(addr.id).then(() =>
                        setAddresses((p) => p.filter((a) => a.id !== addr.id)),
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </ScrollReveal>
      )}

      {tab === "wishlist" && (
        <ScrollReveal as="div" className="tab-content">
          <h3>My Wishlist</h3>
          {wishlist.length === 0 ? (
            <p className="empty-note">
              Nothing saved. <a href="/products">Browse products →</a>
            </p>
          ) : (
            <div className="wishlist-grid">
              {wishlist.map((item) => {
                const p = item.product;
                const img =
                  p?.images?.find((i) => i.is_primary)?.url ??
                  p?.images?.[0]?.url;
                return (
                  <div key={item.id} className="wishlist-card">
                    <img src={img} alt={p?.name} />
                    <div>
                      <h4>{p?.name}</h4>
                      <p>{formatPrice(p?.price)}</p>
                    </div>
                    <div className="wishlist-actions">
                      <a
                        href={`/product/${p?.slug}`}
                        className="hero-btn small"
                      >
                        View
                      </a>
                      <button onClick={() => removeWish(p?.id)}>Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollReveal>
      )}

      {tab === "settings" && (
        <ScrollReveal as="div" className="tab-content">
          <h3>Account Settings</h3>
          <div className="settings-form">
            <label>
              Full Name
              <input
                value={form.full_name}
                disabled={!editing}
                onChange={(e) =>
                  setForm((f) => ({ ...f, full_name: e.target.value }))
                }
              />
            </label>
            <label>
              Phone
              <input
                value={form.phone}
                disabled={!editing}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </label>
            <label>
              Email
              <input value={user?.email ?? ""} disabled />
            </label>
            <div className="settings-actions">
              {editing ? (
                <>
                  <button
                    className="hero-btn small"
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button onClick={() => setEditing(false)}>Cancel</button>
                </>
              ) : (
                <button
                  className="hero-btn small"
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
          {/* Add at bottom of settings tab in Profile.jsx */}
<div style={{ marginTop:"1.5rem", paddingTop:"1.5rem", borderTop:"1px solid #f5f5f5" }}>
  <p style={{ fontSize:"0.8rem", color:"#aaa", marginBottom:"0.5rem" }}>Danger Zone</p>
  <Link to="/delete-account"
    style={{ fontSize:"0.875rem", color:"#ef4444", fontWeight:600, textDecoration:"none" }}>
    🗑️ Delete my account
  </Link>
</div>
        </ScrollReveal>
      )}
      {returnModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={() => setReturnModal(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "2rem",
              width: "100%",
              maxWidth: 460,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 0.5rem", color: "#1a1a2e" }}>
              Request a Return
            </h3>
            <p
              style={{
                margin: "0 0 1.25rem",
                color: "#888",
                fontSize: "0.875rem",
              }}
            >
              Order #{returnModal.order_number}
            </p>
            <form
              onSubmit={handleReturn}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <label
                style={{ fontWeight: 600, fontSize: "0.875rem", color: "#555" }}
              >
                Reason for return *
              </label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                required
                style={{
                  padding: "0.7rem 1rem",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 10,
                  fontSize: "0.9rem",
                  color: "#1a1a2e",
                  outline: "none",
                }}
              >
                <option value="">-- Select reason --</option>
                <option>Wrong item received</option>
                <option>Item damaged / defective</option>
                <option>Item not as described</option>
                <option>Changed my mind</option>
                <option>Other</option>
              </select>
              <textarea
                rows={3}
                placeholder="Any additional details..."
                style={{
                  padding: "0.7rem 1rem",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 10,
                  fontSize: "0.875rem",
                  fontFamily: "inherit",
                  resize: "vertical",
                  outline: "none",
                }}
                onChange={(e) =>
                  setReturnReason(e.target.value + "\n" + e.target.value)
                }
              />
              {returnMsg && (
                <p
                  style={{
                    color: returnMsg.startsWith("✅") ? "#10b981" : "#ef4444",
                    fontSize: "0.84rem",
                    margin: 0,
                  }}
                >
                  {returnMsg}
                </p>
              )}
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  marginTop: "0.25rem",
                }}
              >
                <button
                  type="submit"
                  disabled={returning}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: "#f59e0b",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {returning ? "Submitting..." : "Submit Return Request"}
                </button>
                <button
                  type="button"
                  onClick={() => setReturnModal(null)}
                  style={{
                    padding: "0.75rem 1.25rem",
                    border: "1.5px solid #e2e8f0",
                    background: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    color: "#555",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {cancelModal && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: "1rem",
          }}
          onClick={() => setCancelModal(null)}
        >
          <div
            style={{
              background: "#fff", borderRadius: 20, padding: "2rem",
              width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 0.5rem", color: "#1a1a2e" }}>
              Cancel Order
            </h3>
            <p style={{ margin: "0 0 1.25rem", color: "#888", fontSize: "0.875rem" }}>
              Order #{cancelModal.order_number}
            </p>
            <form onSubmit={handleCancelOrder} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <label style={{ fontWeight: 600, fontSize: "0.875rem", color: "#555" }}>
                Reason for cancellation *
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                required
                style={{
                  padding: "0.7rem 1rem", border: "1.5px solid #e2e8f0",
                  borderRadius: 10, fontSize: "0.9rem", color: "#1a1a2e", outline: "none",
                }}
              >
                <option value="">-- Select reason --</option>
                <option>Order placed by mistake</option>
                <option>Found better price elsewhere</option>
                <option>Delivery time is too long</option>
                <option>Changed my mind</option>
                <option>Other</option>
              </select>
              <textarea
                rows={3}
                placeholder="Any additional details..."
                style={{
                  padding: "0.7rem 1rem", border: "1.5px solid #e2e8f0",
                  borderRadius: 10, fontSize: "0.875rem", fontFamily: "inherit",
                  resize: "vertical", outline: "none",
                }}
                onChange={(e) => {
                  const base = cancelReason.split('\\n')[0];
                  setCancelReason(base + (e.target.value ? '\\n' + e.target.value : ''));
                }}
              />
              {cancelMsg && (
                <p style={{ color: cancelMsg.startsWith("✅") ? "#10b981" : "#ef4444", fontSize: "0.84rem", margin: 0 }}>
                  {cancelMsg}
                </p>
              )}
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
                <button
                  type="submit" disabled={cancelling}
                  style={{
                    flex: 1, padding: "0.75rem", background: "#ef4444", color: "#fff",
                    border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  {cancelling ? "Cancelling..." : "Confirm Cancellation"}
                </button>
                <button
                  type="button" onClick={() => setCancelModal(null)}
                  style={{
                    padding: "0.75rem 1.25rem", border: "1.5px solid #e2e8f0", background: "none",
                    borderRadius: 10, cursor: "pointer", color: "#555",
                  }}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {rateModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={() => setRateModal(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "2rem",
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 0.25rem", color: "#1a1a2e" }}>
              Rate your purchase
            </h3>
            <p
              style={{
                margin: "0 0 1.25rem",
                color: "#888",
                fontSize: "0.875rem",
              }}
            >
              {rateModal.item.product_name}
            </p>
            <form
              onSubmit={handleRate}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {/* Star picker */}
              <div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#555",
                    marginBottom: "0.4rem",
                  }}
                >
                  Your rating *
                </p>
                <StarPicker
                  value={rateForm.rating}
                  onChange={(r) => setRateForm((f) => ({ ...f, rating: r }))}
                />
              </div>
              {/* Title */}
              <div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#555",
                    marginBottom: "0.4rem",
                  }}
                >
                  Review title
                </p>
                <input
                  placeholder="Summarise your experience"
                  value={rateForm.title}
                  onChange={(e) =>
                    setRateForm((f) => ({ ...f, title: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.9rem",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 10,
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              {/* Body */}
              <div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#555",
                    marginBottom: "0.4rem",
                  }}
                >
                  Your review
                </p>
                <textarea
                  rows={3}
                  placeholder="Tell others what you think..."
                  value={rateForm.body}
                  onChange={(e) =>
                    setRateForm((f) => ({ ...f, body: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.9rem",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 10,
                    fontSize: "0.875rem",
                    fontFamily: "inherit",
                    resize: "vertical",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              {rateMsg && (
                <p
                  style={{
                    fontSize: "0.84rem",
                    margin: 0,
                    padding: "0.6rem 0.9rem",
                    borderRadius: 8,
                    color: rateMsg.startsWith("✅") ? "#10b981" : "#ef4444",
                    background: rateMsg.startsWith("✅")
                      ? "#f0fdf4"
                      : "#fef2f2",
                  }}
                >
                  {rateMsg}
                </p>
              )}
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="submit"
                  disabled={rating}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: "#f59e0b",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    opacity: rating ? 0.7 : 1,
                  }}
                >
                  {rating ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  type="button"
                  onClick={() => setRateModal(null)}
                  style={{
                    padding: "0.75rem 1.25rem",
                    border: "1.5px solid #e2e8f0",
                    background: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    color: "#555",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Profile;
