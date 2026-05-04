import { useEffect, useState } from "react";
import { Link, useNavigate }   from "react-router-dom";
import { getProducts, getCategories } from "../services/productService";
import { useCart }     from "../hooks/useCart";
import { useAuth }     from "../hooks/useAuth";
import { useWishlist } from "../hooks/useWishlist";
import "../styles/home.css";

const formatPrice = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const getPrimaryImage = (product) =>
  product.images?.find((i) => i.is_primary)?.url ??
  product.images?.[0]?.url ??
  "https://placehold.co/300x300?text=No+Image";

// ── Mini Product Card ─────────────────────────────────────────
const ProductCard = ({ product }) => {
  const { add }                  = useCart();
  const { user }                 = useAuth();
  const { toggle, isWishlisted } = useWishlist();
  const navigate                 = useNavigate();
  const [adding, setAdding]      = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    setAdding(true);
    try { await add(product.id, 1); }
    finally { setAdding(false); }
  };

  const handleWish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    toggle(product.id);
  };

  return (
    <div className="home-product-card"
      onClick={() => navigate(`/product/${product.slug}`, { state: { product } })}>
      <div className="home-product-img">
        <img src={getPrimaryImage(product)} alt={product.name} />
        {product.original_price && (
          <span className="home-badge">
            {Math.round((1 - product.price / product.original_price) * 100)}% OFF
          </span>
        )}
        <button className={`home-wish ${isWishlisted(product.id) ? "active" : ""}`}
          onClick={handleWish}>
          {isWishlisted(product.id) ? "♥" : "♡"}
        </button>
      </div>
      <div className="home-product-info">
        <p className="home-product-cat">{product.category?.name}</p>
        <h4>{product.name}</h4>
        <div className="home-product-price">
          <span>{formatPrice(product.price)}</span>
          {product.original_price && (
            <s>{formatPrice(product.original_price)}</s>
          )}
        </div>
        <div className="home-product-rating">
          ⭐ {product.rating_avg ?? "—"} ({product.rating_count ?? 0})
        </div>
      </div>
      <button className="home-add-btn" onClick={handleAdd} disabled={adding || product.stock === 0}>
        {product.stock === 0 ? "Out of Stock" : adding ? "Adding..." : "Add to Cart"}
      </button>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// HOME PAGE
// ════════════════════════════════════════════════════════════
const Home = () => {
  const [featured,   setFeatured]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [byCategory, setByCategory] = useState({});
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cats, feat] = await Promise.all([
          getCategories(),
          getProducts({ featured: true, limit: 8 }).then((r) => r.products ?? []),
        ]);
        setCategories(cats ?? []);
        setFeatured(feat);

        // Fetch 4 products per category for the category sections
        const byCat = {};
        await Promise.all(
          (cats ?? []).map(async (cat) => {
            const { products } = await getProducts({ categorySlug: cat.slug, limit: 4 });
            byCat[cat.slug] = products ?? [];
          })
        );
        setByCategory(byCat);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="home-page">

      {/* ── Hero ── */}
      <section className="home-hero">
        <div className="hero-content">
          <p className="hero-eyebrow">Handcrafted with love 💖</p>
          <h1>Sumathi's Crazy Collections</h1>
          <p className="hero-sub">
            Discover our exclusive range of handcrafted bracelets and earrings,
            made to make you shine every single day.
          </p>
          <div className="hero-btns">
            <Link to="/products" className="hero-btn">Shop Now →</Link>
            <Link to="/contact"    className="hero-btn-outline">Place Custom Order</Link>
          </div>
          <div className="hero-stats">
            <div><strong>500+</strong><span>Happy Customers</span></div>
            <div><strong>50+</strong><span>Unique Designs</span></div>
            <div><strong>100%</strong><span>Handcrafted</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-blob" />
          <div className="hero-float-card">✨ New Arrivals</div>
          <div className="hero-float-card two">🚚 Free shipping ₹999+</div>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section className="trust-bar">
        {[
          { icon: "🚚", text: "Free Shipping above ₹999" },
          { icon: "✋", text: "100% Handcrafted" },
          { icon: "↩️", text: "Easy Returns" },
          { icon: "🔒", text: "Secure Payments" },
        ].map((item) => (
          <div key={item.text} className="trust-item">
            <span>{item.icon}</span>
            <p>{item.text}</p>
          </div>
        ))}
      </section>

      {/* ── Categories ── */}
      <section className="home-section">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <Link to="/products">View all →</Link>
        </div>
        <div className="category-grid">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/products?category=${cat.slug}`} className="category-card">
              <div className="category-icon">
                {cat.slug === "bracelets" ? "📿" : cat.slug === "earrings" ? "💎" : "🛍"}
              </div>
              <h3>{cat.name}</h3>
              <p>{cat.description}</p>
              <span>Shop Now →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="home-section alt-bg">
        <div className="section-header">
          <h2>⭐ Featured Products</h2>
          <Link to="/products">View all →</Link>
        </div>
        {loading ? (
          <div className="home-products-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="product-skeleton" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <p style={{ textAlign: "center", color: "#aaa" }}>
            No featured products yet. Add some from the admin dashboard!
          </p>
        ) : (
          <div className="home-products-grid">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* ── Products by Category ── */}
      {categories.map((cat) => (
        byCategory[cat.slug]?.length > 0 && (
          <section key={cat.id} className="home-section">
            <div className="section-header">
              <h2>{cat.name}</h2>
              <Link to={`/products?category=${cat.slug}`}>View all →</Link>
            </div>
            <div className="home-products-grid">
              {byCategory[cat.slug].map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )
      ))}

      {/* ── Why Us ── */}
      <section className="home-section alt-bg">
        <div className="section-header"><h2>Why Choose Us? 💕</h2></div>
        <div className="why-grid">
          {[
            { icon: "💎", title: "Premium Quality",   text: "Every piece is handpicked and crafted with care." },
            { icon: "🎁", title: "Gift Ready",        text: "Beautiful packaging — perfect for gifting." },
            { icon: "⭐", title: "Loved by Customers", text: "500+ happy customers and growing!" },
            { icon: "📦", title: "Fast Delivery",     text: "Orders dispatched within 24–48 hours." },
          ].map((item) => (
            <div key={item.title} className="why-card">
              <span className="why-icon">{item.icon}</span>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-banner">
        <h2>Ready to find your perfect piece? 🌸</h2>
        <p>Browse our full collection of handcrafted jewellery made with love.</p>
        <Link to="/products" className="hero-btn">Shop the Collection →</Link>
      </section>

    </div>
  );
};

export default Home;