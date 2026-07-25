import { motion } from "framer-motion";
import "../styles/policies.css";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

const Returns = () => (
  <section className="policy-page">
    <div className="policy-header">
      <span className="sh__sub"><span className="sh__accent-line" />Hassle-Free</span>
      <motion.h2 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        Returns & Exchanges
      </motion.h2>
      <p>We want you to love your accessories. Here's how we help.</p>
    </div>
    <motion.div className="policy-card" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <h3>Returns</h3>
      <p>We accept returns within 7 days of delivery for unworn items in original packaging. Custom orders are final sale unless damaged.</p>
    </motion.div>
    <motion.div className="policy-card" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <h3>Damaged Items</h3>
      <p>Please email us a photo within 48 hours of delivery. We'll replace or refund once verified.</p>
    </motion.div>
  </section>
);

export default Returns;
