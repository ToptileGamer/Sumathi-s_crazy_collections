import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
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
import { addReview } from "../services/reviewService";
import "../styles/profile.css";

const formatPrice = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

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

const fadeUp = { hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile } = useAuth();
  const { items: wishlist, remove: removeWish } = useWishlist();
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [returnModal, setReturnModal] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [returning, setReturning] = useState(false);
  const [returnMsg, setReturnMsg] = useState("");
  
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelMsg, setCancelMsg] = useState("");

  const [addresses, setAddresses] = useState([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [addrForm, setAddrForm] = useState({ label: "Home", full_name: "", phone: "", line1: "", city: "", state: "", pincode: "" });
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [rateModal, setRateModal] = useState(null);
  const [rateForm, setRateForm] = useState({ rating: 5, title: "", body: "" });
  const [rateMsg, setRateMsg] = useState("");
  const [rating, setRating] = useState(false);
  const [rated, setRated] = useState([]);

  useEffect(() => {
    if (!loading && !user) navigate("/signup");
  }, [user, loading, navigate]);
  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name ?? "", phone: profile.phone ?? "" });
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
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
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
      setAddrForm({ label: "Home", full_name: "", phone: "", line1: "", city: "", state: "", pincode: "" });
    } catch (err) { console.error(err); }
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
    } catch (err) { setReturnMsg("❌ " + err.message); }
    finally { setReturning(false); }
  };

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    setCancelling(true);
    try {
      await cancelOrder(cancelModal.id, user.id);
      setCancelMsg("✅ Order cancelled successfully.");
      setOrders(orders.map(o => o.id === cancelModal.id ? { ...o, status: 'cancelled' } : o));
      setTimeout(() => { setCancelModal(null); setCancelReason(""); setCancelMsg(""); }, 1500);
    } catch (err) { setCancelMsg("❌ " + err.message); }
    finally { setCancelling(false); }
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
      setTimeout(() => { setRateModal(null); setRateMsg(""); }, 1500);
    } catch (err) { setRateMsg("❌ " + (err.message ?? "Already reviewed this product.")); }
    finally { setRating(false); }
  };

  const StarPicker = ({ value, onChange }) => (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} onClick={() => onChange(s)}
          style={{ fontSize: "1.75rem", cursor: "pointer", color: s <= value ? "#D4AF37" : "#e8e3dd", transition: "color 0.15s" }}>★</span>
      ))}
    </div>
  );

  if (loading) return <div className="profile-section"><p style={{ color: "#888", fontFamily: "DM Sans" }}>Loading...</p></div>;

  return (
    <section className="profile-section">
      <motion.div className="profile-header" variants={fadeUp} initial="hidden" animate="visible">
        <div className="profile-avatar">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
          ) : (
            <span>{(profile?.full_name?.[0] ?? user?.email?.[0] ?? "?").toUpperCase()}</span>
          )}
        </div>
        <div className="profile-info">
          <h2>{profile?.full_name ?? "My Account"}</h2>
          <p>{user?.email}</p>
          {profile?.role === "admin" && (
            <button className="admin-badge" onClick={() => navigate("/admin")}>🛠 Admin Dashboard</button>
          )}
        </div>
        <button className="logout-btn" onClick={handleLogout}>Log Out</button>
      </motion.div>

      <div className="profile-tabs">
        {["orders", "addresses", "wishlist", "settings"].map((t) => (
          <button key={t} className={`profile-tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ═══ ORDERS ═══ */}
      {tab === "orders" && (
        <motion.div className="tab-content" variants={fadeUp} initial="hidden" animate="visible">
          <h3>My Orders</h3>
          {orders.length === 0 ? (
            <p className="empty-note">No orders yet. <a href="/products">Start shopping →</a></p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <span className="order-number">#{order.order_number}</span>
                  <span className="order-status" style={{ background: STATUS_COLOR[order.status] }}>
                    {order.status.replace("_", " ")}
                  </span>
                  <span className="order-date">{new Date(order.created_at).toLocaleDateString("en-IN")}</span>
                </div>
                <ul className="order-items-list">
                  {(order.items ?? []).map((item) => (
                    <li key={item.id}>
                      {item.product_name} × {item.quantity}
                      <strong>{formatPrice(item.line_total)}</strong>
                    </li>
                  ))}
                </ul>
                <div className="order-total">
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {["delivered"].includes(order.status) && !hasReturn(order.id) && (
                      <button className="order-action-btn return" onClick={() => setReturnModal(order)}>
                        ↩ Request Return
                      </button>
                    )}
                    {["pending", "payment_initiated", "processing", "paid"].includes(order.status) && (
                      <button className="order-action-btn cancel" onClick={() => setCancelModal(order)}>
                        ✕ Cancel
                      </button>
                    )}
                    {hasReturn(order.id) && <span style={{ fontSize: "0.8rem", color: "#10b981", fontWeight: 600 }}>✓ Return Requested</span>}
                  </div>
                  <span>Total: <strong>{formatPrice(order.total_amount)}</strong></span>
                </div>
                
                {order.status === "delivered" && (
                  <div style={{ marginTop: "0.75rem", borderTop: "1px solid rgba(0,0,0,0.04)", paddingTop: "0.75rem" }}>
                    <p style={{ fontSize: "0.78rem", color: "#bbb", marginBottom: "0.5rem", fontFamily: "DM Sans" }}>Rate your items:</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {(order.items ?? []).map((item) => (
                        <button key={item.id} disabled={rated.includes(item.product_id)}
                          onClick={() => { setRateModal({ orderId: order.id, item }); setRateForm({ rating: 5, title: "", body: "" }); setRateMsg(""); }}
                          style={{
                            padding: "0.35rem 0.85rem", borderRadius: 80,
                            border: rated.includes(item.product_id) ? "1.5px solid #10b981" : "1.5px solid #B8953A",
                            color: rated.includes(item.product_id) ? "#10b981" : "#B8953A",
                            background: "none", fontSize: "0.78rem", fontWeight: 600,
                            cursor: rated.includes(item.product_id) ? "default" : "pointer",
                            fontFamily: "DM Sans",
                          }}>
                          {rated.includes(item.product_id) ? "✓ Rated" : `★ Rate: ${item.product_name}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </motion.div>
      )}

      {/* ═══ ADDRESSES ═══ */}
      {tab === "addresses" && (
        <motion.div className="tab-content" variants={fadeUp} initial="hidden" animate="visible">
          <div className="tab-toolbar">
            <h3 style={{ margin: 0 }}>Saved Addresses</h3>
            <button className="hero-btn small" onClick={() => setShowAddrForm((v) => !v)}>
              {showAddrForm ? "Cancel" : "+ Add Address"}
            </button>
          </div>
          {showAddrForm && (
            <form className="addr-form" onSubmit={handleAddAddress}>
              <select value={addrForm.label} onChange={(e) => setAddrForm((f) => ({ ...f, label: e.target.value }))}>
                <option>Home</option><option>Work</option><option>Other</option>
              </select>
              {["full_name", "phone", "line1", "city", "state", "pincode"].map((field) => (
                <input key={field} placeholder={field.replace("_", " ")} required
                  value={addrForm[field]} onChange={(e) => setAddrForm((f) => ({ ...f, [field]: e.target.value }))} />
              ))}
              <button type="submit" className="hero-btn small">Save Address</button>
            </form>
          )}
          {addresses.length === 0 ? (
            <p className="empty-note">No addresses saved yet.</p>
          ) : (
            addresses.map((addr) => (
              <div key={addr.id} className={`address-card ${addr.is_default ? "default" : ""}`}>
                <div className="addr-label">{addr.label} {addr.is_default && <span>✓ Default</span>}</div>
                <p>{addr.full_name} • {addr.phone}</p>
                <p>{addr.line1}, {addr.city}, {addr.state} – {addr.pincode}</p>
                <div className="addr-actions">
                  {!addr.is_default && (
                    <button onClick={() => setDefaultAddress(user.id, addr.id).then(() =>
                      setAddresses((p) => p.map((a) => ({ ...a, is_default: a.id === addr.id })))
                    )}>Set Default</button>
                  )}
                  <button onClick={() => deleteAddress(addr.id).then(() => setAddresses((p) => p.filter((a) => a.id !== addr.id)))}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}

      {/* ═══ WISHLIST ═══ */}
      {tab === "wishlist" && (
        <motion.div className="tab-content" variants={fadeUp} initial="hidden" animate="visible">
          <h3>My Wishlist</h3>
          {wishlist.length === 0 ? (
            <p className="empty-note">Nothing saved. <a href="/products">Browse products →</a></p>
          ) : (
            <div className="wishlist-grid">
              {wishlist.map((item) => {
                const p = item.product;
                const img = p?.images?.find((i) => i.is_primary)?.url ?? p?.images?.[0]?.url;
                return (
                  <div key={item.id} className="wishlist-card">
                    <img src={img} alt={p?.name} />
                    <div>
                      <h4>{p?.name}</h4>
                      <p>{formatPrice(p?.price)}</p>
                    </div>
                    <div className="wishlist-actions">
                      <a href={`/product/${p?.slug}`} className="hero-btn small">View</a>
                      <button onClick={() => removeWish(p?.id)}>Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* ═══ SETTINGS ═══ */}
      {tab === "settings" && (
        <motion.div className="tab-content" variants={fadeUp} initial="hidden" animate="visible">
          <h3>Account Settings</h3>
          <div className="settings-form">
            <label>Full Name
              <input value={form.full_name} disabled={!editing} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
            </label>
            <label>Phone
              <input value={form.phone} disabled={!editing} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </label>
            <label>Email
              <input value={user?.email ?? ""} disabled />
            </label>
            <div className="settings-actions">
              {editing ? (
                <>
                  <button className="hero-btn small" onClick={handleSaveProfile} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button onClick={() => setEditing(false)}>Cancel</button>
                </>
              ) : (
                <button className="hero-btn small" onClick={() => setEditing(true)}>Edit Profile</button>
              )}
            </div>
          </div>
          <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(0,0,0,0.04)" }}>
            <p style={{ fontSize: "0.8rem", color: "#bbb", marginBottom: "0.5rem", fontFamily: "DM Sans" }}>Danger Zone</p>
            <Link to="/delete-account" style={{ fontSize: "0.875rem", color: "#ef4444", fontWeight: 600, textDecoration: "none", fontFamily: "DM Sans" }}>
              🗑️ Delete my account
            </Link>
          </div>
        </motion.div>
      )}

      {/* ═══ RETURN MODAL ═══ */}
      {returnModal && (
        <div className="profile-modal-overlay" onClick={() => setReturnModal(null)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Request a Return</h3>
            <p className="modal-sub">Order #{returnModal.order_number}</p>
            <form onSubmit={handleReturn}>
              <label>Reason for return *</label>
              <select value={returnReason} onChange={(e) => setReturnReason(e.target.value)} required>
                <option value="">-- Select reason --</option>
                <option>Wrong item received</option>
                <option>Item damaged / defective</option>
                <option>Item not as described</option>
                <option>Changed my mind</option>
                <option>Other</option>
              </select>
              <textarea rows={3} placeholder="Any additional details..." onChange={(e) => setReturnReason(returnReason.split('\n')[0] + (e.target.value ? '\n' + e.target.value : ''))} />
              {returnMsg && <p style={{ color: returnMsg.startsWith("✅") ? "#10b981" : "#ef4444", fontSize: "0.84rem", margin: 0 }}>{returnMsg}</p>}
              <div className="modal-actions">
                <button type="submit" disabled={returning} className="modal-btn-primary">
                  {returning ? "Submitting..." : "Submit Return Request"}
                </button>
                <button type="button" onClick={() => setReturnModal(null)} className="modal-btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ CANCEL MODAL ═══ */}
      {cancelModal && (
        <div className="profile-modal-overlay" onClick={() => setCancelModal(null)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel Order</h3>
            <p className="modal-sub">Order #{cancelModal.order_number}</p>
            <form onSubmit={handleCancelOrder}>
              <label>Reason for cancellation *</label>
              <select value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} required>
                <option value="">-- Select reason --</option>
                <option>Order placed by mistake</option>
                <option>Found better price elsewhere</option>
                <option>Delivery time is too long</option>
                <option>Changed my mind</option>
                <option>Other</option>
              </select>
              <textarea rows={3} placeholder="Any additional details..." onChange={(e) => {
                const base = cancelReason.split('\n')[0];
                setCancelReason(base + (e.target.value ? '\n' + e.target.value : ''));
              }} />
              {cancelMsg && <p style={{ color: cancelMsg.startsWith("✅") ? "#10b981" : "#ef4444", fontSize: "0.84rem", margin: 0 }}>{cancelMsg}</p>}
              <div className="modal-actions">
                <button type="submit" disabled={cancelling} className="modal-btn-primary" style={{ background: "#ef4444" }}>
                  {cancelling ? "Cancelling..." : "Confirm Cancellation"}
                </button>
                <button type="button" onClick={() => setCancelModal(null)} className="modal-btn-secondary">Close</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ RATE MODAL ═══ */}
      {rateModal && (
        <div className="profile-modal-overlay" onClick={() => setRateModal(null)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Rate your purchase</h3>
            <p className="modal-sub">{rateModal.item.product_name}</p>
            <form onSubmit={handleRate}>
              <div>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#555", marginBottom: "0.4rem", fontFamily: "DM Sans" }}>Your rating *</p>
                <StarPicker value={rateForm.rating} onChange={(r) => setRateForm((f) => ({ ...f, rating: r }))} />
              </div>
              <input placeholder="Review title" value={rateForm.title}
                onChange={(e) => setRateForm((f) => ({ ...f, title: e.target.value }))} />
              <textarea rows={3} placeholder="Tell others what you think..." value={rateForm.body}
                onChange={(e) => setRateForm((f) => ({ ...f, body: e.target.value }))} />
              {rateMsg && <p style={{ fontSize: "0.84rem", margin: 0, padding: "0.6rem 0.9rem", borderRadius: 8, color: rateMsg.startsWith("✅") ? "#10b981" : "#ef4444", background: rateMsg.startsWith("✅") ? "#f0fdf4" : "#fef2f2" }}>{rateMsg}</p>}
              <div className="modal-actions">
                <button type="submit" disabled={rating} className="modal-btn-primary">
                  {rating ? "Submitting..." : "Submit Review"}
                </button>
                <button type="button" onClick={() => setRateModal(null)} className="modal-btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Profile;
