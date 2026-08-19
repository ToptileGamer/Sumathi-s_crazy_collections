import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { getProducts, getCategories } from "../services/productService";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useWishlist } from "../hooks/useWishlist";
import BraceletScene from "../components/BraceletScene";
import "../styles/home.css";
import images from "../assets/bracelets/bluewhite_panda.png";
import imgBracelet from "../assets/bracelets/mc4.png";
import imgEarring from "../assets/Earings/yb.png";
import aboutimg from "../assets/aboutimg.jpg";

const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const getPrimaryImage = (p) => p.images?.find((i) => i.is_primary)?.url ?? p.images?.[0]?.url ?? images;

/* ── Premium Animation Variants ── */
const fadeUpSpring = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.7 } } };
const scaleReveal = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } };
const slideLeft = { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };
const slideRight = { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };

/* ── Animated Section Wrapper ── */
function AnimatedSection({ children, className, variants = fadeUpSpring, once = true, margin = "-80px" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin });
  return (
    <motion.section ref={ref} className={className}
      initial="hidden" animate={isInView ? "visible" : "hidden"} variants={variants}>
      {children}
    </motion.section>
  );
}

/* ── Section Header ── */
function SectionHeader({ subtitle, title, center = true }) {
  return (
    <div className={`sh ${center ? "sh--center" : ""}`}>
      <motion.span className="sh__sub"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <span className="sh__accent-line" />{subtitle}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
        {title}
      </motion.h2>
    </div>
  );
}

/* ── Animated Counter ── */
function AnimatedCounter({ value, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = parseInt(value);
    const duration = 1500;
    const step = Math.max(1, Math.floor(end / 60));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, duration / 60);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return <strong ref={ref}>{count}{suffix}</strong>;
}

/* ── Product Card ── */
function ProductCard({ product }) {
  const { add } = useCart();
  const { user } = useAuth();
  const { toggle, isWishlisted } = useWishlist();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [wishHover, setWishHover] = useState(false);
  const img = getPrimaryImage(product);
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

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
    <motion.div className="pcard" variants={scaleReveal}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}>
      <div className="pcard__img"
        onClick={() => navigate(`/product/${product.slug}`, { state: { product } })}>
        <img src={img} alt={product.name} loading="lazy" />
        {discount > 0 && <span className="pcard__badge">-{discount}%</span>}
        <motion.button className={`pcard__wish ${isWishlisted(product.id) ? "active" : ""}`}
          onClick={handleWish} aria-label="Wishlist"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onHoverStart={() => setWishHover(true)}
          onHoverEnd={() => setWishHover(false)}>
          <svg width="18" height="18" viewBox="0 0 24 24"
            fill={isWishlisted(product.id) || wishHover ? "#D4AF37" : "none"}
            stroke={isWishlisted(product.id) || wishHover ? "#D4AF37" : "rgba(255,255,255,0.6)"}
            strokeWidth="1.8">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </motion.button>
        <div className="pcard__add-wrap">
          <motion.button className="pcard__add"
            onClick={handleAdd}
            disabled={adding || product.stock === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}>
            {product.stock === 0 ? "Out of Stock" : adding ? "Adding…" : "Add to Cart"}
          </motion.button>
        </div>
      </div>
      <div className="pcard__info"
        onClick={() => navigate(`/product/${product.slug}`, { state: { product } })}>
        <span className="pcard__cat">{product.category?.name || "Collection"}</span>
        <h4>{product.name}</h4>
        <div className="pcard__price">
          <span className="pcard__current">{fmt(product.price)}</span>
          {product.original_price && <span className="pcard__old">{fmt(product.original_price)}</span>}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   HOME PAGE — Premium Edition
