import { Link } from "react-router-dom";
import "../styles/policies.css";

const NotFound = () => (
  <section className="policy-page">
    <div className="policy-header">
      <h2>Page not found</h2>
      <p>We couldn’t find the page you’re looking for.</p>
      <Link to="/" className="hero-btn">
        Back to Home
      </Link>
    </div>
  </section>
);

export default NotFound;
