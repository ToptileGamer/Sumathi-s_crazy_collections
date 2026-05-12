import { useEffect, useState } from "react";
import { Link, useNavigate }   from "react-router-dom";
import { getProducts, getCategories } from "../services/productService";
import { useCart }     from "../hooks/useCart";
import { useAuth }     from "../hooks/useAuth";
import { useWishlist } from "../hooks/useWishlist";
import "../styles/home.css";
import images from "../assets/bracelets/bluewhite_panda.png"; 
import imgBracelet from "../assets/bracelets/mc4.png";
import imgEarring from "../assets/Earings/yb.png"
import earing from "../assets/Earings/baby_pink.png"

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const getPrimaryImage = (p) =>
  p.images?.find((i) => i.is_primary)?.url ?? p.images?.[0]?.url ?? images;

const ProductCard = ({ product }) => {
  const { add }                  = useCart();
  const { user }                 = useAuth();
  const { toggle, isWishlisted } = useWishlist();
  const navigate                 = useNavigate();
  const [adding, setAdding]      = useState(false);
  const img                      = getPrimaryImage(product);

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
    <div className="home-product-card" onClick={() => navigate(`/product/${product.slug}`, { state: { product } })}>
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
        <button className="home-add-btn" onClick={handleAdd} disabled={adding || product.stock === 0}>
          {product.stock === 0 ? "Out of Stock" : adding ? "Adding…" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="product-skeleton" style={{ cursor: "default", height: '400px' }}>
    <div style={{ height: '280px', width: '100%', background: '#eaeaea' }} />
    <div style={{ padding: '1.5rem', textAlign: 'center' }}>
      <div style={{ width: '40%', height: 10, background: '#eaeaea', margin: '0 auto 10px' }} />
      <div style={{ width: '70%', height: 14, background: '#eaeaea', margin: '0 auto 10px' }} />
      <div style={{ width: '30%', height: 12, background: '#eaeaea', margin: '0 auto' }} />
    </div>
  </div>
);

const Home = () => {
  const [featured,   setFeatured]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cats, feat] = await Promise.all([
          getCategories(),
          getProducts({ featured: true, limit: 8 }).then(r => r.products ?? []),
        ]);
        setCategories(cats ?? []);
        setFeatured(feat);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  return (
    <div className="home-page">
      {/* ════ CINEMATIC HERO ════ */}
      <section className="home-hero">
        <div className="hero-bg-shapes">
          <div className="hero-shape-1" />
          <div className="hero-shape-2" />
        </div>
        <div className="hero-container">
          <div className="hero-content">
            <span className="hero-eyebrow">Sumathi's Crazy Collections</span>
            <h1>
              Jewellery that tells<br/>
              <span>your story.</span>
            </h1>
            <p className="hero-sub">
              Discover our exclusive collection of handcrafted bracelets and earrings —
              each piece thoughtfully made to elevate your everyday elegance.
            </p>
            <div className="hero-btns">
              <Link to="/products" className="hero-btn-primary">Shop Collection</Link>
              <Link to="/about" className="hero-btn-outline">Our Story</Link>
            </div>
            <div className="hero-stats">
              <div><strong>100+</strong><span>Happy Clients</span></div>
              <div><strong>100%</strong><span>Handcrafted</span></div>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="hero-image-main">
              <img src={images} alt="Main Collection" />
            </div>
            <div className="hero-image-sub">
              <img src={earing} alt="Elegant Bracelets" />
            </div>
            <div className="glass-card">
              <div className="glass-icon">✦</div>
              <div className="glass-text">
                <strong>Premium Quality</strong>
                <span>Handmade with love</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ MARQUEE ════ */}
      <div className="marquee-container">
        <div className="marquee-track">
          {Array(8).fill("FREE SHIPPING OVER ₹999 • HANDCRAFTED • 100% SECURE").map((text, i) => (
            <span key={i} className="marquee-item">{text}</span>
          ))}
        </div>
      </div>

        {/* ════ LOOKBOOK (CATEGORIES) ════ */}
        <section className="home-section">
          <div className="section-header center">
            <span className="section-subtitle">The Collections</span>
            <h2>Shop by Category</h2>
          </div>
          <div className="lookbook-grid">
            {categories.filter(cat => /bracelet|earring/i.test(cat.name)).slice(0, 2).map((cat, i) => (
              <Link key={cat.id} to={`/products?category=${cat.slug}`} className="lookbook-item">
                <img src={i === 0 ? imgBracelet : imgEarring} alt={cat.name} className="lookbook-bg" />
                <div className="lookbook-overlay" />
                <div className="lookbook-content">
                  <h3>{cat.name}</h3>
                  <p>Explore Collection →</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      {/* ════ TRENDING PRODUCTS ════ */}
      <section className="home-section alt">
        <div className="section-inner">
          <div className="section-header">
            <div>
              <span className="section-subtitle">Curated Picks</span>
              <h2>Trending Now</h2>
            </div>
            <Link to="/products" className="section-link">View All Products</Link>
          </div>
          <div className="home-products-grid">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ════ PREMIUM TESTIMONIALS ════ */}
      <section className="home-section">
        <div className="section-header center">
          <span className="section-subtitle">Testimonials</span>
          <h2>Loved by Our Customers</h2>
        </div>
        <div className="testimonials-grid">
          {[
            { name: "Priya Sharma", role: "Verified Buyer", text: "The bracelet I ordered is absolutely stunning! The attention to detail is incredible, and it came beautifully packaged. Highly recommend!", rating: "★★★★★" },
            { name: "Ananya M.", role: "Repeat Customer", text: "I wear my earrings every single day. They are so lightweight and I always get compliments on them. Excellent customer service too.", rating: "★★★★★" },
            { name: "Sneha K.", role: "Verified Buyer", text: "Bought a custom piece for my sister's wedding. Sumathi was so helpful throughout the process. The final result took my breath away.", rating: "★★★★★" },
          ].map((r, i) => (
            <div key={i} className="testimonial-card">
              <div className="testi-stars">{r.rating}</div>
              <p className="testi-text">"{r.text}"</p>
              <div className="testi-author">
                <div className="testi-avatar">{r.name.charAt(0)}</div>
                <div className="testi-info">
                  <h4>{r.name}</h4>
                  <span>{r.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════ WHY CHOOSE US ════ */}
      <section className="home-section alt">
        <div className="section-inner">
          <div className="section-header center">
            <span className="section-subtitle">Our Promise</span>
            <h2>Why Choose Us</h2>
          </div>
          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon-wrap">✨</div>
              <h4>Artisan Crafted</h4>
              <p>Every single piece is intricately handcrafted by skilled artisans, ensuring your jewellery is as unique as you are.</p>
            </div>
            <div className="why-card">
              <div className="why-icon-wrap">💎</div>
              <h4>Premium Materials</h4>
              <p>We use strictly hypoallergenic, tarnish-resistant, and premium-grade materials that stand the test of time.</p>
            </div>
            <div className="why-card">
              <div className="why-icon-wrap">🎁</div>
              <h4>Perfect for Gifting</h4>
              <p>Delivered in elegant, premium packaging that makes unboxing a luxurious experience for you or your loved ones.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ════ PARALLAX CTA ════ */}
      <section className="cta-banner">
        <h2>Find Your Perfect Piece</h2>
        <p>Whether you're looking for an everyday staple or a statement piece for a special occasion, we have something beautiful waiting for you.</p>
        <Link to="/products" className="hero-btn-primary" style={{background:'#fff', color:'#1a1a2e'}}>
          Shop the Collection
        </Link>
      </section>
    </div>
  );
};

export default Home;