import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/checkout.css";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../data/products";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totals, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      navigate("/order-confirmation", {
        state: {
          orderId: `SCC-${Math.floor(100000 + Math.random() * 900000)}`,
          totals,
          items,
        },
      });
      clearCart();
    }, 800);
  };

  if (items.length === 0) {
    return (
      <section className="checkout-page">
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Please add items before proceeding to checkout.</p>
          <Link to="/products" className="hero-btn">
            Shop Now
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-page">
      <div className="checkout-header">
        <h2>Checkout</h2>
        <p>Confirm your details and place your order.</p>
      </div>

      <form className="checkout-layout" onSubmit={handleSubmit}>
        <div className="checkout-form">
          <h3>Shipping Information</h3>
          <div className="form-grid">
            <input type="text" placeholder="Full Name" required />
            <input type="email" placeholder="Email Address" required />
            <input type="tel" placeholder="Phone Number" required />
            <input type="text" placeholder="City" required />
            <input type="text" placeholder="State" required />
            <input type="text" placeholder="Postal Code" required />
          </div>
          <textarea placeholder="Delivery Instructions (optional)" rows="3" />

          <h3>Payment Method</h3>
          <div className="payment-options">
            <label>
              <input type="radio" name="payment" defaultChecked />
              UPI / Wallets
            </label>
            <label>
              <input type="radio" name="payment" />
              Card Payment
            </label>
            <label>
              <input type="radio" name="payment" />
              Cash on Delivery
            </label>
          </div>
        </div>

        <aside className="checkout-summary">
          <h3>Order Summary</h3>
          <ul>
            {items.map((item) => (
              <li key={item.slug}>
                <span>{item.name} × {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(totals.subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</span>
          </div>
          <div className="summary-row">
            <span>Estimated Tax</span>
            <span>{formatPrice(totals.tax)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(totals.total)}</span>
          </div>
          <button type="submit" className="hero-btn" disabled={loading}>
            {loading ? "Placing Order..." : "Place Order"}
          </button>
          <p className="summary-note">We’ll send order updates to your email.</p>
        </aside>
      </form>
    </section>
  );
};

export default Checkout;
