import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/productDetails.css";
import "../styles/cart.css";
import { bracelets, earrings } from "../data/products";
import { useCart } from "../context/CartContext";

const Products = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const { addToCart } = useCart();

  const allProducts = useMemo(() => [...bracelets, ...earrings], []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    let data =
      category === "all"
        ? allProducts
        : allProducts.filter((item) => item.category === category);

    if (normalized) {
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(normalized) ||
          item.tags.some((tag) => tag.includes(normalized))
      );
    }

    if (sort === "price-low") {
      return [...data].sort((a, b) => a.price - b.price);
    }
    if (sort === "price-high") {
      return [...data].sort((a, b) => b.price - a.price);
    }
    if (sort === "rating") {
      return [...data].sort((a, b) => b.rating - a.rating);
    }
    return data;
  }, [allProducts, category, query, sort]);

  return (
    <section className="products-section px-6 py-12">
      <div className="products-hero">
        <h2>Shop All Products</h2>
        <p>Browse our handcrafted bracelets & earrings curated with love.</p>
      </div>

      <div className="products-toolbar">
        <input
          type="search"
          placeholder="Search by name or tag..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">All categories</option>
          <option value="Bracelets">Bracelets</option>
          <option value="Earrings">Earrings</option>
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="featured">Featured</option>
          <option value="rating">Top rated</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      <div className="products-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((product) => (
          <div key={product.slug} className="product-card border p-4 rounded shadow hover:shadow-lg transition">
            <Link to={`/product/${product.slug}`} state={{ product }}>
              <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-4" />
              <h3 className="text-lg font-medium">{product.name}</h3>
              <p className="price">{product.displayPrice}</p>
              <p className="product-rating">⭐ {product.rating} • {product.reviews} reviews</p>
            </Link>
            <button className="add-to-cart-btn" onClick={() => addToCart(product, 1)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <h3>No products found</h3>
          <p>Try clearing your filters or search for something else.</p>
        </div>
      )}
    </section>
  );
};

export default Products;
