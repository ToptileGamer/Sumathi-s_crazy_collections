import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "framer-motion";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { getAddresses, addAddress, getOrderCount } from "../services/orderService";
import { createCODOrder } from "../services/orderService";
import "../styles/checkout.css";

const formatPrice = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const EMPTY_ADDR = {
  label: "Home",
  full_name: "",
  phone: "",
  line1: "",
  city: "",
  state: "",
  pincode: "",
};

/* ── Section Header ── */
function SectionHeader({ subtitle, title }) {
  return (
    <motion.div className="checkout-header"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
      <span className="sh__sub">
        <span className="sh__accent-line" />{subtitle}
      </span>
      <h2>{title}</h2>
      <p>Almost there! Confirm your delivery and place your order.</p>
    </motion.div>
  );
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState(EMPTY_ADDR);
  const [savingAddr, setSavingAddr] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [orderCount, setOrderCount] = useState(null);

  // Free shipping perk: first 5 orders ship free (cancelled orders don't count)
  const freeShipPerk = (orderCount ?? 0) < 5;
  const shipping     = freeShipPerk || subtotal >= 999 ? 0 : 99;
  const total        = subtotal + shipping;

  // ── Load saved addresses ───────────────────────────────────
  useEffect(() => {
    if (!user) return;
    getAddresses(user.id)
      .then((data) => {
        setAddresses(data ?? []);
        const def = data?.find((a) => a.is_default);
        if (def) setSelectedAddr(def.id);
        else if (data?.length > 0) setSelectedAddr(data[0].id);
        else setShowAddrForm(true);
      })
      .catch(console.error);
  }, [user]);

  // ── Free shipping on first 5 orders ────────────────────────
  useEffect(() => {
    if (!user) return;
    getOrderCount(user.id)
      .then(setOrderCount)
      .catch(() => setOrderCount(null));
  }, [user]);

  // ── Save new address ──────────────────────────────────────
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddr(true);
    try {
      const saved = await addAddress(user.id, addrForm);
      setAddresses((prev) => [...prev, saved]);
      setSelectedAddr(saved.id);
      setShowAddrForm(false);
      setAddrForm(EMPTY_ADDR);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingAddr(false);
    }
  };

  // ── Place order ───────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!selectedAddr) {
      setError("Please select a delivery address.");
      return;
    }
    setProcessing(true);
    setError("");

    try {
      const order = await createCODOrder({
        cartItems: items.map((i) => ({
          product_id: i.product?.id,
          quantity: i.quantity,
        })),
        addressId: selectedAddr,
      });
      clear();
      navigate("/order-confirmation", { state: { orderId: order.id } });
    } catch (err) {
      setError(err.message ?? "Could not place order.");
      setProcessing(false);
    }
  };

  // ── Guards ────────────────────────────────────────────────
  if (!user)
    return (
      <section className="checkout-page">
        <div className="empty-state">
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
          <h3>Please log in first</h3>
          <p style={{ color: "#888", fontFamily: "DM Sans" }}>Log in to complete your purchase.</p>
          <Link to="/signup" className="hero-btn" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.85rem 2rem", background: "#1a1a1a", color: "#fff", borderRadius: "50px", fontWeight: 600, textDecoration: "none", marginTop: "1rem" }}>
            Log In
          </Link>
        </div>
      </section>
    );

  if (items.length === 0)
    return (
      <section className="checkout-page">
        <div className="empty-state">
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛍️</div>
          <h3>Your cart is empty</h3>
          <p style={{ color: "#888", fontFamily: "DM Sans" }}>Add some items to your cart first.</p>
          <Link to="/products" className="hero-btn" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.85rem 2rem", background: "#1a1a1a", color: "#fff", borderRadius: "50px", fontWeight: 600, textDecoration: "none", marginTop: "1rem" }}>
            Shop Now
          </Link>
        </div>
      </section>
    );

  return (
    <section className="checkout-page">
      <SectionHeader subtitle="Checkout" title="Complete Your Order" />

      <div className="checkout-layout">
        {/* ── LEFT: Address ── */}
        <motion.div className="checkout-form"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <h3>Delivery Address</h3>

          {/* Saved addresses */}
          {addresses.length > 0 && (
            <div className="address-list">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`address-radio ${selectedAddr === addr.id ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddr === addr.id}
                    onChange={() => setSelectedAddr(addr.id)}
                  />
                  <div>
                    <strong>{addr.label}</strong> — {addr.full_name} •{" "}
                    {addr.phone}
                    <p>
                      {addr.line1}, {addr.city}, {addr.state} – {addr.pincode}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}

          <button
            className="add-addr-toggle"
            onClick={() => setShowAddrForm((v) => !v)}
          >
            {showAddrForm ? "− Cancel" : "+ Add New Address"}
          </button>

          {showAddrForm && (
            <form className="addr-form-checkout" onSubmit={handleSaveAddress}>
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
              <input
                placeholder="Full Name"
                required
                value={addrForm.full_name}
                onChange={(e) =>
                  setAddrForm((f) => ({ ...f, full_name: e.target.value }))
                }
              />
              <input
                placeholder="Phone Number"
                required
                value={addrForm.phone}
                onChange={(e) =>
                  setAddrForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
              <input
                placeholder="Address Line"
                required
                value={addrForm.line1}
                onChange={(e) =>
                  setAddrForm((f) => ({ ...f, line1: e.target.value }))
                }
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <input
                  placeholder="City"
                  required
                  value={addrForm.city}
                  onChange={(e) =>
                    setAddrForm((f) => ({ ...f, city: e.target.value }))
                  }
                />
                <input
                  placeholder="State"
                  required
                  value={addrForm.state}
                  onChange={(e) =>
                    setAddrForm((f) => ({ ...f, state: e.target.value }))
                  }
                />
              </div>
              <input
                placeholder="Pincode"
                required
                value={addrForm.pincode}
                onChange={(e) =>
                  setAddrForm((f) => ({ ...f, pincode: e.target.value }))
                }
              />
              <button type="submit" className="hero-btn" disabled={savingAddr}>
                {savingAddr ? "Saving..." : "Save & Use This Address"}
              </button>
            </form>
          )}

          {error && <p className="checkout-error">{error}</p>}
        </motion.div>

        {/* ── RIGHT: Summary ── */}
        <motion.aside className="checkout-summary"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <h3>Order Summary</h3>
          <ul className="checkout-items-list">
            {items.map((item) => {
              const name = item.product?.name ?? "Product";
              const price = item.product?.price ?? 0;
              const img =
                item.product?.images?.find((i) => i.is_primary)?.url ??
                item.product?.images?.[0]?.url;
              return (
                <li key={item.id}>
                  {img && <img src={img} alt={name} />}
                  <span>
                    {name} × {item.quantity}
                  </span>
                  <span>{formatPrice(price * item.quantity)}</span>
                </li>
              );
            })}
          </ul>

          <div className="summary-divider" />
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span style={{ color: shipping === 0 ? "#10b981" : "inherit" }}>
              {shipping === 0 ? "Free 🎉" : formatPrice(shipping)}
            </span>
          </div>
          {freeShipPerk && (
            <div style={{ background: "#ecfdf5", border: "1.5px solid rgba(16,185,129,0.3)", borderRadius: 10, padding: "0.6rem 0.8rem", fontSize: "0.78rem", color: "#047857", lineHeight: 1.5, fontFamily: "DM Sans", margin: "0.4rem 0" }}>
              🎉 FREE shipping — you're on your first 5 orders!
            </div>
          )}
          <div className="summary-divider" />
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          {/* ── Plain-language privacy notice (DPDP Act 2023) ── */}
          <div style={{ background: "#fdf6f0", border: "1.5px solid rgba(184,149,58,0.25)", borderRadius: 10, padding: "0.7rem 0.85rem", fontSize: "0.78rem", color: "#555", lineHeight: 1.6, fontFamily: "DM Sans", margin: "1rem 0" }}>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#1a1a1a" }}>🔒 Privacy Notice:</strong> Your name, phone and delivery address are
              used only to deliver this order and for support. We never sell your data and never send marketing messages
              unless you separately opt in.
            </p>
            <p style={{ margin: "0.35rem 0 0", color: "#B8953A" }}>
              आपका नाम, फ़ोन और पता केवल इस ऑर्डर की डिलीवरी और सहायता के लिए उपयोग होते हैं। हम आपका डेटा नहीं बेचते।
            </p>
          </div>

          <button
            className="hero-btn checkout-btn"
            onClick={handlePlaceOrder}
            disabled={processing}
          >
            {processing
              ? "Processing..."
              : `Place Order ${formatPrice(total)}`
            }
          </button>
        </motion.aside>
      </div>
    </section>
  );
};

export default Checkout;
