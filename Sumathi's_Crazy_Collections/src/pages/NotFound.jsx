import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "../styles/policies.css";

const NotFound = () => (
  <section className="policy-page">
    <div className="policy-header">
      <motion.div style={{ fontSize: "4rem", marginBottom: "1rem" }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}>
        🔍
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        Page not found
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}>
        We couldn't find the page you're looking for.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}>
        <Link to="/" className="hero-btn" style={{ display: "inline-flex" }}>
          Back to Home
        </Link>
      </motion.div>
    </div>
  </section>
);

export default NotFound;
