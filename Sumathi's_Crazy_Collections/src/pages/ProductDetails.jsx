import { useMemo } from "react";
import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
import "../styles/productDetails.css";
import "../styles/cart.css";
import { allProducts, getProductBySlug } from "../data/products";
import { useCart } from "../context/CartContext";

const ProductDetails = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const product = location.state?.product || getProductBySlug(slug);

  // If direct access without state
  if (!product) {
    return (
      <div className="product-details-container text-center">
        <h2 className="text-2xl font-bold mb-4 text-pink-600">Product Not Found</h2>
        <p className="text-gray-600 mb-6">
          This product doesn't exist or was accessed directly without full data.
        </p>
        <button onClick={() => navigate(-1)} className="back-btn">Go Back</button>
      </div>
    );
  }

  const recommendations = useMemo(
    () =>
      allProducts
        .filter((item) => item.slug !== product.slug)
        .sort(() => 0.5 - Math.random())
        .slice(0, 4),
    [product.slug]
  );

  return (
    <div className="product-details-container">
      <div className="product-details-wrapper">
        {/* Image and Info */}
        <div className="product-details-image">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="product-details-info">
          <h1>{product.name}</h1>
          <p className="price">Price: {product.displayPrice}</p>
          <p className="description">{product.description}</p>
          <p className="product-rating">⭐ {product.rating} • {product.reviews} reviews</p>

          <button className="add-to-cart-btn" onClick={() => addToCart(product, 1)}>
            Add to Cart
          </button>
          <Link to="/cart" className="secondary-btn">Buy Now</Link>
          <button className="back-btn" onClick={() => navigate(-1)}>⬅️ Go Back</button>
        </div>
      </div>

      {/* 💖 Recommendations */}
      <section className="recommendations">
        <h2>You may also like...</h2>
        <div className="recommendation-grid">
          {recommendations.map((item) => (
            <div
              key={item.slug}
              className="product-card"
              onClick={() =>
                navigate(`/product/${item.slug}`, {
                  state: { product: item },
                })
              }
            >
              <img src={item.image} alt={item.name} />
              <h3>{item.name}</h3>
              <p>{item.displayPrice}</p>
              <button
                className="add-to-cart-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  addToCart(item, 1);
                }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;
