import { Link } from "react-router-dom";
import "../styles/cart.css";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../data/products";

const Cart = () => {
  const { items, updateQuantity, removeItem, totals } = useCart();

  return (
    <section className="cart-page">
      <div className="cart-header">
        <h2>Your Shopping Bag</h2>
        <p>Review your favorites before checking out.</p>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Browse our collections and add something special.</p>
          <Link to="/products" className="hero-btn">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.slug} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="price">{formatPrice(item.price)}</p>
                  <div className="cart-quantity">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="cart-item-total">
                  <p>{formatPrice(item.price * item.quantity)}</p>
                  <button type="button" onClick={() => removeItem(item.slug)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="cart-summary">
            <h3>Order Summary</h3>
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
            <Link to="/checkout" className="hero-btn">
              Proceed to Checkout
            </Link>
            <p className="summary-note">Free shipping on orders over ₹999.</p>
          </aside>
        </div>
      )}
    </section>
  );
};

export default Cart;
