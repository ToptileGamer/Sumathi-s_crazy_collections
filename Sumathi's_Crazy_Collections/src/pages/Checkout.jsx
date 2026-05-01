import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/checkout.css";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useRazorpay } from "../hooks/useRazorpay";
import { addAddress, getAddresses } from "../services/orderService";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

const Checkout = () => {
  const navigate          = useNavigate();
  const { items, subtotal, clear } = useCart();
  const { user, profile } = useAuth();
  const { checkout }      = useRazorpay();

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [form, setForm]         = useState({
    fullName: profile?.full_name ?? "",
    phone:    profile?.phone     ?? "",
    line1:    "",
    city:     "",
    state:    "",
    pincode:  "",
  });

  const shipping = subtotal >= 999 ? 0 : 99;
  const tax      = Math.round(subtotal * 0.03);
  const total    = subtotal + shipping + tax;

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Save address to Supabase and get its ID
      const address = await addAddress(user.id, {
        full_name: form.fullName,
        phone:     form.phone,
        line1:     form.line1,
        city:      form.city,
        state:     form.state,
        pincode:   form.pincode,
        country:   "India",
      });

      // Trigger Razorpay
      await checkout({
        cartItems: items.map((i) => ({
          product_id: i.product?.id ?? i.id,
          quantity:   i.quantity,
        })),
        addressId:   address.id,
        userProfile: {
          full_name: form.fullName,
          email:     user.email,
          phone:     form.phone,
        },
        onSuccess: (orderId) => {
          clear();
          navigate(`/order-confirmation`, { state: { orderId } });
        },
        onFailure: (msg) => {
          setError(msg);
          setLoading(false);
        },
      });
    } catch (err) {
      setError(err.message ?? "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <section className="checkout-page">
        <div className="empty-state">
          <h3>Please log in first</h3>
          <p>You need to be logged in to checkout.</p>
          <Link to="/profile" className="hero-btn">Log In</Link>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="checkout-page">
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Please add items before proceeding to checkout.</p>
          <Link to="/products" className="hero-btn">Shop Now</Link>
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
            <input name="fullName" type="text"  placeholder="Full Name"    required value={form.fullName} onChange={handleChange} />
            <input name="phone"    type="tel"   placeholder="Phone Number" required value={form.phone}    onChange={handleChange} />
            <input name="line1"    type="text"  placeholder="Address"      required value={form.line1}    onChange={handleChange} />
            <input name="city"     type="text"  placeholder="City"         required value={form.city}     onChange={handleChange} />
            <input name="state"    type="text"  placeholder="State"        required value={form.state}    onChange={handleChange} />
            <input name="pincode"  type="text"  placeholder="Postal Code"  required value={form.pincode}  onChange={handleChange} />
          </div>

          {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
        </div>

        <aside className="checkout-summary">
          <h3>Order Summary</h3>
          <ul>
            {items.map((item) => {
              const name  = item.product?.name  ?? item.name;
              const price = item.product?.price ?? item.price;
              return (
                <li key={item.id ?? item.slug}>
                  <span>{name} × {item.quantity}</span>
                  <span>{formatPrice(price * item.quantity)}</span>
                </li>
              );
            })}
          </ul>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (3%)</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <button type="submit" className="hero-btn" disabled={loading}>
            {loading ? "Processing..." : `Pay ${formatPrice(total)} via Razorpay`}
          </button>
          <p className="summary-note">Secure payment powered by Razorpay.</p>
        </aside>
      </form>
    </section>
  );
};

export default Checkout;