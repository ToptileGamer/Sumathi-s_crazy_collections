import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { getProducts, getCategories } from "../services/productService";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useWishlist } from "../hooks/useWishlist";
import TiltCard from "../components/TiltCard";
import images from "../assets/bracelets/bluewhite_panda.png";
import imgBracelet from "../assets/bracelets/mc4.png";
import imgEarring from "../assets/Earings/yb.png";
import earing from "../assets/Earings/baby_pink.png";

const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const getPrimaryImage = (p) => p.images?.find((i) => i.is_primary)?.url ?? p.images?.[0]?.url ?? images;

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6 } } };
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
const slideLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const slideRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

function AnimatedSection({ children, className, variants = fadeUp, once = true, margin = "-80px" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin });
  return (
    <motion.section ref={ref} className={className}
      initial="hidden" animate={isInView ? "visible" : "hidden"} variants={variants}>
      {children}
    </motion.section>
  );
}

function SectionHeader({ subtitle, title, center = true }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} className={`section-header ${center ? "center" : ""}`}
      initial="hidden" animate={isInView ? "visible" : "hidden"} variants={stagger}>
      <motion.span variants={fadeUp} className="subtitle">{subtitle}</motion.span>
      <motion.h2 variants={fadeUp}>{title}</motion.h2>
    </motion.div>
  );
}

