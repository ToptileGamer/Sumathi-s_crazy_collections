import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div>
        <h3>Sumathi's Crazy Collections</h3>
        <p>Handmade bracelets & earrings curated with love.</p>
        <p className="footer-note">📍 Chennai, India • ✉️ hello@sumathiscollections.com</p>
      </div>
      <div className="footer-links">
        <h4>Shop</h4>
        <Link to="/products">Products</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/checkout">Checkout</Link>
      </div>
      <div className="footer-links">
        <h4>Help</h4>
        <Link to="/faq">FAQ</Link>
        <Link to="/shipping">Shipping</Link>
        <Link to="/returns">Returns</Link>
      </div>
      <div className="footer-links">
        <h4>Company</h4>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
      </div>
    </div>
    <p className="footer-copy">
      © {new Date().getFullYear()} Sumathi's Crazy Collections. All rights reserved.
    </p>
  </footer>
);

export default Footer;
