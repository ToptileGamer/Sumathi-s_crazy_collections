import { useEffect, useState } from "react";
import { useLocation, Link }   from "react-router-dom";
import { getOrder }            from "../services/orderService";

const formatPrice = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const STATUS_STEPS = ["paid", "processing", "shipped", "delivered"];

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
          <p>Loading your order...</p>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="confirmation-page">
        <div className="confirmation-card">
          <div style={{ fontSize: "3rem" }}>🎉</div>
          <h2>Order Placed!</h2>
          <p>Thank you for shopping with us. Check your email for updates.</p>
          <Link to="/products" className="hero-btn">Continue Shopping</Link>
        </div>
      </section>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <section className="confirmation-page">
      {/* ── Success Banner ── */}
      <div className="confirmation-card">
        <div className="success-icon">✓</div>
        <h2>Order Confirmed! 🎉</h2>
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
            <div key={step} className={`tracker-step ${i <= currentStep ? "done" : ""} ${i === currentStep ? "active" : ""}`}>
              <div className="tracker-dot" />
              <span>{step.charAt(0).toUpperCase() + step.slice(1)}</span>
              {i < STATUS_STEPS.length - 1 && <div className="tracker-line" />}
            </div>
          ))}
        </div>
      </div>

      {/* ── Order Details ── */}
      <div className="confirmation-details">
        <div className="conf-section">
          <h3>Items Ordered</h3>
          <ul className="conf-items">
            {(order.items ?? []).map((item) => (
              <li key={item.id}>
                {item.product_image && <img src={item.product_image} alt={item.product_name} />}
                <div>
                  <strong>{item.product_name}</strong>
                  <span>Qty: {item.quantity}</span>
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
          ) : <p style={{ color: "#888" }}>Address not available</p>}
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
            <p style={{ fontSize: "0.8rem", color: "#888", marginTop: "0.5rem" }}>
              Payment ID: {order.razorpay_payment_id}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "2rem" }}>
        <Link to="/profile" className="hero-btn">View All Orders</Link>
        <Link to="/products" className="hero-btn" style={{ background: "#fff", color: "#e91e8c", border: "1.5px solid #e91e8c" }}>
          Continue Shopping
        </Link>
      </div>
    </section>
  );
};

export default OrderConfirmation;