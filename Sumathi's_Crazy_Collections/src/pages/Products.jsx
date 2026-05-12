import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useWishlist } from "../hooks/useWishlist";
import { getProducts, getCategories } from "../services/productService";
import { useSearchParams } from "react-router-dom";
import "../styles/productDetails.css";
import "../styles/cart.css";

import defaultImg from "../assets/bracelets/bluewhite_panda.png";

const formatPrice = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const getPrimaryImage = (product) =>
  product.images?.find((i) => i.is_primary)?.url ??
  product.images?.[0]?.url ??
  defaultImg;

const Products = () => {
  const { add }                  = useCart();
  const { user }                 = useAuth();
  const { toggle, isWishlisted } = useWishlist();

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [addingId,   setAddingId]   = useState(null);
  const [query,      setQuery]      = useState("");
  const [category,   setCategory]   = useState("all");
  const [sort,       setSort]       = useState("created_at");
  const [page,       setPage]       = useState(1);
  const LIMIT = 12;

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { products: data, total: count } = await getProducts({
        categorySlug: category === "all" ? null : category,
        search:       query || null,
        sortBy:       sort,
        page,
        limit:        LIMIT,
      });
      setProducts(data ?? []);
      setTotal(count ?? 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [category, query, sort, page]);

  const [searchParams] = useSearchParams();

// Read ?category=slug from URL on first load
useEffect(() => {
  const cat = searchParams.get("category");
  if (cat) setCategory(cat);
}, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [category, query, sort]);

  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    if (!user) { alert("Please log in to add items to your cart."); return; }
    setAddingId(productId);
    try { await add(productId, 1); }
    finally { setAddingId(null); }
  };

  const handleWishlist = async (e, productId) => {
    e.preventDefault();
    if (!user) { alert("Please log in to save items."); return; }
    await toggle(productId);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <section className="products-section px-6 py-12">
      <div className="products-hero">
        <h2>Shop All Products</h2>
        <p>Browse our handcrafted bracelets & earrings curated with love.</p>
      </div>

      <div className="products-toolbar">
        <input type="search" placeholder="Search by name or tag..."
          value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="created_at">Newest</option>
          <option value="rating">Top Rated</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <div className="products-grid">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="product-skeleton" />)}
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <Link to={`/product/${product.slug}`} state={{ product }}>
                <div className="product-img-wrap">
                  <img src={getPrimaryImage(product)} alt={product.name} />
                  {product.original_price && (
                    <span className="product-badge">
                      {Math.round((1 - product.price / product.original_price) * 100)}% OFF
                    </span>
                  )}
                  <button className={`wishlist-icon ${isWishlisted(product.id) ? "wishlisted" : ""}`}
                    onClick={(e) => handleWishlist(e, product.id)}>
                    {isWishlisted(product.id) ? "♥" : "♡"}
                  </button>
                </div>
                <p className="product-category-label">{product.category?.name}</p>
                <h3>{product.name}</h3>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0 1rem" }}>
                  <span className="price">{formatPrice(product.price)}</span>
                  {product.original_price && (
                    <span style={{ textDecoration: "line-through", color: "#aaa", fontSize: "0.85rem" }}>
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                </div>
                <p className="product-rating">⭐ {product.rating_avg ?? "—"} ({product.rating_count ?? 0})</p>
              </Link>
              <button className="add-to-cart-btn"
                onClick={(e) => handleAddToCart(e, product.id)}
                disabled={addingId === product.id || product.stock === 0}>
                {product.stock === 0 ? "Out of Stock" : addingId === product.id ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="empty-state">
          <h3>No products found</h3>
          <p>Try clearing your filters or search for something else.</p>
          <button className="hero-btn" onClick={() => { setQuery(""); setCategory("all"); }}>Clear Filters</button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} className={page === p ? "active" : ""} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}
    </section>
  );
};

export default Products;