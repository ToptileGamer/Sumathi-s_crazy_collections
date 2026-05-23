import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useRazorpay } from "../hooks/useRazorpay";
import { getAddresses, addAddress } from "../services/orderService";
import { createCODOrder } from "../services/orderService";

import ScrollReveal from "../components/ScrollReveal";
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

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, clear } = useCart();
  const { user, profile } = useAuth();
  const { checkout } = useRazorpay();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState(EMPTY_ADDR);
  const [savingAddr, setSavingAddr] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [payMethod, setPayMethod] = useState("razorpay");

  const shipping = subtotal >= 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.03);
  const total = subtotal + shipping + tax;

  // ── Load saved addresses ───────────────────────────────────
  useEffect(() => {
    if (!user) return;
    getAddresses(user.id)
      .then((data) => {
        setAddresses(data ?? []);
        const def = data?.find((a) => a.is_default);
        if (def) setSelectedAddr(def.id);
        else if (data?.length > 0) setSelectedAddr(data[0].id);
        else setShowAddrForm(true); // no addresses → show form immediately
      })
      .catch(console.error);
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

    // ── COD flow ──────────────────────────────────────────────
    if (payMethod === "cod") {
      try {
        const order = await createCODOrder({
          cartItems: items.map((i) => ({
            product_id: i.product?.id,
            quantity: i.quantity,
          })),
          addressId: selectedAddr,
          userId: user.id,
        });
        clear();
        navigate("/order-confirmation", { state: { orderId: order.id } });
      } catch (err) {
        setError(err.message ?? "Could not place order.");
        setProcessing(false);
      }
      return;
    }

    // ── Razorpay flow ─────────────────────────────────────────
    await checkout({
      cartItems: items.map((i) => ({
        product_id: i.product?.id,
        quantity: i.quantity,
      })),
      addressId: selectedAddr,
      userProfile: {
        full_name: profile?.full_name ?? "",
        email: user?.email ?? "",
        phone: profile?.phone ?? "",
      },
      onSuccess: (orderId) => {
        clear();
        navigate("/order-confirmation", { state: { orderId } });
      },
      onFailure: (msg) => {
        setError(msg);
        setProcessing(false);
      },
    });
  };

  // ── Guards ────────────────────────────────────────────────
  if (!user)
    return (
      <section className="checkout-page">
        <div className="empty-state">
          <h3>Please log in first</h3>
          <Link to="/signup" className="hero-btn">
            Log In
          </Link>
        </div>
      </section>
    );

  if (items.length === 0)
    return (
      <section className="checkout-page">
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <Link to="/products" className="hero-btn">
            Shop Now
          </Link>
        </div>
      </section>
    );

  return (
    <section className="checkout-page">
      <ScrollReveal className="checkout-header">
        <h2>Checkout</h2>
        <p>Almost there! Confirm your delivery and pay securely.</p>
      </ScrollReveal>

      <div className="checkout-layout">
        {/* ── LEFT: Address ── */}
        <ScrollReveal as="div" className="checkout-form">
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
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                }}
              >
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
        </ScrollReveal>

        {/* ── RIGHT: Summary ── */}
        <ScrollReveal as="aside" className="checkout-summary">
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
          <div className="summary-row">
            <span>GST (3%)</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          {/* Payment method picker — add above the pay button */}
          <div style={{ margin: "1rem 0" }}>
            <p
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#555",
                marginBottom: "0.6rem",
              }}
            >
              Payment Method
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {[
                {
                  id: "razorpay",
                  label: "💳 Pay Online",
                  sub: "UPI, Cards, Wallets via Razorpay",
                },
                {
                  id: "cod",
                  label: "💵 Cash on Delivery",
                  sub: "Pay when your order arrives",
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    padding: "0.85rem 1rem",
                    border: `2px solid ${payMethod === opt.id ? "#e91e8c" : "#e2e8f0"}`,
                    borderRadius: 12,
                    cursor: "pointer",
                    background: payMethod === opt.id ? "#fff8fb" : "#fff",
                    transition: "all 0.18s",
                  }}
                >
                  <input
                    type="radio"
                    name="payMethod"
                    value={opt.id}
                    checked={payMethod === opt.id}
                    onChange={() => setPayMethod(opt.id)}
                    style={{ marginTop: 3, accentColor: "#e91e8c" }}
                  />
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        color: "#1a1a2e",
                      }}
                    >
                      {opt.label}
                    </p>
                    <p
                      style={{ margin: 0, fontSize: "0.78rem", color: "#888" }}
                    >
                      {opt.sub}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            className="hero-btn razorpay-btn"
            onClick={handlePlaceOrder}
            disabled={processing}
          >
            {processing
              ? "Processing..."
              : payMethod === "cod"
                ? `Place Order (COD) ${formatPrice(total)}`
                : `Pay ${formatPrice(total)} via Razorpay`}
          </button>
          <p className="summary-note">
            🔒 Secured by Razorpay. UPI, Cards, Wallets & more accepted.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Checkout;
