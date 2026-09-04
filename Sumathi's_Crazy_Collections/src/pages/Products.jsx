import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router";
import { getProducts, getCategories } from "../services/productService";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useWishlist } from "../hooks/useWishlist";
import "../styles/cart.css";
import defaultImg from "../assets/bracelets/bluewhite_panda.png";

const formatPrice = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const getPrimaryImage = (product) =>
  product.images?.find((i) => i.is_primary)?.url ?? product.images?.[0]?.url ?? defaultImg;

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

/* ── Section Header ── */
function SectionHeader({ subtitle, title }) {
  return (
    <div className="sh sh--center">
      <motion.span className="sh__sub"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <span className="sh__accent-line" />{subtitle}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
        {title}
      </motion.h2>
    </div>
  );
}

const Products = () => {
  const { add } = useCart();
  const { user } = useAuth();
  const { toggle, isWishlisted } = useWishlist();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("created_at");
  const [page, setPage] = useState(1);
  const LIMIT = 12;

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { products: data, total: count } = await getProducts({
        categorySlug: category === "all" ? null : category,
        search: query || null,
        sortBy: sort,
        page,
        limit: LIMIT,
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

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setCategory(cat);
  }, [searchParams]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [category, query, sort]);

  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    if (!user) { alert("Please log in to add items to your cart."); return; }
    setAddingId(productId);
    try { await add(productId, 1); } finally { setAddingId(null); }
  };

  const handleWishlist = async (e, productId) => {
    e.preventDefault();
    if (!user) { alert("Please log in to save items."); return; }
    await toggle(productId);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <section className="products-section">
      <SectionHeader subtitle="The Collection" title="Shop All Products" />

      <motion.div className="products-toolbar"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}>
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
      </motion.div>

      {loading ? (
        <motion.div className="products-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="product-skeleton" />
          ))}
        </motion.div>
      ) : (
        <motion.div className="products-grid"
          variants={stagger}
          initial="hidden"
          animate="visible"
          key={page}>
          {products.map((product) => (
            <motion.div key={product.id} className="product-card" variants={fadeUp}>
              <Link to={`/product/${product.slug}`} state={{ product }}>
                <div className="product-img-wrap">
                  <img src={getPrimaryImage(product)} alt={product.name} loading="lazy" />
                  {product.original_price && (
                    <span className="product-badge">
                      {Math.round((1 - product.price / product.original_price) * 100)}% OFF
                    </span>
                  )}
                  <motion.button className={`product-wish ${isWishlisted(product.id) ? "active" : ""}`}
                    onClick={(e) => handleWishlist(e, product.id)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}>
                    {isWishlisted(product.id) ? "♥" : "♡"}
                  </motion.button>
                </div>
                <p className="product-category-label">{product.category?.name || "Collection"}</p>
                <h3>{product.name}</h3>
                <p className="price">
                  {formatPrice(product.price)}
                  {product.original_price && (
                    <span style={{ textDecoration: "line-through", color: "#ccc", fontSize: "0.8rem", marginLeft: "0.4rem" }}>
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                </p>
                <p className="product-rating">✦ {product.rating_avg ?? "—"} ({product.rating_count ?? 0} reviews)</p>
              </Link>
              <div className="product-actions-group">
                {product.stock > 0 && (
                  <Link to="/checkout" onClick={async (e) => {
                    if (!user) { e.preventDefault(); alert("Please log in first."); return; }
                    await add(product.id, 1);
                  }} className="buy-now-btn">
                    Buy Now
                  </Link>
                )}
                <motion.button className="add-to-cart-btn"
                  onClick={(e) => handleAddToCart(e, product.id)}
                  disabled={addingId === product.id || product.stock === 0}
                  whileHover={addingId !== product.id && product.stock > 0 ? { scale: 1.01 } : {}}
                  whileTap={addingId !== product.id && product.stock > 0 ? { scale: 0.98 } : {}}>
                  {product.stock === 0 ? "Out of Stock" : addingId === product.id ? "Adding..." : "Add to Cart"}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!loading && products.length === 0 && (
        <motion.div className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}>
          <h3>No products found</h3>
          <p>Try clearing your filters or search for something else.</p>
          <motion.button className="hero-btn" 
            style={{ background: "#1a1a1a", color: "#fff", border: "none", borderRadius: "50px", padding: "0.85rem 2rem", fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans" }}
            onClick={() => { setQuery(""); setCategory("all"); }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}>
            Clear Filters
          </motion.button>
        </motion.div>
      )}

      {totalPages > 1 && (
        <motion.div className="product-pagination"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}>
          <motion.button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
            whileHover={page > 1 ? { scale: 1.02 } : {}}
            whileTap={page > 1 ? { scale: 0.98 } : {}}>
            ← Prev
          </motion.button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <motion.button key={p} className={page === p ? "active" : ""}
              onClick={() => setPage(p)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}>
              {p}
            </motion.button>
          ))}
          <motion.button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
            whileHover={page < totalPages ? { scale: 1.02 } : {}}
            whileTap={page < totalPages ? { scale: 0.98 } : {}}>
            Next →
          </motion.button>
        </motion.div>
      )}
    </section>
  );
};

export default Products;
