import { useState } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(""); }
  };

  return (
    <footer className="footer" id="site-footer">
      {/* Newsletter Banner */}
      {/* <div className="footer-newsletter">
        <div className="footer-newsletter__inner">
          <div>
            <h3>Stay in the Loop</h3>
            <p>Get notified about new arrivals, exclusive offers & handcrafted collections.</p>
          </div>
          {subscribed ? (
            <p className="footer-newsletter__thanks">✓ Thank you for subscribing!</p>
          ) : (
            <form className="footer-newsletter__form" onSubmit={handleSubscribe}>
              <input
                type="email" placeholder="Enter your email"
                value={email} onChange={e => setEmail(e.target.value)}
                required id="footer-newsletter-input"
              />
              <button type="submit" id="footer-newsletter-btn">Subscribe</button>
            </form>
          )}
        </div>
      </div> */}

      {/* Main Footer */}
      <div className="footer-main">
        <div className="footer-content">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo__icon" style={{color:'#e91e8c',fontSize:'1rem'}}>✦</span>
              <h3>Sumathi's Crazy Collections</h3>
            </div>
            <p>Handcrafted bracelets & earrings made with love and premium materials. Each piece tells a unique story.</p>
            <p className="footer-note">📍 Bangalore, India</p>
            <p className="footer-note">✉️ sumathiscrazycollection@gmail.com</p>
            {/* Social links */}
            <div className="footer-social">
              <a href="https://instagram.com/sumathiscrazycollections" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
              </a>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            </div>
          </div>

          {/* Shop links */}
          <div className="footer-links">
            <h4>Shop</h4>
            <Link to="/products">All Products</Link>
            <Link to="/products?category=bracelets">Bracelets</Link>
            <Link to="/products?category=earrings">Earrings</Link>
            <Link to="/cart">Cart</Link>
          </div>

          {/* Help links */}
          <div className="footer-links">
            <h4>Customer Care</h4>
            <Link to="/faq">FAQ</Link>
            <Link to="/shipping">Shipping Info</Link>
            <Link to="/returns">Returns & Refunds</Link>
            <Link to="/contact">Contact Us</Link>
          </div>

          {/* Company links */}
          <div className="footer-links">
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>

        {/* Trust badges */}
        <div className="footer-trust">
          <div className="footer-trust__item">
            <span>🔒</span> <p>Secure Payments</p>
          </div>
          <div className="footer-trust__item">
            <span>🚚</span> <p>Fast Delivery</p>
          </div>
          <div className="footer-trust__item">
            <span>↩️</span> <p>Easy Returns</p>
          </div>
          <div className="footer-trust__item">
            <span>💎</span> <p>Premium Quality</p>
          </div>
        </div>

        <p className="footer-copy">
          © {new Date().getFullYear()} Sumathi's Crazy Collections. All rights reserved. Made with ♡ in India.
        </p>
      </div>

      <style>{`
        /* Newsletter */
        .footer-newsletter {
          background: linear-gradient(135deg, #1a1a2e, #2d1b4e);
          padding: 3rem 2rem;
        }
        .footer-newsletter__inner {
          max-width: 900px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          gap: 2rem; flex-wrap: wrap;
        }
        .footer-newsletter h3 {
          color: #fff; font-size: 1.3rem; font-weight: 700; margin-bottom: 0.3rem;
          font-family: var(--font-display, Georgia);
        }
        .footer-newsletter p { color: rgba(255,255,255,0.6); font-size: 0.9rem; margin: 0; }
        .footer-newsletter__form {
          display: flex; gap: 0;
          border-radius: 10px; overflow: hidden;
          border: 1.5px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
        }
        .footer-newsletter__form input {
          border: none; background: transparent; color: #fff;
          padding: 0.7rem 1rem; font-size: 0.9rem; min-width: 240px;
          outline: none; font-family: inherit;
        }
        .footer-newsletter__form input::placeholder { color: rgba(255,255,255,0.4); }
        .footer-newsletter__form button {
          background: #e91e8c; color: #fff; border: none;
          padding: 0.7rem 1.5rem; font-weight: 600; font-size: 0.85rem;
          cursor: pointer; transition: background 0.2s; white-space: nowrap;
        }
        .footer-newsletter__form button:hover { background: #c2185b; }
        .footer-newsletter__thanks { color: #10b981; font-weight: 600; font-size: 0.9rem; }

        /* Main footer */
        .footer-main { padding: 3rem 2rem 1.5rem; }
        .footer-brand { max-width: 300px; }
        .footer-logo { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.75rem; }
        .footer-social {
          display: flex; gap: 0.75rem; margin-top: 1rem;
        }
        .footer-social a {
          width: 36px; height: 36px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.12);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.5); transition: all 0.2s;
        }
        .footer-social a:hover {
          color: #e91e8c; border-color: #e91e8c;
          background: rgba(233,30,140,0.08);
        }

        /* Trust badges */
        .footer-trust {
          display: flex; justify-content: center; gap: 2rem;
          flex-wrap: wrap; padding: 2rem 0;
          border-top: 1px solid rgba(255,255,255,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-top: 2rem;
        }
        .footer-trust__item {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.82rem; color: rgba(255,255,255,0.5);
        }
        .footer-trust__item span { font-size: 1.1rem; }
        .footer-trust__item p { margin: 0; }

        @media (max-width: 600px) {
          .footer-newsletter__inner { text-align: center; justify-content: center; }
          .footer-newsletter__form { width: 100%; }
          .footer-newsletter__form input { min-width: 0; flex: 1; }
          .footer-trust { gap: 1rem; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
