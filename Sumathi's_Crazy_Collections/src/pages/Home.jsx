import { useEffect, useState } from "react";
import { Link, useNavigate }   from "react-router-dom";
import { getProducts, getCategories } from "../services/productService";
import { useCart }     from "../hooks/useCart";
import { useAuth }     from "../hooks/useAuth";
import { useWishlist } from "../hooks/useWishlist";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const getPrimaryImage = (p) =>
  p.images?.find((i) => i.is_primary)?.url ?? p.images?.[0]?.url ?? null;

/* ── Product Card ──────────────────────────────────────────── */
const ProductCard = ({ product }) => {
  const { add }                  = useCart();
  const { user }                 = useAuth();
  const { toggle, isWishlisted } = useWishlist();
  const navigate                 = useNavigate();
  const [adding, setAdding]      = useState(false);
  const img                      = getPrimaryImage(product);

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    setAdding(true);
    try { await add(product.id, 1); } finally { setAdding(false); }
  };
  const handleWish = (e) => {
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    toggle(product.id);
  };

  return (
    <div className="pc" onClick={() => navigate(`/product/${product.slug}`, { state: { product } })}>
      <div className="pc__img-wrap">
        {img
          ? <img src={img} alt={product.name} className="pc__img" />
          : <div className="pc__no-img">📷</div>}
        {product.original_price && (
          <span className="pc__discount">
            -{Math.round((1 - product.price / product.original_price) * 100)}%
          </span>
        )}
        <button className={`pc__wish ${isWishlisted(product.id) ? "active" : ""}`} onClick={handleWish}>
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={isWishlisted(product.id) ? "#e91e8c" : "none"}
            stroke={isWishlisted(product.id) ? "#e91e8c" : "#fff"}
            strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
      <div className="pc__body">
        <p className="pc__cat">{product.category?.name}</p>
        <h4 className="pc__name">{product.name}</h4>
        <div className="pc__price-row">
          <span className="pc__price">{fmt(product.price)}</span>
          {product.original_price && <s className="pc__orig">{fmt(product.original_price)}</s>}
        </div>
        {product.rating_count > 0 && (
          <p className="pc__rating">★ {product.rating_avg} <span>({product.rating_count})</span></p>
        )}
      </div>
      <button className="pc__btn" onClick={handleAdd} disabled={adding || product.stock === 0}>
        {product.stock === 0 ? "Out of Stock" : adding ? "Adding…" : "Add to Cart"}
      </button>
    </div>
  );
};

