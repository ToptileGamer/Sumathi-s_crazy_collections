import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart }     from "../hooks/useCart";
import { useAuth }     from "../hooks/useAuth";
import { useWishlist } from "../hooks/useWishlist";
import { getProductBySlug, getProducts } from "../services/productService";
import { getReviews, addReview, hasUserPurchased } from "../services/reviewService";
import "../styles/productDetails.css";
import defaultImg from "../assets/bracelets/bluewhite_panda.png";

const formatPrice = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const Stars = ({ rating, onChange, size = "1.4rem" }) =>
  [1,2,3,4,5].map((s) => (
    <span key={s}
      onClick={() => onChange?.(s)}
      className={s <= rating ? "" : "empty"}
      style={{ cursor: onChange ? "pointer" : "default", fontSize: size }}>★</span>
  ));

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };

const ProductDetails = () => {
  const { slug }               = useParams();
  const navigate               = useNavigate();
  const { add }                = useCart();
  const { user }               = useAuth();
  const { toggle, isWishlisted } = useWishlist();

  const [product,     setProduct]     = useState(null);
  const [related,     setRelated]     = useState([]);
  const [reviews,     setReviews]     = useState([]);
  const [activeImg,   setActiveImg]   = useState(0);
  const [quantity,    setQuantity]    = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [adding,      setAdding]      = useState(false);
  const [canReview,   setCanReview]   = useState(false);

  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", body: "" });
  const [submitting, setSubmitting] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  // ── Fetch product ─────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    getProductBySlug(slug)
      .then((data) => {
        setProduct(data);
        setReviews(data?.reviews ?? []);
        setActiveImg(0);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  // ── Related products ──────────────────────────────────────
  useEffect(() => {
    if (!product) return;
    getProducts({ categorySlug: product.category?.slug, limit: 5 })
      .then(({ products }) =>
        setRelated((products ?? []).filter((p) => p.id !== product.id).slice(0, 4))
      ).catch(console.error);
  }, [product]);

  // ── Check if user can review ──────────────────────────────
  useEffect(() => {
    if (!user || !product) return;
    hasUserPurchased(user.id, product.id)
      .then(setCanReview)
      .catch(() => setCanReview(false));
  }, [user, product]);

  const handleAddToCart = async () => {
    if (!user) { alert("Please log in to add items to your cart."); return; }
    setAdding(true);
    try { await add(product.id, quantity); }
    finally { setAdding(false); }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user || !product) return;
    setSubmitting(true);
    try {
      const r = await addReview({
        product_id: product.id,
        user_id:    user.id,
        rating:     reviewForm.rating,
        title:      reviewForm.title,
        body:       reviewForm.body,
      });
      setReviews((prev) => [r, ...prev]);
      setReviewDone(true);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="product-details-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div className="spinner" />
      <p style={{ color: "#888", fontFamily: "DM Sans" }}>Loading...</p>
    </div>
  );
  
  if (!product) return (
    <div className="product-details-container" style={{ textAlign: "center", padding: "6rem 2rem" }}>
      <h2 style={{ fontFamily: "Playfair Display", color: "#1a1a1a", marginBottom: "1rem" }}>Product Not Found</h2>
      <button onClick={() => navigate(-1)} className="secondary-btn">Go Back</button>
    </div>
  );

  const images = product.images ?? [];
  const primaryImg = images.find((i) => i.is_primary)?.url ?? images[0]?.url ?? defaultImg;

  return (
    <div className="product-details-container">
      <motion.div className="product-details-wrapper" variants={fadeUp} initial="hidden" animate="visible">
        {/* ── Images ── */}
        <div className="product-details-image">
          <motion.img
            key={activeImg}
            src={images[activeImg]?.url ?? primaryImg}
            alt={product.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          />
          {images.length > 1 && (
            <div className="product-details-thumbs">
              {images.map((img, i) => (
                <img key={i} src={img.url} alt={i}
                  className={activeImg === i ? "active" : ""}
                  onClick={() => setActiveImg(i)} />
              ))}
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div className="product-details-info">
          <p className="product-category-label">{product.category?.name || "Collection"}</p>
          <h1>{product.name}</h1>

          <div className="product-details-price">
            <span className="current">{formatPrice(product.price)}</span>
            {product.original_price && (
              <>
                <span className="original">{formatPrice(product.original_price)}</span>
                <span className="discount-badge">
                  {Math.round((1 - product.price / product.original_price) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          <div className="product-details-rating">
            <div className="stars">
              {[1,2,3,4,5].map((s) => (
                <span key={s} className={s <= Math.round(product.rating_avg ?? 0) ? "" : "empty"}>
                  ★
                </span>
              ))}
            </div>
            <span className="rating-text">
              {product.rating_avg ?? "—"} ({product.rating_count ?? 0} reviews)
            </span>
          </div>

          <p className="product-details-desc">{product.description}</p>

          {product.tags?.length > 0 && (
            <div className="product-details-tags">
              {product.tags.map((t) => <span key={t}>#{t}</span>)}
            </div>
          )}

          <p className={`product-details-stock ${product.stock > 0 ? "in-stock" : "out-stock"}`}>
            {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : "✗ Out of Stock"}
          </p>

          {/* Quantity */}
          <div className="product-details-qty">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}>−</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock}>+</button>
          </div>

          <div className="product-details-actions">
            <button className="add-to-cart-btn" onClick={handleAddToCart}
              disabled={adding || product.stock === 0}>
              {adding ? "Adding..." : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            <Link
              to="/checkout"
              onClick={async (e) => {
                if (!user) { e.preventDefault(); alert("Please log in first."); return; }
                await add(product.id, quantity);
              }}
              className="buy-now-btn">
              Buy Now
            </Link>
            <button
              className={`wishlist-btn ${isWishlisted(product.id) ? "active" : ""}`}
              onClick={() => user ? toggle(product.id) : alert("Please log in to save items.")}>
              {isWishlisted(product.id) ? "♥ Saved" : "♡ Wishlist"}
            </button>
          </div>

          <button className="product-details-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════
           REVIEWS
      ═══════════════════════════════════════ */}
      <section className="reviews-section">
        <motion.span className="sh__sub" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <span className="sh__accent-line" />Feedback
        </motion.span>
        <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          Customer Reviews
        </motion.h2>

        {/* Write review */}
        {user && canReview && !reviewDone && (
          <motion.form className="review-form" onSubmit={handleSubmitReview}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h4>Write a Review</h4>
            <div className="stars">
              <Stars rating={reviewForm.rating} onChange={(r) => setReviewForm((f) => ({ ...f, rating: r }))} size="1.5rem" />
            </div>
            <input placeholder="Review title" value={reviewForm.title}
              onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))} />
            <textarea rows={3} placeholder="Share your experience..."
              value={reviewForm.body}
              onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))} />
            <button type="submit" className="hero-btn" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </motion.form>
        )}
        {reviewDone && <p style={{ color: "#10b981", fontFamily: "DM Sans" }}>✓ Thanks for your review!</p>}
        {!user && <p style={{ color: "#888", fontFamily: "DM Sans" }}>
          <Link to="/signup" style={{ color: "#B8953A", fontWeight: 600 }}>Sign up / Log in</Link> to write a review.
        </p>}

        {/* Review list */}
        {reviews.length === 0
          ? <p style={{ color: "#888", fontFamily: "DM Sans" }}>No reviews yet. Be the first!</p>
          : reviews.map((r) => (
            <motion.div key={r.id} className="review-card"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <div className="review-header">
                <div className="reviewer-avatar">
                  {r.user?.avatar_url
                    ? <img src={r.user.avatar_url} alt="avatar" />
                    : <span>{(r.user?.full_name?.[0] ?? "?").toUpperCase()}</span>}
                </div>
                <div>
                  <span className="reviewer-name">{r.user?.full_name ?? "Customer"}</span>
                  {r.is_verified && <span className="verified-badge">✓ Verified Purchase</span>}
                  <div className="reviewer-stars">
                    <Stars rating={r.rating} size="0.85rem" />
                  </div>
                </div>
                <span className="review-date">{new Date(r.created_at).toLocaleDateString("en-IN")}</span>
              </div>
              {r.title && <h4 className="review-title">{r.title}</h4>}
              {r.body  && <p className="review-body">{r.body}</p>}
            </motion.div>
          ))
        }
      </section>

      {/* ═══════════════════════════════════════
           RELATED PRODUCTS
      ═══════════════════════════════════════ */}
      {related.length > 0 && (
        <section className="recommendations">
          <motion.span className="sh__sub" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span className="sh__accent-line" />You May Also Like
          </motion.span>
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            Complete the Look
          </motion.h2>
          <div className="recommendation-grid">
            {related.map((item) => {
              const img = item.images?.find((i) => i.is_primary)?.url ?? item.images?.[0]?.url ?? defaultImg;
              return (
                <motion.div key={item.id} className="product-card"
                  onClick={() => navigate(`/product/${item.slug}`, { state: { product: item } })}
                  variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <div className="product-img-wrap">
                    <img src={img} alt={item.name} />
                  </div>
                  <p className="product-category-label">{item.category?.name || "Collection"}</p>
                  <h3>{item.name}</h3>
                  <p className="price">{formatPrice(item.price)}</p>
                  <button className="add-to-cart-btn"
                    onClick={(e) => { e.stopPropagation(); if (!user) { alert("Please log in."); return; } add(item.id, 1); }}>
                    Add to Cart
                  </button>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
