import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { getProducts, getCategories } from "../services/productService";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useWishlist } from "../hooks/useWishlist";
import "../styles/productDetails.css";
import "../styles/cart.css";
import defaultImg from "../assets/bracelets/bluewhite_panda.png";

import TiltCard from "../components/TiltCard";


const formatPrice = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const getPrimaryImage = (product) =>
  product.images?.find((i) => i.is_primary)?.url ?? product.images?.[0]?.url ?? defaultImg;

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

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
  }, []);

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
      <motion.div className="products-hero"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        <h2>Shop All Products</h2>
        <p>Browse our handcrafted bracelets & earrings curated with love.</p>
      </motion.div>

      <motion.div className="products-toolbar"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}>
        <motion.input type="search" placeholder="Search by name or tag..."
          value={query} onChange={(e) => setQuery(e.target.value)}
          whileFocus={{ borderColor: "#e91e8c", boxShadow: "0 0 0 3px rgba(233,30,140,0.1)" }} />
        <motion.select value={category} onChange={(e) => setCategory(e.target.value)}
          whileFocus={{ borderColor: "#e91e8c" }}>
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </motion.select>
        <motion.select value={sort} onChange={(e) => setSort(e.target.value)}
          whileFocus={{ borderColor: "#e91e8c" }}>
          <option value="created_at">Newest</option>
          <option value="rating">Top Rated</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </motion.select>
      </motion.div>

      {loading ? (
        <motion.div className="products-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div key={i} className="product-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }} />
          ))}
        </motion.div>
      ) : (
        <motion.div className="products-grid"
          variants={stagger}
          initial="hidden"
          animate="visible"
          key={page}>
          {products.map((product) => (
            <TiltCard tiltDegree={3} glare={true} scale={1.01}>
            <motion.div key={product.id} className="product-card" variants={fadeUp}>
              <Link to={`/product/${product.slug}`} state={{ product }}>
                <div className="product-img-wrap">
                  <motion.img src={getPrimaryImage(product)} alt={product.name}
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.5 }} />
                  {product.original_price && (
                    <motion.span className="product-badge"
                      initial={{ x: -60, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}>
                      {Math.round((1 - product.price / product.original_price) * 100)}% OFF
                    </motion.span>
                  )}
                  <motion.button className={`wishlist-icon ${isWishlisted(product.id) ? "wishlisted" : ""}`}
                    onClick={(e) => handleWishlist(e, product.id)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}>
                    {isWishlisted(product.id) ? "♥" : "♡"}
                  </motion.button>
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
                whileHover={addingId !== product.id && product.stock > 0 ? { scale: 1.02 } : {}}
                whileTap={addingId !== product.id && product.stock > 0 ? { scale: 0.98 } : {}}>
                {product.stock === 0 ? "Out of Stock" : addingId === product.id ? "Adding..." : "Add to Cart"}
              </motion.button>
            </motion.div>
            </TiltCard>
          ))}
        </motion.div>
      )}

      {!loading && products.length === 0 && (
        <motion.div className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}>
          <h3>No products found</h3>
          <p>Try clearing your filters or search for something else.</p>
          <motion.button className="btn-primary" onClick={() => { setQuery(""); setCategory("all"); }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}>
            Clear Filters
          </motion.button>
        </motion.div>
      )}

      {totalPages > 1 && (
        <motion.div className="pagination"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}>
          <motion.button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
            whileHover={page > 1 ? { scale: 1.05 } : {}}
            whileTap={page > 1 ? { scale: 0.95 } : {}}>
            ← Prev
          </motion.button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <motion.button key={p} className={page === p ? "active" : ""}
              onClick={() => setPage(p)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}>
              {p}
            </motion.button>
          ))}
          <motion.button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
            whileHover={page < totalPages ? { scale: 1.05 } : {}}
            whileTap={page < totalPages ? { scale: 0.95 } : {}}>
            Next →
          </motion.button>
        </motion.div>
      )}
    </section>
  );
};

export default Products;
