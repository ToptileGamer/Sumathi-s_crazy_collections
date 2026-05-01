import Hero from "../components/Hero";
import { Link } from "react-router-dom";
import "../styles/home.css";
import { bracelets } from "../data/products";
import { useCart } from "../hooks/useCart";

const Home = () => {
  const { addToCart } = useCart();
  const bestSellers = bracelets.slice(0, 3);

  return (
    <div className="home-page">
      <Hero />

      {/* 🌸 Best Sellers Section */}
      <section className="products-section">
        <h2>🌟 Best-Selling Products</h2>
        <p className="subtitle">Hand-picked & loved by our happy customers 💕</p>

        <div className="products-grid">
          {bestSellers.map((product) => (
            <div key={product.name} className="product-card">
              <Link to={`/product/${product.slug}`} state={{ product }}>
                <div className="img-wrapper">
                  <img src={product.image} alt={product.name} />
                </div>
                <h3>{product.name}</h3>
                <p className="price">{product.displayPrice}</p>
                <p className="desc">{product.description}</p>
              </Link>
              <button
                className="add-to-cart-btn"
                onClick={() => addToCart(product, 1)}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 💖 Custom Order Section */}
      <section className="custom-order">
        <h2>💌 Customize Your Bracelet</h2>
        <p>
          Choose your favorite color, charm, and style! We'll make it uniquely yours 🎀
        </p>
        <Link to="/contact" className="custom-btn">
          Create My Bracelet
        </Link>
      </section>

      {/* 🌷 Customer Reviews */}
      <section className="reviews">
        <h2>✨ What Our Customers Say</h2>
        <div className="review-grid">
          <div className="review-card">
            <p>"Absolutely love the pink bow bracelet! It's so cute and comfy 💗"</p>
            <h4>- Sneha</h4>
          </div>
          <div className="review-card">
            <p>"Fast delivery and beautiful packaging! Totally worth it 🌸"</p>
            <h4>- Aishwarya</h4>
          </div>
          <div className="review-card">
            <p>"Got matching bracelets with my bestie — we adore them 🫶"</p>
            <h4>- Meera & Diya</h4>
          </div>
        </div>
      </section>

      {/* 🎀 Call to Action */}
      <section className="cta">
        <h2>Follow us on Instagram 💕</h2>
        <p>@sumathiscrazycollection</p>
        <a
          href="https://instagram.com/sumathiscrazycollection"
          target="_blank"
          rel="noreferrer"
          className="insta-btn"
        >
          Visit Our Instagram ✨
        </a>
      </section>
    </div>
  );
};

export default Home;
