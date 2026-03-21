import { useLocation, Link } from "react-router-dom";
import "../styles/checkout.css";
import { formatPrice } from "../data/products";

const OrderConfirmation = () => {
  const { state } = useLocation();

  if (!state) {
    return (
      <section className="checkout-page">
        <div className="empty-state">
          <h3>No order found</h3>
          <p>Looks like you haven’t placed an order yet.</p>
          <Link to="/products" className="hero-btn">
            Shop the Collection
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-page">
      <div className="confirmation-card">
        <h2>Thank you for your order! 🎉</h2>
        <p>Your order <strong>{state.orderId}</strong> has been placed successfully.</p>
        <div className="confirmation-summary">
          <h3>Order Summary</h3>
          <ul>
            {state.items.map((item) => (
              <li key={item.slug}>
                <span>{item.name} × {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-row total">
            <span>Total Paid</span>
            <span>{formatPrice(state.totals.total)}</span>
          </div>
        </div>
        <div className="confirmation-actions">
          <Link to="/products" className="hero-btn">
            Continue Shopping
          </Link>
          <Link to="/contact" className="hero-btn secondary">
            Need Help? Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OrderConfirmation;