═══════════════════════════════════════════ */
export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroBgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroContentY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  const testimonials = [
    { name: "Priya Sharma", role: "Verified Buyer",
      text: "The bracelet I ordered is absolutely stunning! The attention to detail is incredible, and it came beautifully packaged. Highly recommend!" },
    { name: "Ananya M.", role: "Repeat Customer",
      text: "I wear my earrings every single day. They are so lightweight and I always get compliments on them. Excellent customer service too." },
    { name: "Sneha K.", role: "Verified Buyer",
      text: "Bought a custom piece for my sister's wedding. Sumathi was so helpful throughout the process. The final result took my breath away." },
  ];

  const catItems = categories.filter((c) => /bracelet|earring/i.test(c.name)).slice(0, 2);

  return (
    <div className="home">

      {/* ═══════════════════════════════════════
           CINEMATIC HERO
      ═══════════════════════════════════════ */}
      <header className="hero" ref={heroRef}>
        <motion.div className="hero__bg" style={{ y: heroBgY }}>
          <div className="hero__gradient" />
          <div className="hero__glow-1" />
          <div className="hero__glow-2" />
        </motion.div>

        <motion.div className="hero__inner" style={{ y: heroContentY, opacity: heroOpacity }}>
          <motion.div className="hero__content"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <motion.div className="hero__eyebrow"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}>
              <span className="hero__dot" /> Exquisite Artistry
            </motion.div>

            <motion.h1 className="hero__title"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
              Jewellery that tells<br />
              <span className="hero__accent">your story.</span>
            </motion.h1>

            <motion.p className="hero__desc"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}>
              Discover our exclusive collection of handcrafted bracelets and earrings — each piece thoughtfully made to elevate your everyday elegance.
            </motion.p>

            <motion.div className="hero__btns"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}>
              <Link to="/products" className="btn btn--primary">
                Shop Collection
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link to="/about" className="btn btn--outline">Our Story</Link>
            </motion.div>

            <motion.div className="hero__stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}>
              <div className="hero__stat">
                <AnimatedCounter value={100} suffix="+" />
                <span>Happy Clients</span>
              </div>
              <div className="hero__stat-divider" />
              <div className="hero__stat">
                <AnimatedCounter value={100} suffix="%" />
                <span>Handcrafted</span>
              </div>
              <div className="hero__stat-divider" />
              <div className="hero__stat">
                <AnimatedCounter value={500} suffix="+" />
                <span>Pieces Sold</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div className="hero__visual"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}>
            <div className="hero__canvas">
              <BraceletScene />
            </div>
            <motion.div className="hero__badge hero__badge--1"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1, y: [0, -6, 0] }}
              transition={{ delay: 1.2, duration: 0.5, y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}>
              <div className="hero__badge-icon">✦</div>
              <div><strong>Premium Quality</strong><span>Handmade with love</span></div>
            </motion.div>
            <motion.div className="hero__badge hero__badge--2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1, y: [0, -5, 0] }}
              transition={{ delay: 1.5, duration: 0.5, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}>
              <div className="hero__badge-icon" style={{ background: "#8B5CF6" }}>♡</div>
              <div><strong>Loved by Many</strong><span>4.9 ★ average rating</span></div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div className="hero__scroll"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}>
          <span>Scroll to explore</span>
          <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </motion.svg>
        </motion.div>
      </header>

      {/* ═══════════════════════════════════════
           MARQUEE
      ═══════════════════════════════════════ */}
      <motion.div className="marquee"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}>
        <div className="marquee__track">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className="marquee__item">
              Handcrafted with Love ✦ Premium Materials ✦ Free Shipping over ₹999 ✦ 100% Secure
            </span>
          ))}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════
           SHOP BY CATEGORY
      ═══════════════════════════════════════ */}
      <AnimatedSection className="section">
        <SectionHeader subtitle="The Collections" title="Shop by Category" />
        <motion.div className="cats" variants={stagger}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
          {catItems.map((cat, i) => (
            <motion.div key={cat.id} variants={i === 0 ? slideLeft : slideRight}>
              <Link to={`/products?category=${cat.slug}`} className="cat__card">
                <img src={i === 0 ? imgBracelet : imgEarring} alt={cat.name} className="cat__img" />
                <div className="cat__overlay" />
                <div className="cat__overlay-shine" />
                <div className="cat__content">
                  <h3>{cat.name}</h3>
                  <span className="cat__link">Explore Collection →</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </AnimatedSection>

      {/* ═══════════════════════════════════════
           TRENDING NOW
      ═══════════════════════════════════════ */}
      <AnimatedSection className="section section--alt">
        <div className="section__inner">
          <div className="section__header-row">
            <div>
              <span className="sh__sub">Curated Picks</span>
              <h2 className="sh__title">Trending Now</h2>
            </div>
            <Link to="/products" className="section__link">
              View All
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
            </Link>
          </div>
          <motion.div className="pcard__grid" variants={stagger}
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skel">
                    <div className="skel__img" />
                    <div className="skel__info">
                      <div className="skel__line w-40" />
                      <div className="skel__line w-70" />
                      <div className="skel__line w-30" />
                    </div>
                  </div>
                ))
              : featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══════════════════════════════════════
           BRAND STORY
      ═══════════════════════════════════════ */}
      <AnimatedSection className="section story">
        <div className="story__grid">
          <motion.div className="story__visual"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <div className="story__img">
              <img src={aboutimg} alt="Handcrafted jewelry" />
            </div>
            <motion.div className="story__quote"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}>
              <span className="story__qmark">"</span>
              <p>Our mission is to create timeless pieces that celebrate the individuality of every wearer.</p>
            </motion.div>
          </motion.div>
          <motion.div className="story__content"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <span className="sh__sub">Our Heritage</span>
            <h2 className="sh__title">Exclusive Handcrafted Collections</h2>
            <p className="story__text">Every single piece at Sumathi's Crazy Collections is intricately handcrafted by skilled artisans, ensuring your jewelry is as unique as you are. We believe that jewelry should be more than just an accessory—it's a statement of character and a vessel for memories.</p>
            <p className="story__text">We use strictly hypoallergenic, tarnish-resistant, and premium-grade materials that stand the test of time. From carefully selected beads to ethically sourced metals, quality is woven into every thread and link.</p>
            <Link to="/about" className="story__cta">
              Discover our process
              <span className="story__line" />
            </Link>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══════════════════════════════════════
           TESTIMONIALS
      ═══════════════════════════════════════ */}
      <AnimatedSection className="testi">
        <div className="testi__inner">
          <SectionHeader subtitle="Testimonials" title="Loved by Our Customers" />
          <motion.div className="testi__grid" variants={stagger}
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
            {testimonials.map((r, i) => (
              <motion.div key={i} className="testi__card" variants={fadeUpSpring}
                whileHover={{ y: -6, borderColor: "rgba(212,175,55,0.3)" }}>
                <div className="testi__stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill="#D4AF37" stroke="#D4AF37" strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="testi__text">"{r.text}"</p>
                <div className="testi__author">
                  <div className="testi__avatar">{r.name.charAt(0)}</div>
                  <div><h4>{r.name}</h4><span>{r.role}</span></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══════════════════════════════════════
           WHY CHOOSE US
      ═══════════════════════════════════════ */}
      <AnimatedSection className="section">
        <SectionHeader subtitle="Our Promise" title="Why Choose Us" />
        <motion.div className="why" variants={stagger}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
          {[
            { icon: "✨", title: "Artisan Crafted", desc: "Each piece is meticulously handmade with care, ensuring unparalleled uniqueness." },
            { icon: "💎", title: "Premium Materials", desc: "We source only high-quality, hypoallergenic materials for longevity and comfort." },
            { icon: "🎁", title: "Perfect for Gifting", desc: "Arrives in premium signature packaging, ready to delight your loved ones." },
          ].map((item, i) => (
            <motion.div key={i} className="why__card" variants={fadeUpSpring}>
              <div className="why__icon">{item.icon}</div>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </AnimatedSection>

      {/* ═══════════════════════════════════════
           CTA BANNER
      ═══════════════════════════════════════ */}
      <AnimatedSection className="cta" variants={fadeIn}>
        <div className="cta__glow" />
        <div className="cta__content">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            Find Your Perfect Piece
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}>
            Whether you're looking for an everyday staple or a statement piece for a special occasion, we have something beautiful waiting for you.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}>
            <Link to="/products" className="cta__btn">Shop the Collection</Link>
          </motion.div>
        </div>
      </AnimatedSection>

    </div>
  );
}