const ProductCard = ({ product }) => {
  const { add } = useCart();
  const { user } = useAuth();
  const { toggle, isWishlisted } = useWishlist();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const img = getPrimaryImage(product);

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (!user) { navigate("/signup"); return; }
    setAdding(true);
    try { await add(product.id, 1); } finally { setAdding(false); }
  };

  const handleWish = (e) => {
    e.stopPropagation();
    if (!user) { navigate("/signup"); return; }
    toggle(product.id);
  };

  return (
    <TiltCard tiltDegree={4} glare={true} scale={1.01}>
      <motion.div className="home-product-card" onClick={() => navigate(`/product/${product.slug}`, { state: { product } })}
        variants={scaleIn} layout>
        <div className="home-product-img">
          <img src={img} alt={product.name} />
          {product.original_price && (
            <span className="home-badge">
              -{Math.round((1 - product.price / product.original_price) * 100)}%
            </span>
          )}
          <button className={`home-wish ${isWishlisted(product.id) ? "active" : ""}`} onClick={handleWish}>
            {isWishlisted(product.id) ? "♥" : "♡"}
          </button>
        </div>
        <div className="home-product-info">
          <p className="home-product-cat">{product.category?.name || "Collection"}</p>
          <h4>{product.name}</h4>
          <div className="home-product-price">
            <span>{fmt(product.price)}</span>
            {product.original_price && <s>{fmt(product.original_price)}</s>}
          </div>
          <motion.button className="home-add-btn" onClick={handleAdd} disabled={adding || product.stock === 0}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {product.stock === 0 ? "Out of Stock" : adding ? "Adding…" : "Add to Cart"}
          </motion.button>
        </div>
      </motion.div>
    </TiltCard>
  );
};

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cats, feat] = await Promise.all([
          getCategories(),
          getProducts({ featured: true, limit: 8 }).then((r) => r.products ?? []),
        ]);
        setCategories(cats ?? []);
        setFeatured(feat);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const testimonials = [
    { name: "Priya Sharma", role: "Verified Buyer", text: "The bracelet I ordered is absolutely stunning! The attention to detail is incredible, and it came beautifully packaged." },
    { name: "Ananya M.", role: "Repeat Customer", text: "I wear my earrings every single day. They are so lightweight and I always get compliments on them." },
    { name: "Sneha K.", role: "Verified Buyer", text: "Bought a custom piece for my sister's wedding. Sumathi was so helpful throughout the process." },
  ];

  return (
    <div className="home-page">

      {/* ════ HERO ════ */}
      <section className="home-hero">
        <div className="hero-bg-shapes">
          <motion.div className="hero-shape-1"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="hero-shape-2"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
        </div>

        <div className="hero-container">
          <motion.div className="hero-content"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <motion.span className="hero-eyebrow"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}>
              Sumathi's Crazy Collections
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
              Jewellery that tells<br />
              <motion.span className="gradient-text"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% 200%" }}>
                your story.
              </motion.span>
            </motion.h1>
            <motion.p className="hero-sub"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}>
              Discover our exclusive collection of handcrafted bracelets and earrings — each piece thoughtfully made to elevate your everyday elegance.
            </motion.p>
            <motion.div className="hero-btns"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}>
              <Link to="/products" className="hero-btn-primary">Shop Collection</Link>
              <Link to="/about" className="hero-btn-outline">Our Story</Link>
            </motion.div>
            <motion.div className="hero-stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}>
              <div><strong>100+</strong><span>Happy Clients</span></div>
              <div><strong>100%</strong><span>Handcrafted</span></div>
              <div><strong>500+</strong><span>Pieces Sold</span></div>
            </motion.div>
          </motion.div>

          <motion.div className="hero-visual"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <div className="hero-image-main">
              <img src={images} alt="Main Collection" />
            </div>
            <motion.div className="hero-image-sub"
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}>
              <img src={earing} alt="Elegant Bracelets" />
            </motion.div>
            <motion.div className="glass-card"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1, y: [0, -10, 0] }}
              transition={{ delay: 1.1, duration: 0.5, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}>
              <div className="glass-icon">{String.fromCodePoint(0x2726)}</div>
              <div className="glass-text">
                <strong>Premium Quality</strong>
                <span>Handmade with love</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ════ MARQUEE ════ */}
      <motion.div className="marquee-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}>
        <div className="marquee-track">
          {Array(10).fill("FREE SHIPPING OVER ₹999 • HANDCRAFTED • 100% SECURE • PREMIUM QUALITY").map((text, i) => (
            <span key={i} className="marquee-item">{text}</span>
          ))}
        </div>
      </motion.div>

      {/* ════ CATEGORIES ════ */}
      <AnimatedSection className="home-section">
        <SectionHeader subtitle="The Collections" title="Shop by Category" />
        <motion.div className="lookbook-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
          {categories.filter((cat) => /bracelet|earring/i.test(cat.name)).slice(0, 2).map((cat, i) => (
            <motion.div key={cat.id} variants={i === 0 ? slideLeft : slideRight}>
              <TiltCard tiltDegree={6} glare={true} scale={1.01}>
                <Link to={`/products?category=${cat.slug}`} className="lookbook-item">
                  <img src={i === 0 ? imgBracelet : imgEarring} alt={cat.name} className="lookbook-bg" />
                  <div className="lookbook-overlay" />
                  <div className="lookbook-content">
                    <h3>{cat.name}</h3>
                    <p>Explore Collection →</p>
                  </div>
                </Link>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </AnimatedSection>

      {/* ════ TRENDING PRODUCTS ════ */}
      <AnimatedSection className="home-section alt">
        <div className="section-inner">
          <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
            <div>
              <span className="subtitle">Curated Picks</span>
              <h2 style={{ fontSize: "var(--h2-size)", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--dark)", margin: 0 }}>Trending Now</h2>
            </div>
            <Link to="/products" className="section-link">View All Products →</Link>
          </div>
          <motion.div className="home-products-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="product-skeleton" style={{ cursor: "default", height: "400px" }}>
                    <div style={{ height: "280px", width: "100%", background: "#eaeaea" }} />
                    <div style={{ padding: "1.5rem", textAlign: "center" }}>
                      <div style={{ width: "40%", height: 10, background: "#eaeaea", margin: "0 auto 10px" }} />
                      <div style={{ width: "70%", height: 14, background: "#eaeaea", margin: "0 auto 10px" }} />
                      <div style={{ width: "30%", height: 12, background: "#eaeaea", margin: "0 auto" }} />
                    </div>
                  </div>
                ))
              : featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ════ TESTIMONIALS ════ */}
      <AnimatedSection className="home-section">
        <SectionHeader subtitle="Testimonials" title="Loved by Our Customers" />
        <motion.div className="testimonials-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
          {testimonials.map((r, i) => (
            <motion.div key={i} className="testimonial-card" variants={fadeUp}
              whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}>
              <div className="testi-stars">{String.fromCodePoint(0x2605).repeat(5)}</div>
              <p className="testi-text">"{r.text}"</p>
              <div className="testi-author">
                <div className="testi-avatar">{r.name.charAt(0)}</div>
                <div className="testi-info">
                  <h4>{r.name}</h4>
                  <span>{r.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatedSection>

      {/* ════ WHY CHOOSE US ════ */}
      <AnimatedSection className="home-section alt">
        <div className="section-inner">
          <SectionHeader subtitle="Our Promise" title="Why Choose Us" />
          <motion.div className="why-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
            {[
              { icon: "✨", title: "Artisan Crafted", desc: "Every single piece is intricately handcrafted by skilled artisans, ensuring your jewellery is as unique as you are." },
              { icon: "💎", title: "Premium Materials", desc: "We use strictly hypoallergenic, tarnish-resistant, and premium-grade materials that stand the test of time." },
              { icon: "🎁", title: "Perfect for Gifting", desc: "Delivered in elegant, premium packaging that makes unboxing a luxurious experience for you or your loved ones." },
            ].map((item, i) => (
              <motion.div key={i} className="why-card" variants={fadeUp} whileHover={{ y: -6 }}>
                <motion.div className="why-icon-wrap"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}>
                  {item.icon}
                </motion.div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ════ CTA BANNER ════ */}
      <AnimatedSection className="cta-banner" variants={fadeIn}>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}>
          Find Your Perfect Piece
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}>
          Whether you're looking for an everyday staple or a statement piece for a special occasion, we have something beautiful waiting for you.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}>
          <Link to="/products" className="hero-btn-primary" style={{ background: "#fff", color: "#1a1a2e" }}>
            Shop the Collection
          </Link>
        </motion.div>
      </AnimatedSection>
    </div>
  );
};

export default Home;
