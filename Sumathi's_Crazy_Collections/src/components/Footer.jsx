import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } };

const Footer = () => {

  return (
    <motion.footer className="footer" id="site-footer"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}>

      {/* Main Footer */}
      <div className="footer-main">
        <motion.div className="footer-content" variants={stagger}>
          {/* Brand */}
          <motion.div className="footer-brand" variants={fadeUp}>
            <div className="footer-logo">
              <motion.span className="logo__icon"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                style={{ color: "#e91e8c", fontSize: "1rem" }}>
                ✦
              </motion.span>
              <h3>Sumathi's Crazy Collections</h3>
            </div>
            <p>Handcrafted bracelets & earrings made with love and premium materials. Each piece tells a unique story.</p>
            <p className="footer-note">📍 Bangalore, India</p>
            <p className="footer-note">✉️ sumathiscrazycollection@gmail.com</p>
            <div className="footer-social">
              <motion.a href="https://instagram.com/sumathiscrazycollections" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                whileHover={{ scale: 1.2, color: "#e91e8c" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
              </motion.a>
              <motion.a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                whileHover={{ scale: 1.2, color: "#25D366" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </motion.a>
            </div>
          </motion.div>

          <motion.div className="footer-links" variants={fadeUp}>
            <h4>Shop</h4>
            <Link to="/products">All Products</Link>
            <Link to="/products?category=bracelets">Bracelets</Link>
            <Link to="/products?category=earrings">Earrings</Link>
            <Link to="/cart">Cart</Link>
          </motion.div>

          <motion.div className="footer-links" variants={fadeUp}>
            <h4>Customer Care</h4>
            <Link to="/faq">FAQ</Link>
            <Link to="/shipping">Shipping Info</Link>
            <Link to="/returns">Returns & Refunds</Link>
            <Link to="/contact">Contact Us</Link>
          </motion.div>

          <motion.div className="footer-links" variants={fadeUp}>
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </motion.div>
        </motion.div>

        <motion.div className="footer-trust" variants={stagger}>
          {[
            { icon: "🔒", text: "Secure Payments" },
            { icon: "🚚", text: "Fast Delivery" },
            { icon: "↩️", text: "Easy Returns" },
            { icon: "💎", text: "Premium Quality" },
          ].map((item, i) => (
            <motion.div key={i} className="footer-trust__item" variants={fadeUp}
              whileHover={{ y: -3, scale: 1.02 }}>
              <span>{item.icon}</span>
              <p>{item.text}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.p className="footer-copy" variants={fadeUp}>
          © {new Date().getFullYear()} Sumathi's Crazy Collections. All rights reserved. Made with ♡ in India.
        </motion.p>
      </div>

      <style>{`
        .footer { background: var(--dark); color: rgba(255,255,255,0.7); padding: var(--section-padding) var(--container-px) 2rem; }
        .footer-main { max-width: 1200px; margin: 0 auto; }
        .footer-content { display: grid; gap: 2.5rem; grid-template-columns: 2fr 1fr 1fr 1fr; margin-bottom: 3rem; }
        @media (max-width: 1024px) { .footer-content { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 600px) { .footer-content { grid-template-columns: 1fr; gap: 2rem; text-align: center; } .footer-links { align-items: center; } }
        .footer-content h3 { color: #fff; font-size: 1.15rem; font-weight: 700; font-family: var(--font-display); }
        .footer-logo { display: flex; align-items: center; gap: 0.5rem; }
        @media (max-width: 600px) { .footer-logo { justify-content: center; } }
        .footer p { font-size: 0.9rem; line-height: 1.7; color: rgba(255,255,255,0.6); margin-top: 0.75rem; }
        .footer-note { font-size: 0.85rem; margin-top: 0.75rem; color: rgba(255,255,255,0.4); }
        .footer-social { display: flex; gap: 0.75rem; margin-top: 1.25rem; }
        @media (max-width: 600px) { .footer-social { justify-content: center; } }
        .footer-social a { color: rgba(255,255,255,0.5); transition: color 0.2s; }
        .footer-links { display: flex; flex-direction: column; gap: 0.5rem; }
        .footer-links h4 { color: #fff; font-size: 0.78rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.06em; }
        .footer-links a { color: rgba(255,255,255,0.5); font-size: 0.875rem; transition: color 0.2s; }
        .footer-links a:hover { color: var(--brand); }
        .footer-trust { display: flex; justify-content: center; gap: 3rem; flex-wrap: wrap; padding: 2rem 0; border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 2rem; }
        .footer-trust__item { display: flex; align-items: center; gap: 0.5rem; color: rgba(255,255,255,0.5); font-size: 0.85rem; cursor: default; }
        .footer-trust__item span { font-size: 1.1rem; }
        .footer-trust__item p { margin: 0; color: rgba(255,255,255,0.5); }
        .footer-copy { text-align: center; font-size: 0.8rem; color: rgba(255,255,255,0.3); }
      `}</style>
    </motion.footer>
  );
};

export default Footer;
