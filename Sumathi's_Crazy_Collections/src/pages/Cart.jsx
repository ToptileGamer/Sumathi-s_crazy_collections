import { Link } from "react-router-dom";
import "../styles/cart.css";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

const Cart = () => {
  const { items, update, remove, subtotal } = useCart();
  const { user } = useAuth();

  // Shipping and tax derived from subtotal
  const shipping = subtotal >= 999 ? 0 : 99;
  const tax      = Math.round(subtotal * 0.03); // 3% GST estimate
  const total    = subtotal + shipping + tax;

  if (!user) {
    return (
      <section className="cart-page">
        <div className="empty-state">
          <h3>Please log in</h3>
          <p>You need to be logged in to view your cart.</p>
          <Link to="/profile" className="hero-btn">Log In</Link>
        </div>
      </section>
    );
  }

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
          <Link to="/products" className="hero-btn">Continue Shopping</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => {
              // Supabase items have item.product nested; local items are flat
              const name     = item.product?.name  ?? item.name;
              const price    = item.product?.price ?? item.price;
              const image    = item.product?.images?.find(i => i.is_primary)?.url
                            ?? item.product?.images?.[0]?.url
                            ?? item.image;
              const prodId   = item.product?.id ?? item.slug;

              return (
                <div key={item.id ?? item.slug} className="cart-item">
                  <img src={image} alt={name} />
                  <div className="cart-item-info">
                    <h3>{name}</h3>
                    <p className="price">{formatPrice(price)}</p>
                    <div className="cart-quantity">
                      <button type="button" onClick={() => update(prodId, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => update(prodId, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <div className="cart-item-total">
                    <p>{formatPrice(price * item.quantity)}</p>
                    <button type="button" onClick={() => remove(prodId)}>Remove</button>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <div className="summary-row">
              <span>Estimated Tax (3%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Link to="/checkout" className="hero-btn">Proceed to Checkout</Link>
            <p className="summary-note">Free shipping on orders over ₹999.</p>
          </aside>
        </div>
      )}
    </section>
  );
};

export default Cart;