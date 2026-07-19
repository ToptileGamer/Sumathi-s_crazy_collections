import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart }     from "../hooks/useCart";
import { useAuth }     from "../hooks/useAuth";
import { useWishlist } from "../hooks/useWishlist";
import { getProductBySlug, getProducts } from "../services/productService";
import { getReviews, addReview, hasUserPurchased } from "../services/reviewService";
import ScrollReveal from "../components/ScrollReveal";
import "../styles/productDetails.css";
import "../styles/cart.css";
import defaultImg from "../assets/bracelets/bluewhite_panda.png";

const formatPrice = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const Stars = ({ rating, onChange }) =>
  [1,2,3,4,5].map((s) => (
    <span key={s}
      onClick={() => onChange?.(s)}
      style={{ cursor: onChange ? "pointer" : "default", fontSize: "1.4rem",
               color: s <= rating ? "#f59e0b" : "#ddd" }}>★</span>
  ));

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
    getProducts({ categorySlug: product.category?.slug, limit: 4 })
      .then(({ products }) =>
        setRelated((products ?? []).filter((p) => p.id !== product.id).slice(0, 4))
      ).catch(console.error);
  }, [product]);

  // ── Check if user can review (must have purchased) ────────
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

  if (loading) return <div className="product-details-container"><p>Loading...</p></div>;
  if (!product) return (
    <div className="product-details-container" style={{ textAlign: "center" }}>
      <h2>Product Not Found</h2>
      <button onClick={() => navigate(-1)} className="back-btn">Go Back</button>
    </div>
  );

  const images = product.images ?? [];
  const primaryImg = images.find((i) => i.is_primary)?.url ?? images[0]?.url ?? defaultImg;

  return (
    <div className="product-details-container">
      <ScrollReveal as="div" className="product-details-wrapper">

        {/* ── Images ── */}
        <div className="product-details-image">
          <img src={images[activeImg]?.url ?? primaryImg} alt={product.name} />
          {images.length > 1 && (
            <div className="img-thumbnails">
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
          <p className="product-category-label">{product.category?.name}</p>
          <h1>{product.name}</h1>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", margin: "0.5rem 0" }}>
            <span className="price">{formatPrice(product.price)}</span>
            {product.original_price && (
              <span style={{ textDecoration: "line-through", color: "#aaa" }}>
                {formatPrice(product.original_price)}
              </span>
            )}
            {product.original_price && (
              <span style={{ background: "#fef2f2", color: "#ef4444", padding: "0.2rem 0.5rem", borderRadius: "6px", fontSize: "0.8rem" }}>
                {Math.round((1 - product.price / product.original_price) * 100)}% OFF
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <Stars rating={Math.round(product.rating_avg ?? 0)} />
            <span style={{ color: "#888", fontSize: "0.9rem" }}>
              {product.rating_avg ?? "—"} ({product.rating_count ?? 0} reviews)
            </span>
          </div>

          <p className="description">{product.description}</p>

          {product.tags?.length > 0 && (
            <div className="product-tags">
              {product.tags.map((t) => <span key={t} className="tag">#{t}</span>)}
            </div>
          )}

          <p style={{ fontSize: "0.85rem", color: product.stock > 0 ? "#10b981" : "#ef4444", margin: "0.75rem 0" }}>
            {product.stock > 0 ? `✓ In Stock (${product.stock} left)` : "✗ Out of Stock"}
          </p>

          {/* Quantity */}
          <div className="cart-quantity" style={{ marginBottom: "1rem" }}>
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}>+</button>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button className="add-to-cart-btn" onClick={handleAddToCart}
              disabled={adding || product.stock === 0}>
              {adding ? "Adding..." : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            <Link
    to="/checkout"
    onClick={async (e) => {
      if (!user) { e.preventDefault(); alert("Please log in first."); return; }
      await add(product.id, 1);
    }}
    className="buy-now-btn">
    Buy Now
  </Link>
            <button
              className={`wishlist-btn ${isWishlisted(product.id) ? "wishlisted" : ""}`}
              onClick={() => user ? toggle(product.id) : alert("Please log in to save items.")}>
              {isWishlisted(product.id) ? "♥ Saved" : "♡ Wishlist"}
            </button>
          </div>
          

          <button className="back-btn" onClick={() => navigate(-1)} style={{ marginTop: "1rem" }}>
            ⬅️ Go Back
          </button>
        </div>
      </ScrollReveal>

      {/* ── Reviews ── */}
      <ScrollReveal as="section" className="reviews-section">
        <h2>Customer Reviews</h2>

        {/* Write review */}
        {user && canReview && !reviewDone && (
          <form className="review-form" onSubmit={handleSubmitReview}>
            <h4>Write a Review</h4>
            <div style={{ marginBottom: "0.5rem" }}>
              <Stars rating={reviewForm.rating} onChange={(r) => setReviewForm((f) => ({ ...f, rating: r }))} />
            </div>
            <input placeholder="Review title" value={reviewForm.title}
              onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))} />
            <textarea rows={3} placeholder="Share your experience..."
              value={reviewForm.body}
              onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))} />
            <button type="submit" className="hero-btn" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}
        {reviewDone && <p style={{ color: "#10b981" }}>✓ Thanks for your review!</p>}
        {!user && <p style={{ color: "#888" }}>
          <Link to="/signup" style={{ color: "#e91e8c" }}>Sign up / Log in</Link> to write a review.
        </p>}

        {/* Review list */}
        {reviews.length === 0
          ? <p style={{ color: "#888" }}>No reviews yet. Be the first!</p>
          : reviews.map((r) => (
            <div key={r.id} className="review-card">
              <div className="review-header">
                <div className="reviewer-avatar">
                  {r.user?.avatar_url
                    ? <img src={r.user.avatar_url} alt="avatar" />
                    : <span>{(r.user?.full_name?.[0] ?? "?").toUpperCase()}</span>}
                </div>
                <div>
                  <strong>{r.user?.full_name ?? "Customer"}</strong>
                  {r.is_verified && <span className="verified-badge">✓ Verified Purchase</span>}
                  <div><Stars rating={r.rating} /></div>
                </div>
                <span className="review-date">{new Date(r.created_at).toLocaleDateString("en-IN")}</span>
              </div>
              {r.title && <h4 className="review-title">{r.title}</h4>}
              {r.body  && <p className="review-body">{r.body}</p>}
            </div>
          ))
        }
      </ScrollReveal>

      {/* ── Related Products ── */}
      {related.length > 0 && (
        <ScrollReveal as="section" className="recommendations">
          <h2>You may also like...</h2>
          <div className="recommendation-grid">
            {related.map((item) => {
              const img = item.images?.find((i) => i.is_primary)?.url ?? item.images?.[0]?.url ?? defaultImg;
              return (
                <div key={item.id} className="product-card"
                  onClick={() => navigate(`/product/${item.slug}`, { state: { product: item } })}>
                  <img src={img} alt={item.name} />
                  <h3>{item.name}</h3>
                  <p>{formatPrice(item.price)}</p>
                  <button className="add-to-cart-btn"
                    onClick={(e) => { e.stopPropagation(); if (!user) { alert("Please log in."); return; } add(item.id, 1); }}>
                    Add to Cart
                  </button>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      )}
    </div>
  );
};

export default ProductDetails;