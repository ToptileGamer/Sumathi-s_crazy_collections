import { Link } from "react-router";
import { motion } from "framer-motion";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import "../styles/cart.css";

import defaultImg from "../assets/bracelets/bluewhite_panda.png";

const formatPrice = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const getImage = (item) =>
  item.product?.images?.find((i) => i.is_primary)?.url ??
  item.product?.images?.[0]?.url ??
  defaultImg;

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };

/* ── Section Header ── */
function CartHeader({ subtitle, title }) {
  return (
    <div className="cart-header">
      <motion.span className="sh__sub"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <span className="sh__accent-line" />{subtitle}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
        {title}
      </motion.h2>
    </div>
  );
}

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
          <p style={{ color: "#888", fontFamily: "DM Sans" }}>Log in to view and manage your cart.</p>
          <Link to="/signup" className="hero-btn" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.85rem 2rem", background: "#1a1a1a", color: "#fff", borderRadius: "50px", fontWeight: 600, textDecoration: "none", marginTop: "1rem" }}>
            Sign Up / Log In
          </Link>
        </div>
      </section>
    );
  }

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <section className="cart-page">
        <CartHeader subtitle="Your Bag" title="Your Shopping Bag" />
        <div className="cart-layout">
          <div className="cart-items">
            {[1,2,3].map((i) => (
              <div key={i} style={{ height: 120, background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.04)" }} />
            ))}
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
          <p style={{ color: "#888", fontFamily: "DM Sans" }}>Browse our collections and add something special.</p>
          <Link to="/products" className="hero-btn" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.85rem 2rem", background: "#1a1a1a", color: "#fff", borderRadius: "50px", fontWeight: 600, textDecoration: "none", marginTop: "1rem" }}>
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <CartHeader subtitle="Your Bag" title={`Your Shopping Bag (${items.length})`} />

      <div className="cart-layout">
        {/* ── Items ── */}
        <motion.div className="cart-items" variants={stagger} initial="hidden" animate="visible">
          {items.map((item) => {
            const name    = item.product?.name  ?? "Product";
            const price   = item.product?.price ?? 0;
            const prodId  = item.product?.id;
            const inStock = (item.product?.stock ?? 99) >= item.quantity;

            return (
              <motion.div key={item.id} className="cart-item" variants={fadeUp}>
                <img src={getImage(item)} alt={name} />

                <div className="cart-item-info">
                  <p className="cart-item-category">{item.product?.category?.name}</p>
                  <h3>{name}</h3>
                  <p className="price">{formatPrice(price)}</p>
                  {!inStock && <p style={{ color: "#ef4444", fontSize: "0.8rem", fontFamily: "DM Sans" }}>⚠ Low stock</p>}

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
                  <button type="button" className="cart-item-remove" onClick={() => remove(prodId)}>
                    Remove
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Summary ── */}
        <motion.aside className="cart-summary"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
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
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          {subtotal < 999 && subtotal > 0 && (
            <p className="free-shipping-nudge">
              Add {formatPrice(999 - subtotal)} more for free shipping!
            </p>
          )}

          <Link to="/checkout" className="hero-btn">
            Proceed to Checkout →
          </Link>
          <Link to="/products" className="continue-shopping">← Continue Shopping</Link>
        </motion.aside>
      </div>
    </section>
  );
};

export default Cart;
