import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";
import { useAuth }             from "../hooks/useAuth";
import { useWishlist }         from "../hooks/useWishlist";
import { signOut, updateProfile } from "../services/authService";
import { getOrders, getAddresses, addAddress, deleteAddress, setDefaultAddress } from "../services/orderService";
import "../styles/profile.css";

const formatPrice = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

const STATUS_COLOR = {
  pending:"#f59e0b", payment_initiated:"#3b82f6", paid:"#10b981",
  processing:"#6366f1", shipped:"#0ea5e9", delivered:"#22c55e",
  cancelled:"#ef4444", refunded:"#8b5cf6",
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile } = useAuth();
  const { items: wishlist, remove: removeWish } = useWishlist();
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [addrForm, setAddrForm] = useState({ label:"Home", full_name:"", phone:"", line1:"", city:"", state:"", pincode:"" });
  const [showAddrForm, setShowAddrForm] = useState(false);

  useEffect(() => { if (!loading && !user) navigate("/login"); }, [user, loading, navigate]);
  useEffect(() => { if (profile) setForm({ full_name: profile.full_name ?? "", phone: profile.phone ?? "" }); }, [profile]);
  useEffect(() => {
    if (!user) return;
    getOrders(user.id).then(setOrders).catch(console.error);
    getAddresses(user.id).then(setAddresses).catch(console.error);
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try { await updateProfile(user.id, form); await refreshProfile(); setEditing(false); }
    catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleLogout = async () => { await signOut(); navigate("/"); };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const a = await addAddress(user.id, addrForm);
      setAddresses((prev) => [...prev, a]);
      setShowAddrForm(false);
      setAddrForm({ label:"Home", full_name:"", phone:"", line1:"", city:"", state:"", pincode:"" });
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="profile-section"><p>Loading...</p></div>;

  return (
    <section className="profile-section">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile?.avatar_url ? <img src={profile.avatar_url} alt="avatar" />
            : <span>{(profile?.full_name?.[0] ?? user?.email?.[0] ?? "?").toUpperCase()}</span>}
        </div>
        <div>
          <h2>{profile?.full_name ?? "My Account"}</h2>
          <p>{user?.email}</p>
          {profile?.role === "admin" && (
            <button className="admin-badge" onClick={() => navigate("/admin")}>🛠 Admin Dashboard</button>
          )}
        </div>
        <button className="logout-btn" onClick={handleLogout}>Log Out</button>
      </div>

      <div className="profile-tabs">
        {["orders","addresses","wishlist","settings"].map((t) => (
          <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <div className="tab-content">
          <h3>My Orders</h3>
          {orders.length === 0 ? <p className="empty-note">No orders yet. <a href="/products">Start shopping →</a></p>
            : orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <span className="order-number">#{order.order_number}</span>
                  <span className="order-status" style={{ background: STATUS_COLOR[order.status] }}>{order.status.replace("_"," ")}</span>
                  <span className="order-date">{new Date(order.created_at).toLocaleDateString("en-IN")}</span>
                </div>
                <ul className="order-items-list">
                  {(order.items ?? []).map((item) => (
                    <li key={item.id}>{item.product_name} × {item.quantity}<span>{formatPrice(item.line_total)}</span></li>
                  ))}
                </ul>
                <div className="order-total">Total: <strong>{formatPrice(order.total_amount)}</strong></div>
              </div>
            ))}
        </div>
      )}

      {tab === "addresses" && (
        <div className="tab-content">
          <div className="tab-toolbar">
            <h3>Saved Addresses</h3>
            <button className="hero-btn small" onClick={() => setShowAddrForm((v) => !v)}>
              {showAddrForm ? "Cancel" : "+ Add Address"}
            </button>
          </div>
          {showAddrForm && (
            <form className="addr-form" onSubmit={handleAddAddress}>
              <select value={addrForm.label} onChange={(e) => setAddrForm((f) => ({ ...f, label: e.target.value }))}>
                <option>Home</option><option>Work</option><option>Other</option>
              </select>
              {["full_name","phone","line1","city","state","pincode"].map((field) => (
                <input key={field} placeholder={field.replace("_"," ")} required
                  value={addrForm[field]} onChange={(e) => setAddrForm((f) => ({ ...f, [field]: e.target.value }))} />
              ))}
              <button type="submit" className="hero-btn small">Save Address</button>
            </form>
          )}
          {addresses.length === 0 ? <p className="empty-note">No addresses saved yet.</p>
            : addresses.map((addr) => (
              <div key={addr.id} className={`address-card ${addr.is_default ? "default" : ""}`}>
                <div className="addr-label">{addr.label} {addr.is_default && <span>✓ Default</span>}</div>
                <p>{addr.full_name} • {addr.phone}</p>
                <p>{addr.line1}, {addr.city}, {addr.state} – {addr.pincode}</p>
                <div className="addr-actions">
                  {!addr.is_default && <button onClick={() => setDefaultAddress(user.id, addr.id).then(() => setAddresses((p) => p.map((a) => ({ ...a, is_default: a.id === addr.id }))))}>Set Default</button>}
                  <button onClick={() => deleteAddress(addr.id).then(() => setAddresses((p) => p.filter((a) => a.id !== addr.id)))}>Delete</button>
                </div>
              </div>
            ))}
        </div>
      )}

      {tab === "wishlist" && (
        <div className="tab-content">
          <h3>My Wishlist</h3>
          {wishlist.length === 0 ? <p className="empty-note">Nothing saved. <a href="/products">Browse products →</a></p>
            : (
              <div className="wishlist-grid">
                {wishlist.map((item) => {
                  const p = item.product;
                  const img = p?.images?.find((i) => i.is_primary)?.url ?? p?.images?.[0]?.url;
                  return (
                    <div key={item.id} className="wishlist-card">
                      <img src={img} alt={p?.name} />
                      <div><h4>{p?.name}</h4><p>{formatPrice(p?.price)}</p></div>
                      <div className="wishlist-actions">
                        <a href={`/product/${p?.slug}`} className="hero-btn small">View</a>
                        <button onClick={() => removeWish(p?.id)}>Remove</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      )}

      {tab === "settings" && (
        <div className="tab-content">
          <h3>Account Settings</h3>
          <div className="settings-form">
            <label>Full Name<input value={form.full_name} disabled={!editing} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} /></label>
            <label>Phone<input value={form.phone} disabled={!editing} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></label>
            <label>Email<input value={user?.email ?? ""} disabled /></label>
            <div className="settings-actions">
              {editing
                ? <><button className="hero-btn small" onClick={handleSaveProfile} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button><button onClick={() => setEditing(false)}>Cancel</button></>
                : <button className="hero-btn small" onClick={() => setEditing(true)}>Edit Profile</button>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Profile;