/* ── HOME PAGE ─────────────────────────────────────────────── */
const Home = () => {
  const [featured,   setFeatured]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [byCat,      setByCat]      = useState({});
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
        const map = {};
        await Promise.all((cats ?? []).map(async (cat) => {
          const { products } = await getProducts({ categorySlug: cat.slug, limit: 4 });
          map[cat.slug] = products ?? [];
        }));
        setByCat(map);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const SkeletonCard = () => (
    <div className="pc" style={{ cursor: "default" }}>
      <div className="skeleton-img" />
      <div className="pc__body">
        <div className="skeleton-line" style={{ width: "50%", height: 10 }} />
        <div className="skeleton-line" style={{ width: "80%", height: 14, margin: "6px 0" }} />
        <div className="skeleton-line" style={{ width: "40%", height: 12 }} />
      </div>
    </div>
  );

  return (
    <>
      <div className="home">

        {/* ════ HERO ════ */}
        <section className="hero">
          <div className="hero__inner">
            <div className="hero__content">
              <div className="hero__pill">✦ Handcrafted with Love</div>
              <h1 className="hero__h1">
                Jewellery that tells<br />
                <em>your story</em>
              </h1>
              <p className="hero__sub">
                Discover our exclusive collection of handcrafted bracelets and earrings —
                each piece made to make you feel special, every single day.
              </p>
              <div className="hero__actions">
                <Link to="/products" className="btn btn--primary">Shop the Collection</Link>
                <Link to="/contact"    className="btn btn--primary">Make custom order →</Link>
              </div>
              <div className="hero__trust">
                <span>⭐ 4.8 Rating</span>
                <span>·</span>
                <span>500+ Happy Customers</span>
                <span>·</span>
                <span>Free Shipping ₹999+</span>
              </div>
            </div>
            <div className="hero__visual">
              <div className="hero__ring hero__ring--1" />
              <div className="hero__ring hero__ring--2" />
              <div className="hero__center">
                <span>✦</span>
                <p>Handcrafted</p>
                <p>Jewellery</p>
              </div>
              <div className="hero__float hero__float--tl">📿 Bracelets</div>
              <div className="hero__float hero__float--br">💎 Earrings</div>
              <div className="hero__float hero__float--tr">🎁 Gift Ready</div>
            </div>
          </div>
        </section>

        {/* ════ MARQUEE ════ */}
        <div className="marquee-wrap">
          <div className="marquee-track">
            {["Free Shipping ₹999+", "Handcrafted with Love", "100% Authentic", "Easy Returns", "Secure Payments", "New Arrivals Weekly",
              "Free Shipping ₹999+", "Handcrafted with Love", "100% Authentic", "Easy Returns", "Secure Payments", "New Arrivals Weekly"].map((t, i) => (
              <span key={i} className="marquee-item">✦ {t}</span>
            ))}
          </div>
        </div>

        {/* ════ CATEGORIES ════
        <section className="section">
          <div className="section__head">
            <div>
              <p className="section__eyebrow">Collections</p>
              <h2 className="section__title">Shop by Category</h2>
            </div>
            <Link to="/products" className="section__link">View all →</Link>
          </div>
          <div className="cat-grid">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/products?category=${cat.slug}`} className="cat-card">
                <div className="cat-card__icon">
                  {cat.slug === "bracelets" ? "📿" : cat.slug === "earrings" ? "💎" : "🛍"}
                </div>
                <div className="cat-card__body">
                  <h3>{cat.name}</h3>
                  <p>{cat.description}</p>
                </div>
                <span className="cat-card__arrow">→</span>
              </Link>
            ))}
          </div>
        </section> */}

        {/* ════ FEATURED ════ */}
        <section className="section section--alt">
          <div className="section__head">
            <div>
              <p className="section__eyebrow">Curated Picks</p>
              <h2 className="section__title">Featured Products</h2>
            </div>
            <Link to="/products" className="section__link">View all →</Link>
          </div>
          <div className="products-grid">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : featured.length === 0
              ? <p className="empty-msg">No featured products yet.</p>
              : featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* ════ BY CATEGORY ════ */}
        {categories.map(cat => (
          byCat[cat.slug]?.length > 0 && (
            <section key={cat.id} className={`section ${cat.slug === "earrings" ? "section--alt" : ""}`}>
              <div className="section__head">
                <div>
                  <p className="section__eyebrow">Collection</p>
                  <h2 className="section__title">{cat.name}</h2>
                </div>
                <Link to="/products" className="section__link">View all →</Link>
              </div>
              <div className="products-grid">
                {byCat[cat.slug].map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>
          )
        ))}

        {/* ════ WHY US ════ */}
        <section className="section">
          <div className="section__head">
            <div>
              <p className="section__eyebrow">Why Choose Us</p>
              <h2 className="section__title">Made with care, delivered with love</h2>
            </div>
          </div>
          <div className="why-grid">
            {[
              { icon: "💎", title: "Premium Quality",   desc: "Every piece handpicked and crafted with the finest materials." },
              { icon: "🎁", title: "Gift Ready",        desc: "Beautiful packaging — perfect for any occasion or loved one." },
              { icon: "🚚", title: "Fast Delivery",     desc: "Orders dispatched within 24–48 hrs. Free shipping above ₹999." },
              { icon: "↩️", title: "Easy Returns",      desc: "Not satisfied? We offer hassle-free returns within 7 days." },
            ].map(item => (
              <div key={item.title} className="why-card">
                <div className="why-card__icon">{item.icon}</div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════ CTA ════ */}
        <section className="cta">
          <div className="cta__inner">
            <p className="cta__eyebrow">Ready to shine?</p>
            <h2 className="cta__title">Find your perfect piece today</h2>
            <p className="cta__sub">Handcrafted bracelets & earrings — made for you.</p>
            <Link to="/products" className="btn btn--white">Shop Now →</Link>
          </div>
        </section>
      </div>

      <style>{`
        /* ════════════════════════════════════
           HOME PAGE
        ════════════════════════════════════ */
        .home { overflow-x: hidden; }

        /* ── Buttons ── */
        .btn {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 0.75rem 1.75rem;
          border-radius: 10px;
          font-size: 0.925rem;
          font-weight: 600;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.22s;
          white-space: nowrap;
        }
        .btn--primary {
          background: #e91e8c;
          color: #fff;
        }
        .btn--primary:hover { background: #c2185b; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(233,30,140,0.28); }
        .btn--ghost {
          background: none;
          color: #1a1a2e;
          border: 1.5px solid rgba(0,0,0,0.12);
        }
        .btn--ghost:hover { border-color: #1a1a2e; background: #f5f5f7; }
        .btn--white {
          background: #fff;
          color: #e91e8c;
          font-weight: 700;
        }
        .btn--white:hover { background: #fff0f8; transform: translateY(-2px); }

        /* ── Hero ── */
        .hero {
          background: linear-gradient(135deg, #fff8fb 0%, #fdf2ff 50%, #f0f4ff 100%);
          padding: 5rem 2rem 4rem;
        }
        .hero__inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        .hero__pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #fff0f8;
          color: #e91e8c;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          padding: 0.35rem 0.9rem;
          border-radius: 20px;
          margin-bottom: 1.25rem;
          border: 1px solid rgba(233,30,140,0.15);
        }
        .hero__h1 {
          font-size: clamp(2.2rem, 4.5vw, 3.2rem);
          font-weight: 800;
          color: #1a1a2e;
          line-height: 1.12;
          letter-spacing: -0.02em;
          margin: 0 0 1.25rem;
        }
        .hero__h1 em {
          font-style: normal;
          background: linear-gradient(135deg, #e91e8c, #9c27b0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero__sub {
          font-size: 1.05rem;
          color: #666;
          line-height: 1.7;
          margin: 0 0 2rem;
          max-width: 480px;
        }
        .hero__actions { display: flex; gap: 0.9rem; flex-wrap: wrap; margin-bottom: 2rem; }
        .hero__trust {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.8rem;
          color: #888;
          flex-wrap: wrap;
        }
        .hero__trust span:not(:contains("·")) { font-weight: 500; color: #555; }

        /* Hero visual */
        .hero__visual {
          position: relative;
          height: 420px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero__ring {
          position: absolute;
          border-radius: 50%;
          border: 2px solid rgba(233,30,140,0.12);
        }
        .hero__ring--1 { width: 340px; height: 340px; animation: rotate 18s linear infinite; }
        .hero__ring--2 { width: 240px; height: 240px; border-style: dashed; border-color: rgba(156,39,176,0.12); animation: rotate 12s linear infinite reverse; }
        @keyframes rotate { to { transform: rotate(360deg); } }

        .hero__center {
          position: relative;
          width: 160px; height: 160px;
          background: linear-gradient(135deg, #e91e8c, #9c27b0);
          border-radius: 50%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          color: #fff; text-align: center;
          box-shadow: 0 20px 60px rgba(233,30,140,0.3);
        }
        .hero__center span { font-size: 2rem; }
        .hero__center p { margin: 0; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.9; }

        .hero__float {
          position: absolute;
          background: #fff;
          border-radius: 12px;
          padding: 0.55rem 1rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: #1a1a2e;
          box-shadow: 0 8px 28px rgba(0,0,0,0.1);
          white-space: nowrap;
        }
        .hero__float--tl { top: 8%;  left: 0;   animation: float1 4s ease-in-out infinite; }
        .hero__float--br { bottom: 8%; right: 0; animation: float1 4s ease-in-out infinite 1s; }
        .hero__float--tr { top: 30%; right: -5%; animation: float1 4s ease-in-out infinite 2s; }
        @keyframes float1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }

        /* ── Marquee ── */
        .marquee-wrap {
          background: #1a1a2e;
          overflow: hidden;
          padding: 0.85rem 0;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .marquee-track {
          display: flex;
          gap: 0;
          animation: marquee 28s linear infinite;
          width: max-content;
        }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .marquee-item {
          padding: 0 2.5rem;
          font-size: 0.78rem;
          font-weight: 500;
          color: rgba(255,255,255,0.65);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        /* ── Sections ── */
        .section { max-width: 1200px; margin: 0 auto; padding: 4rem 2rem; }
        .section--alt { max-width: 100%; background: #fafafa; }
        .section--alt > * { max-width: 1200px; margin: 0 auto; }
        .section--alt.section { padding: 4rem 2rem; }

        .section__head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 2rem;
        }
        .section__eyebrow {
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #e91e8c;
          margin: 0 0 0.35rem;
        }
        .section__title {
          font-size: 1.65rem;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .section__link {
          font-size: 0.875rem;
          font-weight: 600;
          color: #e91e8c;
          text-decoration: none;
          white-space: nowrap;
          padding-bottom: 0.2rem;
          border-bottom: 1.5px solid transparent;
          transition: border-color 0.2s;
        }
        .section__link:hover { border-color: #e91e8c; }

        /* ── Category Cards ── */
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.25rem;
        }
        .cat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: #fff;
          border: 1.5px solid rgba(0,0,0,0.07);
          border-radius: 16px;
          text-decoration: none;
          transition: all 0.22s;
          cursor: pointer;
        }
        .cat-card:hover { border-color: #e91e8c; transform: translateY(-3px); box-shadow: 0 12px 32px rgba(233,30,140,0.1); }
        .cat-card__icon { font-size: 2rem; flex-shrink: 0; }
        .cat-card__body { flex: 1; }
        .cat-card__body h3 { margin: 0 0 0.2rem; font-size: 1rem; font-weight: 700; color: #1a1a2e; }
        .cat-card__body p  { margin: 0; font-size: 0.8rem; color: #888; line-height: 1.4; }
        .cat-card__arrow { font-size: 1.1rem; color: #ccc; transition: all 0.2s; }
        .cat-card:hover .cat-card__arrow { color: #e91e8c; transform: translateX(4px); }

        /* ── Products Grid ── */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1.5rem;
        }

        /* ── Product Card ── */
        .pc {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          border: 1.5px solid rgba(0,0,0,0.07);
          cursor: pointer;
          transition: transform 0.22s, box-shadow 0.22s, border-color 0.22s;
          display: flex;
          flex-direction: column;
        }
        .pc:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(0,0,0,0.1); border-color: rgba(233,30,140,0.2); }

        .pc__img-wrap { position: relative; overflow: hidden; }
        .pc__img { width: 100%; height: 210px; object-fit: cover; display: block; transition: transform 0.35s; }
        .pc:hover .pc__img { transform: scale(1.04); }
        .pc__no-img {
          width: 100%; height: 210px;
          background: #f8f0ff;
          display: flex; align-items: center; justify-content: center;
          font-size: 2.5rem;
        }
        .pc__discount {
          position: absolute; top: 10px; left: 10px;
          background: #e91e8c; color: #fff;
          font-size: 0.7rem; font-weight: 700;
          padding: 0.2rem 0.55rem; border-radius: 20px;
        }
        .pc__wish {
          position: absolute; top: 8px; right: 8px;
          width: 34px; height: 34px;
          background: rgba(0,0,0,0.35);
          border: none; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.2s;
          backdrop-filter: blur(4px);
        }
        .pc__wish:hover, .pc__wish.active { background: rgba(255,255,255,0.95); }

        .pc__body { padding: 1rem 1rem 0.5rem; flex: 1; }
        .pc__cat  { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #e91e8c; margin: 0 0 0.25rem; }
        .pc__name { font-size: 0.925rem; font-weight: 600; color: #1a1a2e; margin: 0 0 0.5rem; line-height: 1.35; }
        .pc__price-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
        .pc__price { font-size: 1rem; font-weight: 700; color: #e91e8c; }
        .pc__orig  { font-size: 0.8rem; color: #bbb; }
        .pc__rating { font-size: 0.75rem; color: #f59e0b; margin: 0; }
        .pc__rating span { color: #aaa; }

        .pc__btn {
          margin: 0.5rem 0.9rem 0.9rem;
          padding: 0.6rem;
          background: #1a1a2e;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .pc__btn:hover:not(:disabled) { background: #e91e8c; }
        .pc__btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── Why Us ── */
        .why-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1.25rem;
        }
        .why-card {
          padding: 1.75rem 1.5rem;
          background: #fff;
          border: 1.5px solid rgba(0,0,0,0.07);
          border-radius: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .why-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.08); }
        .why-card__icon { font-size: 1.75rem; margin-bottom: 0.9rem; display: block; }
        .why-card h4 { margin: 0 0 0.4rem; font-size: 0.975rem; font-weight: 700; color: #1a1a2e; }
        .why-card p  { margin: 0; font-size: 0.825rem; color: #888; line-height: 1.55; }

        /* ── CTA ── */
        .cta {
          background: linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 100%);
          padding: 5rem 2rem;
          text-align: center;
        }
        .cta__inner { max-width: 560px; margin: 0 auto; }
        .cta__eyebrow {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #e91e8c;
          margin: 0 0 0.75rem;
        }
        .cta__title {
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          font-weight: 800;
          color: #fff;
          margin: 0 0 0.75rem;
          letter-spacing: -0.01em;
        }
        .cta__sub { font-size: 1rem; color: rgba(255,255,255,0.6); margin: 0 0 2rem; }

        /* ── Skeleton ── */
        .skeleton-img { height: 210px; background: linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size:200% 100%; animation: shimmer 1.4s infinite; }
        .skeleton-line { border-radius:4px; background: linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; margin-bottom:6px; }
        @keyframes shimmer { to{background-position:-200% 0} }
        .empty-msg { color: #aaa; text-align: center; padding: 2rem; grid-column: 1/-1; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .hero__inner { grid-template-columns: 1fr; gap: 2rem; }
          .hero__visual { display: none; }
          .hero { padding: 3rem 1.5rem; }
        }
        @media (max-width: 600px) {
          .section { padding: 2.5rem 1rem; }
          .section--alt.section { padding: 2.5rem 1rem; }
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
          .why-grid { grid-template-columns: repeat(2, 1fr); }
          .section__title { font-size: 1.3rem; }
          .hero__h1 { font-size: 1.85rem; }
          .cat-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
};

export default Home;