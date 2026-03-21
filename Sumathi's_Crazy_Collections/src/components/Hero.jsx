import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-pill">Handmade • Customizable • Gift Ready</p>
        <h1>Bracelets & Earrings Crafted with Love</h1>
        <p>
          Discover playful colors, thoughtful charms, and handcrafted details in every piece.
          Shop ready-to-ship favorites or design your own custom set.
        </p>
        <div className="hero-actions">
          <Link to="/products" className="hero-btn">
            Shop the Collection
          </Link>
          <Link to="/contact" className="hero-btn secondary">
            Create a Custom Order
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
