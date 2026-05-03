import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import "../styles/cart.css";

const formatPrice = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const getImage = (item) =>
  item.product?.images?.find((i) => i.is_primary)?.url ??
  item.product?.images?.[0]?.url ??
  "https://placehold.co/80x80?text=?";

const Cart = () => {
  const { items, update, remove, subtotal, loading } = useCart();
  const { user } = useAuth();

  const shipping = subtotal > 0 && subtotal < 999 ? 99 : 0;
  const tax      = Math.round(subtotal * 0.03);
  const total    = subtotal + shipping + tax;

  // ── Not logged in ─────────────────────────────────────────
  if (!user) {
    return (
      <section className="cart-page">
        <div className="empty-state">
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛒</div>
          <h3>Please log in</h3>
          <p>Log in to view and manage your cart.</p>
          <Link to="/login" className="hero-btn">Log In</Link>
        </div>
      </section>
    );
  }

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <section className="cart-page">
        <div className="cart-header"><h2>Your Shopping Bag</h2></div>
        <div className="cart-layout">
          <div className="cart-items">
            {[1,2,3].map((i) => <div key={i} className="cart-item-skeleton" />)}
          </div>
        </div>
      </section>
    );
  }

  // ── Empty ─────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <section className="cart-page">
        <div className="empty-state">
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛍️</div>
          <h3>Your cart is empty</h3>
          <p>Browse our collections and add something special.</p>
          <Link to="/products" className="hero-btn">Continue Shopping</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <div className="cart-header">
        <h2>Your Shopping Bag</h2>
        <p>{items.length} item{items.length > 1 ? "s" : ""} in your cart</p>
      </div>

      <div className="cart-layout">
        {/* ── Items ── */}
        <div className="cart-items">
          {items.map((item) => {
            const name    = item.product?.name  ?? "Product";
            const price   = item.product?.price ?? 0;
            const prodId  = item.product?.id;
            const inStock = (item.product?.stock ?? 99) >= item.quantity;

            return (
              <div key={item.id} className="cart-item">
                <img src={getImage(item)} alt={name} />

                <div className="cart-item-info">
                  <p className="cart-item-category">{item.product?.category?.name}</p>
                  <h3>{name}</h3>
                  <p className="price">{formatPrice(price)}</p>
                  {!inStock && <p style={{ color: "#ef4444", fontSize: "0.8rem" }}>⚠ Low stock</p>}

                  <div className="cart-quantity">
                    <button type="button"
                      onClick={() => update(prodId, item.quantity - 1)}
                      disabled={item.quantity <= 1}>−</button>
                    <span>{item.quantity}</span>
                    <button type="button"
                      onClick={() => update(prodId, item.quantity + 1)}
                      disabled={item.quantity >= (item.product?.stock ?? 99)}>+</button>
                  </div>
                </div>

                <div className="cart-item-total">
                  <p className="price">{formatPrice(price * item.quantity)}</p>
                  <button type="button" className="remove-btn" onClick={() => remove(prodId)}>
                    🗑 Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Summary ── */}
        <aside className="cart-summary">
          <h3>Order Summary</h3>

          <div className="summary-row">
            <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span style={{ color: shipping === 0 ? "#10b981" : "inherit" }}>
              {shipping === 0 ? "🎉 Free" : formatPrice(shipping)}
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

          {subtotal < 999 && subtotal > 0 && (
            <p className="free-shipping-nudge">
              Add {formatPrice(999 - subtotal)} more for free shipping!
            </p>
          )}

          <Link to="/checkout" className="hero-btn" style={{ display: "block", textAlign: "center", marginTop: "1rem" }}>
            Proceed to Checkout →
          </Link>
          <Link to="/products" className="continue-shopping">← Continue Shopping</Link>
        </aside>
      </div>
    </section>
  );
};

export default Cart;