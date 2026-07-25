import { useEffect, useState } from "react";
import { useLocation, Link }   from "react-router-dom";
import { motion } from "framer-motion";
import { getOrder }            from "../services/orderService";
import "../styles/checkout.css";

const formatPrice = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const STATUS_STEPS = ["paid", "processing", "shipped", "delivered"];

const fadeUp = { hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

const OrderConfirmation = () => {
  const { state }       = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!state?.orderId) { setLoading(false); return; }
    getOrder(state.orderId)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [state?.orderId]);

  if (loading) {
    return (
      <section className="confirmation-page">
        <div className="confirmation-card">
          <div className="spinner" />
          <p style={{ color: "#888", fontFamily: "DM Sans" }}>Loading your order...</p>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="confirmation-page">
        <motion.div className="confirmation-card" variants={fadeUp} initial="hidden" animate="visible">
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
          <h2>Order Placed!</h2>
          <p>Thank you for shopping with us. Check your email for updates.</p>
          <Link to="/products" className="hero-btn" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.85rem 2rem", background: "#1a1a1a", color: "#fff", borderRadius: "50px", fontWeight: 600, textDecoration: "none", marginTop: "1.5rem" }}>
            Continue Shopping
          </Link>
        </motion.div>
      </section>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <section className="confirmation-page">
      {/* ── Success Banner ── */}
      <motion.div className="confirmation-card" variants={fadeUp} initial="hidden" animate="visible">
        <div className="success-icon">✓</div>
        <h2>Order Confirmed!</h2>
        <p>
          Thank you <strong>{order.address?.full_name ?? "there"}</strong>! Your order has been placed successfully.
        </p>
        <div className="order-meta">
          <span>Order #{order.order_number}</span>
          <span>{new Date(order.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}</span>
        </div>

        {/* ── Progress Tracker ── */}
        <div className="order-tracker">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className={`tracker-step ${i <= currentStep ? "done" : ""}`}>
              <div className="tracker-dot" />
              <span>{step.charAt(0).toUpperCase() + step.slice(1)}</span>
              {i < STATUS_STEPS.length - 1 && <div className="tracker-line" />}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Order Details ── */}
      <motion.div className="confirmation-details" variants={fadeUp} initial="hidden" animate="visible">
        <div className="conf-section">
          <h3>Items Ordered</h3>
          <ul className="conf-items">
            {(order.items ?? []).map((item) => (
              <li key={item.id}>
                {item.product_image && <img src={item.product_image} alt={item.product_name} />}
                <div>
                  <strong>{item.product_name}</strong>
                  <span style={{ display: "block", fontSize: "0.78rem", color: "#999" }}>Qty: {item.quantity}</span>
                </div>
                <span className="conf-price">{formatPrice(item.line_total)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="conf-section">
          <h3>Delivery Address</h3>
          {order.address ? (
            <div className="conf-address">
              <p><strong>{order.address.full_name}</strong> • {order.address.phone}</p>
              <p>{order.address.line1}</p>
              <p>{order.address.city}, {order.address.state} – {order.address.pincode}</p>
            </div>
          ) : <p style={{ color: "#888", fontFamily: "DM Sans" }}>Address not available</p>}
        </div>

        <div className="conf-section">
          <h3>Payment Summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{order.shipping_amount === 0 ? "Free" : formatPrice(order.shipping_amount)}</span>
          </div>
          <div className="summary-row total">
            <span>Total Paid</span>
            <span>{formatPrice(order.total_amount)}</span>
          </div>
          {order.razorpay_payment_id && (
            <p style={{ fontSize: "0.8rem", color: "#999", marginTop: "0.5rem", fontFamily: "DM Sans" }}>
              Payment ID: {order.razorpay_payment_id}
            </p>
          )}
        </div>
      </motion.div>

      <div className="confirmation-actions">
        <Link to="/profile" className="hero-btn">View All Orders</Link>
        <Link to="/products" className="hero-btn secondary">Continue Shopping</Link>
      </div>
    </section>
  );
};

export default OrderConfirmation;
